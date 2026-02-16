#!/usr/bin/env tsx
/**
 * ESA Bulk Validation Script
 *
 * Validates all foundation UIDs against the official ESA register.
 * Identifies:
 * - UIDs that don't exist in ESA (non-existent or invalid)
 * - Foundations missing UIDs (should be added)
 * - Name mismatches (our name vs ESA official name)
 * - Purpose text extraction (official Stiftungszweck)
 *
 * Usage:
 *   npm run esa:validate
 *   npm run esa:validate -- --register=research/esa-register-2026-02-16.json
 *
 * Prerequisite:
 *   Run `npm run esa:download` first to download the ESA register.
 */

import * as fs from 'fs';
import * as path from 'path';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import type { Foundation } from '../src/lib/schemas/foundation';

interface ESAFoundation {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface ESARegister {
  downloadDate: string;
  source: string;
  count: number;
  foundations: ESAFoundation[];
}

interface ValidationResult {
  slug: string;
  ourName: string;
  ourUID?: string;
  status: 'valid' | 'not_found' | 'missing_uid' | 'name_mismatch';
  esaName?: string;
  esaPurpose?: string;
  esaCity?: string;
  message: string;
}

// ============================================================================
// LOAD ESA REGISTER
// ============================================================================

function loadESARegister(): ESARegister {
  const researchDir = path.join(process.cwd(), 'research');

  // Find most recent ESA register file
  const files = fs.readdirSync(researchDir)
    .filter(f => f.startsWith('esa-register-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ No ESA register file found in research/');
    console.error('   Run `npm run esa:download` first.\n');
    process.exit(1);
  }

  const registerPath = path.join(researchDir, files[0]);
  console.log(`📂 Loading ESA register: ${files[0]}\n`);

  const data = fs.readFileSync(registerPath, 'utf-8');
  return JSON.parse(data);
}

// ============================================================================
// VALIDATION
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
    .replace(/stiftung|foundation|fondation|fondazione/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function validateFoundations(register: ESARegister): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Build UID lookup
  const uidMap = new Map<string, ESAFoundation>();
  const nameMap = new Map<string, ESAFoundation>();

  for (const esaFound of register.foundations) {
    uidMap.set(esaFound.uid, esaFound);
    nameMap.set(normalizeName(esaFound.name), esaFound);
  }

  for (const foundation of STIFTUNGEN_DATA) {
    // Case 1: No UID
    if (!foundation.uid) {
      // Try to find by name
      const normalized = normalizeName(foundation.name);
      const esaMatch = nameMap.get(normalized);

      if (esaMatch) {
        results.push({
          slug: foundation.slug,
          ourName: foundation.name,
          status: 'missing_uid',
          esaName: esaMatch.name,
          esaPurpose: esaMatch.purpose,
          esaCity: esaMatch.city,
          ourUID: esaMatch.uid,
          message: `Missing UID - found in ESA as "${esaMatch.name}" (${esaMatch.uid})`,
        });
      } else {
        results.push({
          slug: foundation.slug,
          ourName: foundation.name,
          status: 'missing_uid',
          message: 'Missing UID - unable to validate against ESA',
        });
      }
      continue;
    }

    // Case 2: Has UID - validate
    const esaFound = uidMap.get(foundation.uid);

    if (!esaFound) {
      results.push({
        slug: foundation.slug,
        ourName: foundation.name,
        ourUID: foundation.uid,
        status: 'not_found',
        message: `UID ${foundation.uid} not found in ESA register - may be incorrect or foundation is not under federal supervision`,
      });
      continue;
    }

    // Case 3: Valid UID - check name match
    const ourNormalized = normalizeName(foundation.name);
    const esaNormalized = normalizeName(esaFound.name);
    const distance = levenshteinDistance(ourNormalized, esaNormalized);

    if (distance > 5) {
      results.push({
        slug: foundation.slug,
        ourName: foundation.name,
        ourUID: foundation.uid,
        status: 'name_mismatch',
        esaName: esaFound.name,
        esaPurpose: esaFound.purpose,
        esaCity: esaFound.city,
        message: `Name mismatch: our "${foundation.name}" vs ESA "${esaFound.name}" (edit distance: ${distance})`,
      });
    } else {
      results.push({
        slug: foundation.slug,
        ourName: foundation.name,
        ourUID: foundation.uid,
        status: 'valid',
        esaName: esaFound.name,
        esaPurpose: esaFound.purpose,
        esaCity: esaFound.city,
        message: '✓ Valid',
      });
    }
  }

  return results;
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(results: ValidationResult[], register: ESARegister) {
  const valid = results.filter(r => r.status === 'valid');
  const notFound = results.filter(r => r.status === 'not_found');
  const missingUID = results.filter(r => r.status === 'missing_uid');
  const nameMismatch = results.filter(r => r.status === 'name_mismatch');

  console.log('═'.repeat(80));
  console.log('ESA BULK VALIDATION REPORT');
  console.log('═'.repeat(80));
  console.log();
  console.log(`ESA Register Date: ${register.downloadDate}`);
  console.log(`ESA Foundations: ${register.count.toLocaleString()}`);
  console.log(`Our Foundations: ${STIFTUNGEN_DATA.length}`);
  console.log();

  // Summary
  console.log('SUMMARY');
  console.log('─'.repeat(80));
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`⚠️  Name Mismatch: ${nameMismatch.length}`);
  console.log(`❌ Not Found in ESA: ${notFound.length}`);
  console.log(`❓ Missing UID: ${missingUID.length}`);
  console.log();

  // Not Found (Critical)
  if (notFound.length > 0) {
    console.log('❌ NOT FOUND IN ESA REGISTER');
    console.log('─'.repeat(80));
    console.log('These foundations have UIDs that don\'t exist in the official ESA register.');
    console.log('Possible reasons: UID is incorrect, or foundation is not under federal supervision.\n');

    for (const result of notFound) {
      console.log(`  ${result.ourName} (${result.slug})`);
      console.log(`    UID: ${result.ourUID}`);
      console.log(`    Action: Verify UID on foundation website or remove if incorrect\n`);
    }
  }

  // Missing UID (Warning)
  if (missingUID.length > 0) {
    console.log('❓ MISSING UID');
    console.log('─'.repeat(80));
    console.log('These foundations don\'t have UIDs in our data.\n');

    for (const result of missingUID.slice(0, 10)) {
      console.log(`  ${result.ourName} (${result.slug})`);
      if (result.esaName) {
        console.log(`    ✓ Found in ESA: "${result.esaName}"`);
        console.log(`    💡 Add UID: ${result.ourUID}`);
      } else {
        console.log(`    ⚠️  Not found in ESA by name`);
        console.log(`    💡 Search ESA manually: https://www.esa.admin.ch/de/stiftungsverzeichnis`);
      }
      console.log();
    }

    if (missingUID.length > 10) {
      console.log(`  ... and ${missingUID.length - 10} more\n`);
    }
  }

  // Name Mismatch (Info)
  if (nameMismatch.length > 0) {
    console.log('⚠️  NAME MISMATCH');
    console.log('─'.repeat(80));
    console.log('UID is valid but name differs from official ESA name.\n');

    for (const result of nameMismatch) {
      console.log(`  ${result.ourName} (${result.slug})`);
      console.log(`    Our name: ${result.ourName}`);
      console.log(`    ESA name: ${result.esaName}`);
      console.log(`    💡 Consider updating to match official ESA name\n`);
    }
  }

  console.log('═'.repeat(80));
  console.log(`Total issues: ${notFound.length + nameMismatch.length + missingUID.length}`);
  console.log('═'.repeat(80));
  console.log();
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔍 ESA Bulk Validation\n');

  const register = loadESARegister();
  const results = validateFoundations(register);
  generateReport(results, register);

  // Save detailed results
  const outputPath = path.join(process.cwd(), 'research', 'esa-validation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    date: new Date().toISOString().split('T')[0],
    registerDate: register.downloadDate,
    summary: {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      notFound: results.filter(r => r.status === 'not_found').length,
      missingUID: results.filter(r => r.status === 'missing_uid').length,
      nameMismatch: results.filter(r => r.status === 'name_mismatch').length,
    },
    results,
  }, null, 2), 'utf-8');

  console.log(`💾 Detailed results saved: ${outputPath}\n`);
}

main();
