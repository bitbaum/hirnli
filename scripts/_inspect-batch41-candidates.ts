import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const ids = [
    'chana-lutomirsky-stiftung',
    'forschungsstiftung-fuer-informationstechnologie-und-gesellsc',
    'jane-goodall-institut-schweiz-stiftung-fuer-forschung-bildun',
    'jugendhof-stiftung-fuer-anthroposophisch-begruendete-krisenb',
    'karl-margrith-wiederkehr-stiftung',
    'kurt-imhof-stiftung-fuer-medienqualitaet',
    'max-roessler-stiftung',
    'stiftung-kalaidos-fachhochschule',
    'stiftung-one-health',
    'gottfried-schaerer-stiftung',
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
    console.log(`---`);
    console.log(`ID: ${r.id} | fit: ${r.fit_score} | depth: ${r.research_depth}`);
    console.log(`UID: ${r.uid || 'n/a'} | URL: ${r.website || '(none)'}`);
    console.log(`Themes: ${r.themes}`);
    console.log(`Purpose: ${String(r.purpose || '').substring(0, 220)}`);
  }
}
main().catch(console.error);
