#!/usr/bin/env tsx
/**
 * Foundation Data Validation Script
 *
 * Validates all foundation entries against quality gates:
 * - Schema validation (TypeScript types)
 * - Quality gate (delegated to validateFoundationQuality SSOT — uses
 *   isResearched(f) and QUALITY_THRESHOLDS, not the deprecated
 *   needsResearch boolean)
 * - Duplicate detection (slug, UID, fuzzy name matching)
 * - Status enum validation
 * - Required field completeness
 *
 * Usage:
 *   npm run validate:foundations
 *   npm run validate:foundations -- --fix  # Auto-fix trivial issues
 *
 * Exit codes:
 *   0 = All validations passed
 *   1 = Validation failures found
 */

import { getAllFoundations } from './lib/foundations';
import type { Foundation } from '../src/lib/schemas/foundation';
import { ApplicationMethod } from '../src/lib/schemas/foundation';
import { validateFoundationQuality } from '../src/lib/domain/foundation-quality';
import { isResearched } from '../src/lib/domain/foundation-helpers';

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationIssue {
  slug: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  category: 'schema' | 'quality' | 'duplicate' | 'completeness';
  message: string;
  fix?: string;
}

const issues: ValidationIssue[] = [];

function addIssue(issue: ValidationIssue) {
  issues.push(issue);
}

// ============================================================================
// QUALITY GATE VALIDATION
// ============================================================================

/**
 * Quality-gate validation for researched foundations.
 *
 * Delegates to the domain-layer validateFoundationQuality (SSOT) — that
 * function uses computed quality tier (isResearched) and shared
 * QUALITY_THRESHOLDS, replacing the now-deprecated stored needsResearch
 * boolean. The script-level wrapper just flattens the violation list into
 * the addIssue interface.
 */
function validateAllQualityGates(foundations: Foundation[]) {
  const violations = validateFoundationQuality(foundations);
  for (const { slug, issues } of violations) {
    const foundation = foundations.find((f) => f.slug === slug);
    const name = foundation?.name ?? slug;
    for (const message of issues) {
      addIssue({
        slug,
        name,
        severity: 'warning',
        category: 'quality',
        message,
        fix: 'Improve research depth (expand purposeSummary/researchNotes, add contact/themes/websiteUrl)',
      });
    }
  }
}

// ============================================================================
// COMPLETENESS VALIDATION
// ============================================================================

function validateCompleteness(foundation: Foundation) {
  // Warn if missing UID (not required, but valuable)
  if (!foundation.uid) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'warning',
      category: 'completeness',
      message: 'Missing UID (official Swiss foundation identifier)',
      fix: 'Search ESA register for UID: https://www.esa.admin.ch/de/stiftungsverzeichnis',
    });
  }

  // Warn if missing source
  if (!foundation.source) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'warning',
      category: 'completeness',
      message: 'Missing source (where we found this foundation)',
      fix: 'Add source: "fundraiso" | "stiftungschweiz" | "esa" | "manual" | etc.',
    });
  }

  // Warn if missing researchDate
  if (!foundation.researchDate) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'info',
      category: 'completeness',
      message: 'Missing researchDate (when we last researched this)',
      fix: 'Add researchDate: "YYYY-MM-DD"',
    });
  }

  // Warn if high priority (P1-P2) but research is incomplete (computed via tier).
  // Replaces the previous needsResearch=true check — that field is deprecated
  // (foundation-helpers.ts:isResearched is the canonical signal).
  if (foundation.priority <= 2 && !isResearched(foundation)) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'warning',
      category: 'quality',
      message: 'High priority foundation (P1-P2) below `profiliert` tier — incomplete research',
      fix: 'Expand purposeSummary/researchNotes/contact to lift the computed quality tier',
    });
  }
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/stiftung|foundation|fondation/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function validateDuplicates(foundations: Foundation[]) {
  const slugs = new Set<string>();
  const uids = new Set<string>();
  const names = new Map<string, Foundation>();

  for (const foundation of foundations) {
    // Check slug duplicates
    if (slugs.has(foundation.slug)) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'duplicate',
        message: `Duplicate slug: ${foundation.slug}`,
        fix: 'Use unique slug for each foundation',
      });
    }
    slugs.add(foundation.slug);

    // Check UID duplicates
    if (foundation.uid) {
      if (uids.has(foundation.uid)) {
        addIssue({
          slug: foundation.slug,
          name: foundation.name,
          severity: 'error',
          category: 'duplicate',
          message: `Duplicate UID: ${foundation.uid}`,
          fix: 'Same foundation entered twice, or incorrect UID',
        });
      }
      uids.add(foundation.uid);
    }

    // Check fuzzy name matches.
    // Use a length-aware threshold: short normalized names (3-letter acronyms
    // like BSZ, BSD, EHW) have fundamentally low edit distance to each other
    // even when they identify completely different foundations, so a flat
    // distance ≤3 produced thousands of false positives. Skip names <5 chars
    // and tighten the threshold for short-but-reasonable names.
    //
    // For non-zero distance matches, also require matching UIDs — different
    // UIDs identify different legal entities, so similar names with distinct
    // UIDs are guaranteed to be different foundations (different family
    // stiftungen, sister entities, coincidental name overlap, etc.).
    const normalized = normalizeName(foundation.name);
    if (normalized.length >= 5) {
      for (const [existingNormalized, existing] of names.entries()) {
        const minLen = Math.min(normalized.length, existingNormalized.length);
        if (minLen < 5) continue;
        const maxDistance = minLen <= 7 ? 1 : 2;
        const distance = levenshteinDistance(normalized, existingNormalized);
        if (distance > maxDistance) continue;
        // Distance 0: definitely flag (same normalized name)
        // Distance 1+: only flag if UIDs match (or one is missing — possibly
        //   the same foundation imported under two slugs, with one yet to
        //   receive its UID)
        if (distance > 0) {
          if (foundation.uid && existing.uid && foundation.uid !== existing.uid) {
            continue; // different UIDs = different foundations
          }
        }
        addIssue({
          slug: foundation.slug,
          name: foundation.name,
          severity: 'warning',
          category: 'duplicate',
          message: `Possible duplicate of "${existing.name}" (edit distance: ${distance})`,
          fix: 'Verify these are different foundations, or merge if duplicate',
        });
      }
    }
    names.set(normalized, foundation);
  }
}

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

function validateSchema(foundation: Foundation) {
  // Status must be valid enum
  const validStatuses = ['open', 'closed', 'rolling', 'soon'];
  if (!validStatuses.includes(foundation.status)) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'error',
      category: 'schema',
      message: `Invalid status: "${foundation.status}" (must be: ${validStatuses.join(', ')})`,
      fix: 'Use one of: open, closed, rolling, soon',
    });
  }

  // Type must be valid
  const validTypes = ['A', 'B', 'C', 'D', 'network'];
  if (!validTypes.includes(foundation.type)) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'error',
      category: 'schema',
      message: `Invalid type: "${foundation.type}" (must be: ${validTypes.join(', ')})`,
      fix: 'Use Robert Schmuki classification: A, B, C, D, or network',
    });
  }

  // fitScore must be 0-10
  if (foundation.fitScore < 0 || foundation.fitScore > 10) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'error',
      category: 'schema',
      message: `Invalid fitScore: ${foundation.fitScore} (must be 0-10)`,
      fix: 'Set fitScore: 7-10 (excellent), 4-6 (good), 1-3 (limited), 0 (unassessed)',
    });
  }

  // Priority must be 1-4
  if (foundation.priority < 1 || foundation.priority > 4) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'error',
      category: 'schema',
      message: `Invalid priority: ${foundation.priority} (must be 1-4)`,
      fix: 'Set priority: 1 (immediate), 2 (high), 3 (medium), 4 (low)',
    });
  }

  // ApplicationMethod must match the Zod schema enum (SSOT — never duplicate
  // the list here; it drifted out of sync once already, treating valid
  // 'invitation' as invalid).
  const validMethods = ApplicationMethod.options;
  if (!validMethods.includes(foundation.applicationMethod)) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'error',
      category: 'schema',
      message: `Invalid applicationMethod: "${foundation.applicationMethod}" (must be one of: ${validMethods.join(', ')})`,
      fix: 'Use one of the valid application methods from the schema',
    });
  }
}

// ============================================================================
// MAIN VALIDATION RUNNER
// ============================================================================

async function main() {
  console.log('🔍 Validating foundation data...\n');
  const foundations = await getAllFoundations();
  console.log(`📊 Total foundations: ${foundations.length}\n`);

  // Run validations
  for (const foundation of foundations) {
    validateSchema(foundation);
    validateCompleteness(foundation);
  }

  // Quality-gate runs once across the dataset (delegates to domain SSOT)
  validateAllQualityGates(foundations);
  validateDuplicates(foundations);

  // Report results
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  if (issues.length === 0) {
    console.log('✅ All validations passed!\n');
    process.exit(0);
  }

  // Group by severity
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`);
    for (const issue of errors) {
      console.log(`  ${issue.name} (${issue.slug})`);
      console.log(`    ${issue.message}`);
      if (issue.fix) console.log(`    💡 Fix: ${issue.fix}`);
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
    for (const issue of warnings) {
      console.log(`  ${issue.name} (${issue.slug})`);
      console.log(`    ${issue.message}`);
      if (issue.fix) console.log(`    💡 Fix: ${issue.fix}`);
      console.log();
    }
  }

  if (infos.length > 0) {
    console.log(`\nℹ️  INFO (${infos.length}):\n`);
    for (const issue of infos) {
      console.log(`  ${issue.name} (${issue.slug})`);
      console.log(`    ${issue.message}`);
      if (issue.fix) console.log(`    💡 Fix: ${issue.fix}`);
      console.log();
    }
  }

  // Summary
  console.log(`\n📋 SUMMARY:`);
  console.log(`  Total issues: ${issues.length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Info: ${infos.length}\n`);

  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
