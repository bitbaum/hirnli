import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const offset = parseInt(process.argv[2] || '0');
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id as slug, name,
      (config_data->>'fitScore')::int as fit,
      config_data->>'applicationResearchMethod' as method
    FROM fundraising_foundations
    WHERE research_depth IN ('standard','deep')
      AND priority = 4
      AND (
        config_data->>'applicationResearchMethod' IS NULL
        OR config_data->>'applicationResearchMethod' NOT IN ('claude-agent','chatgpt-agent','manual')
      )
      AND archived = false
    ORDER BY (config_data->>'fitScore')::int DESC NULLS LAST, name
    LIMIT 10 OFFSET ${offset}
  `;
  rows.forEach((r: any) => console.log(r.fit, r.slug, '|', r.name, '|', r.method));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
