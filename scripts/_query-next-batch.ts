import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { RESEARCHED_METHODS } from '../src/lib/schemas/foundation';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, config_data->>'websiteUrl' as website, config_data->>'applicationResearchMethod' as method
    FROM fundraising_foundations
    WHERE priority IN (1,2,3) AND research_depth != 'rapid' AND archived = false
      AND id NOT IN ('seif','stiftung-raphael','jugendhilfeverein-des-bezirkes-dielsdorf','z43-netzero','responsability')
    ORDER BY priority ASC, fit_score DESC
  `;
  const needsResearch = rows.filter(r => !RESEARCHED_METHODS.includes((r.method || 'unknown') as any));
  console.log(needsResearch.slice(0, 10).map(r => r.id + ' | ' + r.name + ' | ' + (r.website||'-') + ' | ' + (r.method||'none')).join('\n'));
}
main().catch(console.error);
