#!/usr/bin/env tsx
/**
 * Rescore — Re-score all foundations when scoring config changes
 *
 * Reads all foundations from DB, re-computes fitScore using the centralized
 * config-driven scoring engine, updates config_data + flat columns.
 *
 * WHY: When scoring dimensions change (new theme, adjusted weights, added
 * dimension), all foundations need re-scoring. Essential for multi-org
 * support where each org has different scoring config.
 *
 * Usage:
 *   npx tsx scripts/rescore.ts [--dry-run] [--limit N]
 *   npm run rescore
 *   npm run rescore -- --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import { STIFTUNGEN_CORE } from '../src/lib/config/foundations/stiftungen-core';

// Curated slugs whose priority was manually set — rescore must NOT overwrite
const CURATED_PRIORITY_SLUGS = new Set(STIFTUNGEN_CORE.map((f) => f.slug));

// ============================================================================
// TYPES
// ============================================================================

interface FoundationRow {
  id: string;
  name: string;
  config_data: {
    themes?: string[];
    canton?: string;
    city?: string;
    region?: string;
    applicationMethod?: string;
    isFunder?: boolean;
    isOperative?: boolean;
    fitScore?: number;
    fit?: number;
    priority?: number;
    researchDepth?: string;
    [key: string]: unknown;
  } | null;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Rescore — Re-score all foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  DRY RUN — no DB writes');

  if (!process.env.DATABASE_URL) {
    console.error('  DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Read all foundations with config_data
  const rows = limitArg > 0
    ? (await sql`SELECT id, name, config_data FROM fundraising_foundations WHERE config_data IS NOT NULL ORDER BY id LIMIT ${limitArg}`) as FoundationRow[]
    : (await sql`SELECT id, name, config_data FROM fundraising_foundations WHERE config_data IS NOT NULL ORDER BY id`) as FoundationRow[];
  console.log(`\n  Foundations to score: ${rows.length}`);

  let updated = 0;
  let unchanged = 0;
  let errors = 0;
  const scoreChanges: { name: string; oldScore: number; newScore: number; oldFit: number; newFit: number }[] = [];

  for (const row of rows) {
    if (!row.config_data) continue;

    const cd = row.config_data;

    // Extract canton/city from various places in config_data
    const canton = cd.canton
      || (typeof cd.region === 'string' && cd.region.match(/,\s*([A-Z]{2})$/)?.[1])
      || '';
    const city = cd.city
      || (typeof cd.region === 'string' ? cd.region.split(',')[0].trim() : '')
      || '';

    // Determine isFunder
    const isFunder = cd.isFunder ?? (cd.isOperative === false);

    // Compute new fitScore
    const { fitScore: newFitScore } = computeFitScore({
      themes: cd.themes || [],
      canton,
      city,
      applicationMethod: (cd.applicationMethod as string) || 'unknown',
      isFunder: isFunder ?? false,
    });

    const researchDepth = (cd.researchDepth as string) || 'rapid';
    const newFitDisplay = fitScoreToDisplay(newFitScore, researchDepth);

    // Compute new priority — preserve curated priorities for core foundations
    const slug = (cd as { slug?: string }).slug || '';
    const hasCuratedPriority = CURATED_PRIORITY_SLUGS.has(slug);
    const isZurich = canton === 'ZH';
    let newPriority: 1 | 2 | 3 | 4;
    if (hasCuratedPriority) {
      newPriority = (cd.priority as 1 | 2 | 3 | 4) ?? 4; // Keep existing curated priority
    } else if (newFitScore >= 7 && isFunder) newPriority = 1;
    else if (newFitScore >= 4 && (isFunder || isZurich)) newPriority = 2;
    else if (newFitScore >= 4) newPriority = 3;
    else newPriority = 4;

    const oldFitScore = cd.fitScore ?? 0;
    const oldFit = cd.fit ?? 0;

    if (newFitScore === oldFitScore && newFitDisplay === oldFit) {
      unchanged++;
      continue;
    }

    // Track change
    scoreChanges.push({
      name: row.name,
      oldScore: oldFitScore as number,
      newScore: newFitScore,
      oldFit: oldFit as number,
      newFit: newFitDisplay,
    });

    if (!dryRun) {
      // Update config_data
      const updatedConfigData = {
        ...cd,
        fitScore: newFitScore,
        fit: newFitDisplay,
        priority: newPriority,
      };

      try {
        await sql`
          UPDATE fundraising_foundations
          SET
            config_data = ${JSON.stringify(updatedConfigData)},
            fit_score = ${newFitScore},
            priority = ${newPriority},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${row.id}
        `;
        updated++;
      } catch (err) {
        console.error(`  ${row.name}: ${err instanceof Error ? err.message : err}`);
        errors++;
      }
    } else {
      updated++;
    }
  }

  // Results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total processed:  ${rows.length}`);
  console.log(`  Score changed:    ${updated}`);
  console.log(`  Unchanged:        ${unchanged}`);
  if (errors > 0) console.log(`  Errors:           ${errors}`);

  if (scoreChanges.length > 0 && scoreChanges.length <= 50) {
    console.log('\n  Changes:');
    for (const c of scoreChanges) {
      console.log(`    ${c.name}: fitScore ${c.oldScore}→${c.newScore}, fit ${c.oldFit}→${c.newFit}`);
    }
  } else if (scoreChanges.length > 50) {
    console.log(`\n  ${scoreChanges.length} foundations changed (showing first 20):`);
    for (const c of scoreChanges.slice(0, 20)) {
      console.log(`    ${c.name}: fitScore ${c.oldScore}→${c.newScore}, fit ${c.oldFit}→${c.newFit}`);
    }
    console.log(`    ... and ${scoreChanges.length - 20} more`);
  }

  if (!dryRun && updated > 0) {
    console.log('\n  Next steps:');
    console.log('    npm run sync && npm run build');
  }
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Rescore failed:', err);
  process.exit(1);
});
