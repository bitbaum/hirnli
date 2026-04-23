import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const updates = [
  { id: 'ubs-sozialstiftung', url: 'https://www.ubs.com/global/de/ubs-society/foundations/social-issues-education/contact.html' },
  { id: 'rahn-stiftung', url: 'https://rahn-stiftung.ch/gesuch-einreichen' },
  { id: 'gruetli', url: 'https://www.gruetli-stiftung.ch/#kontakt' },
  { id: 'vontobel-stiftung', url: 'https://www.vontobel-stiftung.ch/de-ch/ihr-gesuch/' },
  { id: 'temperatio', url: 'https://www.temperatio.ch/gesuche.html' },
  { id: 'albert-lueck-stiftung', url: 'https://albert-lueck-stiftung.ch/kontakt/' },
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
