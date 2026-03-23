#!/usr/bin/env tsx
/**
 * Diagnose P1-P3 Gaps — Find foundations with strategic priority but insufficient data
 *
 * Loads STIFTUNGEN_DATA, computes readiness for all P1-P3 foundations,
 * and reports which ones are below recherchiert tier (score < 45).
 *
 * No DB access needed — operates on the sync'd TypeScript data.
 *
 * Output: research/diagnostics/p1p3-gaps-YYYY-MM-DD.json
 *
 * Usage:
 *   npx tsx scripts/diagnose-p1p3-gaps.ts
 *   npx tsx scripts/diagnose-p1p3-gaps.ts --verbose   # Per-foundation details
 */

import * as path from 'path';
import * as fs from 'fs';

import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index.js';
import { computeReadinessScore } from '../src/lib/domain/foundation-scores.js';
import { computePriorityScore } from '../src/lib/domain/foundation-scores.js';
import type { Foundation, QualityTier } from '../src/lib/schemas/foundation.js';

// ============================================================================
// CLI ARGS
// ============================================================================

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

// ============================================================================
// Types
// ============================================================================

interface GapEntry {
  slug: string;
  name: string;
  priority: number;
  fitScore: number;
  readinessScore: number;
  tier: QualityTier;
  pointsNeeded: number; // to reach recherchiert (score 45)
  topImprovements: { label: string; points: number; dimension: string }[];
  missingFields: string[];
}

interface WhatIfScenario {
  field: string;
  description: string;
  affectedCount: number;
  wouldGraduate: number;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  P1-P3 Gap Diagnostic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const total = STIFTUNGEN_DATA.length;
  console.log(`  Total foundations in sync'd data: ${total}`);

  // Filter P1-P3 foundations
  const p1p3: Foundation[] = [];
  for (const f of STIFTUNGEN_DATA) {
    const pResult = computePriorityScore(f);
    if (pResult.level <= 3) {
      p1p3.push(f);
    }
  }
  console.log(`  P1-P3 foundations: ${p1p3.length}`);

  // Compute readiness for each, find those below recherchiert
  const RECHERCHIERT_THRESHOLD = 45; // readiness score needed for recherchiert tier
  const gaps: GapEntry[] = [];
  let alreadyQualified = 0;

  for (const f of p1p3) {
    const readiness = computeReadinessScore(f);
    const priority = computePriorityScore(f, readiness.score);

    if (readiness.tier === 'recherchiert' || readiness.tier === 'anwendungsbereit') {
      alreadyQualified++;
      continue;
    }

    const pointsNeeded = Math.max(0, RECHERCHIERT_THRESHOLD - readiness.score);

    // Determine missing fields from unpassed checks
    const missingFields: string[] = [];
    for (const check of readiness.checks) {
      if (!check.passed) {
        missingFields.push(check.label);
      }
    }

    gaps.push({
      slug: f.slug,
      name: f.name,
      priority: priority.level,
      fitScore: f.fitScore,
      readinessScore: readiness.score,
      tier: readiness.tier,
      pointsNeeded,
      topImprovements: readiness.topImprovements,
      missingFields,
    });
  }

  // Sort by priority (P1 first), then by points needed (lowest first = easiest wins)
  gaps.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.pointsNeeded - b.pointsNeeded;
  });

  console.log(`  Already qualified (recherchiert+): ${alreadyQualified}`);
  console.log(`  Below recherchiert (the gap): ${gaps.length}`);

  // Breakdown by priority
  const byPriority = { 1: 0, 2: 0, 3: 0 };
  for (const g of gaps) {
    byPriority[g.priority as 1 | 2 | 3]++;
  }
  console.log(`\n  Gap by priority:`);
  console.log(`    P1: ${byPriority[1]} foundations below recherchiert`);
  console.log(`    P2: ${byPriority[2]} foundations below recherchiert`);
  console.log(`    P3: ${byPriority[3]} foundations below recherchiert`);

  // Breakdown by current tier
  const byTier: Record<string, number> = {};
  for (const g of gaps) {
    byTier[g.tier] = (byTier[g.tier] || 0) + 1;
  }
  console.log(`\n  Gap by current tier:`);
  for (const [tier, count] of Object.entries(byTier).sort()) {
    console.log(`    ${tier}: ${count}`);
  }

  // Aggregate missing fields
  const fieldCounts: Record<string, number> = {};
  for (const g of gaps) {
    for (const field of g.missingFields) {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    }
  }
  const sortedFields = Object.entries(fieldCounts)
    .sort(([, a], [, b]) => b - a);

  console.log(`\n  Most common missing fields:`);
  for (const [field, count] of sortedFields.slice(0, 10)) {
    const pct = ((count / gaps.length) * 100).toFixed(0);
    console.log(`    ${field}: ${count} (${pct}%)`);
  }

  // ============================================================================
  // What-if scenarios — match by dimension (not label text)
  // ============================================================================

  console.log('\n━━━ What-If Scenarios ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const scenarios: WhatIfScenario[] = [];

  // Helper: compute what-if by dimension
  function whatIfByDimension(dimensionId: string): { affected: number; wouldGraduate: number } {
    let affected = 0;
    let wouldGraduate = 0;
    for (const g of gaps) {
      const dimPoints = g.topImprovements
        .filter(i => i.dimension === dimensionId)
        .reduce((sum, i) => sum + i.points, 0);
      if (dimPoints > 0) {
        affected++;
        if (g.readinessScore + dimPoints >= RECHERCHIERT_THRESHOLD) {
          wouldGraduate++;
        }
      }
    }
    return { affected, wouldGraduate };
  }

  // Scenario: fix all tailoring fields (themes, purposeSummary, researchNotes, pastGrantees, applicationProcess)
  const tailoring = whatIfByDimension('tailoring');
  scenarios.push({
    field: 'tailoring (themes, purpose, notes, process)',
    description: 'Fill all tailoring intelligence fields',
    affectedCount: tailoring.affected,
    wouldGraduate: tailoring.wouldGraduate,
  });

  // Scenario: fix all actionability fields (contact, applicationUrl, method, deadline)
  const actionability = whatIfByDimension('actionability');
  scenarios.push({
    field: 'actionability (contact, URL, method, deadline)',
    description: 'Fill all actionability fields',
    affectedCount: actionability.affected,
    wouldGraduate: actionability.wouldGraduate,
  });

  // Scenario: fix all financial fields (amount range, budget, capital)
  const financial = whatIfByDimension('financial');
  scenarios.push({
    field: 'financial (grant range, budget, capital)',
    description: 'Fill all financial calibration fields',
    affectedCount: financial.affected,
    wouldGraduate: financial.wouldGraduate,
  });

  // Scenario: combined — all possible improvements
  const allCombined = gaps.filter(g => {
    const totalGain = g.topImprovements.reduce((sum, i) => sum + i.points, 0);
    return g.readinessScore + totalGain >= RECHERCHIERT_THRESHOLD;
  });
  scenarios.push({
    field: 'all dimensions combined',
    description: 'Fill ALL missing fields (maximum possible from top 5 improvements)',
    affectedCount: gaps.length,
    wouldGraduate: allCombined.length,
  });

  // Specific what-if: just add 1 point (many are at 44)
  const onePointAway = gaps.filter(g => g.pointsNeeded <= 1);
  scenarios.push({
    field: 'any single field (+1 point minimum)',
    description: 'Foundations needing just 1 more point to graduate',
    affectedCount: onePointAway.length,
    wouldGraduate: onePointAway.length,
  });

  // Score distribution
  const scoreDistribution: Record<string, number> = {};
  for (const g of gaps) {
    const bucket = `${Math.floor(g.readinessScore / 5) * 5}-${Math.floor(g.readinessScore / 5) * 5 + 4}`;
    scoreDistribution[bucket] = (scoreDistribution[bucket] || 0) + 1;
  }

  console.log('\n  Score distribution (gap foundations):');
  for (const [bucket, count] of Object.entries(scoreDistribution).sort()) {
    const bar = '█'.repeat(Math.ceil(count / 5));
    console.log(`    ${bucket.padStart(5)}: ${String(count).padStart(4)} ${bar}`);
  };

  for (const s of scenarios) {
    console.log(`\n  If we add "${s.field}":`);
    console.log(`    Affected: ${s.affectedCount} foundations`);
    console.log(`    Would graduate to recherchiert: ${s.wouldGraduate}`);
  }

  // ============================================================================
  // Easy wins — foundations closest to graduating
  // ============================================================================

  console.log('\n━━━ Easy Wins (closest to recherchiert) ━━━━━━━━━━━━━━━━━━━━━━━');

  const easyWins = gaps
    .filter(g => g.pointsNeeded <= 20)
    .slice(0, 20);

  console.log(`  Foundations within 20 points of recherchiert: ${easyWins.length}`);
  for (const g of easyWins) {
    console.log(`    P${g.priority} | ${g.readinessScore}/100 (need +${g.pointsNeeded}) | ${g.name}`);
    if (VERBOSE) {
      for (const imp of g.topImprovements.slice(0, 3)) {
        console.log(`      → +${imp.points} pts: ${imp.label}`);
      }
    }
  }

  // ============================================================================
  // Per-foundation breakdown (verbose)
  // ============================================================================

  if (VERBOSE) {
    console.log('\n━━━ Full Gap Breakdown ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const g of gaps.slice(0, 50)) {
      console.log(`\n  ${g.name} (P${g.priority}, fit=${g.fitScore})`);
      console.log(`    Score: ${g.readinessScore}/100 → ${g.tier} (need +${g.pointsNeeded} for recherchiert)`);
      console.log(`    Top improvements:`);
      for (const imp of g.topImprovements) {
        console.log(`      +${imp.points} pts: ${imp.label} (${imp.dimension})`);
      }
    }
  }

  // ============================================================================
  // Write output
  // ============================================================================

  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/diagnostics');
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `p1p3-gaps-${today}.json`);
  const report = {
    date: today,
    summary: {
      totalFoundations: total,
      totalP1P3: p1p3.length,
      alreadyQualified,
      belowRecherchiert: gaps.length,
      byPriority,
      byTier,
      currentGesuchPages: alreadyQualified,
    },
    missingFieldCounts: Object.fromEntries(sortedFields),
    scenarios: scenarios.map(s => ({
      field: s.field,
      description: s.description,
      affectedCount: s.affectedCount,
      wouldGraduate: s.wouldGraduate,
    })),
    easyWins: easyWins.map(g => ({
      slug: g.slug,
      name: g.name,
      priority: g.priority,
      readinessScore: g.readinessScore,
      pointsNeeded: g.pointsNeeded,
      topImprovements: g.topImprovements,
    })),
    gaps: gaps.map(g => ({
      slug: g.slug,
      name: g.name,
      priority: g.priority,
      fitScore: g.fitScore,
      readinessScore: g.readinessScore,
      tier: g.tier,
      pointsNeeded: g.pointsNeeded,
      topImprovements: g.topImprovements,
      missingFields: g.missingFields,
    })),
  };

  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\n  Report written to: ${outFile}`);

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Current Gesuch-ready: ${alreadyQualified}`);
  console.log(`  P1-P3 gap (below recherchiert): ${gaps.length}`);
  console.log(`  Best-case with all enrichment: +${allCombined.length} → ~${alreadyQualified + allCombined.length} Gesuch pages`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
