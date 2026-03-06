#!/usr/bin/env tsx
/**
 * Auto-Research — LLM batch research via Groq
 *
 * Takes triage output and enriches each foundation with LLM analysis:
 *   1. Fetches website content via web-extract.ts
 *   2. Combines with ESA purpose + existing DB data
 *   3. Sends to Groq (llama-3.3-70b) with structured research prompt
 *   4. Parses response into ResearchDraft JSON
 *   5. Writes drafts to research/auto-research/YYYY-MM-DD/
 *
 * Drafts feed directly into foundation-upsert.ts → npm run sync → npm run build
 *
 * Usage:
 *   npx tsx scripts/auto-research.ts research/triage/2026-03-05.json
 *   npx tsx scripts/auto-research.ts research/triage/2026-03-05.json --dry-run
 *   npx tsx scripts/auto-research.ts research/triage/2026-03-05.json --limit=10
 *   npx tsx scripts/auto-research.ts research/triage/2026-03-05.json --offset=20 --limit=10
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { callGroqJSON } from './lib/groq-client';
import { extractWebContent } from './lib/web-extract';
import { ResearchAnalysisSchema } from './lib/research-types';
import type { ResearchAnalysis, ResearchDraft } from './lib/research-types';
import { THEMES } from '../src/lib/config/foundations/metadata';
import { ThemeId } from '../src/lib/schemas/foundation';

type ThemeIdType = z.infer<typeof ThemeId>;
const VALID_THEME_IDS: Set<string> = new Set(ThemeId.options);
function filterValidThemes(ids: string[]): ThemeIdType[] {
  return ids.filter(t => VALID_THEME_IDS.has(t)) as ThemeIdType[];
}

// ============================================================================
// CLI args
// ============================================================================

const args = process.argv.slice(2);
const inputFile = args.find(a => !a.startsWith('--'));
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10) || Infinity;
const OFFSET = parseInt(args.find(a => a.startsWith('--offset='))?.split('=')[1] || '0', 10) || 0;
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000', 10);

if (!inputFile) {
  console.error('Usage: npx tsx scripts/auto-research.ts <triage-file.json> [--dry-run] [--limit=N] [--offset=N]');
  process.exit(1);
}

// ============================================================================
// Types (from triage.ts output)
// ============================================================================

interface TriageItem {
  slug: string;
  name: string;
  fitScore: number;
  priority: number;
  researchDepth: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  officialPurpose: string | null;
  themes: string[];
  missing: string[];
  triageScore: number;
}

interface TriageOutput {
  date: string;
  items: TriageItem[];
}

// ============================================================================
// Research prompt — adapted from foundation-research-assistant.ts
// ============================================================================

const AVAILABLE_THEMES = Object.values(THEMES)
  .map(t => `  "${t.id}": ${t.label} — ${t.description}`)
  .join('\n');

const SYSTEM_PROMPT = `Du bist ein Schweizer Stiftungsexperte. Du analysierst Stiftungen und bewertest deren Passung für Revamp-IT, ein Sozialunternehmen in Zürich.

## Über Revamp-IT
- Repariert und refurbisht IT-Geräte (Kreislaufwirtschaft, ~150 Geräte/Jahr, ~285 kg CO₂ gespart pro Gerät)
- Installiert Linux (digitale Souveränität, Open Source)
- Gibt Geräte an Bedürftige weiter (soziale Integration)
- Bietet 8-10 Praktikumsplätze für Benachteiligte (Arbeitsintegration, Sozialhilfe/RAV/IV)
- IT-Workshops und digitale Bildung (Linux-Kurse, Reparatur-Workshops)
- Standort: Zürich (Badenerstrasse 816 + Birmensdorferstrasse 379)
- Gemeinnütziger Verein seit 2009, 100+ Praktikant:innen seit Beginn

## Verfügbare Themen
${AVAILABLE_THEMES}

## Aufgabe
Analysiere die gegebene Stiftung und gib eine strukturierte JSON-Antwort zurück.

## JSON-Antwortformat
{
  "isFunder": boolean,          // Förderstiftung (true) oder operativ (false)?
  "funderConfidence": "high"|"medium"|"low",
  "reasoning": "string",        // 1-2 Sätze: Warum Förderer oder Operator?
  "themes": ["theme-id", ...],  // Passende Theme-IDs aus der Liste oben
  "suggestedType": "A"|"B"|"C"|"D"|"network",  // Robert Schmuki Klassifizierung
  "suggestedFit": 0-3,          // 0=unbewertet, 1=gering, 2=gut, 3=exzellent
  "suggestedPriority": 1-4,     // 1=sofort, 2=hoch, 3=mittel, 4=niedrig
  "purposeSummary": "string",   // 150+ Zeichen: Was fördert diese Stiftung? Spezifische Schwerpunkte.
  "researchNotes": "string",    // 250+ Zeichen: Warum passt sie zu Revamp-IT? Alignment-Punkte, Empfehlungen.
  "applicationMethod": "online"|"email"|"contact"|"post"|"invitation"|"unknown",
  "contactInfo": { "email": "...", "phone": "...", "address": "..." },
  "grantRange": { "min": number|null, "max": number|null, "typical": number|null },
  "warnings": ["string", ...]   // Warnungen oder Red Flags
}

WICHTIG:
- purposeSummary MUSS mindestens 150 Zeichen lang sein und spezifische Förderbereiche nennen
- researchNotes MUSS mindestens 250 Zeichen lang sein mit konkreter Analyse der Passung zu Revamp-IT
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü)
- Gib NUR valides JSON zurück, kein Markdown, keine Erklärung`;

function buildUserPrompt(item: TriageItem, websiteContent: string | null): string {
  const lines: string[] = [];

  lines.push(`# Stiftung: ${item.name}`);
  lines.push(`Slug: ${item.slug}`);

  if (item.websiteUrl) lines.push(`Website: ${item.websiteUrl}`);
  if (item.contactEmail) lines.push(`E-Mail: ${item.contactEmail}`);
  if (item.contactPhone) lines.push(`Telefon: ${item.contactPhone}`);
  if (item.themes.length > 0) lines.push(`Bisherige Themen: ${item.themes.join(', ')}`);
  lines.push(`Aktueller Fit-Score: ${item.fitScore}/10`);
  lines.push(`Aktuelle Priorität: P${item.priority}`);

  if (item.officialPurpose) {
    lines.push(`\n## Offizieller Stiftungszweck (ESA)`);
    lines.push(item.officialPurpose.substring(0, 2000));
  }

  if (websiteContent) {
    lines.push(`\n## Website-Inhalt (gekürzt)`);
    lines.push(websiteContent);
  } else {
    lines.push(`\n## Website: Nicht erreichbar oder kein Inhalt`);
  }

  lines.push(`\nBitte analysiere diese Stiftung und gib die strukturierte JSON-Antwort zurück.`);

  return lines.join('\n');
}

// ============================================================================
// Draft builder — maps Groq output to ResearchDraft (compatible with upsert)
// ============================================================================

function buildDraft(item: TriageItem, analysis: ResearchAnalysis, websiteContent: string | null): ResearchDraft {
  return {
    slug: item.slug,
    name: item.name,
    timestamp: new Date().toISOString(),
    queueItem: {
      name: item.name,
      slug: item.slug,
      tier: item.priority,
      evScore: item.fitScore,
      websiteUrl: item.websiteUrl || undefined,
      esaMatch: {
        uid: '',
        name: item.name,
        purpose: item.officialPurpose || '',
        canton: '',
        city: '',
        status: 'aktiv',
      },
      candidate: {
        name: item.name,
        slug: item.slug,
      },
    },
    websiteContent: websiteContent || undefined,
    analysis,
    _meta: {
      source: 'auto-research',
      groqModel: 'llama-3.3-70b-versatile',
      triageScore: item.triageScore,
    },
  };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  // Load triage file
  const fullPath = path.resolve(inputFile!);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
  }

  const triage: TriageOutput = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const allItems = triage.items.slice(OFFSET, OFFSET + LIMIT);

  console.log(`Auto-Research: ${allItems.length} foundations (offset=${OFFSET}, limit=${LIMIT === Infinity ? 'all' : LIMIT})`);
  if (DRY_RUN) console.log('  DRY RUN — will process first 3 only, no files written');

  const items = DRY_RUN ? allItems.slice(0, 3) : allItems;

  // Output directory
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve(`research/auto-research/${today}`);
  if (!DRY_RUN) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let success = 0;
  let errors = 0;
  let skipped = 0;
  const results: { slug: string; status: string; fitScore?: number; priority?: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = `[${i + 1}/${items.length}]`;

    // Skip if no website (can't fetch content, LLM has nothing to work with beyond ESA purpose)
    if (!item.websiteUrl || item.websiteUrl.includes('zefix.ch') || item.websiteUrl.includes('uid.admin.ch')) {
      if (item.officialPurpose && item.officialPurpose.length > 100) {
        // ESA purpose is substantial enough to analyze without website
        console.log(`  ${progress} ${item.name} — no website, using ESA purpose only`);
      } else {
        console.log(`  ${progress} ${item.name} — SKIP (no website, no substantial ESA purpose)`);
        skipped++;
        results.push({ slug: item.slug, status: 'skipped-no-content' });
        continue;
      }
    }

    // Fetch website content
    let websiteContent: string | null = null;
    if (item.websiteUrl && !item.websiteUrl.includes('zefix.ch')) {
      try {
        const result = await extractWebContent(item.websiteUrl);
        if (result.ok && result.content) {
          websiteContent = result.content;
        }
      } catch {
        // Website fetch failed — continue with ESA purpose only
      }
    }

    // Build prompt
    const userPrompt = buildUserPrompt(item, websiteContent);

    // Call Groq
    console.log(`  ${progress} ${item.name} — calling Groq...`);
    const groqResult = await callGroqJSON<Record<string, unknown>>(SYSTEM_PROMPT, userPrompt, {
      maxTokens: 2048,
      temperature: 0.3,
      timeoutMs: 60_000,
    });

    if (!groqResult.ok) {
      console.error(`  ${progress} ${item.name} — Groq error: ${groqResult.error}`);
      errors++;
      results.push({ slug: item.slug, status: `error: ${groqResult.error}` });
      // Wait before retry on next item
      await sleep(DELAY_MS * 2);
      continue;
    }

    // Strip null values (Groq sends null for missing fields, Zod expects undefined)
    const cleaned = stripNulls(groqResult.data as Record<string, unknown>);

    // Parse and validate against ResearchAnalysisSchema
    const parsed = ResearchAnalysisSchema.safeParse(cleaned);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      console.error(`  ${progress} ${item.name} — validation error: ${issues}`);

      // Try to salvage: fill in missing fields with defaults
      const salvaged = salvageAnalysis(groqResult.data as Record<string, unknown>, item);
      if (salvaged) {
        console.log(`  ${progress} ${item.name} — salvaged with defaults`);
        const draft = buildDraft(item, salvaged, websiteContent);
        writeDraft(outDir, draft, DRY_RUN, progress);
        success++;
        results.push({ slug: item.slug, status: 'salvaged', fitScore: salvaged.suggestedFit, priority: salvaged.suggestedPriority });
      } else {
        errors++;
        results.push({ slug: item.slug, status: `validation-error: ${issues}` });
      }
      await sleep(DELAY_MS);
      continue;
    }

    const analysis = parsed.data;
    const draft = buildDraft(item, analysis, websiteContent);

    writeDraft(outDir, draft, DRY_RUN, progress);
    success++;
    results.push({ slug: item.slug, status: 'ok', fitScore: analysis.suggestedFit, priority: analysis.suggestedPriority });

    if (groqResult.usage) {
      const tokens = groqResult.usage.prompt_tokens + groqResult.usage.completion_tokens;
      console.log(`    → isFunder=${analysis.isFunder}, themes=[${analysis.themes.join(',')}], fit=${analysis.suggestedFit}, P${analysis.suggestedPriority} (${tokens} tokens)`);
    }

    // Rate limit: don't hammer Groq
    if (i < items.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log(`\nAuto-Research complete: ${success} success, ${errors} errors, ${skipped} skipped`);
  if (!DRY_RUN && success > 0) {
    console.log(`  Drafts written to: ${outDir}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review drafts: ls ${outDir}`);
    console.log(`  2. Upsert: npx tsx scripts/foundation-upsert.ts ${outDir}`);
    console.log(`  3. Sync:   npm run sync`);
    console.log(`  4. Build:  npm run build`);

    // Write summary file
    const summaryFile = path.join(outDir, '_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify({
      date: today,
      source: inputFile,
      total: items.length,
      success,
      errors,
      skipped,
      results,
    }, null, 2));
  }
}

// ============================================================================
// Helpers
// ============================================================================

import { sleep } from './lib/utilities';

/** Recursively strip null values from an object (Groq sends null, Zod expects undefined) */
function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) continue; // skip null → becomes undefined (absent)
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      result[key] = stripNulls(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function writeDraft(outDir: string, draft: ResearchDraft, dryRun: boolean, progress: string): void {
  if (dryRun) {
    console.log(`  ${progress} ${draft.name} — DRY RUN (would write ${draft.slug}.json)`);
    console.log(`    Analysis: isFunder=${draft.analysis.isFunder}, themes=[${draft.analysis.themes.join(',')}]`);
    console.log(`    Purpose: ${draft.analysis.purposeSummary.substring(0, 80)}...`);
    return;
  }

  const outFile = path.join(outDir, `${draft.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(draft, null, 2));
  console.log(`  ${progress} ${draft.name} → ${draft.slug}.json`);
}

/**
 * Attempt to salvage a partially valid Groq response by filling defaults.
 * Returns null if core fields (isFunder, purposeSummary) are truly missing.
 */
function salvageAnalysis(raw: Record<string, unknown>, item: TriageItem): ResearchAnalysis | null {
  try {
    const analysis: ResearchAnalysis = {
      isFunder: typeof raw.isFunder === 'boolean' ? raw.isFunder : true,
      funderConfidence: (raw.funderConfidence as 'high' | 'medium' | 'low') || 'low',
      reasoning: (raw.reasoning as string) || 'Auto-salvaged from partial Groq response',
      themes: filterValidThemes(Array.isArray(raw.themes) ? raw.themes : item.themes),
      suggestedType: (['A', 'B', 'C', 'D', 'network'].includes(raw.suggestedType as string) ? raw.suggestedType : 'C') as ResearchAnalysis['suggestedType'],
      suggestedFit: typeof raw.suggestedFit === 'number' ? Math.min(3, Math.max(0, raw.suggestedFit)) : 1,
      suggestedPriority: typeof raw.suggestedPriority === 'number' ? Math.min(4, Math.max(1, raw.suggestedPriority)) : item.priority,
      purposeSummary: (raw.purposeSummary as string) || '',
      researchNotes: (raw.researchNotes as string) || '',
      applicationMethod: (raw.applicationMethod as ResearchAnalysis['applicationMethod']) || 'unknown',
      contactInfo: {
        email: (raw.contactInfo as Record<string, string>)?.email || item.contactEmail || undefined,
        phone: (raw.contactInfo as Record<string, string>)?.phone || item.contactPhone || undefined,
        address: (raw.contactInfo as Record<string, string>)?.address || undefined,
      },
      grantRange: {
        min: (raw.grantRange as Record<string, number>)?.min || undefined,
        max: (raw.grantRange as Record<string, number>)?.max || undefined,
        typical: (raw.grantRange as Record<string, number>)?.typical || undefined,
      },
      warnings: Array.isArray(raw.warnings) ? raw.warnings.filter((w): w is string => typeof w === 'string') : [],
    };

    // Must have purposeSummary to be useful
    if (!analysis.purposeSummary || analysis.purposeSummary.length < 20) {
      return null;
    }

    return analysis;
  } catch {
    return null;
  }
}

main().catch(err => {
  console.error('Auto-research failed:', err);
  process.exit(1);
});
