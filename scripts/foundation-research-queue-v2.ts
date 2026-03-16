#!/usr/bin/env tsx
/**
 * Foundation Research Queue v2 — Enhanced EV Scoring
 *
 * Reads all foundations from DB and generates a priority-ordered research queue
 * using enhanced Expected Value scoring with cross-source signals from bulk
 * enrichment (Layer 1).
 *
 * Key differences from v1:
 *   - Works on ALL foundations (not just screening output)
 *   - Uses actual theme assignments (not just keyword substring)
 *   - Incorporates funder/operator classification
 *   - Filters out operatives and non-funders
 *   - Considers current quality tier (skip already-researched)
 *
 * Enhanced EV formula:
 *   EV = themeOverlap × geoBonus × funderLikelihood × tierWeight
 *   (operatives are excluded, not penalized)
 *
 * Usage:
 *   npx tsx scripts/foundation-research-queue-v2.ts
 *   npx tsx scripts/foundation-research-queue-v2.ts --limit=100
 *   npx tsx scripts/foundation-research-queue-v2.ts --min-ev=2.0
 *
 * Output:
 *   research/queue-v2-YYYY-MM-DD.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { scoreFunderOperator } from './lib/theme-classifier';
import type { Foundation } from '../src/lib/schemas/foundation';

// ============================================================================
// CONFIG
// ============================================================================

// Theme weights — how much each theme overlap contributes to EV
// Core themes (direct Revamp-IT mission) score higher
const THEME_WEIGHTS: Record<string, number> = {
  arbeitsintegration: 3,
  kreislaufwirtschaft: 3,
  'soziale-integration': 2.5,
  'digitale-bildung': 2.5,
  'digitale-souveraenitaet': 3,
  klima: 1.5,
  zuerich: 1, // geographic, not thematic
};

// Zürich-area cities for geographic bonus
const ZURICH_AREA = ['zürich', 'zurich', 'winterthur', 'dietikon', 'dübendorf', 'uster', 'wädenswil', 'kloten', 'opfikon', 'bülach'];
const GERMAN_CH_CANTONS = ['ZH', 'BE', 'LU', 'ZG', 'SZ', 'AG', 'SG', 'TG', 'SH', 'GL', 'BS', 'BL', 'SO', 'NW', 'OW', 'UR', 'GR', 'AR', 'AI'];

// ============================================================================
// TYPES
// ============================================================================

interface QueueItem {
  slug: string;
  name: string;
  uid: string;
  evScore: number;
  currentTier: string;
  themes: string[];
  themeScore: number;
  geoScore: number;
  funderScore: number;
  city: string;
  canton: string;
  hasWebsite: boolean;
  hasOfficialPurpose: boolean;
  missingForNextTier: string[];
}

interface QueueOutput {
  date: string;
  version: string;
  totalCandidates: number;
  filters: {
    excludedOperatives: number;
    excludedAlreadyResearched: number;
    excludedNoThemes: number;
    excludedNoFunderSignal: number;
  };
  items: QueueItem[];
}

// ============================================================================
// EV SCORING
// ============================================================================

function computeThemeScore(themes: string[]): number {
  if (themes.length === 0) return 0;
  let score = 0;
  for (const theme of themes) {
    score += THEME_WEIGHTS[theme] || 1;
  }
  // Normalize: 1 theme = base, multiple themes = bonus (diminishing returns)
  return Math.min(score, 8); // Cap at 8 to prevent outliers
}

function computeGeoScore(city: string, canton: string): number {
  const cityLower = city.toLowerCase();
  if (ZURICH_AREA.some(c => cityLower.includes(c))) return 2.0;
  if (canton === 'ZH') return 1.8;
  if (GERMAN_CH_CANTONS.includes(canton)) return 1.0;
  // French/Italian Swiss — still valid but lower priority
  return 0.5;
}

function computeFunderLikelihood(f: Foundation): number {
  // Explicit operative flag from bulk enrichment
  if (f.isOperative === true) return 0;

  const purpose = f.officialPurpose || '';
  if (purpose.length < 10) return 0.5; // Unknown, give benefit of doubt

  const scores = scoreFunderOperator(purpose);
  const total = scores.funder + scores.operator;
  if (total === 0) return 0.5;

  // Ratio: mostly funder = high, mostly operator = low
  return Math.max(0.1, scores.funder / total);
}

/** Registry URL check */
function isRegistryUrl(url: string): boolean {
  if (!url) return true;
  return url.includes('zefix.ch') || url.includes('uid.admin.ch');
}

/** Compute quality tier (mirrors foundation-helpers.ts) */
function getQualityTier(f: Foundation): string {
  const realWeb = !!f.websiteUrl && !isRegistryUrl(f.websiteUrl);
  const directContact = !!(f.contact?.email || f.contact?.phone);
  const hasAppUrl = !!f.applicationUrl;
  const hasGrantRange = !!(f.amount?.min || f.amount?.max);
  const hasThemes = f.themes.length > 0;
  const hasContactInfo = directContact || !!f.contact?.address;
  const hasRegistryData = !!f.officialPurpose || hasThemes || (f.fitScore ?? 0) > 0;

  if (realWeb && directContact && hasAppUrl && hasGrantRange) return 'anwendungsbereit';
  if (realWeb && directContact) return 'recherchiert';
  if (hasThemes && hasContactInfo) return 'profiliert';
  if (hasRegistryData) return 'erfasst';
  return 'verzeichnet';
}

/** What fields are missing for the next tier */
function missingForNextTier(f: Foundation): string[] {
  const tier = getQualityTier(f);
  const missing: string[] = [];
  const realWeb = !!f.websiteUrl && !isRegistryUrl(f.websiteUrl);
  const directContact = !!(f.contact?.email || f.contact?.phone);
  const hasThemes = f.themes.length > 0;
  const hasContactInfo = directContact || !!f.contact?.address;

  switch (tier) {
    case 'verzeichnet':
      if (!f.officialPurpose) missing.push('officialPurpose');
      if (!hasThemes) missing.push('themes');
      break;
    case 'erfasst':
      if (!hasThemes) missing.push('themes');
      if (!hasContactInfo) missing.push('contact');
      break;
    case 'profiliert':
      if (!realWeb) missing.push('websiteUrl');
      if (!directContact) missing.push('email/phone');
      break;
    case 'recherchiert':
      if (!f.applicationUrl) missing.push('applicationUrl');
      if (!f.amount?.min && !f.amount?.max) missing.push('grantRange');
      break;
  }
  return missing;
}

function computeEV(f: Foundation, city: string, canton: string): {
  ev: number;
  themeScore: number;
  geoScore: number;
  funderScore: number;
} {
  const themeScore = computeThemeScore(f.themes as string[]);
  const geoScore = computeGeoScore(city, canton);
  const funderScore = computeFunderLikelihood(f);

  // Tier weight: foundations closer to useful tiers get bonus
  const tier = getQualityTier(f);
  const tierWeights: Record<string, number> = {
    verzeichnet: 0.5,
    erfasst: 1.0,
    profiliert: 1.5, // Already profiled, just needs website + contact
  };
  const tierWeight = tierWeights[tier] || 1.0;

  const ev = themeScore * geoScore * funderScore * tierWeight;

  return {
    ev: Math.round(ev * 100) / 100,
    themeScore: Math.round(themeScore * 100) / 100,
    geoScore: Math.round(geoScore * 100) / 100,
    funderScore: Math.round(funderScore * 100) / 100,
  };
}

// ============================================================================
// ESA LOOKUP (for city/canton when not in config_data)
// ============================================================================

interface ESAEntry { uid: string; name: string; purpose: string; canton: string; city: string; status: string; }

function loadESAIndex(): Map<string, ESAEntry> {
  const esaPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  if (!fs.existsSync(esaPath)) return new Map();
  const data = JSON.parse(fs.readFileSync(esaPath, 'utf-8'));
  const map = new Map<string, ESAEntry>();
  for (const entry of data.foundations) {
    map.set(entry.uid, entry);
  }
  return map;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500;
  const minEvArg = args.find(a => a.startsWith('--min-ev='));
  const minEv = minEvArg ? parseFloat(minEvArg.split('=')[1]) : 0.5;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Foundation Research Queue v2');
  console.log('  Enhanced EV scoring with cross-source signals');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Limit: ${limit} | Min EV: ${minEv}`);

  // Load DB
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, name, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
    ORDER BY id
  `;
  console.log(`\n📦 Loaded ${rows.length} foundations from DB`);

  const esaIndex = loadESAIndex();
  console.log(`📦 ESA index: ${esaIndex.size} entries`);

  // Filter and score
  const filters = {
    excludedOperatives: 0,
    excludedAlreadyResearched: 0,
    excludedNoThemes: 0,
    excludedNoFunderSignal: 0,
  };

  const candidates: QueueItem[] = [];

  for (const row of rows) {
    const f = row.config_data as Foundation;
    const tier = getQualityTier(f);

    // Skip already well-researched foundations
    if (tier === 'recherchiert' || tier === 'anwendungsbereit') {
      filters.excludedAlreadyResearched++;
      continue;
    }

    // Skip explicit operatives
    if (f.isOperative === true) {
      filters.excludedOperatives++;
      continue;
    }

    // Get city/canton from ESA if not in config_data
    const esa = f.uid ? esaIndex.get(f.uid) : undefined;
    const city = f.region || esa?.city || '';
    const canton = esa?.canton || '';

    // Compute EV
    const { ev, themeScore, geoScore, funderScore } = computeEV(f, city, canton);

    // Filter: need at least some theme overlap
    if (themeScore === 0) {
      filters.excludedNoThemes++;
      continue;
    }

    // Filter: need funder signal
    if (funderScore < 0.2) {
      filters.excludedNoFunderSignal++;
      continue;
    }

    // Filter: minimum EV
    if (ev < minEv) continue;

    candidates.push({
      slug: f.slug,
      name: f.name,
      uid: f.uid || '',
      evScore: ev,
      currentTier: tier,
      themes: f.themes as string[],
      themeScore,
      geoScore,
      funderScore,
      city,
      canton,
      hasWebsite: !!f.websiteUrl && !isRegistryUrl(f.websiteUrl),
      hasOfficialPurpose: !!(f.officialPurpose && f.officialPurpose.length > 50),
      missingForNextTier: missingForNextTier(f),
    });
  }

  // Sort by EV descending
  candidates.sort((a, b) => b.evScore - a.evScore);

  // Apply limit
  const queue = candidates.slice(0, limit);

  // Display results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  QUEUE RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total foundations:       ${rows.length.toLocaleString()}`);
  console.log(`  Excluded (operatives):   ${filters.excludedOperatives.toLocaleString()}`);
  console.log(`  Excluded (researched):   ${filters.excludedAlreadyResearched.toLocaleString()}`);
  console.log(`  Excluded (no themes):    ${filters.excludedNoThemes.toLocaleString()}`);
  console.log(`  Excluded (no funder):    ${filters.excludedNoFunderSignal.toLocaleString()}`);
  console.log(`  Candidates (EV >= ${minEv}): ${candidates.length.toLocaleString()}`);
  console.log(`  Queue (top ${limit}):       ${queue.length.toLocaleString()}`);

  // Tier breakdown of queue
  const tierBreakdown: Record<string, number> = {};
  for (const item of queue) {
    tierBreakdown[item.currentTier] = (tierBreakdown[item.currentTier] || 0) + 1;
  }
  console.log('\n  Queue tier breakdown:');
  for (const [tier, count] of Object.entries(tierBreakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${tier.padEnd(20)} ${count}`);
  }

  // EV distribution
  if (queue.length > 0) {
    const evValues = queue.map(q => q.evScore);
    console.log(`\n  EV range: ${evValues[evValues.length - 1].toFixed(2)} — ${evValues[0].toFixed(2)}`);
    console.log(`  EV median: ${evValues[Math.floor(evValues.length / 2)].toFixed(2)}`);
  }

  // Show top 30
  console.log('\n🎯 Top 30 Research Candidates:\n');
  for (let i = 0; i < Math.min(30, queue.length); i++) {
    const item = queue[i];
    const themes = item.themes.slice(0, 3).join(', ');
    console.log(
      `  ${String(i + 1).padStart(3)}. [EV ${item.evScore.toFixed(2).padStart(5)}] ` +
      `[${item.currentTier.padEnd(12)}] ` +
      `${item.name.substring(0, 45).padEnd(47)} ` +
      `${item.city.substring(0, 15).padEnd(17)} ` +
      `{${themes}}`
    );
  }

  // Save queue
  const today = new Date().toISOString().split('T')[0];
  const output: QueueOutput = {
    date: today,
    version: '2.0',
    totalCandidates: candidates.length,
    filters,
    items: queue,
  };

  const outputPath = path.join(process.cwd(), 'research', `queue-v2-${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Queue saved: research/queue-v2-${today}.json`);
  console.log(`   ${queue.length} candidates ready for research\n`);
  console.log('📋 Next: Use foundation-batch-research.ts with this queue\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
