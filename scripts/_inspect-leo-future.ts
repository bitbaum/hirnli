import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const [r] = await sql`
    SELECT id, priority, fit_score, research_depth, data_confidence,
      config_data->>'websiteUrl' as website,
      config_data->>'applicationMethod' as method,
      config_data->>'acceptsApplications' as accepts,
      config_data->>'isOperative' as operative,
      config_data->>'officialPurpose' as purpose,
      config_data->>'purposeSummary' as summary,
      config_data->>'uid' as uid,
      config_data->>'themes' as themes
    FROM fundraising_foundations WHERE id = 'leo-future'
  `;
  console.log(`ID: ${r.id} | P${r.priority} | fit=${r.fit_score} | depth=${r.research_depth} | confidence=${r.data_confidence}`);
  console.log(`UID: ${r.uid || 'n/a'} | URL: ${r.website || '(none)'}`);
  console.log(`method: ${r.method} | accepts: ${r.accepts} | operative: ${r.operative}`);
  console.log(`Themes: ${r.themes}`);
  console.log(`Purpose: ${String(r.purpose || '').substring(0, 400)}`);
  console.log(`Summary: ${String(r.summary || '').substring(0, 300)}`);
}
main().catch(console.error);
