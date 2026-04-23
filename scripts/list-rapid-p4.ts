import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
const SLUGS = [
  'education-and-social-foundation-bildung-und-soziales-stiftun',
  'sozial-bildungsfonds-des-kaufmaennischen-verbandes-schweiz',
  'stiftung-fuer-alphabetisierung-und-grundbildung-schweiz',
  'cleantech21-foundation',
  'gemeinnuetzige-gesellschaft-des-bezirks-uster',
  'hand-in-hand-stiftung-fuer-eine-nachhaltige-entwicklung',
  'hugo-bachmann-stiftung-fuer-nachhaltigkeit',
  'impact-corner-stiftung',
  'stiftung-fokus-frauen',
];
async function main() {
  for (const slug of SLUGS) {
    const [r] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!r) continue;
    const cd = r.config_data as Record<string, unknown>;
    const uid = cd.uid as string || '';
    const name = cd.name as string || slug;
    const zefix = cd.websiteUrl as string || '';
    console.log(`${name} | ${uid} | ${zefix}`);
  }
}
main().catch(console.error);
