import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT priority, COUNT(*) as cnt FROM fundraising_foundations WHERE (data_confidence IS NULL OR data_confidence != 'unverified') AND (archived IS NULL OR archived = false) GROUP BY priority ORDER BY priority`;
  rows.forEach(r => console.log('P' + r.priority + ': ' + r.cnt));
  const [synced] = await sql`SELECT COUNT(*) as cnt FROM fundraising_foundations WHERE (data_confidence IS NULL OR data_confidence != 'unverified') AND (archived IS NULL OR archived = false)`;
  console.log('Total sync-eligible:', synced.cnt);
}
main().catch(console.error);
