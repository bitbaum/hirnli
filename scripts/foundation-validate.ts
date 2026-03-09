#!/usr/bin/env tsx
/**
 * Foundation Data Validation Script
 *
 * Validates all foundation entries against quality gates:
 * - Schema validation (TypeScript types)
 * - Quality gate for needsResearch: false (150+ char purpose, 250+ char notes, contact, themes, website)
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

import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import type { Foundation } from '../src/lib/schemas/foundation';

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

function validateQualityGate(foundation: Foundation) {
  if (foundation.needsResearch === false) {
    // Must have purposeSummary ≥ 150 chars
    if (!foundation.purposeSummary || foundation.purposeSummary.length < 150) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'quality',
        message: `needsResearch: false requires purposeSummary ≥150 chars (current: ${foundation.purposeSummary?.length || 0})`,
        fix: 'Set needsResearch: true OR expand purposeSummary',
      });
    }

    // Must have researchNotes ≥ 250 chars
    if (!foundation.researchNotes || foundation.researchNotes.length < 250) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'quality',
        message: `needsResearch: false requires researchNotes ≥250 chars (current: ${foundation.researchNotes?.length || 0})`,
        fix: 'Set needsResearch: true OR expand researchNotes with fit analysis',
      });
    }

    // Must have contact (email OR phone)
    if (!foundation.contact || (!foundation.contact.email && !foundation.contact.phone)) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'quality',
        message: 'needsResearch: false requires contact.email OR contact.phone',
        fix: 'Set needsResearch: true OR add contact information',
      });
    }

    // Must have themes
    if (!foundation.themes || foundation.themes.length === 0) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'quality',
        message: 'needsResearch: false requires at least one theme',
        fix: 'Set needsResearch: true OR assign relevant themes',
      });
    }

    // Must have websiteUrl OR applicationUrl
    if (!foundation.websiteUrl && !foundation.applicationUrl) {
      addIssue({
        slug: foundation.slug,
        name: foundation.name,
        severity: 'error',
        category: 'quality',
        message: 'needsResearch: false requires websiteUrl OR applicationUrl',
        fix: 'Set needsResearch: true OR add website URL',
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

  // Warn if high priority (1-2) but needsResearch: true
  if (foundation.priority <= 2 && foundation.needsResearch === true) {
    addIssue({
      slug: foundation.slug,
      name: foundation.name,
      severity: 'warning',
      category: 'quality',
      message: 'High priority foundation (1-2) still needs research - should prioritize completion',
      fix: 'Complete research to enable Gesuch generation',
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
          matrix[i - 1][j] + 1
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

    // Check fuzzy name matches
    const normalized = normalizeName(foundation.name);
    for (const [existingNormalized, existing] of names.entries()) {
      const distance = levenshteinDistance(normalized, existingNormalized);
      if (distance <= 3) {
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

  // ApplicationMethod must be valid
  const validMethods = ['online', 'post', 'email', 'contact', 'direct', 'personal', 'partnership', 'via_partner', 'membership', 'contract', 'none', 'unknown'];
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

function main() {
  console.log('🔍 Validating foundation data...\n');
  console.log(`📊 Total foundations: ${STIFTUNGEN_DATA.length}\n`);

  // Run validations
  for (const foundation of STIFTUNGEN_DATA) {
    validateSchema(foundation);
    validateQualityGate(foundation);
    validateCompleteness(foundation);
  }

  validateDuplicates(STIFTUNGEN_DATA);

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

main();
