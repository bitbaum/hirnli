import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const slugs = [
  'schoepflin-stiftung-assoziierter-partner','start-foundation',
  'education-and-social-foundation-bildung-und-soziales-stiftun',
  'schweizerische-stiftung-fuer-kinder-und-jugendliche-in-not',
  'sozial-bildungsfonds-des-kaufmaennischen-verbandes-schweiz',
  'stiftung-fuer-alphabetisierung-und-grundbildung-schweiz',
  'fondation-hans-wilsdorf','cleantech21-foundation',
  'fondation-free-future','gemeinnuetzige-gesellschaft-des-bezirks-uster',
  'hand-in-hand-stiftung-fuer-eine-nachhaltige-entwicklung',
  'hugo-bachmann-stiftung-fuer-nachhaltigkeit','impact-corner-stiftung',
  'limmat-stiftung','pro-patria-schweiz-bundesfeierspende',
  'stiftung-fokus-frauen','stiftung-wirtschaft-und-oekologie-swo',
  'fondation-gandur-pour-la-jeunesse'
];

async function main() {
  for (const slug of slugs) {
    const [r] = await sql`SELECT id, fit_score, priority, research_depth FROM fundraising_foundations WHERE id = ${slug}`;
    if (r) console.log(`${r.fit_score}→? | P${r.priority} | ${r.research_depth} | ${r.id}`);
    else console.log(`NOT FOUND: ${slug}`);
  }
}
main().catch(console.error);
