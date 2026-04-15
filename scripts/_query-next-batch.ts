import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, config_data->>'websiteUrl' as website, config_data->>'applicationResearchMethod' as method
    FROM fundraising_foundations
    WHERE priority IN (1,2,3) AND research_depth != 'rapid' AND archived = false
      AND (config_data->>'applicationResearchMethod' IS NULL OR config_data->>'applicationResearchMethod' NOT IN ('chatgpt-agent','claude-agent','manual'))
      AND id NOT IN ('seif','stiftung-raphael','jugendhilfeverein-des-bezirkes-dielsdorf','z43-netzero','responsability')
    ORDER BY priority ASC, fit_score DESC LIMIT 10
  `;
  console.log(rows.map((r: any) => r.id + ' | ' + r.name + ' | ' + (r.website||'-') + ' | ' + (r.method||'none')).join('\n'));
}
main().catch(console.error);
