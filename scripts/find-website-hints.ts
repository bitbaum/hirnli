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
  'limmat-stiftung',
  'pro-patria-schweiz-bundesfeierspende',
  'stiftung-fokus-frauen',
];

async function main() {
  for (const slug of SLUGS) {
    const [r] = await sql`SELECT id, config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!r) continue;
    const cd = r.config_data as Record<string, unknown>;
    const process_ = (cd.applicationProcess as string[])?.join(' ') || '';
    const notes = (cd.researchNotes as string) || '';
    const purpose = (cd.purposeSummary as string) || '';
    
    // Look for URL hints in text
    const urlPattern = /(?:www\.|https?:\/\/)[^\s,)]+(?:\.[a-z]{2,6})[^\s,)"]*/gi;
    const allText = process_ + ' ' + notes + ' ' + purpose;
    const urls = allText.match(urlPattern) || [];
    
    console.log(`\n${slug}:`);
    console.log(`  currentUrl: ${cd.websiteUrl}`);
    if (urls.length > 0) console.log(`  hintedUrls: ${[...new Set(urls)].join(', ')}`);
    if (process_) console.log(`  process: ${process_.substring(0, 120)}`);
  }
}
main().catch(console.error);
