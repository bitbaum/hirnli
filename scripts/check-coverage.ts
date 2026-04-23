import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT priority, COUNT(*) as total,
      COUNT(*) FILTER (WHERE config_data->>'applicationUrl' IS NOT NULL AND config_data->>'applicationUrl' != '') as with_url,
      COUNT(*) FILTER (WHERE config_data->>'applicationUrl' IS NULL OR config_data->>'applicationUrl' = '') as without_url
    FROM fundraising_foundations
    WHERE priority IN (1,2,3)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
    GROUP BY priority ORDER BY priority
  `;
  rows.forEach(r => console.log(`P${r.priority}: ${r.total} total | ${r.with_url} with applicationUrl | ${r.without_url} missing`));
}
main().catch(console.error);
