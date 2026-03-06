#!/usr/bin/env tsx
/**
 * ESA Screening v2 — High-Precision Filter
 *
 * Improvements over v1:
 * - Medical "Kreislauf" (cardiovascular) excluded from kreislaufwirtschaft
 * - Blockchain/crypto/DeFi protocol treasuries excluded
 * - International development foundations excluded (focus: Switzerland-domestic)
 * - "bildung" alone doesn't match digitale-bildung (needs IT/digital context)
 * - High-signal phrase combinations for real Revamp-IT fit
 * - Funder vs Operator separation is stricter
 *
 * Usage: npx tsx scripts/esa-screen-v2.ts
 * Output: research/esa-screening-v2-YYYY-MM-DD.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import { NOT_RECOMMENDED } from '../src/lib/config/foundations/metadata';

// ============================================================================
// TYPES
// ============================================================================

interface ESAFoundation {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface ScoredCandidate {
  name: string;
  uid: string;
  city: string;
  canton: string;
  purpose: string;
  matchedSignals: string[];
  score: number;
  tier: 1 | 2 | 3;
  flags: string[];
  researchPriority: 'immediate' | 'batch' | 'backlog';
}

// ============================================================================
// EXCLUSIONS — things that cause false positives
// ============================================================================

/** Medical "Kreislauf" context — these are cardiology foundations, not circular economy */
const MEDICAL_KREISLAUF = [
  'herz', 'kardio', 'cardiovascular', 'herzchirurg', 'kardiolog',
  'herzerkrank', 'herzinsuffizienz', 'kreislauferkrank', 'kreislaufleiden',
  'blutdruck', 'patienten',
];

/** Blockchain/crypto protocol treasuries — match "open source" + "software" but irrelevant */
const CRYPTO_EXCLUSIONS = [
  'blockchain', 'crypto', 'krypto', 'token', 'defi', 'dao', 'web3',
  'nft', 'bitcoin', 'ethereum', 'protocol', 'ledger', 'dezentralisiert',
  'dezentrale softwarearchitektur', 'smart contract', 'mining',
  'consensus', 'proof of', 'staking', 'lukso', 'ökosystem',
];

/** International development — foundations that fund abroad, not Swiss domestic */
const INTL_DEV_EXCLUSIONS = [
  'entwicklungsland', 'dritte welt', 'entwicklungszusammenarbeit',
  'humanitäre hilfe', 'lateinamerika', 'afrika', 'asien',
  'nepal', 'indien', 'global south', 'globaler süden',
  'entwicklungsgebiet', 'äthiopien', 'kenia', 'uganda',
  'mosambik', 'tansania', 'brasilien', 'kolumbien',
  'peru', 'bolivien', 'myanmar', 'kambodscha', 'haiti',
  'cabo verde', 'ägypten', 'marokko',
];

/** Sector-level exclusions — very unlikely to fund IT/integration projects */
const SECTOR_EXCLUSIONS = [
  // Animals
  'tierheim', 'tierschutz', 'tierhilfe', 'tierärzt',
  // Agriculture (not tech)
  'alpwirtschaft', 'landwirtschaft', 'bauern', 'saatgut',
  'kulturpflanze', 'fischerei', 'fischzentrum', 'imkerei',
  // Heritage/religion
  'denkmalpflege', 'denkmalschutz', 'heimatschutz',
  'kirchlich', 'liturgi', 'missionier', 'evangelisier',
  'pfarrei', 'kirchgemeinde',
  // Family-restricted
  'familienangehörig', 'nachkommen des stifters',
  'stipendien an familienangehörige',
  // Municipal
  'einwohnergemeinde', 'ortsbürgergemeinde', 'burgergemeinde',
  // Sports clubs
  'golf', 'tennis', 'schiess', 'fussball', 'sportverein',
  // Medical/health (very specialized)
  'krebsforschung', 'krebsliga', 'onkologie', 'palliativ',
  'multiple sklerose', 'parkinson', 'alzheimer', 'rheuma',
  'diabete', 'epilepsie', 'augenerkrankung', 'augenheilkunde',
  'hörbehindert', 'gehörlos',
  // Arts/culture (no tech angle)
  'orchest', 'oper', 'ballett', 'symphonie', 'philharmon',
  'musikschule', 'konservatorium',
  // Pure nature conservation
  'wildtier', 'vogelschutz', 'naturschutzgebiet',
  'moorschutz', 'waldschutz', 'gewässerschutz',
];

// ============================================================================
// HIGH-SIGNAL PHRASES — combinations that really indicate Revamp-IT fit
// ============================================================================

interface Signal {
  name: string;
  weight: number;
  /** ALL of these must appear (substring match) */
  requires: string[];
  /** NONE of these may appear */
  excludes?: string[];
}

const HIGH_SIGNALS: Signal[] = [
  // === PERFECT FIT signals (weight 5) ===
  { name: 'elektroschrott', weight: 5, requires: ['elektroschrott'] },
  { name: 'e-waste', weight: 5, requires: ['e-waste'] },
  { name: 'refurbish', weight: 5, requires: ['refurbish'] },
  { name: 'IT-reparatur', weight: 4, requires: ['reparatur'], excludes: ['auto', 'fahrzeug', 'velo', 'fahrrad'] },
  { name: 'gebrauchte-IT', weight: 5, requires: ['gebraucht'], excludes: ['gebrauchsgüter des täglichen'] },

  // === STRONG FIT signals (weight 3-4) ===
  { name: 'linux', weight: 4, requires: ['linux'] },
  { name: 'open-source-funder', weight: 4, requires: ['open source'], excludes: ['blockchain', 'dezentralisiert', 'protocol', 'token'] },
  { name: 'open-source-alt', weight: 4, requires: ['open-source'], excludes: ['blockchain', 'dezentralisiert', 'protocol'] },
  { name: 'quelloffen', weight: 4, requires: ['quelloffen'], excludes: ['blockchain'] },
  { name: 'digitale-souveraenitaet', weight: 4, requires: ['souverän'], excludes: ['nahrungs'] },
  { name: 'datensouveraenitaet', weight: 4, requires: ['datensouveränität'] },
  { name: 'kreislaufwirtschaft-explicit', weight: 4, requires: ['kreislaufwirtschaft'] },
  { name: 'zirkulaer-wirtschaft', weight: 4, requires: ['zirkulär'] },
  { name: 'wiederverwend', weight: 3, requires: ['wiederverwend'] },
  { name: 'wiederaufbereitung', weight: 4, requires: ['wiederaufbereitung'] },
  { name: 'ressourcenschonung', weight: 3, requires: ['ressourcenschon'] },
  { name: 'secondhand', weight: 3, requires: ['secondhand'] },
  { name: 'second-hand', weight: 3, requires: ['second-hand'] },
  { name: 'recycling-sozial', weight: 3, requires: ['recycling'], excludes: ['pet', 'glas', 'papier'] },

  // === WORK INTEGRATION signals (weight 3) ===
  { name: 'arbeitsintegration', weight: 3, requires: ['arbeitsintegration'] },
  { name: 'berufliche-integration', weight: 3, requires: ['berufliche integration'] },
  { name: 'wiedereingliederung', weight: 3, requires: ['wiedereingliederung'] },
  { name: 'beschaeftigungsprogramm', weight: 3, requires: ['beschäftigungsprogramm'] },
  { name: 'arbeitstraining', weight: 3, requires: ['arbeitstraining'] },
  { name: 'langzeitarbeitslos', weight: 3, requires: ['langzeitarbeitslos'] },
  { name: 'sozialfirma', weight: 4, requires: ['sozialfirma'] },
  { name: 'sozialer-betrieb', weight: 3, requires: ['sozialer betrieb'] },

  // === DIGITAL EDUCATION signals (weight 2-3) — need IT context ===
  { name: 'IT-bildung', weight: 3, requires: ['informatik'], excludes: ['blockchain'] },
  { name: 'IT-kompetenz', weight: 3, requires: ['it-kompetenz'] },
  { name: 'medienkompetenz', weight: 3, requires: ['medienkompetenz'] },
  { name: 'digital-literacy', weight: 3, requires: ['digital literacy'] },
  { name: 'digitale-kompetenz', weight: 3, requires: ['digitale kompetenz'] },
  { name: 'computer-bildung', weight: 3, requires: ['computer'] },
  { name: 'programmieren', weight: 3, requires: ['programmier'] },
  { name: 'software-bildung', weight: 2, requires: ['software'], excludes: ['blockchain', 'dezentralisiert', 'protocol'] },
  { name: 'digitale-bildung-combo', weight: 2, requires: ['digital', 'bildung'], excludes: ['blockchain'] },

  // === FUNDER indicators (weight 2) ===
  { name: 'foerdert-projekte', weight: 2, requires: ['fördert'] },
  { name: 'projektfoerderung', weight: 2, requires: ['projektförderung'] },
  { name: 'beitraege', weight: 2, requires: ['beiträge'] },
  { name: 'unterstuetzt', weight: 2, requires: ['unterstützt'] },
  { name: 'zuwendungen', weight: 2, requires: ['zuwendungen'] },
  { name: 'finanzielle-hilfe', weight: 2, requires: ['finanzielle hilfe'] },
  { name: 'vergibt', weight: 2, requires: ['vergibt'] },

  // === SOCIAL INTEGRATION signals (weight 2) ===
  { name: 'soziale-integration', weight: 2, requires: ['soziale integration'] },
  { name: 'chancengleichheit', weight: 2, requires: ['chancengleich'] },
  { name: 'inklusion', weight: 2, requires: ['inklusion'] },
  { name: 'niederschwellig', weight: 2, requires: ['niederschwellig'] },
  { name: 'benachteiligt', weight: 2, requires: ['benachteiligt'] },
  { name: 'teilhabe', weight: 2, requires: ['teilhabe'] },

  // === CLIMATE with tech angle (weight 2) ===
  { name: 'klima-tech', weight: 2, requires: ['klima'], excludes: ['landwirtschaft', 'wald', 'moor'] },
  { name: 'co2-reduktion', weight: 2, requires: ['co2'] },
  { name: 'nachhaltigkeit-tech', weight: 2, requires: ['nachhaltigkeit'], excludes: ['landwirtschaft', 'wald', 'lebensmittel'] },

  // === YOUTH integration (weight 2) ===
  { name: 'jugend-beruf', weight: 2, requires: ['jugend'], excludes: ['kirchgemeinde', 'pfadi', 'sport'] },
  { name: 'lehrstelle', weight: 3, requires: ['lehrstelle'] },
  { name: 'berufseinstieg', weight: 3, requires: ['berufseinstieg'] },
  { name: 'uebergang-schule-beruf', weight: 3, requires: ['übergang'] },

  // === ZURICH bonus (weight 2) ===
  { name: 'zuerich-focus', weight: 2, requires: ['zürich'] },
  { name: 'winterthur-focus', weight: 2, requires: ['winterthur'] },
];

// ============================================================================
// DEDUPLICATION
// ============================================================================

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/stiftung|foundation|fondation|fondazione/gi, '')
    .replace(/[^a-zäöü0-9]/g, '')
    .trim();
}

function buildExistingSet(): Set<string> {
  const names = new Set<string>();
  for (const f of STIFTUNGEN_DATA) names.add(normalizeName(f.name));
  for (const f of NOT_RECOMMENDED) names.add(normalizeName(f.name));
  return names;
}

function buildExistingUIDs(): Set<string> {
  const uids = new Set<string>();
  for (const f of STIFTUNGEN_DATA) {
    if ('uid' in f && typeof (f as Record<string, unknown>).uid === 'string') {
      uids.add((f as Record<string, unknown>).uid as string);
    }
  }
  return uids;
}

// ============================================================================
// SCORING
// ============================================================================

function isExcluded(purposeLower: string, nameLower: string): string | null {
  // Sector exclusions
  for (const kw of SECTOR_EXCLUSIONS) {
    if (purposeLower.includes(kw)) return `sector:${kw}`;
  }

  // Crypto/blockchain
  for (const kw of CRYPTO_EXCLUSIONS) {
    if (purposeLower.includes(kw) || nameLower.includes(kw)) return `crypto:${kw}`;
  }

  // International development (only exclude if NO Swiss-domestic angle)
  let intlCount = 0;
  let swissCount = 0;
  for (const kw of INTL_DEV_EXCLUSIONS) {
    if (purposeLower.includes(kw)) intlCount++;
  }
  const swissTerms = ['schweiz', 'inland', 'zürich', 'bern', 'basel', 'luzern', 'st. gallen', 'winterthur'];
  for (const kw of swissTerms) {
    if (purposeLower.includes(kw)) swissCount++;
  }
  // Only exclude if strong international signal with weak Swiss signal
  if (intlCount >= 2 && swissCount === 0) return 'intl-dev';
  if (intlCount >= 1 && purposeLower.includes('im ausland') && !purposeLower.includes('im in- und ausland')) return 'intl-dev';

  // Medical Kreislauf (only exclude if that's the main purpose)
  if (purposeLower.includes('kreislauf')) {
    let medicalCount = 0;
    for (const kw of MEDICAL_KREISLAUF) {
      if (purposeLower.includes(kw)) medicalCount++;
    }
    // If 2+ medical terms alongside "kreislauf", it's cardiovascular
    if (medicalCount >= 2) return 'medical-kreislauf';
  }

  return null;
}

function scoreFoundation(esa: ESAFoundation): ScoredCandidate | null {
  const purposeLower = esa.purpose.toLowerCase();
  const nameLower = esa.name.toLowerCase();
  const fullText = `${nameLower} ${purposeLower}`;

  // Skip inactive
  if (esa.status !== 'aktiv') return null;

  // Skip empty/short purpose
  if (!esa.purpose || esa.purpose.length < 30) return null;

  // Check exclusions
  const exclusion = isExcluded(purposeLower, nameLower);
  if (exclusion) return null;

  // Match signals
  const matchedSignals: string[] = [];
  let score = 0;

  for (const signal of HIGH_SIGNALS) {
    // Check all required terms present
    const allRequired = signal.requires.every(r => fullText.includes(r));
    if (!allRequired) continue;

    // Check no excluded terms present
    if (signal.excludes) {
      const hasExclude = signal.excludes.some(e => fullText.includes(e));
      if (hasExclude) continue;
    }

    matchedSignals.push(signal.name);
    score += signal.weight;
  }

  // Must have at least 2 signals with combined weight >= 5
  if (matchedSignals.length < 2 || score < 5) return null;

  // Operator penalty — if they run facilities, they likely don't fund external projects
  const operatorTerms = [
    'betreibt', 'unterhält', 'betrieb von', 'heim', 'klinik', 'spital',
    'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim', 'tagesstätte',
    'trägerin', 'museum', 'theater',
  ];
  let operatorCount = 0;
  for (const kw of operatorTerms) {
    if (purposeLower.includes(kw)) operatorCount++;
  }
  score -= Math.min(operatorCount * 2, 6);
  const flags: string[] = [];
  if (operatorCount >= 2) flags.push('likely-operator');

  // Zurich geo bonus
  const zurichCities = ['zürich', 'winterthur', 'dübendorf', 'dietikon', 'kloten', 'uster', 'wädenswil', 'horgen', 'bülach', 'adliswil'];
  if (zurichCities.some(c => esa.city.toLowerCase().includes(c)) || esa.canton === 'ZH') {
    score += 3;
    flags.push('zurich-region');
  }

  // Funder language bonus
  const hasFunderLanguage = matchedSignals.some(s =>
    ['foerdert-projekte', 'projektfoerderung', 'beitraege', 'unterstuetzt', 'zuwendungen', 'finanzielle-hilfe', 'vergibt'].includes(s)
  );
  if (hasFunderLanguage) flags.push('funder-language');

  // Core-theme bonus — signals directly about our work
  const coreSignals = matchedSignals.filter(s =>
    ['elektroschrott', 'e-waste', 'refurbish', 'IT-reparatur', 'gebrauchte-IT',
     'linux', 'open-source-funder', 'open-source-alt', 'quelloffen',
     'kreislaufwirtschaft-explicit', 'zirkulaer-wirtschaft', 'wiederaufbereitung',
     'arbeitsintegration', 'berufliche-integration', 'sozialfirma',
     'digitale-souveraenitaet', 'datensouveraenitaet',
    ].includes(s)
  );
  if (coreSignals.length > 0) {
    flags.push('core-fit');
    score += coreSignals.length * 2;
  }

  // Tiering
  let tier: 1 | 2 | 3;
  if (score >= 14 && (hasFunderLanguage || coreSignals.length >= 2)) {
    tier = 1;
  } else if (score >= 8) {
    tier = 2;
  } else {
    tier = 3;
  }

  // Research priority
  let researchPriority: 'immediate' | 'batch' | 'backlog';
  if (tier === 1 || (tier === 2 && flags.includes('zurich-region'))) {
    researchPriority = 'immediate';
  } else if (tier === 2) {
    researchPriority = 'batch';
  } else {
    researchPriority = 'backlog';
  }

  // After operator penalty, need minimum score
  if (score < 4) return null;

  return {
    name: esa.name,
    uid: esa.uid,
    city: esa.city,
    canton: esa.canton,
    purpose: esa.purpose.replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 600),
    matchedSignals,
    score,
    tier,
    flags,
    researchPriority,
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ESA Screening v2 — High-Precision Filter');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load ESA register
  const registerPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf-8'));
  const foundations: ESAFoundation[] = register.foundations;

  console.log(`\n📚 ESA register: ${foundations.length} foundations`);

  // Build dedup sets
  const existingNames = buildExistingSet();
  const existingUIDs = buildExistingUIDs();
  console.log(`📋 Existing DB + NOT_RECOMMENDED: ${existingNames.size} names, ${existingUIDs.size} UIDs`);

  // Screen
  const stats = {
    inactive: 0,
    duplicate: 0,
    excluded: { sector: 0, crypto: 0, intlDev: 0, medicalKreislauf: 0, other: 0 },
    tooFewSignals: 0,
    tooLowScore: 0,
  };
  const candidates: ScoredCandidate[] = [];

  for (const esa of foundations) {
    if (esa.status !== 'aktiv') { stats.inactive++; continue; }

    const normalized = normalizeName(esa.name);
    if (existingNames.has(normalized) || existingUIDs.has(esa.uid)) { stats.duplicate++; continue; }

    const result = scoreFoundation(esa);
    if (!result) {
      // Categorize why it was filtered
      const purposeLower = esa.purpose.toLowerCase();
      const nameLower = esa.name.toLowerCase();
      const exclusion = isExcluded(purposeLower, nameLower);
      if (exclusion) {
        if (exclusion.startsWith('sector:')) stats.excluded.sector++;
        else if (exclusion.startsWith('crypto:')) stats.excluded.crypto++;
        else if (exclusion === 'intl-dev') stats.excluded.intlDev++;
        else if (exclusion === 'medical-kreislauf') stats.excluded.medicalKreislauf++;
        else stats.excluded.other++;
      } else {
        stats.tooFewSignals++;
      }
      continue;
    }

    candidates.push(result);
  }

  // Sort by score desc
  candidates.sort((a, b) => b.score - a.score || a.tier - b.tier);

  const tier1 = candidates.filter(c => c.tier === 1);
  const tier2 = candidates.filter(c => c.tier === 2);
  const tier3 = candidates.filter(c => c.tier === 3);
  const immediate = candidates.filter(c => c.researchPriority === 'immediate');
  const batch = candidates.filter(c => c.researchPriority === 'batch');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total screened:              ${foundations.length}`);
  console.log(`  Skipped (inactive):          ${stats.inactive}`);
  console.log(`  Skipped (already in DB):     ${stats.duplicate}`);
  console.log(`  Excluded (sector):           ${stats.excluded.sector}`);
  console.log(`  Excluded (crypto/blockchain): ${stats.excluded.crypto}`);
  console.log(`  Excluded (international dev): ${stats.excluded.intlDev}`);
  console.log(`  Excluded (medical kreislauf): ${stats.excluded.medicalKreislauf}`);
  console.log(`  Excluded (other):            ${stats.excluded.other}`);
  console.log(`  No matching signals:         ${stats.tooFewSignals}`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  CANDIDATES:                  ${candidates.length}`);
  console.log(`    Tier 1 (high priority):    ${tier1.length}`);
  console.log(`    Tier 2 (good fit):         ${tier2.length}`);
  console.log(`    Tier 3 (possible):         ${tier3.length}`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  Research queue:`);
  console.log(`    Immediate (T1 + ZH T2):    ${immediate.length}`);
  console.log(`    Batch (other T2):          ${batch.length}`);

  // Signal distribution
  const signalCounts: Record<string, number> = {};
  for (const c of candidates) {
    for (const s of c.matchedSignals) {
      signalCounts[s] = (signalCounts[s] || 0) + 1;
    }
  }
  console.log('\n  Top signals:');
  const topSignals = Object.entries(signalCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [s, count] of topSignals) {
    console.log(`    ${s}: ${count}`);
  }

  // Print all Tier 1
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  TIER 1 — HIGH PRIORITY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const c of tier1) {
    const flagStr = c.flags.length > 0 ? ` [${c.flags.join(', ')}]` : '';
    console.log(`\n  (${c.score}pts) ${c.name} — ${c.city}, ${c.canton}${flagStr}`);
    console.log(`    Signals: ${c.matchedSignals.join(', ')}`);
    console.log(`    Purpose: ${c.purpose.substring(0, 200)}...`);
  }

  // Print Tier 2 (immediate only)
  const t2immediate = tier2.filter(c => c.researchPriority === 'immediate');
  if (t2immediate.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  TIER 2 — ZURICH REGION (research immediately)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const c of t2immediate) {
      console.log(`\n  (${c.score}pts) ${c.name} — ${c.city}, ${c.canton}`);
      console.log(`    Signals: ${c.matchedSignals.join(', ')}`);
    }
  }

  // Save
  const today = new Date().toISOString().split('T')[0];
  const report = {
    date: today,
    version: 'esa-v2',
    source: 'esa-register-2026-02-16.json',
    improvements: [
      'Medical kreislauf exclusion (cardiology ≠ circular economy)',
      'Crypto/blockchain exclusion',
      'International development exclusion',
      'Signal-based scoring (not keyword counting)',
      'Operator penalty increased',
      'Research priority assignment',
    ],
    totalScreened: foundations.length,
    stats,
    candidateCount: candidates.length,
    tierBreakdown: { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length },
    researchQueue: { immediate: immediate.length, batch: batch.length, backlog: candidates.length - immediate.length - batch.length },
    signalDistribution: signalCounts,
    candidates,
  };

  const outPath = path.join(process.cwd(), 'research', `esa-screening-v2-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report: ${outPath}`);
  console.log('✅ Done!\n');
}

main();
