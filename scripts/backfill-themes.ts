#!/usr/bin/env tsx
/**
 * Backfill themes for foundations with no themes assigned.
 * Uses the free keyword classifier on purposeSummary + officialPurpose.
 * Updates config_data.themes, focus_areas, fit_score, priority in DB.
 *
 * Usage:
 *   npx tsx scripts/backfill-themes.ts --dry-run    # Preview only
 *   npx tsx scripts/backfill-themes.ts               # Write to DB
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { classifyThemes, scoreFunderOperator } from './lib/theme-classifier';
import { computeFitScore } from '../src/lib/domain/fit-scoring';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const DRY_RUN = process.argv.includes('--dry-run');

  // Find non-rapid foundations with no themes
  const rows = await sql`
    SELECT
      f.id, f.name, f.config_data, f.fit_score, f.priority,
      r.official_purpose, r.region
    FROM fundraising_foundations f
    LEFT JOIN fundraising_foundation_registry r ON r.id = f.id
    WHERE (
      f.focus_areas IS NULL
      OR f.focus_areas::text = '[]'
      OR (f.config_data->>'themes') IS NULL
      OR (f.config_data->>'themes') = '[]'
    )
    AND (f.research_depth IS NULL OR f.research_depth != 'rapid')
    AND f.config_data IS NOT NULL
  `;

  console.log(`Found ${rows.length} non-rapid foundations with no themes`);
  if (DRY_RUN) console.log('DRY RUN — no DB writes\n');

  let updated = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const row of rows) {
    const cfg = row.config_data as Record<string, unknown>;
    const purpose = (cfg.purposeSummary as string) || '';
    const officialPurpose = (row.official_purpose as string) || '';
    const name = (row.name as string) || '';

    // Combine all available text for classification
    const text = `${purpose} ${officialPurpose}`.toLowerCase();
    const nameLower = name.toLowerCase();

    if (text.trim().length < 20) {
      skipped++;
      continue;
    }

    const themes = classifyThemes(text, nameLower);

    if (themes.length === 0) {
      skipped++;
      continue;
    }

    // Compute fitScore based on themes + geography
    const region = (cfg.region as string) || (row.region as string) || '';
    const appMethod = (cfg.applicationMethod as string) || 'unknown';
    const { funder } = scoreFunderOperator(text);
    const isFunder = funder > 0;

    const { fitScore } = computeFitScore({
      themes,
      canton: region,
      city: region,
      applicationMethod: appMethod,
      isFunder,
    });

    // Compute priority
    const isZurich = region.toLowerCase().includes('zürich') || region === 'ZH';
    let priority: 1 | 2 | 3 | 4;
    if (fitScore >= 7 && isFunder) priority = 1;
    else if (fitScore >= 4 && (isFunder || isZurich)) priority = 2;
    else if (fitScore >= 4) priority = 3;
    else priority = 4;

    const existingFit = (row.fit_score as number) || 0;
    const existingPriority = (row.priority as number) || 4;

    console.log(`  ${name} → ${themes.join(', ')} (fit=${fitScore}${fitScore > existingFit ? '↑' : ''}, P${priority})`);

    if (!DRY_RUN) {
      await sql`
        UPDATE fundraising_foundations
        SET
          config_data = jsonb_set(
            jsonb_set(config_data, '{themes}', ${JSON.stringify(themes)}::jsonb),
            '{fitScore}', ${JSON.stringify(Math.max(fitScore, existingFit))}::jsonb
          ),
          focus_areas = ${JSON.stringify(themes)},
          fit_score = GREATEST(fit_score, ${fitScore}),
          priority = LEAST(priority, ${priority}),
          updated_at = ${now}
        WHERE id = ${row.id}
      `;
    }

    updated++;
  }

  console.log(`\nDone: ${updated} classified, ${skipped} skipped (no text or no matching keywords)`);
  if (DRY_RUN) console.log('DRY RUN — no DB writes');
  else if (updated > 0) console.log('Next: npm run sync && npm run build');
}

main();
