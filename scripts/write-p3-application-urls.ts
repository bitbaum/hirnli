/**
 * Write confirmed applicationUrls for P3 foundations (batch research 2026-04-23)
 * Also clears wrong websiteUrls where research confirmed the stored URL is wrong.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const applicationUrls: Array<{ id: string; url: string }> = [
  // Batch 1 — major foundations
  { id: 'sens-suisse',                     url: 'https://sens-suisse.ch/mitmachen/' },
  { id: 'impacthub-zuerich',               url: 'https://zurich.impacthub.ch/angebot/impact-programme/partner-werden/' },
  { id: 'jacobs-stiftung',                 url: 'https://jacobsfoundation.org/work-with-us/' },
  { id: 'fondation-leenaards',             url: 'https://leenaards.ch/contact/' },
  { id: 'fondation-vareille',              url: 'https://www.vareillefoundation.org/contacts/' },
  { id: 'fondation-gandur-pour-la-jeunesse', url: 'https://fg-jeunesse.org/soumettre-un-projet/' },
  { id: 'fondazione-minerva',              url: 'https://minerva-stiftung.org/was-wir-tun/gesuch-einreichen/' },
  { id: 'innosuisse',                      url: 'https://innolink.innosuisse.ch/' },
  // Batch 2
  { id: 'somaha-stiftung',                 url: 'https://somaha-stiftung.ch/foerderantrag-einreichen/' },
  { id: 'bridging-nations-stiftung',       url: 'https://bridging-nations.org/submit-a-project/' },
  { id: 'cleantech21-foundation',          url: 'https://www.cleantech21.org/contact' },
  { id: 'schweizerische-stiftung-fuer-kinder-und-jugendliche-in-not', url: 'https://www.kinder-stiftung.ch/gesuche' },
  { id: 'svc-unternehmertum',              url: 'https://svc.swiss/de/kontakt' },
  // Batch 3
  { id: 'accordeos-stiftung',              url: 'https://www.accordeos.ch/gesuche.html' },
  { id: 'gebauer-stiftung',                url: 'https://www.gebauer-stiftung.ch/#gesuche' },
  { id: 'stiftung-soliterra',              url: 'https://www.soliterra.ch' },
  { id: 'cardano-stiftung',                url: 'https://projectcatalyst.io' },
  { id: 'kyria-stiftung',                  url: 'https://kyria.ch/kontakt/' },
  { id: 'foundation-benedict',             url: 'https://www.foundation-benedict.org/kontakt/' },
  { id: 'thomas-abegg-foundation',         url: 'https://www.thomas-abegg-foundation.ch/kontakt/' },
  // Batch 4
  { id: 'fondation-futur',                 url: 'https://www.futur.ch/Kontakt' },
  { id: 'denk-an-mich',                    url: 'https://denkanmich.ch/gesuch-einreichen' },
  { id: 'iff-mauderli-stiftung',           url: 'https://www.iff-mauderli-stiftung.ch' },
  { id: 'stiftung-uitikon',                url: 'https://stiftung-uitikon.org/#kontakt' },
  { id: 'fondation-hans-wilsdorf',         url: 'https://hanswilsdorf.ch/depot-de-demande/demande-de-soutien-institutionnel' },
  { id: 'ekt-energiestiftung',             url: 'https://www.ekt-energiestiftung.ch/foerderung/gesuche/' },
  { id: 'fondation-sonja-knapp',           url: 'https://www.fondationsk.ch' },
  { id: 'fondazione-mantello-filantropia', url: 'https://www.filantropia.ch/contatti/' },
  { id: 'swisslos-sportfonds-zh',          url: 'https://www.zks-zuerich.ch/dienstleistungen/sportfonds-gesuche' },
  // Batch 5
  { id: 'credis-stiftung',                 url: 'https://www.credis-stiftung.ch/contact/bewerbung' },
  { id: 'dignitas-academy',                url: 'https://www.dignitas-academy.ch/gesuche/' },
  { id: 'martha-bock-stiftung',            url: 'https://www.martha-bock-stiftung.ch/gesuche' },
  { id: 'hans-henny-fonds-der-albertus-magnus-stiftung', url: 'https://albertusmagnus.ch/#kontakt' },
  { id: 'fondation-charles-leopold-mayer-pour-le-progres-humain-fph', url: 'https://www.fph.ch/rubrique6_fr.html' },
  { id: 'ueli-schlageter-stiftung',        url: 'https://easynpo.schlageter-stiftung.ch/' },
  { id: 'stiftung-klimarappen',            url: 'https://www.klimarappen.ch/de/Kontakt.21.html' },
  { id: 'stiftung-greuter-briner',         url: 'https://stiftung-gb.ch' },
  { id: 'stiftung-giuvenils',              url: 'https://giuvenils.ch/gesuche-einreichen/' },
  { id: 'birkenhof-stiftung',              url: 'https://stiftung-birkenhof.ch/kontakt/' },
  { id: 'eruv-stiftung',                   url: 'https://eruv.ch/#kontakt' },
];

// Wrong websiteUrls confirmed by research — clear them
const clearWebsiteUrl: string[] = [
  'hamasil-stiftung',    // hamasil.ch redirects to kulturpark.ch (unrelated venue)
  'dcs-stiftung',        // dcs.ch is an IT services company, not the foundation
  'cambiata-stiftung',   // domain shows bare "Maildomain" page, no foundation site
  'youthaid-foundation', // domain parked for sale (Namoxy.com)
  'templeton-stiftung',  // templeton.ch → Franklin Templeton (investment firm)
  'start-foundation',    // www.startfoundation.ch is NXDOMAIN
  'leo-future',          // leofuturefoundation.ch does not resolve
];

async function main() {
  let written = 0;
  let notFound = 0;

  console.log('Writing applicationUrls...');
  for (const { id, url } of applicationUrls) {
    const r = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{applicationUrl}', ${JSON.stringify(url)}::jsonb),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (r.length > 0) { written++; console.log(`  ✅ ${id}`); }
    else { notFound++; console.log(`  ❌ NOT FOUND: ${id}`); }
  }

  console.log('\nClearing wrong websiteUrls...');
  for (const id of clearWebsiteUrl) {
    const r = await sql`
      UPDATE fundraising_foundations
      SET config_data = config_data - 'websiteUrl',
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (r.length > 0) console.log(`  ✅ cleared websiteUrl: ${id}`);
    else console.log(`  ❌ NOT FOUND: ${id}`);
  }

  console.log(`\nDone: ${written} applicationUrls written, ${notFound} not found`);
}
main().catch(console.error);
