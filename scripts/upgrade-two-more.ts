import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const UPGRADES = [
  { slug: 'cleantech21-foundation', url: 'https://www.cleantech21.org' },
  { slug: 'stiftung-fokus-frauen', url: 'https://www.fokusfrauen.ch' },
];

async function main() {
  for (const { slug, url } of UPGRADES) {
    const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row) { console.log(`NOT FOUND: ${slug}`); continue; }
    const cd = row.config_data as Record<string, unknown>;
    cd.websiteUrl = url;
    cd.researchDepth = 'standard';
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd)}::jsonb,
          research_depth = 'standard',
          updated_at = NOW()
      WHERE id = ${slug}
    `;
    console.log(`Updated ${slug}: ${url}`);
  }
}
main().catch(console.error);
