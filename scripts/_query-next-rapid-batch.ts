/**
 * Query next P4 rapid candidates for research batch.
 * Usage: npx tsx scripts/_query-next-rapid-batch.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const EXCLUDE_IDS = [
  // batch 39
  'baitella-eberle','stiftung-opa-objective-polyglot-apprenticeship','fwg-foundation',
  'walter-robert-corti-stiftung','fairster-foundation','stiftung-pferdehof-pfisterberg',
  'albert-und-ida-beer-stiftung','netzwerk-stiftung-fuer-soziale-arbeit-sport-und-kultur',
  'dr-hans-duttweiler-hug-stiftung','options-for-growth-foundation',
  // batch 40
  'circular-zuerich','pep-stiftung','social-gastronomy-schweiz','familie-schwarz',
  'iw-stiftung-mensch-und-zukunft','stiftung-symphasis','appsocial-org-stiftung',
  'creative-ai-foundation','sefa-kaya-foundation','stiftung-i-care-for-you',
  // batch 41
  'jane-goodall-institut-schweiz-stiftung-fuer-forschung-bildun',
  'jugendhof-stiftung-fuer-anthroposophisch-begruendete-krisenb',
  'kurt-imhof-stiftung-fuer-medienqualitaet','stiftung-kalaidos-fachhochschule',
  'forschungsstiftung-fuer-informationstechnologie-und-gesellsc',
  'karl-margrith-wiederkehr-stiftung','stiftung-one-health','max-roessler-stiftung',
  'gottfried-schaerer-stiftung','chana-lutomirsky-stiftung',
  // batch 42
  'stiftung-muetterhilfe','stiftung-pfizer-forschungspreis',
  'stiftung-zur-foerderung-sozialwissenschaftlicher-forschung-u',
  'aline-andrea-rutz-stiftung','arte-terra-clima-foundation','asmallworld-foundation',
  'baasch-medicus-stiftung-zuerich','costas-and-eleni-venieri-charitable-foundation',
  'dr-adrian-otto-naegeli-stiftung','michael-kohn-stiftung',
  // batch 43
  'economic-foundation-zuerich-park-side','ernst-wilhelm-meier-stiftung',
  'fritz-gerber-stiftung-fuer-begabte-junge-menschen','geschwister-maeder-stiftung',
  'gottfried-und-ursula-schaeppi-jecklin-stiftung','gottlieb-naef-stiftung',
  'guenther-caspar-stiftung-buero-ehrbar','hans-wegmann-stiftung',
  'harald-naegeli-stiftung','iduna-stiftung',
  // batch 44 + straggler
  'paul-und-hedy-schaufelberger-biggel-stiftung',
  'jean-anderson-studenten-sos-stiftung','jizchak-und-denise-schaechter-stiftung',
  'joseph-stiftung','kanthari-foundation-switzerland','kohler-friederich-stiftung',
  'kolianda-stiftung','liveyourdream-foundation',
  'luiza-penha-walter-renteiro-stiftung-fuer-die-jugend-des-bez',
  'max-wiederkehr-stiftung','maya-behn-eschenburg-stiftung',
  'mekkihelp-stiftung','oscar-seeger-stiftung',
  // earlier batches
  'stopp-klimakrise','fuchs-eugster','cammac-stiftung','climatoor','erde-2-0',
  'foundation-zuerich-park-side',
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, fit_score, name,
      config_data->>'themes' as themes,
      config_data->>'officialPurpose' as purpose,
      config_data->>'applicationResearchMethod' as method
    FROM fundraising_foundations
    WHERE research_depth = 'rapid'
      AND priority = 4
      AND archived = false
      AND fit_score >= 5
      AND data_confidence = 'ai-assessed'
    ORDER BY fit_score DESC, id ASC
    LIMIT 50
  `;

  const filtered = rows.filter(r => !EXCLUDE_IDS.includes(r.id as string));
  console.log(`Found ${filtered.length} candidates (fit>=5, rapid, ai-assessed):\n`);
  for (const r of filtered.slice(0, 15)) {
    const themes = String(r.themes || '').replace(/[\[\]"]/g, '').substring(0, 60);
    const purpose = String(r.purpose || '').substring(0, 90);
    console.log(`${r.fit_score} | ${r.id}`);
    console.log(`    themes: ${themes}`);
    console.log(`    purpose: ${purpose.substring(0, 90)}`);
    console.log();
  }
}
main().catch(console.error);
