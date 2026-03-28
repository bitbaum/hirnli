#!/usr/bin/env tsx
/**
 * Re-score Phase2 results with stricter LLM prompt
 * 
 * Problem: Phase2 LLM is hallucinating themes on medical/sports/culture foundations.
 * This script re-runs Phase2 triage with a MUCH stricter prompt that explicitly
 * rejects off-topic foundations and validates theme assignments.
 * 
 * Usage:
 *   npx tsx scripts/rescore-phase2.ts                    # Re-score today's batch
 *   npx tsx scripts/rescore-phase2.ts --date=2026-03-28  # Specific date
 *   npx tsx scripts/rescore-phase2.ts --dry-run          # Preview only
 *   npx tsx scripts/rescore-phase2.ts --limit=50         # Cap LLM calls
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { computeFitScore } from '../src/lib/domain/fit-scoring';
import { THEME_LABELS } from './lib/theme-classifier';
import { callGroqJSON, GROQ_MODELS } from './lib/groq-client';
import { sleep } from './lib/utilities';
import { THEMES } from '../src/lib/config/foundations/metadata';
import { ThemeId } from '../src/lib/schemas/foundation';

// ============================================================================
// CLI ARGS
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DATE_ARG = args.find(a => a.startsWith('--date='))?.split('=')[1];
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10) || Infinity;
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000', 10);

// ============================================================================
// TYPES
// ============================================================================

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
  suggestedType: string;
}

const VALID_THEME_IDS: Set<string> = new Set(ThemeId.options);

const AVAILABLE_THEMES = Object.values(THEMES)
  .map(t => `  "${t.id}": ${t.label} — ${t.description}`)
  .join('\n');

// ============================================================================
// STRICT TRIAGE PROMPT — Reject hallucinations
// ============================================================================

const STRICT_TRIAGE_SYSTEM_PROMPT = `Du bist ein Schweizer Stiftungsexperte. Bewerte STRENG, ob diese Stiftung für Revamp-IT relevant ist.

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

function buildTriagePrompt(item: TriageResult, phase1: any): string {
  const lines = [
    `# ${item.name}`,
    '',
    '## Offizieller Stiftungszweck (ESA/ZHAW)',
    phase1.officialPurpose.substring(0, 1500),
    '',
    `## Bisherige (möglicherweise falsche) Bewertung`,
    `Themes: ${item.themes.map(t => THEME_LABELS[t] || t).join(', ') || 'keine'}`,
    `FitScore: ${item.fitScore}/10`,
    `isFunder: ${item.isFunder}`,
    '',
    '**Prüfe kritisch**: Passt diese Stiftung WIRKLICH zu Revamp-IT (IT-Refurbishing + Arbeitsintegration)?',
    'Bitte bewerte EHRLICH als JSON.',
  ];
  return lines.join('\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Re-score Phase2 with Strict Prompt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (DRY_RUN) console.log('  DRY RUN — preview only');

  const today = DATE_ARG || new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/pipeline-graduate');
  
  // Load Phase 1 and Phase 2 results
  const phase1File = path.join(outDir, `phase1-${today}.json`);
  const phase2File = path.join(outDir, `phase2-results-${today}.json`);
  
  if (!fs.existsSync(phase1File) || !fs.existsSync(phase2File)) {
    console.error(`  Missing files for ${today}. Run pipeline-graduate first.`);
    process.exit(1);
  }

  const phase1Data = JSON.parse(fs.readFileSync(phase1File, 'utf-8'));
  const phase2Data = JSON.parse(fs.readFileSync(phase2File, 'utf-8'));
  
  // Build lookup from Phase1 (for officialPurpose)
  const phase1Lookup = new Map<string, any>();
  for (const item of phase1Data.items) {
    phase1Lookup.set(item.slug, item);
  }

  // Filter: only re-score items with fitScore >= 4 (the ones we care about)
  const toRescore = (phase2Data.items as TriageResult[])
    .filter(item => item.fitScore >= 4)
    .slice(0, Math.min(LIMIT, Infinity));

  console.log(`  Phase2 items: ${phase2Data.items.length}`);
  console.log(`  FitScore >= 4: ${toRescore.length}`);
  console.log(`  Re-scoring: ${Math.min(toRescore.length, LIMIT)}`);

  if (!process.env.GROQ_API_KEY) {
    console.error('  GROQ_API_KEY not set.');
    process.exit(1);
  }

  const corrected: TriageResult[] = [];
  const unchanged: TriageResult[] = [];
  let errors = 0;
  let tokensUsed = 0;

  for (let i = 0; i < toRescore.length; i++) {
    const item = toRescore[i];
    const phase1 = phase1Lookup.get(item.slug);
    if (!phase1) {
      console.error(`  ${item.slug}: No Phase1 data found, skipping`);
      continue;
    }

    const progress = `[${i + 1}/${toRescore.length}]`;
    const prompt = buildTriagePrompt(item, phase1);

    console.log(`  ${progress} ${item.name} (old fit=${item.fitScore})...`);

    if (DRY_RUN && i >= 3) {
      console.log(`  DRY RUN — stopping after 3 previews`);
      break;
    }

    const groqResult = await callGroqJSON<Record<string, unknown>>(
      STRICT_TRIAGE_SYSTEM_PROMPT, prompt,
      { maxTokens: 512, temperature: 0.2, timeoutMs: 30_000 },
    );

    if (!groqResult.ok) {
      console.error(`    ERROR: ${groqResult.error}`);
      errors++;
      await sleep(DELAY_MS * 2);
      continue;
    }

    if (groqResult.usage) {
      tokensUsed += groqResult.usage.prompt_tokens + groqResult.usage.completion_tokens;
    }

    const raw = groqResult.data;

    // Extract and validate themes
    const rawThemes = Array.isArray(raw.themes) ? raw.themes : [];
    const validThemes = rawThemes.filter((t: unknown) =>
      typeof t === 'string' && VALID_THEME_IDS.has(t)
    ) as string[];

    // Compute real fitScore from LLM themes (algorithmic)
    const applicationMethod = (raw.applicationMethod as string) || 'unknown';
    const isFunder = typeof raw.isFunder === 'boolean' ? raw.isFunder : item.isFunder;
    const { fitScore: algoScore } = computeFitScore({
      themes: validThemes,
      canton: phase1.canton,
      city: phase1.city,
      applicationMethod,
      isFunder,
    });

    // LLM's contextual assessment (0-3 scale → map to 0-10)
    const LLM_FIT_MAP = [0, 4, 6, 8] as const;
    const suggestedFit = typeof raw.suggestedFit === 'number' ? Math.min(3, Math.max(0, Math.round(raw.suggestedFit))) : 0;
    const llmScore = LLM_FIT_MAP[suggestedFit] ?? 0;

    // Use best of algorithmic and LLM-assessed score
    const newFitScore = Math.max(algoScore, llmScore);

    // Priority from fitScore
    const isZurich = phase1.canton === 'ZH';
    let priority: 1 | 2 | 3 | 4;
    if (newFitScore >= 7 && isFunder) priority = 1;
    else if (newFitScore >= 4 && (isFunder || isZurich)) priority = 2;
    else if (newFitScore >= 4) priority = 3;
    else priority = 4;

    const correctedItem: TriageResult = {
      slug: item.slug,
      name: item.name,
      fitScore: newFitScore,
      priority,
      themes: validThemes,
      purposeSummary: (raw.purposeSummary as string) || item.purposeSummary,
      researchNotes: (raw.researchNotes as string) || item.researchNotes,
      isFunder,
      funderConfidence: (raw.funderConfidence as string) || 'low',
      applicationMethod,
      suggestedType: (raw.suggestedType as string) || 'C',
    };

    const changed = newFitScore !== item.fitScore || validThemes.join(',') !== item.themes.join(',');
    if (changed) {
      corrected.push(correctedItem);
      const oldFit = item.fitScore >= 7 ? '★★★' : item.fitScore >= 4 ? '★★☆' : '★☆☆';
      const newFit = newFitScore >= 7 ? '★★★' : newFitScore >= 4 ? '★★☆' : '★☆☆';
      console.log(`    CORRECTED: ${item.fitScore} ${oldFit} → ${newFitScore} ${newFit}`);
      console.log(`      Old themes: [${item.themes.join(',')}]`);
      console.log(`      New themes: [${validThemes.join(',')}]`);
    } else {
      unchanged.push(correctedItem);
      console.log(`    OK: fit=${newFitScore}, themes=[${validThemes.join(',')}]`);
    }

    if (i < toRescore.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  Re-scoring complete: ${corrected.length} corrected, ${unchanged.length} unchanged, ${errors} errors`);
  console.log(`  Tokens used: ${tokensUsed}`);

  // Save corrected results
  if (!DRY_RUN && corrected.length > 0) {
    const correctedFile = path.join(outDir, `phase2-corrected-${today}.json`);
    
    // Merge with unchanged items and original low-fit items
    const allItems = [
      ...corrected,
      ...unchanged,
      ...(phase2Data.items as TriageResult[]).filter((item: TriageResult) => item.fitScore < 4),
    ];
    
    fs.writeFileSync(correctedFile, JSON.stringify({
      date: today,
      total: allItems.length,
      correctedCount: corrected.length,
      items: allItems.sort((a, b) => b.fitScore - a.fitScore),
    }, null, 2));
    
    console.log(`  Corrected results: ${correctedFile}`);
    
    // Summary of corrections
    const demotedToZero = corrected.filter(c => c.fitScore === 0).length;
    const stillHighFit = corrected.filter(c => c.fitScore >= 7).length;
    console.log(`\n  Summary:`);
    console.log(`    Demoted to fitScore=0: ${demotedToZero}`);
    console.log(`    Still fitScore>=7: ${stillHighFit}`);
  }
}

main().catch((err) => {
  console.error('Re-scoring failed:', err);
  process.exit(1);
});
