import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const ids = [
    'cambiata-stiftung','youthaid-foundation','hamasil-stiftung','alice-ackermann',
    'dcs-stiftung','fondation-honegger','emil-huber-stockar-stiftung','elsa-stiftung',
  ];
  const rows = await sql`
    SELECT id, priority, fit_score,
      config_data->>'websiteUrl' as website,
      config_data->>'applicationMethod' as method,
      config_data->>'acceptsApplications' as accepts,
      config_data->>'officialPurpose' as purpose,
      config_data->>'uid' as uid,
      config_data->>'themes' as themes
    FROM fundraising_foundations WHERE id = ANY(${ids})
    ORDER BY fit_score DESC, id ASC
  `;
  for (const r of rows) {
    console.log('---');
    console.log(`P${r.priority} | ${r.id} | fit=${r.fit_score} | UID: ${r.uid || 'n/a'}`);
    console.log(`  website: ${r.website || '(none)'} | method: ${r.method} | accepts: ${r.accepts}`);
    console.log(`  themes: ${r.themes}`);
    console.log(`  purpose: ${String(r.purpose || '').substring(0, 250)}`);
  }
}
main().catch(console.error);
