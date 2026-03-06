#!/usr/bin/env tsx
/**
 * Gesuch Audit — Quality-check top Gesuch pages
 *
 * For all foundations with Gesuch pages (tier ≥ recherchiert, P1-P3):
 *   1. Loads composed Gesuch content via gesuch-composer
 *   2. Checks: does foundationBridge mention the specific foundation?
 *   3. Are stories theme-relevant? Is contact info present?
 *   4. Outputs a quality report with actionable recommendations
 *
 * Usage:
 *   npx tsx scripts/gesuch-audit.ts
 *   npx tsx scripts/gesuch-audit.ts --priority=1
 *   npx tsx scripts/gesuch-audit.ts --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import { hasGesuchPage } from '../src/lib/domain/foundation-helpers';
import { composeGesuch } from '../src/lib/domain/gesuch-composer';
import { computePriorityScore } from '../src/lib/domain/foundation-scores';

// ============================================================================
// CLI args
// ============================================================================

const args = process.argv.slice(2);
const PRIORITY_FILTER = parseInt(args.find(a => a.startsWith('--priority='))?.split('=')[1] || '0', 10) || 0;
const JSON_OUTPUT = args.includes('--json');

// ============================================================================
// Types
// ============================================================================

interface AuditIssue {
  slug: string;
  name: string;
  priority: number;
  issues: string[];
  score: number; // 0-100 quality score
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const gesuchFoundations = STIFTUNGEN_DATA.filter(f => {
    if (!hasGesuchPage(f)) return false;
    if (PRIORITY_FILTER > 0) {
      const computed = computePriorityScore(f);
      return computed.level === PRIORITY_FILTER;
    }
    return true;
  });

  if (!JSON_OUTPUT) {
    console.log(`Gesuch Audit: checking ${gesuchFoundations.length} foundations with Gesuch pages`);
    if (PRIORITY_FILTER > 0) console.log(`  Filtered to P${PRIORITY_FILTER} only`);
  }

  const auditResults: AuditIssue[] = [];

  for (const foundation of gesuchFoundations) {
    const composed = composeGesuch(foundation);
    const computed = computePriorityScore(foundation);
    const issues: string[] = [];

    // Check 1: Is the Gesuch actually ready?
    if (!composed.ready) {
      issues.push(`NOT READY: ${composed.readyReason}`);
    }

    // Check 2: Does foundationBridge mention the foundation name?
    if (composed.ready) {
      const bridge = composed.foundationBridge.toLowerCase();
      const nameParts = foundation.name.toLowerCase().split(/[\s-]+/).filter(p => p.length > 3);
      const mentionsFoundation = nameParts.some(part => bridge.includes(part));
      if (!mentionsFoundation) {
        issues.push(`Bridge text does not mention foundation name (generic bridge)`);
      }
      if (composed.foundationBridge.length < 50) {
        issues.push(`Bridge text too short (${composed.foundationBridge.length} chars)`);
      }
    }

    // Check 3: Are themes present and mapped to stories?
    if (composed.ready) {
      if (composed.themes.all.length === 0) {
        issues.push(`No theme metadata resolved`);
      }
      if (!composed.story.why) {
        issues.push(`Missing WHY story section`);
      }
      if (composed.story.projects.length === 0) {
        issues.push(`No projects in story`);
      }
    }

    // Check 4: Contact info present?
    if (!foundation.contact?.email && !foundation.contact?.phone) {
      issues.push(`No contact info (email or phone)`);
    }

    // Check 5: Research notes quality
    if (!foundation.researchNotes || foundation.researchNotes.length < 250) {
      issues.push(`Research notes thin (${foundation.researchNotes?.length || 0} chars, need 250+)`);
    }

    // Check 6: Purpose summary quality
    if (!foundation.purposeSummary || foundation.purposeSummary.length < 150) {
      issues.push(`Purpose summary thin (${foundation.purposeSummary?.length || 0} chars, need 150+)`);
    }

    // Check 7: Website URL present and not just Zefix
    if (!foundation.websiteUrl || foundation.websiteUrl.includes('zefix.ch')) {
      issues.push(`No real website URL`);
    }

    // Compute quality score (100 = perfect, 0 = terrible)
    let score = 100;
    if (!composed.ready) score -= 50;
    if (issues.some(i => i.includes('Bridge text'))) score -= 15;
    if (issues.some(i => i.includes('No contact'))) score -= 10;
    if (issues.some(i => i.includes('Research notes thin'))) score -= 10;
    if (issues.some(i => i.includes('Purpose summary thin'))) score -= 10;
    if (issues.some(i => i.includes('No real website'))) score -= 5;
    score = Math.max(0, score);

    if (issues.length > 0) {
      auditResults.push({
        slug: foundation.slug,
        name: foundation.name,
        priority: computed.level,
        issues,
        score,
      });
    }
  }

  // Sort by priority (P1 first), then by score (worst first)
  auditResults.sort((a, b) => a.priority - b.priority || a.score - b.score);

  if (JSON_OUTPUT) {
    const today = new Date().toISOString().split('T')[0];
    const outDir = path.resolve('research/audit');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${today}.json`);
    fs.writeFileSync(outFile, JSON.stringify({
      date: today,
      totalChecked: gesuchFoundations.length,
      totalIssues: auditResults.length,
      perfect: gesuchFoundations.length - auditResults.length,
      results: auditResults,
    }, null, 2));
    console.log(`Audit written to: ${outFile}`);
    return;
  }

  // Console output
  const perfect = gesuchFoundations.length - auditResults.length;
  console.log(`\nResults: ${perfect} perfect, ${auditResults.length} with issues\n`);

  // Group by priority
  for (const p of [1, 2, 3]) {
    const items = auditResults.filter(r => r.priority === p);
    if (items.length === 0) continue;

    console.log(`--- P${p} (${items.length} with issues) ---`);
    for (const item of items) {
      console.log(`  ${item.name} [score: ${item.score}/100]`);
      for (const issue of item.issues) {
        console.log(`    - ${issue}`);
      }
    }
    console.log('');
  }

  // Customization candidates (P1/P2 foundations with generic bridges)
  const needsCustomization = auditResults.filter(
    r => r.priority <= 2 && r.issues.some(i => i.includes('Bridge text'))
  );
  if (needsCustomization.length > 0) {
    console.log(`=== CUSTOMIZATION NEEDED (${needsCustomization.length} P1/P2 foundations) ===`);
    for (const item of needsCustomization) {
      console.log(`  ${item.slug} — ${item.name}`);
    }
    console.log(`\nRun: npx tsx scripts/batch-customize.ts`);
  }
}

main();
