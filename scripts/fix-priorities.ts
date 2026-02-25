#!/usr/bin/env tsx
/**
 * Fix Priority Data Corruption
 *
 * The rescore.ts script computes priority algorithmically from fitScore,
 * which overwrites manually curated priority values from stiftungen-core.ts.
 * This script restores the 21 foundations whose curated priorities were
 * corrupted by re-scoring.
 *
 * Reads the CURATED priority from stiftungen-core.ts (the human-reviewed
 * source of truth) and writes it to both the `priority` column and
 * `config_data->priority` in the DB.
 *
 * Usage:
 *   npx tsx scripts/fix-priorities.ts [--dry-run]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { STIFTUNGEN_CORE } from '../src/lib/config/foundations/stiftungen-core';

// ============================================================================
// The 21 foundations with corrupted priorities
// ============================================================================

const CORRUPTED_SLUGS = new Set([
  'baitella-eberle',
  'baugarten',
  'binding',
  'ernst-goehner',
  'fair-recycling',
  'familie-schwarz',
  'globility-circle',
  'glueckskette',
  'hasler',
  'hirschmann',
  'klimup',
  'landscape-resilience',
  'mercator',
  'migros-getconnected',
  'minerva',
  'prototype-fund',
  'responsability',
  'rethink',
  'stellennetz',
  'svc-unternehmertum',
  'wirtschaft-gesellschaft',
]);

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Fix Priority Data Corruption');
  console.log('  Restore curated priorities from stiftungen-core.ts → DB');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  DRY RUN — no DB writes\n');

  if (!process.env.DATABASE_URL) {
    console.error('  DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Build lookup: slug → curated priority from stiftungen-core.ts
  const curatedPriorities = new Map<string, number>();
  for (const f of STIFTUNGEN_CORE) {
    if (CORRUPTED_SLUGS.has(f.slug)) {
      curatedPriorities.set(f.slug, f.priority);
    }
  }

  // Validate we found all 21 in the source data
  const missing = [...CORRUPTED_SLUGS].filter(s => !curatedPriorities.has(s));
  if (missing.length > 0) {
    console.error(`  Missing from stiftungen-core.ts: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`  Foundations to fix: ${curatedPriorities.size}\n`);

  // Read current DB values for comparison
  const rows = await sql`
    SELECT id, name, priority, config_data
    FROM fundraising_foundations
    WHERE id = ANY(${[...CORRUPTED_SLUGS]})
    ORDER BY id
  ` as { id: string; name: string; priority: number | null; config_data: Record<string, unknown> | null }[];

  if (rows.length === 0) {
    console.error('  No matching foundations found in DB. Check org_id/slugs.');
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const curatedPriority = curatedPriorities.get(row.id);
    if (curatedPriority === undefined) continue;

    const dbPriority = row.priority;
    const configPriority = row.config_data?.priority as number | undefined;

    if (dbPriority === curatedPriority && configPriority === curatedPriority) {
      console.log(`  ${row.id}: already correct (P${curatedPriority}) — skipping`);
      skipped++;
      continue;
    }

    console.log(
      `  ${row.id}: P${dbPriority ?? '?'}→P${curatedPriority}` +
      (configPriority !== curatedPriority ? ` (config_data: P${configPriority ?? '?'}→P${curatedPriority})` : '') +
      ` [${row.name}]`
    );

    if (!dryRun) {
      try {
        // Update config_data with corrected priority
        const updatedConfigData = {
          ...row.config_data,
          priority: curatedPriority,
        };

        await sql`
          UPDATE fundraising_foundations
          SET
            priority = ${curatedPriority},
            config_data = ${JSON.stringify(updatedConfigData)},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${row.id}
        `;
        updated++;
      } catch (err) {
        console.error(`  ERROR ${row.id}: ${err instanceof Error ? err.message : err}`);
        errors++;
      }
    } else {
      updated++;
    }
  }

  // Check for slugs in our list that weren't found in DB
  const foundSlugs = new Set(rows.map(r => r.id));
  const notInDb = [...CORRUPTED_SLUGS].filter(s => !foundSlugs.has(s));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Fixed:     ${updated}`);
  console.log(`  Skipped:   ${skipped} (already correct)`);
  if (errors > 0) console.log(`  Errors:    ${errors}`);
  if (notInDb.length > 0) console.log(`  Not in DB: ${notInDb.join(', ')}`);

  if (!dryRun && updated > 0) {
    console.log('\n  Next steps:');
    console.log('    npm run sync && npm run build');
  }
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Fix priorities failed:', err);
  process.exit(1);
});
