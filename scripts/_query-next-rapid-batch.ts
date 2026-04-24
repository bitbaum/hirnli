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
  // earlier batches
  'stopp-klimakrise','fuchs-eugster','cammac-stiftung','climatoor','erde-2-0',
  // batch 36-38 IDs (from chatgpt-results files)
  'social-gastronomy-schweiz','stiftung-one-health','stiftung-symphasis',
  'foundation-zuerich-park-side','gottfried-schaerer-stiftung',
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
