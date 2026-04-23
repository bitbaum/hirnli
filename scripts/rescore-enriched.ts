/**
 * Re-score foundations whose themes were enriched via claude-agent research
 * but whose fitScore was never recomputed. Updates config_data.fitScore;
 * the DB trigger syncs flat fit_score column automatically.
 * Then run: npm run sync  (to propagate priority changes)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { computeFitScore } from '../src/lib/domain/fit-scoring';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');

const SLUGS = [
  'start-foundation',
  'education-and-social-foundation-bildung-und-soziales-stiftun',
  'sozial-bildungsfonds-des-kaufmaennischen-verbandes-schweiz',
  'stiftung-fuer-alphabetisierung-und-grundbildung-schweiz',
  'cleantech21-foundation',
  'gemeinnuetzige-gesellschaft-des-bezirks-uster',
  'hand-in-hand-stiftung-fuer-eine-nachhaltige-entwicklung',
  'hugo-bachmann-stiftung-fuer-nachhaltigkeit',
  'impact-corner-stiftung',
  'limmat-stiftung',
  'pro-patria-schweiz-bundesfeierspende',
  'stiftung-fokus-frauen',
  'fondation-hans-wilsdorf',
  'schoepflin-stiftung-assoziierter-partner',
];

async function main() {
  console.log(`=== Re-score enriched foundations ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);
  let updated = 0;

  for (const slug of SLUGS) {
    const [row] = await sql`SELECT id, fit_score, priority, config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row) { console.log(`  ❌ NOT FOUND: ${slug}`); continue; }

    const cd = row.config_data as Record<string, unknown>;
    const result = computeFitScore(cd as unknown as Parameters<typeof computeFitScore>[0]);
    const newScore = result.fitScore;
    const oldScore = row.fit_score as number;

    // Only update if the score would increase (never downgrade)
    if (newScore <= oldScore) {
      console.log(`  = ${slug} (fit_score=${oldScore}, no change needed)`);
      continue;
    }

    console.log(`  ↑ ${slug}: fit_score ${oldScore}→${newScore} (themes: ${(cd.themes as string[])?.join(',')})`);

    if (!DRY_RUN) {
      await sql`
        UPDATE fundraising_foundations
        SET config_data = jsonb_set(config_data, '{fitScore}', ${newScore}::jsonb),
            updated_at = NOW()
        WHERE id = ${slug}
      `;
    }
    updated++;
  }

  console.log(`\nUpdated: ${updated} foundations`);
  if (!DRY_RUN && updated > 0) {
    console.log('Next: npm run sync  (recomputes priority from new fitScore)');
  }
}
main().catch(console.error);
