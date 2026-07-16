/**
 * Set data confidence levels based on research depth
 *
 * Rules (in priority order):
 * - research_depth='deep'     → 'human-verified'
 * - research_depth='standard' → 'ai-assessed'
 * - research_depth='rapid' + has real enrichment (applicationResearchMethod set or themes+notes)
 *                             → 'ai-assessed'
 * - research_depth='rapid' + no enrichment → 'unverified' (excluded from sync)
 *
 * IMPORTANT: The old Rule 1 ("automated-research + rapid → unverified") was too broad.
 * Many automated-research foundations have been enriched by claude-agent batches, adding
 * themes and purposeSummary. Those should remain 'ai-assessed', not be demoted.
 *
 * Run with: npx tsx scripts/set-confidence.ts
 * Dry run:  npx tsx scripts/set-confidence.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { sql } from './lib/db';

const DRY_RUN = process.argv.includes('--dry-run');

interface ConfidenceStats {
  deepToVerified: number;
  standardToAiAssessed: number;
  enrichedRapidToAiAssessed: number;
  unenrichedRapidToUnverified: number;
  unchanged: number;
}

async function setConfidence() {

  console.log(`\n📊 Setting data confidence levels... (${DRY_RUN ? 'DRY RUN' : 'LIVE'})\n`);

  const stats: ConfidenceStats = {
    deepToVerified: 0,
    standardToAiAssessed: 0,
    enrichedRapidToAiAssessed: 0,
    unenrichedRapidToUnverified: 0,
    unchanged: 0,
  };

  if (DRY_RUN) {
    // Count what WOULD change, without updating
    const [deep] = await sql`SELECT COUNT(*) as cnt FROM fundraising_foundations WHERE research_depth='deep' AND (data_confidence IS NULL OR data_confidence != 'human-verified')`;
    const [standard] = await sql`SELECT COUNT(*) as cnt FROM fundraising_foundations WHERE research_depth='standard' AND (data_confidence IS NULL OR data_confidence != 'ai-assessed')`;
    const [enrichedRapid] = await sql`
      SELECT COUNT(*) as cnt FROM fundraising_foundations
      WHERE research_depth='rapid'
        AND (data_confidence IS NULL OR data_confidence != 'ai-assessed')
        AND config_data->>'applicationResearchMethod' IS NOT NULL
        AND config_data->>'applicationResearchMethod' NOT IN ('unknown', '')
    `;
    const [unenrichedRapid] = await sql`
      SELECT COUNT(*) as cnt FROM fundraising_foundations
      WHERE research_depth='rapid'
        AND data_confidence IS NULL
        AND (config_data->>'applicationResearchMethod' IS NULL
             OR config_data->>'applicationResearchMethod' IN ('unknown', ''))
    `;
    console.log(`Would set: ${deep.cnt} deep→human-verified`);
    console.log(`Would set: ${standard.cnt} standard→ai-assessed`);
    console.log(`Would set: ${enrichedRapid.cnt} enriched-rapid→ai-assessed`);
    console.log(`Would set: ${unenrichedRapid.cnt} unenriched-rapid→unverified`);
    console.log('\nDRY RUN — no changes made.');
    return;
  }

  // Rule 1: deep → human-verified
  const r1 = await sql`
    UPDATE fundraising_foundations
    SET data_confidence = 'human-verified', updated_at = NOW()
    WHERE research_depth = 'deep'
      AND (data_confidence IS NULL OR data_confidence != 'human-verified')
    RETURNING 1
  `;
  stats.deepToVerified = r1.length;
  console.log(`✅ Set ${stats.deepToVerified} foundations to 'human-verified' (research_depth=deep)`);

  // Rule 2: standard → ai-assessed
  const r2 = await sql`
    UPDATE fundraising_foundations
    SET data_confidence = 'ai-assessed', updated_at = NOW()
    WHERE research_depth = 'standard'
      AND (data_confidence IS NULL OR data_confidence != 'ai-assessed')
    RETURNING 1
  `;
  stats.standardToAiAssessed = r2.length;
  console.log(`✅ Set ${stats.standardToAiAssessed} foundations to 'ai-assessed' (research_depth=standard)`);

  // Rule 3: rapid + has applicationResearchMethod set → ai-assessed
  // (these were explicitly researched by claude-agent/chatgpt-agent etc.)
  const r3 = await sql`
    UPDATE fundraising_foundations
    SET data_confidence = 'ai-assessed', updated_at = NOW()
    WHERE research_depth = 'rapid'
      AND (data_confidence IS NULL OR data_confidence != 'ai-assessed')
      AND config_data->>'applicationResearchMethod' IS NOT NULL
      AND config_data->>'applicationResearchMethod' NOT IN ('unknown', '')
    RETURNING 1
  `;
  stats.enrichedRapidToAiAssessed = r3.length;
  console.log(`✅ Set ${stats.enrichedRapidToAiAssessed} foundations to 'ai-assessed' (enriched rapid)`);

  // Rule 4: rapid + no enrichment signal + not yet assessed → unverified
  // Only marks NULL entries — never demotes existing ai-assessed foundations.
  // Rapid foundations that are already ai-assessed (e.g. enriched via Groq themes
  // pipeline without setting applicationResearchMethod) are intentionally preserved.
  const r4 = await sql`
    UPDATE fundraising_foundations
    SET data_confidence = 'unverified', updated_at = NOW()
    WHERE research_depth = 'rapid'
      AND data_confidence IS NULL
      AND (config_data->>'applicationResearchMethod' IS NULL
           OR config_data->>'applicationResearchMethod' IN ('unknown', ''))
    RETURNING 1
  `;
  stats.unenrichedRapidToUnverified = r4.length;
  console.log(`✅ Set ${stats.unenrichedRapidToUnverified} foundations to 'unverified' (unenriched rapid)`);

  // Count remaining NULL (should be ~0 after running all rules)
  const [nullResult] = await sql`SELECT COUNT(*) as cnt FROM fundraising_foundations WHERE data_confidence IS NULL`;
  stats.unchanged = Number(nullResult.cnt);

  console.log(`\n📈 Summary:`);
  console.log(`   deep→human-verified:       ${stats.deepToVerified}`);
  console.log(`   standard→ai-assessed:      ${stats.standardToAiAssessed}`);
  console.log(`   enriched-rapid→ai-assessed:${stats.enrichedRapidToAiAssessed}`);
  console.log(`   unenriched-rapid→unverified:${stats.unenrichedRapidToUnverified}`);
  console.log(`   Unchanged (NULL):          ${stats.unchanged}`);

  // Show final distribution
  const distribution = await sql`
    SELECT data_confidence, COUNT(*) as cnt
    FROM fundraising_foundations
    GROUP BY data_confidence
    ORDER BY CASE data_confidence
      WHEN 'human-verified' THEN 1
      WHEN 'ai-assessed' THEN 2
      WHEN 'unverified' THEN 3
      ELSE 4 END
  `;

  console.log('\n📊 Current distribution:');
  for (const row of distribution) {
    console.log(`   ${String(row.data_confidence ?? '(null)').padEnd(20)} ${row.cnt}`);
  }
  console.log('');
}

setConfidence().catch(console.error);
