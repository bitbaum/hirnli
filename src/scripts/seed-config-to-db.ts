/**
 * Seed Script: TypeScript Config → DB config_data Column
 *
 * One-time script that populates the `config_data` JSONB column
 * in fundraising_foundations with the full Foundation object from
 * TypeScript config files. This establishes DB as the write SSOT.
 *
 * Uses raw SQL with Neon serverless driver for efficient batch operations
 * (avoids 116+ individual HTTP requests via Drizzle ORM).
 *
 * Run with: npm run seed:config
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import type { Foundation } from '../lib/schemas/foundation';
// Import directly from batch files (not from index.ts which may point to generated file)
import { STIFTUNGEN_CORE } from '../lib/config/foundations/stiftungen-core';
import { STIFTUNGEN_2026_02 } from '../lib/config/foundations/stiftungen-2026-02';

const STIFTUNGEN_DATA: Foundation[] = [...STIFTUNGEN_CORE, ...STIFTUNGEN_2026_02];

async function seedConfigToDb() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log(`\nSeeding config_data for ${STIFTUNGEN_DATA.length} foundations...\n`);

  // Process in batches to avoid overwhelming the HTTP connection
  const BATCH_SIZE = 10;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < STIFTUNGEN_DATA.length; i += BATCH_SIZE) {
    const batch = STIFTUNGEN_DATA.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (f) => {
      try {
        // Use ON CONFLICT to upsert: update config_data if exists, insert if not
        await sql`
          INSERT INTO fundraising_foundations (
            id, name, website_url, contact_email, contact_phone,
            fit_score, priority, focus_areas, geographic_scope, organization_type,
            application_method, application_deadline,
            research_depth, research_date, data_quality,
            source, config_data, created_at, updated_at, archived
          ) VALUES (
            ${f.slug}, ${f.name}, ${f.websiteUrl}, ${f.contact?.email || null}, ${f.contact?.phone || null},
            ${f.fit}, ${f.priority}, ${JSON.stringify(f.themes)}, ${f.region}, ${f.type === 'network' ? 'network' : 'foundation'},
            ${f.applicationMethod}, ${f.deadline || null},
            ${f.needsResearch ? 'rapid' : 'standard'}, ${f.researchDate}, ${f.needsResearch ? 3 : 4},
            ${f.source || 'typescript-legacy'}, ${JSON.stringify(f)}, ${new Date().toISOString()}, ${new Date().toISOString()}, false
          )
          ON CONFLICT (id) DO UPDATE SET
            config_data = ${JSON.stringify(f)},
            updated_at = ${new Date().toISOString()}
        `;

        // Check if it was an insert or update based on xmax
        // For simplicity, just count as "processed"
        return 'ok';
      } catch (error) {
        console.error(`  Error for ${f.slug}:`, error instanceof Error ? error.message : error);
        errors++;
        return 'error';
      }
    });

    const results = await Promise.all(promises);
    const batchOk = results.filter((r) => r === 'ok').length;
    updated += batchOk; // We count all as "upserted" since we can't easily distinguish
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchOk}/${batch.length} upserted`);
  }

  // Count totals
  const countResult = await sql`SELECT count(*) as total FROM fundraising_foundations`;
  const configCountResult = await sql`SELECT count(*) as total FROM fundraising_foundations WHERE config_data IS NOT NULL`;

  console.log(`\nResults:`);
  console.log(`  Upserted: ${updated} foundations with config_data`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in DB: ${countResult[0].total}`);
  console.log(`  With config_data: ${configCountResult[0].total}`);
  console.log(`  DB-only (no config_data): ${Number(countResult[0].total) - Number(configCountResult[0].total)}`);
  console.log(`\nDone.\n`);
}

seedConfigToDb().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
