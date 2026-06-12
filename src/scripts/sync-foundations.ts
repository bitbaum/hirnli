/**
 * Sync Script: DB config_data → Generated TypeScript
 *
 * Reads foundation config_data from Neon DB, validates against Zod schema,
 * and writes src/lib/config/foundations/stiftungen-generated.ts.
 *
 * This is the bridge between DB (write SSOT) and TypeScript config (build cache).
 *
 * Uses neon() directly (not db/client.ts) to avoid import hoisting issues
 * with environment variable loading in script context.
 *
 * Run with: npm run sync
 * Runs automatically before build via prebuild script.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// CI builds don't have DB access — skip sync and use committed generated file
if (process.env.SKIP_SYNC === 'true') {
  console.log('SKIP_SYNC=true — using committed stiftungen-generated.ts');
  process.exit(0);
}

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';
import { foundationSchema } from '../lib/schemas/foundation';
import type { Foundation } from '../lib/schemas/foundation';
import { computePriorityScore } from '../lib/domain/foundation-scores';

const OUTPUT_PATH = resolve(__dirname, '../lib/config/foundations/stiftungen-generated.ts');

async function syncFoundations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log('\nSyncing foundations from DB...\n');

  // Quality gate: only include foundations with verified or AI-assessed data.
  // Excludes ~15k 'unverified' bulk imports (AI-guessed themes, no contact data).
  // Keeps ~1,200 foundations that have substantive research (standard/deep depth).
  //
  // Previous filter used needsResearch flag — replaced with data_confidence
  // column (set by set-confidence.ts migration) for clearer semantics.
  const { rows } = await pool.query(`
    SELECT id, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
      AND (archived = false OR archived IS NULL)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
    ORDER BY id
  `);

  console.log(`  Found ${rows.length} foundations (rapid name-only excluded)`);

  // Validate each against Zod schema
  const valid: unknown[] = [];
  const invalid: Array<{ id: string; errors: string[] }> = [];

  for (const row of rows) {
    const result = foundationSchema.safeParse(row.config_data);
    if (result.success) {
      valid.push(result.data);
    } else {
      const errors = result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`
      );
      invalid.push({ id: row.id, errors });
    }
  }

  if (invalid.length > 0) {
    console.warn(`\n  Validation errors (${invalid.length} foundations):`);
    for (const { id, errors } of invalid) {
      console.warn(`    ${id}:`);
      for (const e of errors) {
        console.warn(`      - ${e}`);
      }
    }
  }

  if (valid.length === 0) {
    console.error('\n  No valid foundations found. Aborting sync.\n');
    process.exit(1);
  }

  // Recompute priority from the authoritative computePriorityScore()
  // Pipeline scripts set fitScore; priority is DERIVED from fit + readiness + penalties.
  // This ensures stored priority always matches what the UI displays.
  let priorityUpdates = 0;
  for (const f of valid as Foundation[]) {
    const computed = computePriorityScore(f);
    if (f.priority !== computed.level) {
      (f as Record<string, unknown>).priority = computed.level;
      priorityUpdates++;
    }
  }
  if (priorityUpdates > 0) {
    console.log(`  Recomputed priority for ${priorityUpdates} foundations`);
    // Write corrected priorities back to DB (trigger syncs flat column)
    for (const f of valid as Foundation[]) {
      await pool.query(
        `UPDATE fundraising_foundations
         SET config_data = jsonb_set(config_data, '{priority}', $1::jsonb)
         WHERE id = $2 AND (config_data->>'priority')::int != $3`,
        [JSON.stringify(f.priority), f.slug, f.priority]
      );
    }
  }

  // Generate TypeScript file
  // WHY JSON.parse: With 5,500+ foundations, a raw array literal causes
  // TS2590 "union type too complex to represent". JSON.parse avoids this
  // by deferring type inference to runtime.
  const timestamp = new Date().toISOString();
  const jsonData = JSON.stringify(valid);
  const content = `// AUTO-GENERATED — DO NOT EDIT MANUALLY
// Source: Neon DB (fundraising_foundations.config_data)
// Generated: ${timestamp}
// Run \`npm run sync\` to regenerate from database
// Foundations: ${valid.length}

/* eslint-disable */

import type { Foundation } from '../../schemas/foundation';

export const STIFTUNGEN_GENERATED: Foundation[] = JSON.parse('${jsonData.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}');
`;

  writeFileSync(OUTPUT_PATH, content, 'utf-8');

  console.log(`\n  Generated: stiftungen-generated.ts`);
  console.log(`  Valid: ${valid.length} foundations`);
  console.log(`  Invalid: ${invalid.length} foundations (skipped)`);
  console.log(`\nSync complete.\n`);

  // pg keeps the event loop alive — without this the prebuild never exits
  await pool.end();
}

syncFoundations().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
