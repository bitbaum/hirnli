import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`
    SELECT id, fit_score, priority,
           config_data->>'websiteUrl' as website,
           config_data->>'applicationUrl' as appurl,
           config_data->>'acceptsApplications' as accepts,
           config_data->>'applicationMethod' as method,
           config_data->'contact'->>'email' as email
    FROM fundraising_foundations
    WHERE priority IN (1,2)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND config_data->>'applicationUrl' IS NULL
      AND config_data->>'websiteUrl' IS NOT NULL
      AND config_data->>'websiteUrl' != ''
    ORDER BY priority, fit_score DESC
  `;
  console.log(`P1-P2 with website but no applicationUrl: ${rows.length}`);
  rows.forEach(r => console.log(
    `  P${r.priority} fitScore=${r.fit_score} | ${r.id} | ${r.method}/${r.accepts} | ${r.website}`
  ));
}
main().catch(console.error);
