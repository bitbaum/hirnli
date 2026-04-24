/**
 * Write confirmed applicationUrls for P2-P3 foundations — batch 10 (2026-04-24)
 * Also fixes 1 wrong websiteUrl discovered during research.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const applicationUrls: Array<{ id: string; url: string }> = [
  // avina-stiftung: contact page; note they do NOT accept unsolicited applications
  // (they approach projects proactively), but contact page is the correct applicationUrl
  { id: 'avina-stiftung',          url: 'https://avinastiftung.ch/en/contact/' },
  // stiftung-helene-arnold: contact page; foundation explicitly does not accept unsolicited applications
  { id: 'stiftung-helene-arnold',  url: 'https://www.stiftung-helene-arnold.ch/kontakt.html' },
  // wirtschaft-gesellschaft: operates through Vita Perspektiv AG; contact page confirmed live
  { id: 'wirtschaft-gesellschaft', url: 'https://vitaperspektiv.ch/ueber-uns/kontakt/' },
  // templeton-stiftung: Swiss Templeton entity uses global John Templeton Foundation grant portal
  { id: 'templeton-stiftung',      url: 'https://www.templeton.org/grants/apply-for-grant' },
];

// Wrong websiteUrls found during research — clear to empty
// emil-huber-stockar-stiftung: ethz.ch was set incorrectly — the actual foundation is an
// alpine accident/rescue foundation in Zollikon with no connection to ETH Zurich
const clearWebsiteUrls: Array<{ id: string; reason: string }> = [
  { id: 'emil-huber-stockar-stiftung', reason: 'ethz.ch is wrong — alpine rescue foundation, not ETH-related' },
];

async function main() {
  let written = 0;

  console.log('Writing applicationUrls...');
  for (const { id, url } of applicationUrls) {
    const r = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{applicationUrl}', ${JSON.stringify(url)}::jsonb),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (r.length > 0) { written++; process.stdout.write(`  ✅ ${id}\n`); }
    else process.stdout.write(`  ❌ NOT FOUND: ${id}\n`);
  }

  console.log('\nClearing wrong websiteUrls...');
  for (const { id, reason } of clearWebsiteUrls) {
    const r = await sql`
      UPDATE fundraising_foundations
      SET config_data = config_data - 'websiteUrl',
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (r.length > 0) console.log(`  ✅ cleared websiteUrl: ${id} (${reason})`);
    else console.log(`  ❌ NOT FOUND: ${id}`);
  }

  console.log(`\nDone: ${written}/${applicationUrls.length} applicationUrls written`);
}
main().catch(console.error);
