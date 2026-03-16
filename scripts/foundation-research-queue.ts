#!/usr/bin/env tsx
/**
 * Foundation Research Queue Generator
 *
 * Takes screening v3.1 output (passed candidates) and generates a
 * priority-ordered queue using Expected Value scoring.
 *
 * EV = tierWeight × themeOverlapScore × geographicBonus
 *
 * Usage:
 *   npm run research:queue
 *   npm run research:queue -- --input=research/screening-v3.1-2026-02-16.json
 *
 * Output:
 *   research/queue-YYYY-MM-DD.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ResearchQueueItem, ResearchQueue } from './lib/research-types';
import { slugify } from './lib/utilities';

// ============================================================================
// TYPES (screening v3.1 output shape)
// ============================================================================

interface ScreeningResult {
  candidate: {
    name: string;
    slug?: string;
    location?: string;
    foundVia?: string[];
    url?: string;
  };
  decision: 'pass' | 'exclude';
  tier?: 1 | 2 | 3 | 4;
  esaMatch?: {
    uid: string;
    name: string;
    purpose: string;
    canton: string;
    city: string;
    status: string;
  };
  scores?: {
    funderScore: number;
    operatorScore: number;
    socialScore: number;
    confidence: 'high' | 'medium' | 'low';
  };
}

interface ScreeningReport {
  date: string;
  version: string;
  results: ScreeningResult[];
}

// ============================================================================
// EV SCORING
// ============================================================================

const TIER_WEIGHTS: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };

// Core theme keywords that overlap with Revamp-IT's mission
const CORE_THEME_KEYWORDS = [
  'arbeitsintegration', 'soziale integration', 'berufliche integration',
  'kreislaufwirtschaft', 'recycling', 'wiederverwendung',
  'digitale bildung', 'digitale kompetenz', 'informatik',
  'bildung', 'ausbildung', 'erziehung',
  'benachteiligt', 'chancengleichheit',
];

// Zürich-area cities for geographic bonus
const ZURICH_CITIES = ['zürich', 'zurich'];
const GERMAN_CH_CITIES = [
  'winterthur', 'zug', 'baden', 'aarau', 'bern', 'basel', 'luzern',
  'st. gallen', 'schaffhausen', 'freienbach', 'wetzikon', 'alpnach',
];

function computeThemeOverlap(purpose: string): number {
  const purposeLower = purpose.toLowerCase();
  let matches = 0;
  for (const kw of CORE_THEME_KEYWORDS) {
    if (purposeLower.includes(kw)) matches++;
  }
  // Scale: at least 0.33 (minimum), up to 1.0 for 3+ matches
  return Math.max(0.33, Math.min(1.0, matches / 3));
}

function computeGeoBonus(city: string): number {
  const cityLower = city.toLowerCase();
  if (ZURICH_CITIES.some(c => cityLower.includes(c))) return 1.5;
  if (GERMAN_CH_CITIES.some(c => cityLower.includes(c))) return 1.0;
  return 0.5; // FR/IT region that passed screening
}

function computeEV(tier: number, purpose: string, city: string): number {
  const tierWeight = TIER_WEIGHTS[tier] ?? 1;
  const themeOverlap = computeThemeOverlap(purpose);
  const geoBonus = computeGeoBonus(city);
  return tierWeight * themeOverlap * geoBonus;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Foundation Research Queue Generator');
  console.log('  Prioritizes candidates by Expected Value for deep research');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find input file
  const args = process.argv.slice(2);
  let inputPath: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--input=')) {
      inputPath = arg.substring(8);
    }
  }

  if (!inputPath) {
    // Find latest screening v3.1 file
    const researchDir = path.join(process.cwd(), 'research');
    const files = fs.readdirSync(researchDir)
      .filter(f => f.startsWith('screening-v3.1-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('❌ No screening v3.1 files found. Run `npm run screen:v3.1` first.\n');
      process.exit(1);
    }

    inputPath = path.join('research', files[0]);
  }

  const fullPath = path.join(process.cwd(), inputPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${inputPath}\n`);
    process.exit(1);
  }

  const report: ScreeningReport = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  console.log(`\n📋 Loaded screening: ${inputPath} (v${report.version}, ${report.date})`);

  // Filter to passing candidates with ESA data
  const passed = report.results.filter(
    (r): r is ScreeningResult & { esaMatch: NonNullable<ScreeningResult['esaMatch']>; tier: number } =>
      r.decision === 'pass' && r.esaMatch != null && r.tier != null,
  );

  console.log(`   Passed candidates: ${passed.length}\n`);

  if (passed.length === 0) {
    console.log('⚠️  No candidates to queue.\n');
    process.exit(0);
  }

  // Build queue items with EV scores
  const items: ResearchQueueItem[] = passed.map(r => {
    const ev = computeEV(r.tier, r.esaMatch.purpose, r.esaMatch.city);
    return {
      name: r.candidate.name,
      slug: r.candidate.slug || slugify(r.candidate.name),
      tier: r.tier as 1 | 2 | 3 | 4,
      evScore: Math.round(ev * 100) / 100,
      websiteUrl: r.candidate.url,
      esaMatch: r.esaMatch,
      candidate: r.candidate,
      scores: r.scores,
    };
  });

  // Sort by EV descending
  items.sort((a, b) => b.evScore - a.evScore);

  // Display queue
  console.log('🎯 Priority Queue:\n');
  items.forEach((item, i) => {
    console.log(
      `  ${String(i + 1).padStart(2)}. [EV ${item.evScore.toFixed(2)}] [T${item.tier}] ${item.name} (${item.esaMatch.city})`,
    );
  });

  // Save queue
  const today = new Date().toISOString().split('T')[0];
  const queue: ResearchQueue = {
    date: today,
    sourceScreening: inputPath,
    totalCandidates: items.length,
    items,
  };

  const outputPath = path.join(process.cwd(), 'research', `queue-${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2), 'utf-8');

  console.log(`\n💾 Queue saved: ${outputPath}`);
  console.log(`   ${items.length} candidates ready for research\n`);
  console.log('📋 Next: npm run research:run\n');
}

main();
