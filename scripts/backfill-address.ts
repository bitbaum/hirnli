#!/usr/bin/env tsx
/**
 * Backfill contact_address from config_data JSONB
 *
 * Reads foundations where config_data->'contact'->>'address' IS NOT NULL
 * but contact_address IS NULL, and copies the value to the column.
 *
 * Usage:
 *   npx tsx scripts/backfill-address.ts
 *   npx tsx scripts/backfill-address.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const dryRun = process.argv.includes('--dry-run');

async function main() {
  // Find foundations with address in JSONB but not in the column
  const rows = await sql`
    SELECT id, config_data->'contact'->>'address' AS address
    FROM fundraising_foundations
    WHERE config_data->'contact'->>'address' IS NOT NULL
      AND contact_address IS NULL
  `;

  console.log(`Found ${rows.length} foundations to backfill`);

  if (dryRun) {
    for (const row of rows.slice(0, 10)) {
      console.log(`  ${row.id}: ${row.address}`);
    }
    if (rows.length > 10) console.log(`  ... and ${rows.length - 10} more`);
    return;
  }

  if (rows.length === 0) return;

  // Batch update via single statement
  const result = await sql`
    UPDATE fundraising_foundations
    SET contact_address = config_data->'contact'->>'address',
        updated_at = NOW()
    WHERE config_data->'contact'->>'address' IS NOT NULL
      AND contact_address IS NULL
  `;

  console.log(`Backfilled ${rows.length} contact_address values`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
