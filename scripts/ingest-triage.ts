#!/usr/bin/env tsx
/**
 * Ingest triage results from Claude inline analysis.
 * Reads a JSON file of triage results and upserts to DB.
 * Same logic as pipeline-graduate phase 3.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { sql } from './lib/db';
import { computeFitScore } from '../src/lib/domain/fit-scoring.js';
import { ThemeId } from '../src/lib/schemas/foundation.js';
import { requireOrgId } from './lib/require-org';
import { splitFoundationPatch, upsertAssessment } from './lib/assessment-write';

const DRY_RUN = process.argv.includes('--dry-run');

// Whose assessments this run produces. Resolved before any work begins: a run
// that cannot say which organisation it is triaging for should fail at the
// start, not after writing half a register under nobody's name.
//
// This script previously had no org id at all and updated rows by slug alone.
// With one tenant that was invisible; it now writes assessment rows, which have
// an owner by construction, so the question can no longer go unanswered.
const ORG_ID = requireOrgId();

const INPUT_FILE = process.argv.find((a) => !a.startsWith('-') && a.endsWith('.json'));

const VALID_THEME_IDS: Set<string> = new Set(ThemeId.options);

interface TriageEntry {
  slug: string;
  name: string;
  themes: string[];
  purposeSummary: string;
  researchNotes: string;
  isFunder: boolean;
  suggestedType: string;
  applicationMethod: string;
}

async function main() {
  if (!INPUT_FILE) {
    console.error('Usage: npx tsx scripts/ingest-triage.ts <results.json> [--dry-run]');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const entries: TriageEntry[] = Array.isArray(raw) ? raw : raw.items;

  console.log(`Ingesting ${entries.length} triage results from ${INPUT_FILE}`);
  if (DRY_RUN) console.log('DRY RUN — no DB writes');

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  // Track processed slugs for idempotency
  const processedFile = path.resolve(`research/pipeline-graduate/phase2-processed-${today}.json`);
  let processedSlugs = new Set<string>();
  if (fs.existsSync(processedFile)) {
    processedSlugs = new Set(JSON.parse(fs.readFileSync(processedFile, 'utf-8')));
  }

  for (const entry of entries) {
    // Validate themes
    const validThemes = entry.themes.filter((t) => VALID_THEME_IDS.has(t));

    // Skip entries without useful data
    if (!entry.purposeSummary || entry.purposeSummary.length < 30) {
      skipped++;
      continue;
    }

    // Compute fitScore from themes (algorithmic)
    const { fitScore: algoScore } = computeFitScore({
      themes: validThemes,
      canton: '',
      city: '',
      applicationMethod: entry.applicationMethod || 'unknown',
      isFunder: entry.isFunder,
    });

    // Use best of algorithmic and LLM-assessed score (LLM has context we lack: canton, purpose nuance)
    const fitScore = Math.max(algoScore, (entry as any).fitScore ?? 0);

    // Priority is NOT computed here — sync script derives it via
    // computePriorityScore() which uses fitScore + readiness + penalties.
    const _priority = 4; // not written here — sync script derives priority via computePriorityScore()

    const fitLabel = fitScore >= 7 ? '★★★' : fitScore >= 4 ? '★★☆' : '★☆☆';
    console.log(`  ${entry.name}: fit=${fitScore} ${fitLabel}, themes=[${validThemes.join(',')}]`);

    if (!DRY_RUN) {
      const mergeConfig: Record<string, unknown> = {
        themes: validThemes,
        researchDate: today,
        type: entry.suggestedType || 'C',
        isOperative: !entry.isFunder,
        tagline: entry.purposeSummary.substring(0, 80),
      };
      if (entry.purposeSummary.length >= 100) {
        mergeConfig.purposeSummary = entry.purposeSummary;
      }
      if (entry.researchNotes && entry.researchNotes.length >= 100) {
        mergeConfig.researchNotes = entry.researchNotes;
      }

      // Upgrade from rapid when we have substantial analysis data
      const hasSubstantialData = entry.purposeSummary.length >= 100 && validThemes.length > 0;

      // Priority is always P4 at write time — sync computes the real value
      const writePriority = 4;

      // Set researchDepth in mergeConfig so the trigger picks it up
      const writeDepth = hasSubstantialData ? 'standard' : 'rapid';
      const fullMerge = { ...mergeConfig, researchDepth: writeDepth, researchDate: today };

      // Registry facts stay in the blob; the triage verdict — fit, themes,
      // tagline, notes, depth — is this organisation's and goes to its
      // assessment row, which is the only place the app reads it from.
      const { registry, analysis } = splitFoundationPatch({
        ...fullMerge,
        fitScore,
        priority: writePriority,
      });

      try {
        await sql`
          UPDATE fundraising_foundations
          SET config_data = config_data || ${JSON.stringify(registry)}::jsonb,
              updated_at = ${now}
          WHERE id = ${entry.slug}
        `;

        await upsertAssessment(ORG_ID, entry.slug, analysis);

        upserted++;
        processedSlugs.add(entry.slug);
      } catch (err) {
        console.error(`    ERROR: ${err instanceof Error ? err.message : err}`);
        errors++;
      }
    } else {
      processedSlugs.add(entry.slug);
    }
  }

  // Save processed slugs
  if (!DRY_RUN) {
    fs.writeFileSync(processedFile, JSON.stringify([...processedSlugs], null, 2));
  }

  // Also append to phase2-results
  const resultsFile = path.resolve(`research/pipeline-graduate/phase2-results-${today}.json`);
  if (!DRY_RUN && fs.existsSync(resultsFile)) {
    const existing = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    const existingSlugs = new Set(existing.items.map((r: any) => r.slug));
    const newItems = entries
      .filter((e) => !existingSlugs.has(e.slug) && e.purposeSummary?.length >= 30)
      .map((e) => ({
        slug: e.slug,
        name: e.name,
        fitScore: computeFitScore({
          themes: e.themes.filter((t) => VALID_THEME_IDS.has(t)),
          canton: '',
          city: '',
          applicationMethod: e.applicationMethod || 'unknown',
          isFunder: e.isFunder,
        }).fitScore,
        themes: e.themes.filter((t) => VALID_THEME_IDS.has(t)),
        purposeSummary: e.purposeSummary,
        researchNotes: e.researchNotes || '',
        isFunder: e.isFunder,
      }));
    existing.items.push(...newItems);
    existing.total = existing.items.length;
    fs.writeFileSync(resultsFile, JSON.stringify(existing, null, 2));
  }

  console.log(`\nDone: ${upserted} upserted, ${skipped} skipped, ${errors} errors`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
