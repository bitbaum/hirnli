#!/usr/bin/env tsx
/**
 * Foundation Triage — Surface top research targets from DB
 *
 * Queries fundraising_foundations for high-value foundations that are still
 * at 'rapid' research depth (name + ESA purpose only, no real research).
 *
 * Filters:
 *   - fitScore ≥ 4 AND priority ≤ 3
 *   - NOT in NOT_RECOMMENDED list
 *   - researchDepth = 'rapid' OR missing quality gate fields
 *
 * Output: research/triage/YYYY-MM-DD.json (ranked by fitScore × priority)
 *
 * Usage:
 *   npx tsx scripts/triage.ts
 *   npx tsx scripts/triage.ts --min-fit=3 --max-priority=4
 *   npx tsx scripts/triage.ts --limit=50
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { NOT_RECOMMENDED } from '../src/lib/config/foundations/metadata';

// ============================================================================
// CLI args
// ============================================================================

const args = process.argv.slice(2);
function getArg(name: string, defaultVal: number): number {
  const flag = args.find(a => a.startsWith(`--${name}=`));
  return flag ? parseInt(flag.split('=')[1], 10) : defaultVal;
}

const MIN_FIT = getArg('min-fit', 4);
const MAX_PRIORITY = getArg('max-priority', 3);
const LIMIT = getArg('limit', 200);

// ============================================================================
// Types
// ============================================================================

interface TriageItem {
  slug: string;
  name: string;
  fitScore: number;
  priority: number;
  researchDepth: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  officialPurpose: string | null;
  themes: string[];
  missing: string[];
  /** Higher = better research target */
  triageScore: number;
}

interface TriageOutput {
  date: string;
  criteria: { minFit: number; maxPriority: number; limit: number };
  totalMatches: number;
  items: TriageItem[];
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const notRecommendedNames = new Set(NOT_RECOMMENDED.map(nr => nr.name.toLowerCase()));

  console.log(`Triage: fitScore ≥ ${MIN_FIT}, priority ≤ ${MAX_PRIORITY}, limit ${LIMIT}`);

  // Query foundations with high fit but lacking research
  const rows = await sql`
    SELECT
      f.id AS slug,
      f.name,
      f.fit_score,
      f.priority,
      f.research_depth,
      f.website_url,
      f.contact_email,
      f.contact_phone,
      f.focus_areas,
      f.config_data,
      r.official_purpose
    FROM fundraising_foundations f
    LEFT JOIN fundraising_foundation_registry r ON r.id = f.id
    WHERE f.fit_score >= ${MIN_FIT}
      AND f.priority <= ${MAX_PRIORITY}
      AND f.archived = false
      AND (
        f.research_depth = 'rapid'
        OR f.research_depth IS NULL
      )
    ORDER BY f.fit_score DESC, f.priority ASC
    LIMIT ${LIMIT * 2}
  `;

  console.log(`  DB returned ${rows.length} candidates`);

  // Filter NOT_RECOMMENDED and build triage items
  const items: TriageItem[] = [];

  for (const row of rows) {
    // Skip NOT_RECOMMENDED
    if (notRecommendedNames.has((row.name as string).toLowerCase())) {
      continue;
    }

    const configData = row.config_data as Record<string, unknown> | null;
    const purposeSummary = (configData?.purposeSummary as string) || '';
    const researchNotes = (configData?.researchNotes as string) || '';
    const contact = configData?.contact as { email?: string; phone?: string; address?: string } | undefined;
    // focus_areas is JSONB — Neon may return it as parsed array or as string
    const rawFocusAreas = row.focus_areas;
    const themes: string[] = Array.isArray(rawFocusAreas)
      ? rawFocusAreas
      : typeof rawFocusAreas === 'string'
        ? JSON.parse(rawFocusAreas)
        : [];

    // Determine what's missing for quality gate
    const missing: string[] = [];
    if (!purposeSummary || purposeSummary.length < 150) missing.push('purposeSummary (<150 chars)');
    if (!researchNotes || researchNotes.length < 250) missing.push('researchNotes (<250 chars)');
    if (!contact?.email && !contact?.phone && !contact?.address) missing.push('contact');
    if (!themes || themes.length === 0) missing.push('themes');
    if (!row.website_url) missing.push('websiteUrl');

    // Skip if already passes quality gate (shouldn't happen given depth=rapid, but safety check)
    if (missing.length === 0) continue;

    // Compute triage score: higher fitScore + lower priority + having a website = better target
    const fitScore = (row.fit_score as number) || 0;
    const priority = (row.priority as number) || 4;
    const hasWebsite = !!row.website_url && !(row.website_url as string).includes('zefix.ch');
    const triageScore = fitScore * 2 + (5 - priority) + (hasWebsite ? 3 : 0);

    items.push({
      slug: row.slug as string,
      name: row.name as string,
      fitScore,
      priority,
      researchDepth: row.research_depth as string | null,
      websiteUrl: row.website_url as string | null,
      contactEmail: row.contact_email as string | null,
      contactPhone: row.contact_phone as string | null,
      officialPurpose: row.official_purpose as string | null,
      themes,
      missing,
      triageScore,
    });
  }

  // Sort by triage score (descending)
  items.sort((a, b) => b.triageScore - a.triageScore);

  // Apply limit
  const limited = items.slice(0, LIMIT);

  // Write output
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.resolve('research/triage');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const output: TriageOutput = {
    date: today,
    criteria: { minFit: MIN_FIT, maxPriority: MAX_PRIORITY, limit: LIMIT },
    totalMatches: items.length,
    items: limited,
  };

  const outFile = path.join(outDir, `${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  // Summary
  console.log(`\nTriage results: ${limited.length} targets (of ${items.length} total matches)`);
  console.log(`  Written to: ${outFile}`);

  // Breakdown
  const withWebsite = limited.filter(i => i.websiteUrl && !i.websiteUrl.includes('zefix.ch')).length;
  const p1 = limited.filter(i => i.priority === 1).length;
  const p2 = limited.filter(i => i.priority === 2).length;
  const p3 = limited.filter(i => i.priority === 3).length;
  console.log(`  P1: ${p1} | P2: ${p2} | P3: ${p3}`);
  console.log(`  With real website: ${withWebsite} | Without: ${limited.length - withWebsite}`);
  console.log(`  Top 5:`);
  for (const item of limited.slice(0, 5)) {
    console.log(`    ${item.name} (fit=${item.fitScore}, P${item.priority}, triage=${item.triageScore}) — missing: ${item.missing.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Triage failed:', err);
  process.exit(1);
});
