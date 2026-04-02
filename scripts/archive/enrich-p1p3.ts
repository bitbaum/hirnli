#!/usr/bin/env tsx
/**
 * Enrich P1-P3 — Targeted enrichment for P1-P3 foundations below recherchiert
 *
 * Two-layer enrichment:
 *   Layer 1 (keywords): Free — classify themes from officialPurpose via keyword matching
 *   Layer 2 (LLM):      Cheap — generate purposeSummary + researchNotes via Groq
 *
 * Both layers upsert back to DB with GREATEST/LEAST score protection.
 *
 * Usage:
 *   npx tsx scripts/enrich-p1p3.ts --dry-run        # Preview changes
 *   npx tsx scripts/enrich-p1p3.ts --phase=keywords  # Layer 1 only (free)
 *   npx tsx scripts/enrich-p1p3.ts --phase=llm       # Layer 2 only (Groq)
 *   npx tsx scripts/enrich-p1p3.ts                    # Both layers
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index.js';
import { computeReadinessScore } from '../src/lib/domain/foundation-scores.js';
import { computePriorityScore } from '../src/lib/domain/foundation-scores.js';
import { computeFitScore } from '../src/lib/domain/fit-scoring.js';
import { classifyThemes, THEME_LABELS } from './lib/theme-classifier.js';
import { callGroqJSON } from './lib/groq-client.js';
import { sleep } from './lib/utilities.js';
import { THEMES } from '../src/lib/config/foundations/metadata.js';
import { ThemeId } from '../src/lib/schemas/foundation.js';
import type { Foundation } from '../src/lib/schemas/foundation.js';

// ============================================================================
// CLI ARGS
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PHASE_ARG = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'both';
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10) || Infinity;
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000', 10);

// ============================================================================
// Find P1-P3 foundations below recherchiert
// ============================================================================

interface GapFoundation {
  foundation: Foundation;
  priorityLevel: number;
  readinessScore: number;
  tier: string;
}

function findGapFoundations(): GapFoundation[] {
  const gaps: GapFoundation[] = [];

  for (const f of STIFTUNGEN_DATA) {
    const readiness = computeReadinessScore(f);
    const priority = computePriorityScore(f, readiness.score);

    // Only P1-P3
    if (priority.level > 3) continue;

    // Only below recherchiert
    if (readiness.tier === 'recherchiert' || readiness.tier === 'anwendungsbereit') continue;

    gaps.push({
      foundation: f,
      priorityLevel: priority.level,
      readinessScore: readiness.score,
      tier: readiness.tier,
    });
  }

  // Sort: P1 first, then lowest readiness (most room for improvement)
  gaps.sort((a, b) => {
    if (a.priorityLevel !== b.priorityLevel) return a.priorityLevel - b.priorityLevel;
    return a.readinessScore - b.readinessScore;
  });

  return gaps;
}

// ============================================================================
// LAYER 1: Keyword enrichment (0 tokens)
// ============================================================================

interface KeywordResult {
  slug: string;
  name: string;
  newThemes: string[];
  oldThemes: string[];
  newFitScore: number;
  oldFitScore: number;
  improved: boolean;
}

async function layer1Keywords(
  sql: NeonQueryFunction<false, false>,
  gaps: GapFoundation[],
): Promise<{ results: KeywordResult[]; remaining: GapFoundation[] }> {
  console.log('\n━━━ Layer 1: Keyword Enrichment (0 tokens) ━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Foundations to process: ${gaps.length}`);

  // Fetch officialPurpose from registry for all gap foundations
  const slugs = gaps.map(g => g.foundation.slug);

  // Batch query in chunks of 500
  const purposeMap = new Map<string, string>();
  for (let i = 0; i < slugs.length; i += 500) {
    const chunk = slugs.slice(i, i + 500);
    const rows = await sql`
      SELECT id, official_purpose
      FROM fundraising_foundation_registry
      WHERE id = ANY(${chunk})
        AND official_purpose IS NOT NULL
        AND LENGTH(official_purpose) > 30
    ` as { id: string; official_purpose: string }[];

    for (const row of rows) {
      purposeMap.set(row.id, row.official_purpose);
    }
  }

  console.log(`  Foundations with officialPurpose (>30 chars): ${purposeMap.size}`);

  const results: KeywordResult[] = [];
  let improved = 0;
  let upserted = 0;
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  for (const gap of gaps) {
    const f = gap.foundation;
    const purpose = purposeMap.get(f.slug);
    if (!purpose) continue;

    const purposeLower = purpose.toLowerCase();
    const nameLower = f.name.toLowerCase();

    // Classify themes using updated keyword rules
    const newThemes = classifyThemes(purposeLower, nameLower);

    // Merge with existing themes (union, no duplicates)
    const existingThemes = f.themes || [];
    const merged = [...new Set([...existingThemes, ...newThemes])];

    // Only proceed if we found new themes
    const addedThemes = merged.filter(t => !existingThemes.includes(t));
    if (addedThemes.length === 0) {
      results.push({
        slug: f.slug,
        name: f.name,
        newThemes: existingThemes,
        oldThemes: existingThemes,
        newFitScore: f.fitScore,
        oldFitScore: f.fitScore,
        improved: false,
      });
      continue;
    }

    // Recompute fitScore with new themes
    const { fitScore: newFitScore } = computeFitScore({
      themes: merged,
      canton: f.contact?.address?.includes('Zürich') ? 'ZH' : '',
      city: f.contact?.address || '',
      applicationMethod: f.applicationMethod || 'unknown',
      isFunder: !f.isOperative,
    });

    improved++;

    results.push({
      slug: f.slug,
      name: f.name,
      newThemes: merged,
      oldThemes: existingThemes,
      newFitScore,
      oldFitScore: f.fitScore,
      improved: true,
    });

    // Upsert to DB
    if (!DRY_RUN) {
      try {
        const mergeConfig = { themes: merged };
        await sql`
          UPDATE fundraising_foundations
          SET
            config_data = config_data || ${JSON.stringify(mergeConfig)}::jsonb,
            fit_score = GREATEST(fit_score, ${newFitScore}),
            focus_areas = ${JSON.stringify(merged)},
            updated_at = ${now}
          WHERE id = ${f.slug}
        `;
        upserted++;
      } catch (err) {
        console.error(`    ${f.name}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  console.log(`  Improved (new themes found): ${improved}`);
  console.log(`  Upserted to DB: ${upserted}`);

  // Log top improvements
  const topImproved = results
    .filter(r => r.improved)
    .sort((a, b) => b.newFitScore - a.newFitScore)
    .slice(0, 10);

  if (topImproved.length > 0) {
    console.log(`\n  Top improvements:`);
    for (const r of topImproved) {
      const addedThemes = r.newThemes.filter(t => !r.oldThemes.includes(t));
      console.log(`    ${r.name}: fit ${r.oldFitScore}→${r.newFitScore}, +themes: [${addedThemes.join(',')}]`);
    }
  }

  // Remaining: foundations still below recherchiert after keyword enrichment
  const remaining = gaps.filter(g => {
    const result = results.find(r => r.slug === g.foundation.slug);
    // If not improved or not found in results, still a gap
    return !result?.improved || true; // Keep all for layer 2 — readiness depends on more than themes
  });

  return { results, remaining: gaps }; // Pass all gaps to layer 2 (themes alone rarely graduate)
}

// ============================================================================
// LAYER 2: LLM enrichment (Groq, ~500 tokens each)
// ============================================================================

const VALID_THEME_IDS: Set<string> = new Set(ThemeId.options);

const AVAILABLE_THEMES = Object.values(THEMES)
  .map(t => `  "${t.id}": ${t.label} — ${t.description}`)
  .join('\n');

const ENRICH_SYSTEM_PROMPT = `Du bist ein Schweizer Stiftungsexperte. Ergänze fehlende Daten für diese Stiftung.

## Über Revamp-IT (Kurzprofil)
- IT-Refurbishing + Kreislaufwirtschaft (Zürich)
- Arbeitsintegration: 8-10 Praktikumsplätze für Sozialhilfe/RAV/IV
- Digitale Bildung: Linux-Kurse, Reparatur-Workshops
- Gemeinnütziger Verein seit 2009

## Verfügbare Themen
${AVAILABLE_THEMES}

## Aufgabe
Analysiere den offiziellen Stiftungszweck und generiere:
1. purposeSummary: Spezifische Zusammenfassung des Förderzwecks (150+ Zeichen)
2. researchNotes: Einschätzung der Passung zu Revamp-IT (250+ Zeichen)
3. themes: Relevante Themen-IDs aus der Liste oben

## JSON-Format
{
  "purposeSummary": "string (150+ Zeichen, spezifische Förderbereiche)",
  "researchNotes": "string (250+ Zeichen, Passung zu Revamp-IT mit konkreten Anknüpfungspunkten)",
  "themes": ["theme-id", ...],
  "suggestedFitScore": 0-10,
  "isFunder": boolean
}

WICHTIG: Schweizer Schriftdeutsch (ss statt ß). Nur valides JSON.`;

interface LlmResult {
  slug: string;
  name: string;
  purposeSummary: string;
  researchNotes: string;
  themes: string[];
  fitScore: number;
  success: boolean;
}

async function layer2Llm(
  sql: NeonQueryFunction<false, false>,
  gaps: GapFoundation[],
): Promise<LlmResult[]> {
  console.log('\n━━━ Layer 2: LLM Enrichment (Groq, ~500 tokens each) ━━━━━━━━━');

  if (!process.env.GROQ_API_KEY) {
    console.error('  GROQ_API_KEY not set. Skipping Layer 2.');
    return [];
  }

  // Filter: only foundations that still need enrichment
  // (missing purposeSummary or researchNotes or both are too short)
  const needsLlm = gaps.filter(g => {
    const f = g.foundation;
    const hasPurpose = f.purposeSummary && f.purposeSummary.length >= 100;
    const hasNotes = f.researchNotes && f.researchNotes.length >= 100;
    return !hasPurpose || !hasNotes;
  });

  // Fetch officialPurpose for LLM prompt context
  const slugs = needsLlm.map(g => g.foundation.slug);
  const purposeMap = new Map<string, string>();
  for (let i = 0; i < slugs.length; i += 500) {
    const chunk = slugs.slice(i, i + 500);
    const rows = await sql`
      SELECT id, official_purpose
      FROM fundraising_foundation_registry
      WHERE id = ANY(${chunk})
        AND official_purpose IS NOT NULL
    ` as { id: string; official_purpose: string }[];

    for (const row of rows) {
      purposeMap.set(row.id, row.official_purpose);
    }
  }

  // Also check existing config_data for officialPurpose
  for (let i = 0; i < slugs.length; i += 500) {
    const chunk = slugs.slice(i, i + 500);
    const rows = await sql`
      SELECT id, config_data->>'officialPurpose' as purpose, config_data->>'purposeSummary' as summary
      FROM fundraising_foundations
      WHERE id = ANY(${chunk})
    ` as { id: string; purpose: string | null; summary: string | null }[];

    for (const row of rows) {
      if (!purposeMap.has(row.id) && row.purpose && row.purpose.length > 30) {
        purposeMap.set(row.id, row.purpose);
      }
      // Also use existing purposeSummary as fallback context
      if (!purposeMap.has(row.id) && row.summary && row.summary.length > 30) {
        purposeMap.set(row.id, row.summary);
      }
    }
  }

  // Filter to those with text to send to LLM
  const processable = needsLlm.filter(g => purposeMap.has(g.foundation.slug));
  const toProcess = processable.slice(0, Math.min(processable.length, LIMIT));

  console.log(`  Foundations needing LLM enrichment: ${needsLlm.length}`);
  console.log(`  With available purpose text: ${processable.length}`);
  console.log(`  Processing this run: ${toProcess.length}${LIMIT < Infinity ? ` (limit=${LIMIT})` : ''}`);

  if (toProcess.length === 0) {
    console.log('  Nothing to process.');
    return [];
  }

  // Idempotency tracking
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/diagnostics');
  fs.mkdirSync(outDir, { recursive: true });
  const processedFile = path.join(outDir, `enrich-processed-${today}.json`);

  let processedSlugs = new Set<string>();
  if (fs.existsSync(processedFile)) {
    const existing = JSON.parse(fs.readFileSync(processedFile, 'utf-8')) as string[];
    processedSlugs = new Set(existing);
    console.log(`  Already processed today: ${processedSlugs.size}`);
  }

  const results: LlmResult[] = [];
  let success = 0;
  let errors = 0;
  let tokensUsed = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < toProcess.length; i++) {
    const gap = toProcess[i];
    const f = gap.foundation;
    const progress = `[${i + 1}/${toProcess.length}]`;

    if (processedSlugs.has(f.slug)) {
      continue; // Skip already processed
    }

    if (DRY_RUN && i >= 3) {
      console.log(`  ${progress} DRY RUN — stopping after 3 previews`);
      break;
    }

    const purpose = purposeMap.get(f.slug)!;
    const existingThemes = f.themes || [];

    const userPrompt = [
      `# ${f.name}`,
      `Bestehende Themen: ${existingThemes.map(t => THEME_LABELS[t] || t).join(', ') || 'keine'}`,
      `FitScore: ${f.fitScore}/10`,
      '',
      '## Offizieller Stiftungszweck',
      purpose.substring(0, 2000),
      '',
      'Bitte ergänze fehlende Daten als JSON.',
    ].join('\n');

    console.log(`  ${progress} ${f.name}...`);

    const groqResult = await callGroqJSON<Record<string, unknown>>(
      ENRICH_SYSTEM_PROMPT, userPrompt,
      { maxTokens: 1024, temperature: 0.2, timeoutMs: 30_000 },
    );

    if (!groqResult.ok) {
      console.error(`    ERROR: ${groqResult.error}`);
      errors++;
      if (groqResult.error?.includes('429') || groqResult.error?.includes('Rate limit')) {
        console.error('  Rate limit hit. Stopping. Re-run later to continue.');
        break;
      }
      await sleep(DELAY_MS * 2);
      continue;
    }

    if (groqResult.usage) {
      tokensUsed += groqResult.usage.prompt_tokens + groqResult.usage.completion_tokens;
    }

    const raw = groqResult.data;

    // Extract and validate
    const purposeSummary = typeof raw.purposeSummary === 'string' ? raw.purposeSummary : '';
    const researchNotes = typeof raw.researchNotes === 'string' ? raw.researchNotes : '';
    const rawThemes = Array.isArray(raw.themes) ? raw.themes : [];
    const validThemes = rawThemes.filter((t: unknown) =>
      typeof t === 'string' && VALID_THEME_IDS.has(t)
    ) as string[];

    // Merge themes (union)
    const mergedThemes = [...new Set([...existingThemes, ...validThemes])];

    // Recompute fitScore
    const { fitScore: newFitScore } = computeFitScore({
      themes: mergedThemes,
      canton: f.contact?.address?.includes('Zürich') ? 'ZH' : '',
      city: f.contact?.address || '',
      applicationMethod: f.applicationMethod || 'unknown',
      isFunder: !f.isOperative,
    });

    results.push({
      slug: f.slug,
      name: f.name,
      purposeSummary,
      researchNotes,
      themes: mergedThemes,
      fitScore: newFitScore,
      success: true,
    });

    // Upsert to DB
    if (!DRY_RUN && purposeSummary.length >= 50) {
      try {
        const mergeConfig: Record<string, unknown> = {
          themes: mergedThemes,
          researchDate: today,
        };
        // Only set purposeSummary if it's better than existing
        if (purposeSummary.length >= 100) {
          mergeConfig.purposeSummary = purposeSummary;
          mergeConfig.tagline = purposeSummary.substring(0, 80);
        }
        if (researchNotes.length >= 100) {
          mergeConfig.researchNotes = researchNotes;
        }

        await sql`
          UPDATE fundraising_foundations
          SET
            config_data = config_data || ${JSON.stringify(mergeConfig)}::jsonb,
            fit_score = GREATEST(fit_score, ${newFitScore}),
            focus_areas = ${JSON.stringify(mergedThemes)},
            research_date = ${today},
            updated_at = ${now}
          WHERE id = ${f.slug}
        `;
        success++;
      } catch (err) {
        console.error(`    ${f.name}: ${err instanceof Error ? err.message : err}`);
        errors++;
      }
    }

    processedSlugs.add(f.slug);

    const fitLabel = newFitScore >= 7 ? '★★★' : newFitScore >= 4 ? '★★☆' : '★☆☆';
    console.log(`    → fit=${newFitScore} ${fitLabel}, themes=[${mergedThemes.join(',')}], purpose=${purposeSummary.length}ch, notes=${researchNotes.length}ch`);

    // Rate limit protection
    if (i < toProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  Layer 2 complete: ${success} enriched, ${errors} errors, ${tokensUsed} tokens used`);

  // Save processed list
  if (!DRY_RUN) {
    fs.writeFileSync(processedFile, JSON.stringify([...processedSlugs], null, 2));

    // Write results
    const resultsFile = path.join(outDir, `enrich-results-${today}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify({
      date: today,
      total: results.length,
      success,
      errors,
      tokensUsed,
      items: results,
    }, null, 2));
    console.log(`  Results written to: ${resultsFile}`);
  }

  return results;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Enrich P1-P3 — Targeted enrichment for strategic foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (DRY_RUN) console.log('  DRY RUN — no DB writes');
  console.log(`  Phase: ${PHASE_ARG}`);

  if (!process.env.DATABASE_URL) {
    console.error('  DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Find all P1-P3 foundations below recherchiert
  const gaps = findGapFoundations();
  console.log(`\n  P1-P3 foundations below recherchiert: ${gaps.length}`);

  const byPriority = { 1: 0, 2: 0, 3: 0 };
  for (const g of gaps) {
    byPriority[g.priorityLevel as 1 | 2 | 3]++;
  }
  console.log(`    P1: ${byPriority[1]}, P2: ${byPriority[2]}, P3: ${byPriority[3]}`);

  let keywordResults: KeywordResult[] = [];
  let llmResults: LlmResult[] = [];

  // Layer 1: Keywords
  if (PHASE_ARG === 'keywords' || PHASE_ARG === 'both') {
    const layer1 = await layer1Keywords(sql, gaps);
    keywordResults = layer1.results;
  }

  // Layer 2: LLM
  if (PHASE_ARG === 'llm' || PHASE_ARG === 'both') {
    llmResults = await layer2Llm(sql, gaps);
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Enrichment Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  P1-P3 gap size: ${gaps.length}`);

  if (keywordResults.length > 0) {
    const improved = keywordResults.filter(r => r.improved).length;
    console.log(`  Layer 1 (keywords): ${improved} improved out of ${keywordResults.length}`);
  }

  if (llmResults.length > 0) {
    const enriched = llmResults.filter(r => r.success).length;
    console.log(`  Layer 2 (LLM): ${enriched} enriched`);
  }

  if (!DRY_RUN) {
    console.log('\n  Next steps:');
    console.log('    1. npm run sync     # Regenerate stiftungen-generated.ts');
    console.log('    2. npm run build    # Verify new Gesuch page count');
    console.log('    3. npx tsx scripts/diagnose-p1p3-gaps.ts  # Re-measure gap');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
