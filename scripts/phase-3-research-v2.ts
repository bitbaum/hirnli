#!/usr/bin/env tsx
/**
 * Phase 3 Research v2.0 - Research the 18 passed candidates from screening v2.0
 *
 * Purpose: Validate the 30% false positive projection and measure actual efficiency
 *
 * Usage: npm run research:phase3
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ScreeningResult {
  candidate: {
    name: string;
    slug: string;
    location: string;
    foundVia: string[];
  };
  decision: 'pass' | 'exclude';
  tier?: number;
  reason?: string;
  esaMatch?: {
    uid: string;
    name: string;
    purpose: string;
    city: string;
    canton: string;
    status: string;
  };
  scores?: {
    funderScore: number;
    operatorScore: number;
    confidence: string;
  };
}

interface ScreeningData {
  results: ScreeningResult[];
}

function main() {
  console.log('📋 Phase 3 Research v2.0 - Analyzing passed candidates\n');

  // Load screening results
  const screeningPath = join(process.cwd(), 'research', 'screening-v2-2026-02-16.json');
  const screeningData: ScreeningData = JSON.parse(readFileSync(screeningPath, 'utf-8'));

  // Filter passed candidates
  const passed = screeningData.results.filter(r => r.decision === 'pass');
  console.log(`✅ Found ${passed.length} passed candidates\n`);

  // Group by tier
  const byTier: Record<number, ScreeningResult[]> = {};
  passed.forEach(p => {
    const tier = p.tier || 4;
    if (!byTier[tier]) byTier[tier] = [];
    byTier[tier].push(p);
  });

  console.log('📊 Tier breakdown:');
  Object.keys(byTier).sort().forEach(tier => {
    console.log(`   Tier ${tier}: ${byTier[Number(tier)].length} candidates`);
  });
  console.log('');

  // Create output directory
  const outDir = join(process.cwd(), 'research', 'phase-3-v2-2026-02-16');
  mkdirSync(outDir, { recursive: true });

  // Generate research prompts for each candidate
  passed.forEach((result, index) => {
    const { candidate, tier, esaMatch, scores } = result;

    const prompt = generateResearchPrompt(candidate, tier || 4, esaMatch, scores);

    const filename = `${String(index + 1).padStart(2, '0')}-${candidate.slug}.md`;
    const filepath = join(outDir, filename);

    writeFileSync(filepath, prompt, 'utf-8');
    console.log(`📄 Generated: ${filename}`);
  });

  // Create summary file
  const summary = {
    date: '2026-02-16',
    source: 'screening-v2-2026-02-16.json',
    totalPassed: passed.length,
    tierBreakdown: Object.keys(byTier).reduce((acc, tier) => {
      acc[tier] = byTier[Number(tier)].length;
      return acc;
    }, {} as Record<string, number>),
    candidates: passed.map(p => ({
      name: p.candidate.name,
      slug: p.candidate.slug,
      tier: p.tier,
      uid: p.esaMatch?.uid,
      location: p.esaMatch?.city || p.candidate.location,
      funderScore: p.scores?.funderScore || 0,
      operatorScore: p.scores?.operatorScore || 0,
    })),
  };

  const summaryPath = join(outDir, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\n📝 Summary: ${summaryPath}`);

  console.log(`\n✅ Generated ${passed.length} research prompts in ${outDir}/`);
  console.log('\n📌 Next steps:');
  console.log('   1. Use Claude Code to analyze each foundation (WebFetch + ESA data)');
  console.log('   2. Assess: funder vs operator, themes, fit, application method');
  console.log('   3. Decision: add / exclude / needs_more_research');
  console.log('   4. Track time per foundation (target: <3 min each)');
  console.log('   5. Measure false positive rate (projected: 30%)');
}

function generateResearchPrompt(
  candidate: ScreeningResult['candidate'],
  tier: number,
  esaMatch: ScreeningResult['esaMatch'],
  scores: ScreeningResult['scores']
): string {
  const { name, slug, location, foundVia } = candidate;

  return `# Foundation Research: ${name}

**Tier**: ${tier}
**Location**: ${location}
**Found via**: ${foundVia.join(', ')}
**ESA UID**: ${esaMatch?.uid || 'N/A'}
**Funder/Operator Score**: ${scores?.funderScore || 0} / ${scores?.operatorScore || 0} (confidence: ${scores?.confidence || 'unknown'})

---

## Official ESA Data

**Name (ESA)**: ${esaMatch?.name || 'Not found'}
**City**: ${esaMatch?.city || 'Unknown'}
**Status**: ${esaMatch?.status || 'Unknown'}

**Stiftungszweck (Official Purpose)**:
\`\`\`
${esaMatch?.purpose || 'No ESA entry found'}
\`\`\`

---

## Research Tasks

### 1. Find Website
- [ ] Search for official website
- [ ] Note URL: _______________

### 2. Funder vs Operator Assessment

Based on ESA purpose and website:
- [ ] **Funder**: Keywords like "fördert", "unterstützt Projekte", "vergibt Beiträge", application form
- [ ] **Operator**: Keywords like "betreibt", "führt durch", "bietet an", own programs
- [ ] **Mixed**: Both funding and operating

**Decision**: ________________

**Reasoning**:


### 3. Theme Alignment

Check if foundation focuses on Revamp-IT themes:
- [ ] **Social Integration** (Arbeitsintegration, sozial benachteiligte)
- [ ] **Environmental** (Umwelt, Klima, Kreislaufwirtschaft, Recycling)
- [ ] **Education/Digital** (Bildung, digitale Kompetenzen)

**Themes found**: ________________

### 4. Geographic Focus

- [ ] **Swiss inland focus** (Schweiz, specific cantons)
- [ ] **Zürich connection** (Zürich-based, active in ZH)
- [ ] **International development only** (developing countries, Global South)
- [ ] **French/Italian only** (Geneva/Lausanne/Lugano, no German-speaking presence)

**Geographic fit**: ________________

### 5. Application Method

If funder, check how to apply:
- [ ] Online application form
- [ ] Email/postal application
- [ ] Personal contact required
- [ ] Partnership/invitation only
- [ ] Unclear/no information

**Method**: ________________

### 6. Fit Assessment

**Overall fit for Revamp-IT** (1-5 scale):
- 5 = Perfect fit (strong funder, right themes, Zürich-based)
- 4 = Good fit (funder, themes align, Swiss focus)
- 3 = Possible fit (funder but limited thematic match)
- 2 = Weak fit (operator or wrong focus)
- 1 = No fit (exclude)

**Fit score**: _____ / 5

**Reasoning**:


---

## Decision

**Final decision**:
- [ ] **Add to database** (needsResearch: false) - strong candidate
- [ ] **Add to database** (needsResearch: true) - potential but needs more info
- [ ] **Exclude** - operator, wrong focus, or other disqualifier
- [ ] **Exclude** - add to NOT_RECOMMENDED

**If adding, fill out**:
- Purpose summary (150+ chars):
- Research notes (250+ chars):
- Contact info:
- Application deadline:
- Robert type (A/B/C/D):

**If excluding, reason**:


---

## Time Tracking

**Start time**: _____
**End time**: _____
**Total minutes**: _____

**Target**: < 3 minutes per foundation
`;
}

main();
