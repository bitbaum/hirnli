#!/usr/bin/env tsx
/**
 * Foundation Screening v3.1 - Gap Fixes + Smart Tiering
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 *
 * Fixes based on Phase 3 final 8 analysis (measured 50% FP rate):
 * 1. **Operator keywords enhanced** - Add "trägerin", "informationsaustausch", "plattform"
 * 2. **International development complete** - Add "dritte welt" (old German term)
 * 3. **Healthcare sector filter** - Separate filter for healthcare-only foundations
 * 4. **Smart tiering** - Core theme matching, geographic proximity, thematic focus scoring
 *
 * Usage:
 *   npm run screen:v3.1 -- --input=research/fundraiso-discovery-2026-02-16.json
 *   npm run screen:v3.1 -- --batch  # Use latest discovery file
 *
 * Output:
 *   research/screening-v3.1-YYYY-MM-DD.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllFoundations } from './lib/foundations';
import type { Foundation } from '../src/lib/schemas/foundation';

/** Populated once at the start of main() before any screening happens. */
let existingFoundations: Foundation[] = [];
import { NOT_RECOMMENDED } from '../src/lib/config/foundations/metadata';

interface Candidate {
  name: string;
  slug?: string;
  location?: string;
  foundVia?: string[];
  url?: string;
}

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

type ExclusionReason =
  | 'duplicate_in_db'
  | 'duplicate_in_not_recommended'
  | 'geographic_international_only'
  | 'operator_not_funder'
  | 'french_italian_only'
  | 'sector_mismatch'
  | 'no_social_dimension';

interface ScreeningResult {
  candidate: Candidate;
  decision: 'pass' | 'exclude';
  tier?: 1 | 2 | 3 | 4;
  reason?: ExclusionReason;
  details?: string;
  esaMatch?: ESAFoundation;
  scores?: {
    funderScore: number;
    operatorScore: number;
    socialScore: number; // NEW in v3
    confidence: 'high' | 'medium' | 'low';
  };
}

interface ScreeningReport {
  date: string;
  version: '3.1';
  input: string;
  totalCandidates: number;
  passed: number;
  excluded: number;
  exclusionBreakdown: Record<ExclusionReason, number>;
  tierBreakdown: Record<1 | 2 | 3 | 4, number>;
  improvementsOverV3: string[];
  results: ScreeningResult[];
}

// ============================================================================
// LOAD DATA
// ============================================================================

function loadESARegister(): ESARegister | null {
  const researchDir = path.join(process.cwd(), 'research');
  const files = fs
    .readdirSync(researchDir)
    .filter((f) => f.startsWith('esa-register-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ No ESA register found. Run `npm run esa:download` first.\n');
    return null;
  }

  const registerPath = path.join(researchDir, files[0]);
  const data = fs.readFileSync(registerPath, 'utf-8');
  return JSON.parse(data);
}

function loadCandidates(filePath: string): Candidate[] {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}\n`);
    return [];
  }

  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  return data.foundations || data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeName(name: string): string {
  return (
    name
      .toLowerCase()
      // Convert umlauts to ae/oe/ue BEFORE stripping non-ASCII, so both
      // 'Unterstützungs' and 'Unterstuetzungs' normalize identically.
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/stiftung|foundation|fondation|fondazione/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()
  );
}

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
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

/**
 * Filter 1: Duplicate in the foundation DB
 */
function isDuplicateInDB(candidate: Candidate): boolean {
  const normalized = normalizeName(candidate.name);

  for (const foundation of existingFoundations) {
    const dbNormalized = normalizeName(foundation.name);

    if (dbNormalized === normalized) {
      return true;
    }

    if (levenshteinDistance(normalized, dbNormalized) <= 3) {
      return true;
    }

    if (foundation.slug === candidate.slug) {
      return true;
    }
  }

  return false;
}

/**
 * Filter 2: Duplicate in NOT_RECOMMENDED
 */
function isDuplicateInNotRecommended(candidate: Candidate): boolean {
  const normalized = normalizeName(candidate.name);

  for (const excluded of NOT_RECOMMENDED) {
    const excludedNormalized = normalizeName(excluded.name);

    if (excludedNormalized === normalized) {
      return true;
    }

    if (levenshteinDistance(normalized, excludedNormalized) <= 3) {
      return true;
    }

    if (excluded.name.toLowerCase() === candidate.name.toLowerCase()) {
      return true;
    }
  }

  return false;
}

/**
 * Filter 3: Find in ESA register
 */
function findInESA(register: ESARegister, name: string): ESAFoundation | null {
  const normalized = normalizeName(name);

  for (const foundation of register.foundations) {
    const esaNormalized = normalizeName(foundation.name);

    if (
      esaNormalized === normalized ||
      foundation.name.toLowerCase() === name.toLowerCase() ||
      levenshteinDistance(normalized, esaNormalized) <= 2
    ) {
      return foundation;
    }
  }

  return null;
}

/**
 * Filter 4: Geographic filtering (international development)
 */
function hasInternationalDevelopmentFocus(purpose: string, _city: string): boolean {
  const purposeLower = purpose.toLowerCase();

  // Keywords indicating international development focus
  const internationalKeywords = [
    'entwicklungsländer',
    'entwicklungszusammenarbeit',
    'ländern des südens',
    'dritte welt',
    'drittwelt', // NEW v3.1 - old German term for "Third World"
    'global south',
    'developing countries',
    'emerging countries',
    'afrika',
    'asien',
    'lateinamerika',
    'africa',
    'asia',
    'latin america',
    'haiti',
    'kenya',
    'ethiopia',
    'uganda',
    'philippines',
    'cambodia',
  ];

  // Keywords indicating Swiss focus
  const swissFocusKeywords = [
    'schweiz',
    'suisse',
    'svizzera',
    'switzerland',
    'zürich',
    'zurich',
    'bern',
    'geneva',
    'basel',
  ];

  const hasInternationalKeywords = internationalKeywords.some((kw) => purposeLower.includes(kw));
  const hasSwissFocus = swissFocusKeywords.some((kw) => purposeLower.includes(kw));

  // Only exclude if strong international focus and NO Swiss mention
  return hasInternationalKeywords && !hasSwissFocus;
}

/**
 * Filter 5: Funder vs Operator detection (ENHANCED in v3.0)
 */
function scoreFunderOperator(purpose: string): {
  funderScore: number;
  operatorScore: number;
  socialScore: number; // NEW
  confidence: 'high' | 'medium' | 'low';
} {
  const purposeLower = purpose.toLowerCase();

  // Funder keywords (German, French, Italian)
  const funderKeywords = [
    'fördert',
    'unterstützt projekte',
    'vergibt beiträge',
    'projektförderung',
    'gesuchsverfahren',
    'antragsformular',
    'finanzielle unterstützung',
    'zuwendungen',
    'finanziert',
    'unterstützung und förderung', // Fondation Assura pattern
    // French
    'soutient des projets',
    'octroie des contributions',
    'soutien financier',
    'finance',
    // Italian
    'sostiene progetti',
    'contributi finanziari',
  ];

  // Operator keywords (German, French, Italian) - ENHANCED in v3.1
  const operatorKeywords = [
    'betreibt',
    'führt durch',
    'bietet an',
    'dienstleister',
    'eigene programme',
    'direkt tätig',
    'selbst tätig',
    'angebote',
    'leistungen erbringen',
    // Strong operator signals from Phase 3 v2.0 analysis
    'erbringung von dienstleistungen',
    'geführten betriebe',
    'geführten einrichtungen',
    'geführt', // Catches "geführten", "geführte"
    'organisieren', // Catches infinitive + conjugations
    'organisiert',
    'anlässe', // Events
    'veranstaltungen', // Events
    'bietet', // Offers (catches "bietet an", "bietet dienste", etc.)
    'geboten wird', // "is offered"
    'hilfestellung', // Assistance
    'durchführung', // Execution/carrying out
    'serviceleistung', // Services
    // NEW from Phase 3 final 8 analysis (v3.1)
    'trägerin',
    'träger', // Operator/carrier of institution
    'informationsaustausch', // Information exchange (platforms)
    'plattform',
    'portal', // Platform/portal
    'wohnheim',
    'heim', // Residential home
    'wohn- und begegnungsort', // Residential facility
    // French
    'exploite',
    'offre des services',
    'propres programmes',
    'prestation de services',
    'organise',
    'plateforme',
    // Italian
    'gestisce',
    'offre servizi',
    'programmi propri',
    'erogazione di servizi',
    'organizza',
    'piattaforma',
  ];

  // Social dimension keywords (NEW in v3.0)
  const socialKeywords = [
    'sozial',
    'social',
    'sociale',
    'integration',
    'integrazione',
    'arbeitsintegration',
    'bildung',
    'éducation',
    'educazione',
    'armut',
    'pauvreté',
    'povertà',
    'benachteiligt',
    'défavorisé',
    'vulnerable',
    'vulnerabile',
    'chancengleichheit',
  ];

  let funderScore = 0;
  let operatorScore = 0;
  let socialScore = 0;

  for (const keyword of funderKeywords) {
    if (purposeLower.includes(keyword)) {
      funderScore++;
    }
  }

  for (const keyword of operatorKeywords) {
    if (purposeLower.includes(keyword)) {
      operatorScore++;
    }
  }

  for (const keyword of socialKeywords) {
    if (purposeLower.includes(keyword)) {
      socialScore++;
    }
  }

  // Confidence based on score difference
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (Math.abs(funderScore - operatorScore) >= 3) {
    confidence = 'high';
  } else if (Math.abs(funderScore - operatorScore) >= 1) {
    confidence = 'medium';
  }

  return { funderScore, operatorScore, socialScore, confidence };
}

/**
 * Filter 6: French/Italian only (ENHANCED in v3.0 - fixed Geneva gap)
 */
function isFrenchItalianOnly(city: string, purpose: string): boolean {
  // FIXED: Added more Geneva variants, ensure case-insensitive matching
  const frenchCities = [
    'genève',
    'geneva',
    'geneve',
    'canton de genève',
    'lausanne',
    'neuchâtel',
    'fribourg',
    'meyrin',
  ];
  const italianCities = ['lugano', 'locarno', 'bellinzona', 'mendrisio'];

  const cityLower = city.toLowerCase();
  const purposeLower = purpose.toLowerCase();

  // Check if city is French/Italian
  const isFrenchItalianCity =
    frenchCities.some((fc) => cityLower.includes(fc)) ||
    italianCities.some((ic) => cityLower.includes(ic));

  if (!isFrenchItalianCity) {
    return false;
  }

  // Check for Zürich connection in purpose
  const hasZurichConnection = purposeLower.includes('zürich') || purposeLower.includes('zurich');

  return !hasZurichConnection;
}

/**
 * Filter 7: Social dimension requirement (v3.0)
 *
 * Climate/environment-only funders must have at least some social dimension
 * to fit Revamp-IT's dual mission (social integration + environment)
 */
function hasSocialDimension(purpose: string, socialScore: number): boolean {
  const purposeLower = purpose.toLowerCase();

  // Climate/environment keywords
  const climateKeywords = [
    'klima',
    'climate',
    'climat',
    'umwelt',
    'environment',
    'environnement',
    'energie',
    'energy',
    'énergie',
    'natur',
    'nature',
    'natura',
  ];

  const isClimateOnly = climateKeywords.some((kw) => purposeLower.includes(kw));

  // If climate-focused, require social dimension
  if (isClimateOnly && socialScore === 0) {
    return false; // Climate-only, no social dimension
  }

  return true; // Either not climate-only, or has social dimension
}

/**
 * NEW Filter 8: Healthcare sector filter (v3.1)
 *
 * Healthcare-only foundations should be filtered out (not our focus)
 */
function isHealthcareOnly(purpose: string): boolean {
  const purposeLower = purpose.toLowerCase();

  const healthcareKeywords = [
    'gesundheitsvorsorge',
    'gesundheitswesen',
    'medizinische versorgung',
    'krankenversicherung',
    'gesundheitsförderung',
  ];

  const hasHealthcare = healthcareKeywords.some((kw) => purposeLower.includes(kw));

  if (!hasHealthcare) {
    return false; // Not healthcare-focused
  }

  // Check if it also has our core themes
  const coreThemeKeywords = [
    'arbeitsintegration',
    'soziale integration',
    'berufliche integration',
    'kreislaufwirtschaft',
    'recycling',
    'wiederverwendung',
    'secondhand',
    'digitale bildung',
    'digitale kompetenz',
    'informatik',
    'bildung',
    'ausbildung',
    'erziehung', // Education (broader)
  ];

  const hasCoreTheme = coreThemeKeywords.some((kw) => purposeLower.includes(kw));

  // Healthcare-only if has healthcare keywords but NO core themes
  return hasHealthcare && !hasCoreTheme;
}

/**
 * NEW: Core theme matching (v3.1)
 *
 * Detect if foundation focuses on Revamp-IT's core themes
 */
function getCoreThemeScore(purpose: string): number {
  const purposeLower = purpose.toLowerCase();
  let score = 0;

  // Social integration (highest priority)
  const socialIntegrationKeywords = [
    'arbeitsintegration',
    'soziale integration',
    'berufliche integration',
    'benachteiligte',
    'chancengleichheit',
  ];
  if (socialIntegrationKeywords.some((kw) => purposeLower.includes(kw))) {
    score += 3; // High value
  }

  // Circular economy
  const circularEconomyKeywords = [
    'kreislaufwirtschaft',
    'recycling',
    'wiederverwendung',
    'secondhand',
    'upcycling',
  ];
  if (circularEconomyKeywords.some((kw) => purposeLower.includes(kw))) {
    score += 3; // High value
  }

  // Digital literacy
  const digitalKeywords = ['digitale bildung', 'digitale kompetenz', 'informatik'];
  if (digitalKeywords.some((kw) => purposeLower.includes(kw))) {
    score += 3; // High value
  }

  // Education (broader, lower value)
  const educationKeywords = ['bildung', 'ausbildung', 'erziehung'];
  if (educationKeywords.some((kw) => purposeLower.includes(kw)) && score === 0) {
    score += 1; // Some value if no stronger match
  }

  return score;
}

/**
 * NEW: Thematic focus scoring (v3.1)
 *
 * Penalize foundations that support too many unrelated sectors (unfocused)
 */
function getThematicFocusScore(purpose: string): number {
  const purposeLower = purpose.toLowerCase();

  const sectors = [
    ['kultur', 'culture', 'cultura'],
    ['wissenschaft', 'science', 'scienza'],
    ['sport', 'sports'],
    ['gesundheit', 'health', 'santé', 'salute'],
    ['umwelt', 'environment', 'environnement'],
    ['sozial', 'social', 'sociale'],
    ['bildung', 'education', 'éducation', 'educazione'],
    ['kunst', 'art', 'arte'],
  ];

  let sectorCount = 0;
  for (const sectorKeywords of sectors) {
    if (sectorKeywords.some((kw) => purposeLower.includes(kw))) {
      sectorCount++;
    }
  }

  // Score: fewer sectors = more focused
  if (sectorCount <= 2) return 2; // Very focused
  if (sectorCount <= 4) return 1; // Moderately focused
  return 0; // Unfocused (5+ sectors)
}

// ============================================================================
// MAIN SCREENING LOGIC
// ============================================================================

function screenCandidate(candidate: Candidate, esaRegister: ESARegister): ScreeningResult {
  // Filter 1: Duplicate in the foundation DB
  if (isDuplicateInDB(candidate)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'duplicate_in_db',
      details: 'Foundation already in database',
    };
  }

  // Filter 2: Duplicate in NOT_RECOMMENDED
  if (isDuplicateInNotRecommended(candidate)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'duplicate_in_not_recommended',
      details: 'Foundation already excluded in previous research',
    };
  }

  // Filter 3: ESA validation (soft — non-ESA foundations pass with lower confidence)
  const esaMatch = findInESA(esaRegister, candidate.name);

  // Non-ESA candidates: pass through as tier 3 (cantonal, Vereine, or unmatched name)
  // They need research but should NOT be excluded — ESA only covers federal foundations
  if (!esaMatch) {
    const candidateCity = candidate.location?.replace(/, ?CH$/, '').toLowerCase() || '';
    const isZurichArea =
      candidateCity.includes('zürich') ||
      candidateCity.includes('winterthur') ||
      candidateCity.includes('schlieren') ||
      candidateCity.includes('maur');

    return {
      candidate,
      decision: 'pass' as const,
      tier: isZurichArea ? (3 as const) : (4 as const),
      details: `Not in ESA (cantonal/other supervision) - ${isZurichArea ? 'ZH area' : 'needs location check'}`,
      scores: { funderScore: 0, operatorScore: 0, socialScore: 0, confidence: 'low' as const },
    };
  }

  // --- ESA-confirmed candidates: run full filter pipeline ---

  // Filter 4: Geographic filtering
  if (hasInternationalDevelopmentFocus(esaMatch.purpose, esaMatch.city)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'geographic_international_only',
      details: 'Exclusively international development focus (developing countries)',
      esaMatch,
    };
  }

  // Filter 5: French/Italian only (ENHANCED)
  if (isFrenchItalianOnly(esaMatch.city, esaMatch.purpose)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'french_italian_only',
      details: `French/Italian region (${esaMatch.city}) with no Zürich connection`,
      esaMatch,
    };
  }

  // Filter 6: Funder vs Operator (ENHANCED)
  const scores = scoreFunderOperator(esaMatch.purpose);

  // ENHANCED: Operator keywords weighted 2× (v3.0)
  const weightedOperatorScore = scores.operatorScore * 2;

  if (weightedOperatorScore > scores.funderScore * 2) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'operator_not_funder',
      details: `Likely operator (weighted operator score: ${weightedOperatorScore}, funder score: ${scores.funderScore})`,
      esaMatch,
      scores,
    };
  }

  // Filter 7: Social dimension requirement (v3.0)
  if (!hasSocialDimension(esaMatch.purpose, scores.socialScore)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'no_social_dimension',
      details: 'Climate/environment focus without social integration dimension',
      esaMatch,
      scores,
    };
  }

  // NEW Filter 8: Healthcare sector (v3.1)
  if (isHealthcareOnly(esaMatch.purpose)) {
    return {
      candidate,
      decision: 'exclude',
      reason: 'sector_mismatch',
      details: 'Healthcare-only foundation (not our focus)',
      esaMatch,
      scores,
    };
  }

  // Passed all filters - tier the candidate with ENHANCED SCORING (v3.1)

  // Calculate additional scores
  const coreThemeScore = getCoreThemeScore(esaMatch.purpose);
  const focusScore = getThematicFocusScore(esaMatch.purpose);
  const isZurichBased = esaMatch.city.toLowerCase().includes('zürich');
  const isNearZurich = ['winterthur', 'zug', 'baden', 'aarau', 'freienbach', 'wetzikon'].some(
    (city) => esaMatch.city.toLowerCase().includes(city),
  );

  // Start with base tier
  let tier: 1 | 2 | 3 | 4 = 4;

  // Tier 1: Zürich-based + strong funder + core theme match
  if (isZurichBased && scores.funderScore >= 2 && coreThemeScore >= 3) {
    tier = 1;
  }
  // Tier 2: (Zürich-based + funder) OR (core theme + strong funder)
  else if (
    (isZurichBased && scores.funderScore >= 1) ||
    (coreThemeScore >= 3 && scores.funderScore >= 2)
  ) {
    tier = 2;
  }
  // Tier 3: Near Zürich + some signals OR core theme OR good focus
  else if (
    (isNearZurich && scores.funderScore >= 1) ||
    coreThemeScore >= 1 ||
    (focusScore >= 1 && scores.funderScore >= 1)
  ) {
    tier = 3;
  }
  // Tier 4: Passed filters but weak signals
  else {
    tier = 4;
  }

  return {
    candidate,
    decision: 'pass',
    tier,
    esaMatch,
    scores,
    details: `Tier ${tier} - Funder: ${scores.funderScore}, Operator: ${scores.operatorScore}, Social: ${scores.socialScore}`,
  };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

function processBatch(candidates: Candidate[], esaRegister: ESARegister): ScreeningReport {
  console.log(`\n🔍 Screening ${candidates.length} candidates with v3.0 filters...\n`);

  const results: ScreeningResult[] = [];
  const exclusionBreakdown: Record<ExclusionReason, number> = {
    duplicate_in_db: 0,
    duplicate_in_not_recommended: 0,
    geographic_international_only: 0,
    operator_not_funder: 0,
    french_italian_only: 0,
    sector_mismatch: 0,
    no_social_dimension: 0,
  };
  const tierBreakdown: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const candidate of candidates) {
    const result = screenCandidate(candidate, esaRegister);
    results.push(result);

    if (result.decision === 'exclude' && result.reason) {
      exclusionBreakdown[result.reason]++;
      console.log(`  ❌ ${candidate.name} - ${result.reason}`);
    } else if (result.decision === 'pass' && result.tier) {
      tierBreakdown[result.tier]++;
      console.log(`  ✅ ${candidate.name} - Tier ${result.tier}`);
    }
  }

  const passed = results.filter((r) => r.decision === 'pass').length;
  const excluded = results.filter((r) => r.decision === 'exclude').length;

  console.log(`\n📊 Screening complete!`);
  console.log(`   ✅ Passed: ${passed} (${Math.round((passed / candidates.length) * 100)}%)`);
  console.log(
    `   ❌ Excluded: ${excluded} (${Math.round((excluded / candidates.length) * 100)}%)\n`,
  );

  console.log(`📈 Exclusion breakdown:`);
  Object.entries(exclusionBreakdown)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .forEach(([reason, count]) => {
      console.log(`   ${reason}: ${count} (${Math.round((count / candidates.length) * 100)}%)`);
    });

  console.log(`\n🎯 Tier breakdown:`);
  Object.entries(tierBreakdown)
    .filter(([, count]) => count > 0)
    .forEach(([tier, count]) => {
      console.log(`   Tier ${tier}: ${count}`);
    });

  const report: ScreeningReport = {
    date: new Date().toISOString().split('T')[0],
    version: '3.1',
    input: 'fundraiso-discovery-2026-02-16',
    totalCandidates: candidates.length,
    passed,
    excluded,
    exclusionBreakdown,
    tierBreakdown,
    improvementsOverV3: [
      'Fixed operator keywords: added "trägerin", "informationsaustausch", "plattform", "portal"',
      'Fixed international development: added "dritte welt" (old German term)',
      'Added healthcare sector filter (healthcare-only foundations excluded)',
      'Enhanced tiering: core theme matching, geographic proximity, thematic focus scoring',
    ],
    results,
  };

  return report;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Foundation Screening v3.1');
  console.log('  Gap fixes + smart tiering (core themes, geography, focus)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  existingFoundations = await getAllFoundations();

  // Load ESA register
  const esaRegister = loadESARegister();
  if (!esaRegister) {
    process.exit(1);
  }

  console.log(
    `\n📚 Loaded ESA register: ${esaRegister.count} foundations (${esaRegister.downloadDate})`,
  );

  // Load candidates
  const args = process.argv.slice(2);
  let inputPath = 'research/fundraiso-discovery-2026-02-16.json'; // Default

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--input=')) {
      inputPath = args[i].split('=')[1];
    }
  }

  const candidates = loadCandidates(inputPath);
  if (candidates.length === 0) {
    console.error('❌ No candidates loaded.\n');
    process.exit(1);
  }

  console.log(`📋 Loaded ${candidates.length} candidates from ${inputPath}`);

  // Process batch
  const report = processBatch(candidates, esaRegister);

  // Save report
  const outputPath = path.join(process.cwd(), 'research', `screening-v3.1-${report.date}.json`);

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n💾 Report saved: ${outputPath}`);
  console.log('\n✅ Screening v3.1 complete!\n');
}

main().catch((err) => {
  console.error('Screening failed:', err);
  process.exit(1);
});
