import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const ids = [
    'foundation-regina','util-stiftung','michael-kohn','z43-netzero',
    'youthaid-foundation','cambiata-stiftung','leo-future','hamasil-stiftung',
    'alice-ackermann','dcs-stiftung','fondation-honegger','emil-huber-stockar-stiftung','elsa-stiftung',
  ];
  const rows = await sql`
    SELECT id, priority, fit_score,
      config_data->>'websiteUrl' as website,
      config_data->>'applicationMethod' as method,
      config_data->>'acceptsApplications' as accepts,
      config_data->>'applicationUrl' as appUrl,
      config_data->>'contact' as contact,
      config_data->>'purposeSummary' as summary
    FROM fundraising_foundations WHERE id = ANY(${ids})
    ORDER BY priority ASC, fit_score DESC
  `;
  for (const r of rows) {
    console.log('---');
    console.log(`P${r.priority} | ${r.id} | fit=${r.fit_score}`);
    console.log(`  website: ${r.website || '(none)'}`);
    console.log(`  method: ${r.method} | accepts: ${r.accepts}`);
    console.log(`  appUrl: ${r.appUrl || '(none)'}`);
    console.log(`  summary: ${String(r.summary || '').substring(0, 150)}`);
  }
}
main().catch(console.error);
