import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { computeFitScore } from '../src/lib/domain/fit-scoring';

const sql = neon(process.env.DATABASE_URL!);

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
  for (const slug of SLUGS) {
    const [row] = await sql`SELECT id, fit_score, priority, config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row) { console.log(`NOT FOUND: ${slug}`); continue; }
    const cd = row.config_data as Record<string, unknown>;
    const result = computeFitScore(cd as unknown as Parameters<typeof computeFitScore>[0]);
    const delta = result.fitScore - (row.fit_score as number);
    const themes = (cd.themes as string[])?.join(',') || 'none';
    const marker = delta > 0 ? `↑ ${row.fit_score}→${result.fitScore}` : `= ${row.fit_score}`;
    console.log(`${marker.padEnd(8)} | P${row.priority} | ${slug.substring(0,45)} | ${themes}`);
  }
}
main().catch(console.error);
