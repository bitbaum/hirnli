import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const ids = [
    'michael-kohn-stiftung',
    'stiftung-muetterhilfe',
    'stiftung-pfizer-forschungspreis',
    'stiftung-zur-foerderung-sozialwissenschaftlicher-forschung-u',
    'aline-andrea-rutz-stiftung',
    'arte-terra-clima-foundation',
    'asmallworld-foundation',
    'baasch-medicus-stiftung-zuerich',
    'costas-and-eleni-venieri-charitable-foundation',
    'dr-adrian-otto-naegeli-stiftung',
  ];
  const rows = await sql`
    SELECT id, fit_score,
      config_data->>'officialPurpose' as purpose,
      config_data->>'websiteUrl' as website,
      config_data->>'uid' as uid,
      config_data->>'themes' as themes
    FROM fundraising_foundations
    WHERE id = ANY(${ids})
    ORDER BY fit_score DESC, id ASC
  `;
  for (const r of rows) {
    console.log('---');
    console.log(`ID: ${r.id} | fit: ${r.fit_score}`);
    console.log(`UID: ${r.uid || 'n/a'} | URL: ${r.website || '(none)'}`);
    console.log(`Themes: ${r.themes}`);
    console.log(`Purpose: ${String(r.purpose || '').substring(0, 300)}`);
  }
}
main().catch(console.error);
