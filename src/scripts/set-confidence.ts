/**
 * Set data confidence levels based on research depth and source
 *
 * Maps existing research_depth and source fields to dataConfidence levels:
 * - source='automated-research' + research_depth='rapid' → 'unverified'
 * - research_depth='standard' → 'ai-assessed'
 * - research_depth='deep' → 'human-verified'
 *
 * Run with: npx tsx src/scripts/set-confidence.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

interface ConfidenceStats {
  unverified: number;
  aiAssessed: number;
  humanVerified: number;
  unchanged: number;
}

async function setConfidence() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('\n📊 Setting data confidence levels...\n');

  const stats: ConfidenceStats = {
    unverified: 0,
    aiAssessed: 0,
    humanVerified: 0,
    unchanged: 0,
  };

  // Rule 1: source='automated-research' AND research_depth='rapid' → 'unverified'
  const unverifiedResult = await sql`
    UPDATE fundraising_foundations
    SET 
      data_confidence = 'unverified',
      updated_at = NOW()
    WHERE source = 'automated-research'
      AND research_depth = 'rapid'
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
  `;
  stats.unverified = unverifiedResult.count ?? 0;
  console.log(`✅ Set ${stats.unverified} foundations to 'unverified' (automated-research + rapid)`);

  // Rule 2: research_depth='standard' → 'ai-assessed'
  const aiAssessedResult = await sql`
    UPDATE fundraising_foundations
    SET 
      data_confidence = 'ai-assessed',
      updated_at = NOW()
    WHERE research_depth = 'standard'
      AND (data_confidence IS NULL OR data_confidence != 'ai-assessed')
  `;
  stats.aiAssessed = aiAssessedResult.count ?? 0;
  console.log(`✅ Set ${stats.aiAssessed} foundations to 'ai-assessed' (research_depth=standard)`);

  // Rule 3: research_depth='deep' → 'human-verified'
  const humanVerifiedResult = await sql`
    UPDATE fundraising_foundations
    SET 
      data_confidence = 'human-verified',
      verified_at = NOW(),
      updated_at = NOW()
    WHERE research_depth = 'deep'
      AND (data_confidence IS NULL OR data_confidence != 'human-verified')
  `;
  stats.humanVerified = humanVerifiedResult.count ?? 0;
  console.log(`✅ Set ${stats.humanVerified} foundations to 'human-verified' (research_depth=deep)`);

  // Count foundations that didn't match any rule
  const totalResult = await sql`
    SELECT COUNT(*) as count
    FROM fundraising_foundations
    WHERE data_confidence IS NULL
  `;
  stats.unchanged = Number(totalResult[0]?.count ?? 0);

  console.log(`\n📈 Summary:`);
  console.log(`   Unverified:      ${stats.unverified}`);
  console.log(`   AI-assessed:     ${stats.aiAssessed}`);
  console.log(`   Human-verified:  ${stats.humanVerified}`);
  console.log(`   Unchanged (NULL): ${stats.unchanged}`);
  console.log(`   Total processed: ${stats.unverified + stats.aiAssessed + stats.humanVerified}\n`);

  // Show distribution
  const distribution = await sql`
    SELECT 
      data_confidence,
      COUNT(*) as count
    FROM fundraising_foundations
    GROUP BY data_confidence
    ORDER BY 
      CASE data_confidence
        WHEN 'human-verified' THEN 1
        WHEN 'ai-assessed' THEN 2
        WHEN 'unverified' THEN 3
        ELSE 4
      END
  `;

  console.log('📊 Current confidence distribution:\n');
  for (const row of distribution) {
    const level = row.data_confidence ?? '(null)';
    const count = row.count;
    console.log(`   ${level.padEnd(20)} ${count}`);
  }
  console.log('');
}

setConfidence().catch(console.error);
