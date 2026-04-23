import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { computeFitScore } from '../src/lib/domain/fit-scoring';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`
    SELECT id, fit_score, priority, config_data
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
    ORDER BY fit_score DESC LIMIT 20
  `;
  for (const row of rows) {
    const cd = row.config_data as Record<string, unknown>;
    const result = computeFitScore(cd as unknown as Parameters<typeof computeFitScore>[0]);
    const delta = result.fitScore - (row.fit_score as number);
    if (delta < 0) {
      console.log(`${row.fit_score}→${result.fitScore} | P${row.priority} | ${row.id} | themes:${(cd.themes as string[])?.join(',') || 'none'}`);
    }
  }
}
main().catch(console.error);
