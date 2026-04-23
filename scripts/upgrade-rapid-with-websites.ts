/**
 * Backfill: upgrade researchDepth from 'rapid' to 'standard' for foundations
 * that already have a real website URL (not a registry/directory link).
 *
 * Root cause: import-research-results.ts never set researchDepth='standard'
 * when it added a websiteUrl. Hundreds of foundations got real websites but
 * stayed 'rapid', which kept them at P4 regardless of fitScore.
 *
 * After running this, run: npm run sync  (recomputes priorities)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { isRegistryUrl } from '../src/lib/config/registry-domains';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`=== Upgrade rapid→standard for foundations with real websites ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  // Fetch all rapid non-unverified foundations with a websiteUrl set
  const rows = await sql`
    SELECT id, fit_score, config_data->>'websiteUrl' as url
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
      AND config_data->>'researchDepth' = 'rapid'
      AND config_data->>'websiteUrl' IS NOT NULL
      AND config_data->>'websiteUrl' != ''
    ORDER BY fit_score DESC
  `;

  // Filter out registry URLs using the same logic as the app
  const toUpgrade = rows.filter(r => !isRegistryUrl(r.url as string));

  console.log(`Found ${rows.length} rapid foundations with websiteUrl set`);
  console.log(`Registry URLs filtered out: ${rows.length - toUpgrade.length}`);
  console.log(`To upgrade: ${toUpgrade.length}\n`);

  console.log('Top 10 by fitScore:');
  toUpgrade.slice(0, 10).forEach(r =>
    console.log(`  fitScore=${r.fit_score} | ${r.id} | ${r.url}`)
  );

  if (DRY_RUN) {
    console.log('\nDRY RUN — no changes made. Remove --dry-run to apply.');
    return;
  }

  if (toUpgrade.length === 0) {
    console.log('Nothing to upgrade.');
    return;
  }

  // Bulk UPDATE using IN clause with the filtered IDs
  const ids = toUpgrade.map(r => r.id as string);

  // Process in batches of 100 to avoid parameter limits
  const BATCH = 100;
  let upgraded = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{researchDepth}', '"standard"'),
          updated_at = NOW()
      WHERE id = ANY(${batch}::text[])
        AND config_data->>'researchDepth' = 'rapid'
    `;
    upgraded += batch.length;
    process.stdout.write(`  ${upgraded}/${ids.length}...\r`);
  }

  console.log(`\nUpgraded ${upgraded} foundations rapid→standard`);
  console.log('Next: npm run sync  (recomputes priority from new researchDepth)');
}
main().catch(console.error);
