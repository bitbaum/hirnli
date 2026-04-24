import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, priority, fit_score, data_confidence, research_depth,
      config_data->>'uid' as uid,
      config_data->>'websiteUrl' as website,
      config_data->>'applicationMethod' as method,
      config_data->>'applicationUrl' as appUrl,
      config_data->>'officialPurpose' as purpose
    FROM fundraising_foundations
    WHERE id LIKE '%michael%kohn%'
    ORDER BY priority ASC
  `;
  for (const r of rows) {
    console.log('---');
    console.log(`ID: ${r.id} | P${r.priority} | fit=${r.fit_score} | depth=${r.research_depth} | confidence=${r.data_confidence}`);
    console.log(`UID: ${r.uid || 'n/a'} | URL: ${r.website || '(none)'}`);
    console.log(`method: ${r.method} | appUrl: ${r.appUrl || '(none)'}`);
    console.log(`Purpose: ${String(r.purpose || '').substring(0, 200)}`);
  }
}
main().catch(console.error);
