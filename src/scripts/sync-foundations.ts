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

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { foundationSchema } from '../lib/schemas/foundation';

const OUTPUT_PATH = resolve(__dirname, '../lib/config/foundations/stiftungen-generated.ts');

async function syncFoundations() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('\nSyncing foundations from DB...\n');

  // Read only human-researched foundations (exclude rapid/auto-scraped Zefix imports).
  // 'rapid' research_depth = auto-imported from Zefix with minimal data — not useful
  // in the app's display layer. These stay in DB for the screening pipeline only.
  // This keeps the generated TS file at ~500KB instead of 24MB.
  const rows = await sql`
    SELECT id, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
      AND (research_depth IS NULL OR research_depth != 'rapid')
    ORDER BY id
  `;

  console.log(`  Found ${rows.length} human-researched foundations (rapid auto-imports excluded)`);

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
}

syncFoundations().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
