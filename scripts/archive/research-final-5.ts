#!/usr/bin/env tsx

/**
 * Research Final 5 Candidates from Screening v3.1
 *
 * Quick 1-minute research on each candidate to validate projected 0-20% FP rate
 * Target: Identify 2-3 valid foundations to add to database
 */

import fs from 'fs';
import path from 'path';

const FINAL_5 = [
  {
    uid: 'CHE-157.513.088',
    name: 'Blauer Planet - Stiftung zur Bewahrung der Umwelt und Natur',
    city: 'Alpnach',
    scores: { funderScore: 1, operatorScore: 0, socialScore: 2 },
  },
  {
    uid: 'CHE-112.160.088',
    name: 'FREY CHARITABLE FOUNDATION',
    city: 'Freienbach',
    scores: { funderScore: 0, operatorScore: 0, socialScore: 4 },
  },
  {
    uid: 'CHE-452.574.859',
    name: 'Asuera Stiftung',
    city: 'Freienbach',
    scores: { funderScore: 2, operatorScore: 0, socialScore: 0 },
  },
  {
    uid: 'CHE-113.616.027',
    name: 'S. Eustachius Stiftung',
    city: 'Winterthur',
    scores: { funderScore: 1, operatorScore: 1, socialScore: 2 },
  },
  {
    uid: 'CHE-109.338.115',
    name: 'Stiftung Freie Gemeinschaftsbank',
    city: 'Basel',
    scores: { funderScore: 0, operatorScore: 0, socialScore: 2 },
  },
];

function generateResearchPrompt(candidate: typeof FINAL_5[0], index: number): string {
  return `# ${index}. ${candidate.name}

**UID**: ${candidate.uid}
**Location**: ${candidate.city}
**Scores**: Funder ${candidate.scores.funderScore} | Operator ${candidate.scores.operatorScore} | Social ${candidate.scores.socialScore}

## Research Tasks (1 minute)

### 1. Find Website
- Search for foundation name + UID
- Note official website URL

### 2. Funder vs Operator Assessment
- Does it GIVE grants/funding to other organizations? → Funder ✅
- Does it OPERATE programs/services directly? → Operator ❌

### 3. Theme Alignment
Check if it funds any of:
- Social integration / Arbeitsintegration /職業統合
- Environmental sustainability / Umwelt / Kreislaufwirtschaft
- Digital literacy / Bildung

### 4. Geographic Focus
- Switzerland-only? ✅
- International development focus? ❌

### 5. Decision
- ❌ EXCLUDE: [operator | wrong_theme | international | other reason]
- ⚠️ ADD (needs_research): Funder, plausible fit
- ✅ ADD: Strong funder, clear fit

---

`;
}

function main() {
  console.log('🔬 Research Final 5 from Screening v3.1\n');
  console.log('Target: 1 minute per foundation, validate 0-20% FP rate\n');
  console.log('---\n');

  let fullPrompt = '# Final 5 Research - Screening v3.1\n\n';
  fullPrompt += '**Date**: 2026-02-16\n';
  fullPrompt += '**Goal**: Validate projected 0-20% FP rate, identify 2-3 valid adds\n';
  fullPrompt += '**Time limit**: 1 minute per foundation\n\n';
  fullPrompt += '---\n\n';

  FINAL_5.forEach((candidate, index) => {
    fullPrompt += generateResearchPrompt(candidate, index + 1);
  });

  // Save to research directory
  const outputDir = path.join(process.cwd(), 'research');
  const outputPath = path.join(outputDir, 'final-5-research-prompts.md');

  fs.writeFileSync(outputPath, fullPrompt, 'utf-8');

  console.log(`✅ Research prompts generated: ${outputPath}\n`);
  console.log('📋 Next steps:');
  console.log('   1. Review each foundation (1 min each = 5 min total)');
  console.log('   2. Make decisions (exclude vs add)');
  console.log('   3. Add valid foundations to database');
  console.log('   4. Measure actual FP rate vs projected 0-20%\n');
}

main();
