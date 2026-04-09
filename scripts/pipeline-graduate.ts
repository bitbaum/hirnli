#!/usr/bin/env tsx
/**
 * Pipeline Graduate — Graduate rapid foundations through a cheap funnel
 *
 * The problem: 16k+ rapid foundations, most with no data. We can't research
 * them all. We need to find the ones worth investing tokens on.
 *
 * The funnel (cheapest signals first):
 *
 *   Phase 1: KEYWORD SCREEN (0 tokens)
 *     officialPurpose keyword match → eliminate clearly irrelevant foundations
 *     Input: DB rapid foundations with officialPurpose
 *     Output: candidates with themes + funder/operator classification
 *
 *   Phase 2: LLM TRIAGE (cheap, ~500 tokens each)
 *     One Groq call per candidate: "rate fit, classify themes, assess funder"
 *     Input: Phase 1 candidates
 *     Output: enriched foundations with fitScore, themes, purposeSummary
 *
 *   Phase 3: UPSERT + SYNC (close the loop)
 *     Write results back to DB, run sync to regenerate config
 *     Also ingests any pending auto-research drafts from disk
 *
 * Idempotent: tracks processed slugs per run date. Safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/pipeline-graduate.ts                    # Full run
 *   npx tsx scripts/pipeline-graduate.ts --phase=1          # Keyword screen only
 *   npx tsx scripts/pipeline-graduate.ts --phase=2          # LLM triage only
 *   npx tsx scripts/pipeline-graduate.ts --dry-run           # Preview, no writes
 *   npx tsx scripts/pipeline-graduate.ts --limit=50          # Cap LLM calls
 *   npx tsx scripts/pipeline-graduate.ts --ingest-only       # Just ingest pending drafts
 *   npx tsx scripts/pipeline-graduate.ts --skip-sync         # Don't run sync after
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { execSync } from 'child_process';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import {
  classifyThemes,
  scoreFunderOperator,
  classifyType,
  detectApplicationMethod,
  THEME_LABELS,
} from './lib/theme-classifier';
import { callGroqJSON, GROQ_MODELS } from './lib/groq-client';
import { sleep } from './lib/utilities';
import { THEMES } from '../src/lib/config/foundations/metadata';
import { ThemeId } from '../src/lib/schemas/foundation';

// ============================================================================
// CLI ARGS
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_SYNC = args.includes('--skip-sync');
const INGEST_ONLY = args.includes('--ingest-only');
const PHASE_ARG = parseInt(args.find(a => a.startsWith('--phase='))?.split('=')[1] || '0', 10);
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10) || Infinity;
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000', 10);
const MODEL_ARG = args.find(a => a.startsWith('--model='))?.split('=')[1] || '';
const GROQ_MODEL_OVERRIDE = MODEL_ARG === '8b' ? GROQ_MODELS['8b'] : MODEL_ARG === '70b' ? GROQ_MODELS['70b'] : undefined;

// ============================================================================
// TYPES
// ============================================================================

interface RapidFoundation {
  id: string;
  name: string;
  config_data: Record<string, unknown>;
  official_purpose: string | null;
}

interface ScreenCandidate {
  slug: string;
  name: string;
  officialPurpose: string;
  themes: string[];
  funderScore: number;
  operatorScore: number;
  isFunder: boolean;
  fitScore: number;
  canton: string;
  city: string;
  websiteUrl: string;
}

interface TriageResult {
  slug: string;
  name: string;
  fitScore: number;
  priority: number;
  themes: string[];
  purposeSummary: string;
  researchNotes: string;
  isFunder: boolean;
  funderConfidence: string;
  applicationMethod: string;
  contactEmail?: string;
  contactPhone?: string;
  suggestedType: string;
}

// ============================================================================
// PHASE 1: KEYWORD SCREEN (0 tokens)
// ============================================================================

async function phase1KeywordScreen(sql: NeonQueryFunction<false, false>): Promise<ScreenCandidate[]> {
  console.log('\n━━━ Phase 1: Keyword Screen (0 tokens) ━━━━━━━━━━━━━━━━━━━━━━━');

  // Read rapid foundations that have officialPurpose
  const rows = await sql`
    SELECT
      f.id,
      f.name,
      f.config_data,
      COALESCE(
        f.config_data->>'officialPurpose',
        f.config_data->>'purposeSummary'
      ) as official_purpose
    FROM fundraising_foundations f
    WHERE f.research_depth = 'rapid'
      AND f.archived = false
    ORDER BY f.id
  ` as RapidFoundation[];

  console.log(`  Rapid foundations in DB: ${rows.length}`);

  // Filter: must have some purpose text to screen
  const withPurpose = rows.filter(r =>
    r.official_purpose && r.official_purpose.length > 30
  );
  console.log(`  With officialPurpose (>30 chars): ${withPurpose.length}`);

  // Keyword classify each one
  const candidates: ScreenCandidate[] = [];
  let eliminated = 0;
  let operativeOnly = 0;

  for (const row of withPurpose) {
    const purpose = row.official_purpose!;
    const purposeLower = purpose.toLowerCase();
    const nameLower = row.name.toLowerCase();

    // Classify themes
    const themes = classifyThemes(purposeLower, nameLower);

    // Funder vs operator
    const { funder, operator } = scoreFunderOperator(purpose);
    const isFunder = funder > operator;

    // If no themes AND clearly an operator → eliminate
    if (themes.length === 0 && !isFunder) {
      eliminated++;
      continue;
    }

    // If clearly operative (high operator score, no funder signals) → skip
    if (operator >= 3 && funder === 0) {
      operativeOnly++;
      continue;
    }

    // Extract location from config_data
    const cd = row.config_data || {};
    const canton = (cd.region as string)?.includes('Kanton')
      ? (cd.region as string).match(/Kanton (\w+)/)?.[1] || ''
      : '';
    const city = (cd.region as string) || '';

    // Compute fit score
    const applicationMethod = detectApplicationMethod(purpose);
    const { fitScore } = computeFitScore({
      themes, canton, city, applicationMethod, isFunder,
    });

    candidates.push({
      slug: row.id,
      name: row.name,
      officialPurpose: purpose,
      themes,
      funderScore: funder,
      operatorScore: operator,
      isFunder,
      fitScore,
      canton,
      city,
      websiteUrl: (cd.websiteUrl as string) || '',
    });
  }

  // Deduplicate by slug (LEFT JOIN can produce duplicates)
  const seen = new Set<string>();
  const duplicates = candidates.length;
  const deduped = candidates.filter(c => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });

  // Sort: highest fitScore first, then funder score
  deduped.sort((a, b) => {
    const fitDiff = b.fitScore - a.fitScore;
    if (fitDiff !== 0) return fitDiff;
    return b.funderScore - a.funderScore;
  });

  console.log(`  Eliminated (no themes + not funder): ${eliminated}`);
  console.log(`  Eliminated (clearly operative): ${operativeOnly}`);
  if (duplicates !== deduped.length) {
    console.log(`  Deduplicated: ${duplicates - deduped.length} duplicates removed`);
  }
  console.log(`  Candidates surviving keyword screen: ${deduped.length}`);

  // Stats breakdown
  const withThemes = deduped.filter(c => c.themes.length > 0).length;
  const highFit = deduped.filter(c => c.fitScore >= 4).length;
  const funderCount = deduped.filter(c => c.isFunder).length;

  console.log(`    With themes: ${withThemes}`);
  console.log(`    FitScore ≥ 4: ${highFit}`);
  console.log(`    Identified as funder: ${funderCount}`);

  // Write phase 1 results
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/pipeline-graduate');
  fs.mkdirSync(outDir, { recursive: true });

  const phase1File = path.join(outDir, `phase1-${today}.json`);
  if (!DRY_RUN) {
    fs.writeFileSync(phase1File, JSON.stringify({
      date: today,
      totalRapid: rows.length,
      withPurpose: withPurpose.length,
      eliminated: eliminated + operativeOnly,
      candidates: deduped.length,
      items: deduped,
    }, null, 2));
    console.log(`  Results written to: ${phase1File}`);
  }

  return deduped;
}

// ============================================================================
// PHASE 2: LLM TRIAGE (cheap, ~500 tokens each)
// ============================================================================

const VALID_THEME_IDS: Set<string> = new Set(ThemeId.options);

/** Save triage results to disk, merging with any existing file for today. */
function saveResults(outDir: string, today: string, results: TriageResult[]): void {
  const resultsFile = path.join(outDir, `phase2-results-${today}.json`);
  let allResults = results;
  if (fs.existsSync(resultsFile)) {
    const existing = JSON.parse(fs.readFileSync(resultsFile, 'utf-8')) as { items: TriageResult[] };
    const existingSlugs = new Set(existing.items.map((r: TriageResult) => r.slug));
    const newResults = results.filter(r => !existingSlugs.has(r.slug));
    allResults = [...existing.items, ...newResults];
  }
  fs.writeFileSync(resultsFile, JSON.stringify({
    date: today,
    total: allResults.length,
    items: allResults,
  }, null, 2));
}

const AVAILABLE_THEMES = Object.values(THEMES)
  .map(t => `  "${t.id}": ${t.label} — ${t.description}`)
  .join('\n');

const TRIAGE_SYSTEM_PROMPT = `Du bist ein Schweizer Stiftungsexperte. Bewerte STRENG, ob diese Stiftung für Revamp-IT relevant ist.

## Über Revamp-IT (Kurzprofil)
- **Kerngeschäft**: IT-Geräte refurbishing (Hardware aufbereiten, nicht Forschung)
- **Soziale Mission**: Arbeitsintegration (8-10 Praktikumsplätze für Sozialhilfe/RAV/IV-Bezüger)
- **Bildung**: Linux-Kurse, Reparatur-Workshops (IT-fokussiert, keine allgemeine Bildung)
- **Standort**: Zürich (gemeinnütziger Verein seit 2009)
- **Kreislaufwirtschaft**: E-Waste, Ressourcenschonung, Secondhand-IT

## WICHTIG: Was IST KEINE Passung

**MEDIZIN/GESUNDHEIT**: Krebsforschung, Herz-Kreislauf, Kliniken, Spitäler, Pflege → **KEINE PASSUNG**
**SPORT**: Fussball, Leichtathletik, Sportförderung → **KEINE PASSUNG**
**KULTUR/KUNST**: Musik, Theater, Film, Denkmalpflege, Literatur → **KEINE PASSUNG**
**LANDWIRTSCHAFT**: Bauernhöfe, ökologischer Anbau → **KEINE PASSUNG**
**ALLGEMEINE BILDUNG**: Schulen, Universitäten, Stipendien (ohne IT/Digital-Fokus) → **KEINE PASSUNG**
**INTERNATIONALE ENTWICKLUNG**: Afrika, Asien, Südamerika (ohne CH-Fokus) → **KEINE PASSUNG**

## WICHTIG: Themen-Validierung

Weise NUR Themen zu, die **EXPLIZIT** im Stiftungszweck stehen:
- "arbeitsintegration": NUR wenn "berufliche Integration", "Arbeitsmarkt", "Beschäftigungsmassnahmen" WÖRTLICH vorkommen
- "digitale-bildung": NUR wenn "IT", "Informatik", "digitale Kompetenz", "Medienkompetenz" WÖRTLICH vorkommen
- "kreislaufwirtschaft": NUR wenn "Recycling", "Ressourcen", "Kreislauf", "Wiederverwendung" WÖRTLICH vorkommen
- "soziale-integration": NUR wenn "Benachteiligte", "Migration", "Randgruppen", "soziale Teilhabe" WÖRTLICH vorkommen

**Keine Halluzinationen**: Wenn der Stiftungszweck "Krebsforschung" sagt, hat er NICHTS mit IT, Arbeitsintegration oder Kreislaufwirtschaft zu tun.

## Verfügbare Themen
${AVAILABLE_THEMES}

## JSON-Format (STRENG validieren)
{
  "isFunder": boolean,
  "funderConfidence": "high"|"medium"|"low",
  "themes": ["theme-id", ...],  // NUR wenn EXPLIZIT im Zweck
  "suggestedType": "A"|"B"|"C"|"D"|"network",
  "suggestedFit": 0-3,  // 0 = keine Passung, 1-3 = Passung
  "suggestedPriority": 1-4,
  "purposeSummary": "string (150+ Zeichen, spezifische Förderbereiche)",
  "researchNotes": "string (100+ Zeichen, EHRLICHE Passung-Einschätzung)",
  "applicationMethod": "online"|"email"|"invitation"|"unknown",
  "warnings": []
}

WICHTIG: 
- Schweizer Schriftdeutsch (ss statt ß)
- Nur valides JSON
- Bei KEINER Passung: themes=[], suggestedFit=0, researchNotes="Keine Passung zu Revamp-IT"`;

function buildTriagePrompt(candidate: ScreenCandidate): string {
  const lines = [
    `# ${candidate.name}`,
    `Bisherige Themen (Keyword): ${candidate.themes.map(t => THEME_LABELS[t] || t).join(', ') || 'keine'}`,
    `Keyword-FitScore: ${candidate.fitScore}/10`,
    `Funder-Signal: ${candidate.funderScore} (Operator: ${candidate.operatorScore})`,
    '',
    '## Offizieller Stiftungszweck',
    candidate.officialPurpose.substring(0, 1500),
    '',
    'Bitte bewerte kurz als JSON.',
  ];
  return lines.join('\n');
}

async function phase2LlmTriage(
  sql: NeonQueryFunction<false, false>,
  candidates: ScreenCandidate[],
): Promise<TriageResult[]> {
  console.log('\n━━━ Phase 2: LLM Triage (cheap, ~500 tokens each) ━━━━━━━━━━━');

  // Load already-processed slugs for idempotency
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/pipeline-graduate');
  const processedFile = path.join(outDir, `phase2-processed-${today}.json`);
  let processedSlugs = new Set<string>();

  if (fs.existsSync(processedFile)) {
    const existing = JSON.parse(fs.readFileSync(processedFile, 'utf-8')) as string[];
    processedSlugs = new Set(existing);
    console.log(`  Already processed today: ${processedSlugs.size}`);
  }

  // Filter: only candidates worth an LLM call
  // Must have themes OR high funder score
  const triageable = candidates.filter(c =>
    (c.themes.length > 0 || c.funderScore >= 2) &&
    !processedSlugs.has(c.slug)
  );

  const toProcess = triageable.slice(0, Math.min(triageable.length, LIMIT));
  console.log(`  Candidates to triage: ${triageable.length}`);
  console.log(`  Processing this run: ${toProcess.length}${LIMIT < Infinity ? ` (limit=${LIMIT})` : ''}`);

  if (toProcess.length === 0) {
    console.log('  Nothing to process.');
    return [];
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('  GROQ_API_KEY not set. Skipping Phase 2.');
    return [];
  }

  const results: TriageResult[] = [];
  let success = 0;
  let errors = 0;
  let tokensUsed = 0;
  let rateLimitHits = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const candidate = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;

    if (DRY_RUN && i >= 3) {
      console.log(`  ${progress} DRY RUN — stopping after 3 previews`);
      break;
    }

    const prompt = buildTriagePrompt(candidate);

    console.log(`  ${progress} ${candidate.name}...`);
    const groqResult = await callGroqJSON<Record<string, unknown>>(
      TRIAGE_SYSTEM_PROMPT, prompt,
      { maxTokens: 512, temperature: 0.2, timeoutMs: 30_000, model: GROQ_MODEL_OVERRIDE },
    );

    if (!groqResult.ok) {
      console.error(`    ERROR: ${groqResult.error}`);
      errors++;
      // On rate limit, distinguish daily (TPD) vs per-minute (TPM)
      if (groqResult.error?.includes('429') || groqResult.error?.includes('Rate limit')) {
        const isDaily = groqResult.error?.includes('per day') || groqResult.error?.includes('TPD');
        if (isDaily) {
          console.error('  Daily token limit reached. Stopping Phase 2. Try --model=8b or wait until tomorrow.');
          break;
        }
        rateLimitHits++;
        if (rateLimitHits >= 5) {
          console.error('  Too many rate limits. Stopping Phase 2.');
          break;
        }
        console.log(`    Rate limit #${rateLimitHits} — waiting 65s for TPM window reset...`);
        await sleep(65_000);
        i--; // Retry this candidate
        continue;
      }
      await sleep(DELAY_MS * 2);
      continue;
    }

    if (groqResult.usage) {
      tokensUsed += groqResult.usage.prompt_tokens + groqResult.usage.completion_tokens;
    }

    const raw = groqResult.data;

    // Extract and validate themes
    const rawThemes = Array.isArray(raw.themes) ? raw.themes : candidate.themes;
    const validThemes = rawThemes.filter((t: unknown) =>
      typeof t === 'string' && VALID_THEME_IDS.has(t)
    ) as string[];

    // Compute real fitScore from LLM themes (algorithmic)
    const applicationMethod = (raw.applicationMethod as string) || 'unknown';
    const isFunder = typeof raw.isFunder === 'boolean' ? raw.isFunder : candidate.isFunder;
    const { fitScore: algoScore } = computeFitScore({
      themes: validThemes,
      canton: candidate.canton,
      city: candidate.city,
      applicationMethod,
      isFunder,
    });

    // LLM's contextual assessment (0-3 scale → map to 0-10)
    // 0→0, 1→4, 2→6, 3→8  (conservative: LLM "3" doesn't auto-become 10)
    const LLM_FIT_MAP = [0, 4, 6, 8] as const;
    const suggestedFit = typeof raw.suggestedFit === 'number' ? Math.min(3, Math.max(0, Math.round(raw.suggestedFit))) : 0;
    const llmScore = LLM_FIT_MAP[suggestedFit] ?? 0;

    // Use algorithmic score — LLM themes already feed into algo via computeFitScore.
    // Don't double-count LLM's suggestedFit (it can only inflate, never correct).
    const fitScore = algoScore;

    // Priority from fitScore — rapid foundations are always P4 (not enough data to act on)
    const isZurich = candidate.canton === 'ZH';
    let priority: 1 | 2 | 3 | 4;
    if (fitScore >= 7 && isFunder) priority = 1;
    else if (fitScore >= 4 && (isFunder || isZurich)) priority = 2;
    else if (fitScore >= 4) priority = 3;
    else priority = 4;

    const result: TriageResult = {
      slug: candidate.slug,
      name: candidate.name,
      fitScore,
      priority,
      themes: validThemes,
      purposeSummary: (raw.purposeSummary as string) || '',
      researchNotes: (raw.researchNotes as string) || '',
      isFunder,
      funderConfidence: (raw.funderConfidence as string) || 'low',
      applicationMethod,
      suggestedType: (raw.suggestedType as string) || 'C',
    };

    results.push(result);
    processedSlugs.add(candidate.slug);
    success++;
    rateLimitHits = 0; // Reset after successful call

    const fitLabel = fitScore >= 7 ? '★★★' : fitScore >= 4 ? '★★☆' : '★☆☆';
    console.log(`    → fit=${fitScore} ${fitLabel}, P${priority}, themes=[${validThemes.join(',')}], funder=${isFunder}`);

    // Save progress every 25 results (avoid losing work on interrupts)
    if (!DRY_RUN && success % 25 === 0) {
      fs.writeFileSync(processedFile, JSON.stringify([...processedSlugs], null, 2));
      saveResults(outDir, today, results);
    }

    // Rate limit protection
    if (i < toProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  Phase 2 complete: ${success} triaged, ${errors} errors, ${tokensUsed} tokens used`);

  // Final save
  if (!DRY_RUN) {
    fs.writeFileSync(processedFile, JSON.stringify([...processedSlugs], null, 2));
    saveResults(outDir, today, results);
  }

  return results;
}

// ============================================================================
// PHASE 3: UPSERT + SYNC (close the loop)
// ============================================================================

async function phase3Upsert(
  sql: NeonQueryFunction<false, false>,
  triageResults: TriageResult[],
): Promise<number> {
  console.log('\n━━━ Phase 3: Upsert + Sync ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  let updated = 0;
  let errors = 0;

  // Part A: Upsert triage results
  if (triageResults.length > 0) {
    console.log(`\n  A) Upserting ${triageResults.length} triage results...`);

    for (const r of triageResults) {
      // Skip low-value results (no purpose summary = LLM gave nothing useful)
      if (!r.purposeSummary || r.purposeSummary.length < 30) continue;

      const fitDisplay = fitScoreToDisplay(r.fitScore, true); // rapid tier → gated

      // Build merge config (without fitScore/priority — use GREATEST/LEAST)
      const mergeConfig = {
        themes: r.themes,
        purposeSummary: r.purposeSummary,
        researchNotes: r.researchNotes,
        researchDate: today,
        type: r.suggestedType,
        isOperative: !r.isFunder,
        needsResearch: true,
        tagline: r.purposeSummary.substring(0, 80),
      };

      // Upgrade from rapid when we have substantial analysis data
      const hasSubstantialData = r.purposeSummary.length >= 100 && r.themes.length > 0;

      // Gate: foundations staying at rapid depth are never actionable (P4)
      const writePriority = hasSubstantialData ? r.priority : 4;

      // Set researchDepth in mergeConfig so the trigger picks it up
      const writeDepth = hasSubstantialData ? 'standard' : 'rapid';
      const fullMerge = { ...mergeConfig, researchDepth: writeDepth, researchDate: today };

      try {
        // config_data is SSOT — trigger auto-syncs flat columns
        await sql`
          UPDATE fundraising_foundations
          SET
            config_data = jsonb_set(
              jsonb_set(
                config_data || ${JSON.stringify(fullMerge)}::jsonb,
                '{fitScore}',
                to_jsonb(${r.fitScore})
              ),
              '{priority}',
              to_jsonb(${writePriority})
            ),
            updated_at = ${now}
          WHERE id = ${r.slug}
        `;

        updated++;
      } catch (err) {
        console.error(`    ${r.name}: ${err instanceof Error ? err.message : err}`);
        errors++;
      }
    }

    console.log(`  Triage upserted: ${updated}, errors: ${errors}`);
  }

  // Part B: Ingest any pending auto-research drafts from disk
  const pendingDirs = findPendingAutoResearch();
  if (pendingDirs.length > 0) {
    console.log(`\n  B) Ingesting pending auto-research drafts...`);
    for (const dir of pendingDirs) {
      console.log(`    Upserting: ${dir}`);
      if (!DRY_RUN) {
        try {
          execSync(`npx tsx scripts/foundation-upsert.ts "${dir}"`, {
            stdio: 'inherit',
            cwd: process.cwd(),
          });
        } catch {
          console.error(`    Upsert failed for ${dir}`);
        }
      }
    }
  }

  // Part C: Sync
  const totalUpdated = updated + (pendingDirs.length > 0 ? 1 : 0);
  if (!SKIP_SYNC && totalUpdated > 0 && !DRY_RUN) {
    console.log('\n  C) Running sync...');
    try {
      execSync('npm run sync', { stdio: 'inherit', cwd: process.cwd() });
    } catch {
      console.error('  Sync failed. Run manually: npm run sync');
    }
  }

  return updated;
}

/**
 * Find auto-research directories that haven't been upserted yet.
 * Checks for _summary.json (written by auto-research.ts) and absence of _upserted marker.
 */
function findPendingAutoResearch(): string[] {
  const baseDir = path.resolve('research/auto-research');
  if (!fs.existsSync(baseDir)) return [];

  const pending: string[] = [];
  for (const entry of fs.readdirSync(baseDir)) {
    const dir = path.join(baseDir, entry);
    if (!fs.statSync(dir).isDirectory()) continue;

    const summaryFile = path.join(dir, '_summary.json');
    const upsertedMarker = path.join(dir, '_upserted');

    // Has results but not yet upserted
    if (fs.existsSync(summaryFile) && !fs.existsSync(upsertedMarker)) {
      // Check there are actual draft files (not just summary)
      const drafts = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
      if (drafts.length > 0) {
        pending.push(dir);
      }
    }
  }

  return pending;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Pipeline Graduate — Cheap funnel for rapid foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (DRY_RUN) console.log('  DRY RUN — no DB writes, no sync');
  if (GROQ_MODEL_OVERRIDE) console.log(`  Model: ${GROQ_MODEL_OVERRIDE}`);

  if (!process.env.DATABASE_URL) {
    console.error('  DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Ingest-only mode: just close the loop on pending drafts
  if (INGEST_ONLY) {
    await phase3Upsert(sql, []);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Done (ingest-only)!\n');
    return;
  }

  // Phase 1: Keyword screen
  let candidates: ScreenCandidate[] = [];
  if (PHASE_ARG === 0 || PHASE_ARG === 1) {
    candidates = await phase1KeywordScreen(sql);
  }

  // Phase 2: LLM triage
  let triageResults: TriageResult[] = [];
  if (PHASE_ARG === 0 || PHASE_ARG === 2) {
    // If we skipped phase 1, load from disk
    if (candidates.length === 0 && PHASE_ARG === 2) {
      const today = new Date().toISOString().split('T')[0];
      const phase1File = path.resolve(`research/pipeline-graduate/phase1-${today}.json`);
      if (fs.existsSync(phase1File)) {
        const data = JSON.parse(fs.readFileSync(phase1File, 'utf-8'));
        candidates = data.items;
        console.log(`  Loaded ${candidates.length} candidates from Phase 1 results`);
      } else {
        console.error('  No Phase 1 results found. Run --phase=1 first.');
        process.exit(1);
      }
    }

    triageResults = await phase2LlmTriage(sql, candidates);
  }

  // Phase 3: Upsert + sync
  if (!DRY_RUN) {
    await phase3Upsert(sql, triageResults);
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Pipeline Graduate — Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (candidates.length > 0) {
    console.log(`  Phase 1: ${candidates.length} candidates from keyword screen`);
  }
  if (triageResults.length > 0) {
    const highFit = triageResults.filter(r => r.fitScore >= 4).length;
    const p1p2 = triageResults.filter(r => r.priority <= 2).length;
    console.log(`  Phase 2: ${triageResults.length} triaged via LLM`);
    console.log(`    FitScore ≥ 4: ${highFit}`);
    console.log(`    P1 + P2: ${p1p2}`);
  }
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Pipeline graduate failed:', err);
  process.exit(1);
});
