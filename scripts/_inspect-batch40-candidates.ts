import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const ids = [
    'circular-zuerich','familie-schwarz','iw-stiftung-mensch-und-zukunft',
    'social-gastronomy-schweiz','stiftung-symphasis','appsocial-org-stiftung',
    'creative-ai-foundation','pep-stiftung','sefa-kaya-foundation','stiftung-i-care-for-you'
  ];
  const rows = await sql`
    SELECT id, fit_score, research_depth,
      config_data->>'officialPurpose' as purpose,
      config_data->>'websiteUrl' as website,
      config_data->>'themes' as themes,
      config_data->>'uid' as uid
    FROM fundraising_foundations
    WHERE id = ANY(${ids})
    ORDER BY fit_score DESC, id ASC
  `;
  for (const r of rows) {
    console.log('---');
    console.log(`ID: ${r.id} | fit: ${r.fit_score} | depth: ${r.research_depth}`);
    console.log(`UID: ${r.uid || 'unknown'}`);
    console.log(`URL: ${r.website || '(none)'}`);
    console.log(`Themes: ${r.themes}`);
    console.log(`Purpose: ${String(r.purpose || '').substring(0, 250)}`);
  }
}
main().catch(console.error);
