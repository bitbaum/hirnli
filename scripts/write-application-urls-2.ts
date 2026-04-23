import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const updates = [
  // Confirmed application/contact pages
  { id: 'zuerich-jobs', url: 'https://stiftungzuerichjobs.ch/kontakt/' },
  { id: 'stiftung-accentus', url: 'https://www.accentus.ch/kontakt/' },
  { id: 'hans-eggenberger', url: 'https://www.hans-eggenberger-stiftung.ch/antrag.html' },
  { id: 'alfred-und-bertha-zangger-weber-stiftung', url: 'https://zanggerweberstiftung.ch/gesuchseingabe/' },
  { id: 'hans-konrad-rahn-stiftung', url: 'https://rahnstiftung.ch/gesuch-einreichen' },
  { id: 'stiftung-solidaritaet-mit-sehgeschaedigten', url: 'https://www.blind.ch/kontakt.html' },
  { id: 's-eustachius-stiftung', url: 'http://eustachius-stiftung.ch/' },
  // Homepage is the only contact point
  { id: 'respact-foundation', url: 'https://www.respact-foundation.ch' },
];

async function main() {
  for (const { id, url } of updates) {
    const result = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{applicationUrl}', ${JSON.stringify(url)}::jsonb),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, config_data->>'applicationUrl' as url
    `;
    if (result.length > 0) {
      console.log(`✅ ${id} → ${result[0].url}`);
    } else {
      console.log(`❌ NOT FOUND: ${id}`);
    }
  }
}
main().catch(console.error);
