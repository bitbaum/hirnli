/**
 * Write confirmed applicationUrls for P3 foundations — batch 6-9 (2026-04-24)
 * Also fixes 3 wrong websiteUrls discovered during research.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const applicationUrls: Array<{ id: string; url: string }> = [
  // Batch 6
  { id: 'kath-kirche-zh',                                          url: 'https://www.zhkath.ch/ueber-uns/kontakt' },
  { id: 'stiftung-fh-schweiz-zur-foerderung-des-dualen-bildungswegs', url: 'https://www.stiftungfhschweiz.ch/persoenlicher-kontakt' },
  { id: 'efort-foundation',                                        url: 'https://www.efort.org/contact-us/' },
  { id: 'digitale-gesellschaft',                                   url: 'https://www.digitale-gesellschaft.ch/uber-uns/kontakt/' },
  { id: 'stiftung-david-dienst-schweiz',                           url: 'https://stiftungdaviddienstschweiz.ch/ueber-uns/kontakt/' },
  { id: 'schwab-foundation',                                       url: 'https://www.schwabfound.org/contact' },
  { id: 'oak-foundation-assoziierter-partner',                     url: 'https://oakfnd.org/submit-enquiry/' },
  { id: 'stiftung-sahee',                                          url: 'https://www.sahee.org/pages/gesuche.php?lg=en' },
  // Batch 7
  { id: 'stiftung-morgental',                                      url: 'https://www.morgental.ch/kontakt/' },
  { id: 'arthur-waser-stiftung',                                   url: 'https://www.arthur-waser-foundation.ch/kontakt/#gesuchstellung' },
  { id: 'stiftung-lernforum',                                      url: 'https://www.stiftung-lernforum.ch/kontakt' },
  { id: 'emdo-stiftung',                                           url: 'https://emdo.ch' },
  { id: 'coubertin-meets-dunant',                                  url: 'https://coubertin-meets-dunant.ch/anmeldung' },
  { id: 'sebastiana-stiftung',                                     url: 'https://www.sebastiana.ch/kontakt' },
  { id: 'hans-asperger-stiftung',                                  url: 'https://www.hans-asperger-stiftung.ch/formular.html' },
  { id: 'agid-svizzer-per-la-muntogna',                            url: 'https://www.berghilfe.ch/gesuche/gesuch-einreichen' },
  { id: 'erwin-blaser-stiftung',                                   url: 'https://erwin-blaser-stiftung.ch/de/kontakt.html' },
  { id: 'stiftung-luzerner-sterntaler',                            url: 'https://sterntaler.lu/' },
  // Batch 8
  { id: 'stiftung-mckinsey-kinderhilfe-schweiz',                   url: 'https://www.mks-stiftung.ch/de/foerderung-beantragen/' },
  { id: 'palatin-stiftung',                                        url: 'https://www.palatin.ch/gesuch-einreichen/' },
  { id: 'metrohm-stiftung',                                        url: 'https://www.metrohm-stiftung.ch/gesuch/' },
  { id: 'steinegg-stiftung',                                       url: 'https://www.steinegg.ch/kontakt' },
  { id: 'fondation-suisa',                                         url: 'https://fondation-suisa.ch/de/gesuche/' },
  { id: 'medicor-foundation',                                      url: 'https://www.medicor.li/grants' },
  { id: 'sanni-foundation',                                        url: 'https://sanni-foundation.com/kontakt/' },
  { id: 'meltwater-foundation',                                    url: 'https://meltwater.org/mest-ai-startup-program/' },
  { id: 'landscape-resilience',                                    url: 'https://landscaperesiliencefund.org/contact-us/' },
  { id: 'stiftung-swisscontact',                                   url: 'https://www.swisscontact.org/en/get-involved-with-us/philanthropic-engagement' },
  // Batch 9
  { id: 'stipendienstiftung-reiser-siemssen-selve-gerdtzen',       url: 'https://www.studienfinanzierung.uzh.ch/de/gesuche_fristen.html' },
];

// Wrong websiteUrls found during research — fix to correct domain
const fixWebsiteUrls: Array<{ id: string; url: string }> = [
  // fhschweiz.ch is the alumni/association site; foundation is at stiftungfhschweiz.ch
  { id: 'stiftung-fh-schweiz-zur-foerderung-des-dualen-bildungswegs', url: 'https://www.stiftungfhschweiz.ch' },
  // arthur-waser-stiftung.ch doesn't match; real domain is arthur-waser-foundation.ch
  { id: 'arthur-waser-stiftung',                                   url: 'https://www.arthur-waser-foundation.ch' },
  // stiftung-david-dienst-schweiz.ch vs stiftungdaviddienstschweiz.ch (no hyphens)
  { id: 'stiftung-david-dienst-schweiz',                           url: 'https://stiftungdaviddienstschweiz.ch' },
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

  console.log('\nFixing wrong websiteUrls...');
  for (const { id, url } of fixWebsiteUrls) {
    const r = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{websiteUrl}', ${JSON.stringify(url)}::jsonb),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (r.length > 0) console.log(`  ✅ fixed websiteUrl: ${id} → ${url}`);
    else console.log(`  ❌ NOT FOUND: ${id}`);
  }

  console.log(`\nDone: ${written}/${applicationUrls.length} applicationUrls written`);
}
main().catch(console.error);
