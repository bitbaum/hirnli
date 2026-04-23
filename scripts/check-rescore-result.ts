import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { computeFitScore } from '../src/lib/domain/fit-scoring';

const sql = neon(process.env.DATABASE_URL!);

const SLUGS = [
  'start-foundation',
  'education-and-social-foundation-bildung-und-soziales-stiftun',
  'fondation-hans-wilsdorf',
  'schoepflin-stiftung-assoziierter-partner',
  'impact-corner-stiftung',
];

async function main() {
  for (const slug of SLUGS) {
    const [row] = await sql`SELECT id, fit_score, priority, research_depth, data_confidence, config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row) { console.log(`NOT FOUND: ${slug}`); continue; }
    const cd = row.config_data as Record<string, unknown>;
    console.log(`${slug}: fit_score=${row.fit_score}, priority=P${row.priority}, depth=${row.research_depth}, conf=${row.data_confidence}, config.fitScore=${cd.fitScore}`);
  }
}
main().catch(console.error);
