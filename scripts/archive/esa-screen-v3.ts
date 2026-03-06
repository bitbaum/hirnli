#!/usr/bin/env tsx
/**
 * ESA Screening v3 — Expanded Funnel for 333 Target
 *
 * Combines v2's precise exclusions with full screening's broader theme matching.
 * Lowers thresholds to capture ~400 candidates for batch research.
 *
 * Strategy:
 * - v2 exclusions (medical kreislauf, crypto, intl dev, sector) for precision
 * - Theme-based scoring from full screening for breadth
 * - Signal-based bonus from v2 for ranking
 * - Single-theme matches accepted (with lower score) — v2/full required 2+
 * - Dedup against STIFTUNGEN_DATA + NOT_RECOMMENDED
 *
 * Usage: npx tsx scripts/esa-screen-v3.ts
 * Output: research/esa-screening-v3-YYYY-MM-DD.json
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
  matchedThemes: string[];
  score: number;
  tier: 1 | 2 | 3 | 4;
  flags: string[];
  wave: 'wave1' | 'wave2' | 'wave3' | 'wave4';
}

// ============================================================================
// EXCLUSIONS — from v2 (proven precision)
// ============================================================================

const MEDICAL_KREISLAUF = [
  'herz', 'kardio', 'cardiovascular', 'herzchirurg', 'kardiolog',
  'herzerkrank', 'herzinsuffizienz', 'kreislauferkrank', 'kreislaufleiden',
  'blutdruck', 'patienten',
];

const CRYPTO_EXCLUSIONS = [
  'blockchain', 'crypto', 'krypto', 'token', 'defi', 'dao', 'web3',
  'nft', 'bitcoin', 'ethereum', 'protocol', 'ledger', 'dezentralisiert',
  'dezentrale softwarearchitektur', 'smart contract', 'mining',
  'consensus', 'proof of', 'staking', 'lukso', 'ökosystem',
];

const INTL_DEV_EXCLUSIONS = [
  'entwicklungsland', 'dritte welt', 'entwicklungszusammenarbeit',
  'humanitäre hilfe', 'lateinamerika', 'afrika', 'asien',
  'nepal', 'indien', 'global south', 'globaler süden',
  'entwicklungsgebiet', 'äthiopien', 'kenia', 'uganda',
  'mosambik', 'tansania', 'brasilien', 'kolumbien',
  'peru', 'bolivien', 'myanmar', 'kambodscha', 'haiti',
  'cabo verde', 'ägypten', 'marokko',
];

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
// THEME KEYWORDS — broader than v2, from full screening
// ============================================================================

const THEME_KEYWORDS: Record<string, string[]> = {
  arbeitsintegration: [
    'arbeitsintegration', 'arbeitsmarkt', 'berufliche integration',
    'beschäftigungsprogramm', 'berufsbildung', 'berufseinstieg',
    'wiedereingliederung', 'erwerbstätigkeit', 'praktik', 'lehrstelle',
    'umschulung', 'qualifizierung', 'arbeitstraining',
    'langzeitarbeitslos', 'stellensuch', 'sozialhilfe',
    'berufsausbildung', 'berufslehre', 'arbeitsmarktfähig',
    'sozialunternehm', 'sozialfirma', 'sozialer betrieb',
  ],
  kreislaufwirtschaft: [
    'kreislauf', 'recycling', 'wiederverwend', 'reparatur',
    'refurbish', 'abfall', 'ressourcenschon', 'zirkulär',
    'elektroschrott', 'e-waste', 'secondhand', 'second-hand',
    'wiederaufbereitung', 'lebensdauer', 'nachhaltige nutzung',
    'gebraucht', 'repair', 'zero waste', 'abfallvermeidung',
    'materialkreislauf', 'produkt-lebenszykl',
  ],
  'soziale-integration': [
    'soziale integration', 'sozial benachteiligt',
    'migrant', 'migration', 'flüchtling', 'asyl',
    'marginalisiert', 'randgruppen',
    'existenzsicher', 'sozialhilfeempfänger',
    'arbeitsintegration', 'berufliche integration',
    'soziale teilhabe', 'chancengleichheit',
  ],
  'digitale-bildung': [
    'informatik', 'programmier', 'software',
    'medienkompetenz', 'it-kompetenz', 'digital literacy',
    'digitale kompetenz', 'digitale bildung',
    'ict', 'informationstechnologie',
    'mint', 'stem',
  ],
  'digitale-souveraenitaet': [
    'open source', 'souverän', 'quelloffen', 'linux',
    'open-source', 'datenschutz', 'datensouveränität',
    'digitale selbstbestimmung', 'freie software',
    'künstliche intelligenz', 'open data',
    'datensicher', 'digitale unabhängigkeit',
  ],
  klima: [
    'klima', 'klimaschutz', 'klimawandel',
    'co2', 'kohlendioxid', 'treibhausgas', 'emission',
    'erneuerbar', 'erneuerbare energie',
    'dekarbonisier', 'energiewende',
  ],
  jugend: [
    'jugend', 'jugendlich', 'junge erwachsen', 'junge menschen',
    'kinder und jugend', 'heranwachsend', 'teenager',
    'übergang schule beruf', 'ausbildungsplatz',
    'junge', 'lernende',
  ],
  zuerich: [
    'zürich', 'zürch', 'winterthur',
  ],
};

// ============================================================================
// HIGH-VALUE SIGNALS — from v2 (for ranking bonus)
// ============================================================================

interface Signal {
  name: string;
  weight: number;
  requires: string[];
  excludes?: string[];
}

const HIGH_SIGNALS: Signal[] = [
  // Perfect fit (weight 5)
  { name: 'elektroschrott', weight: 5, requires: ['elektroschrott'] },
  { name: 'e-waste', weight: 5, requires: ['e-waste'] },
  { name: 'refurbish', weight: 5, requires: ['refurbish'] },
  { name: 'IT-reparatur', weight: 4, requires: ['reparatur'], excludes: ['auto', 'fahrzeug', 'velo', 'fahrrad'] },
  { name: 'gebrauchte-IT', weight: 5, requires: ['gebraucht'], excludes: ['gebrauchsgüter des täglichen'] },
  // Strong fit (weight 3-4)
  { name: 'linux', weight: 4, requires: ['linux'] },
  { name: 'open-source-funder', weight: 4, requires: ['open source'], excludes: ['blockchain', 'dezentralisiert', 'protocol', 'token'] },
  { name: 'quelloffen', weight: 4, requires: ['quelloffen'], excludes: ['blockchain'] },
  { name: 'digitale-souveraenitaet', weight: 4, requires: ['souverän'], excludes: ['nahrungs'] },
  { name: 'kreislaufwirtschaft-explicit', weight: 4, requires: ['kreislaufwirtschaft'] },
  { name: 'wiederverwend', weight: 3, requires: ['wiederverwend'] },
  { name: 'arbeitsintegration', weight: 3, requires: ['arbeitsintegration'] },
  { name: 'berufliche-integration', weight: 3, requires: ['berufliche integration'] },
  { name: 'sozialfirma', weight: 4, requires: ['sozialfirma'] },
  { name: 'medienkompetenz', weight: 3, requires: ['medienkompetenz'] },
  { name: 'digitale-kompetenz', weight: 3, requires: ['digitale kompetenz'] },
  { name: 'lehrstelle', weight: 3, requires: ['lehrstelle'] },
  { name: 'berufseinstieg', weight: 3, requires: ['berufseinstieg'] },
];

// ============================================================================
// FUNDER / OPERATOR KEYWORDS
// ============================================================================

const FUNDER_KEYWORDS = [
  'fördert', 'förderung', 'unterstützt', 'unterstützung',
  'beiträge', 'zuwendungen', 'zuschüsse', 'finanzielle hilfe',
  'projektförderung', 'stipend', 'ausricht',
  'gewährt', 'vergab', 'vergibt', 'zusprech',
  'finanziell', 'projekten', 'gemeinnützig',
];

const OPERATOR_KEYWORDS = [
  'betreibt', 'führt', 'unterhält', 'verwaltet',
  'betrieb von', 'heim', 'klinik', 'spital', 'hospital',
  'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim',
  'kinderheim', 'tagesstätte', 'krippe', 'trägerin',
  'museum', 'theater',
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

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// ============================================================================
// EXCLUSION CHECK (from v2)
// ============================================================================

function isExcluded(purposeLower: string, nameLower: string): string | null {
  // Sector exclusions — but allow if digital/bildung also present
  const hasDigitalContext = purposeLower.includes('digital') || purposeLower.includes('bildung') || purposeLower.includes('informatik');
  for (const kw of SECTOR_EXCLUSIONS) {
    if (purposeLower.includes(kw) && !hasDigitalContext) return `sector:${kw}`;
  }

  // Crypto/blockchain
  for (const kw of CRYPTO_EXCLUSIONS) {
    if (purposeLower.includes(kw) || nameLower.includes(kw)) return `crypto:${kw}`;
  }

  // International development (only if NO Swiss-domestic angle)
  let intlCount = 0;
  let swissCount = 0;
  for (const kw of INTL_DEV_EXCLUSIONS) {
    if (purposeLower.includes(kw)) intlCount++;
  }
  const swissTerms = ['schweiz', 'inland', 'zürich', 'bern', 'basel', 'luzern', 'st. gallen', 'winterthur', 'in- und ausland'];
  for (const kw of swissTerms) {
    if (purposeLower.includes(kw)) swissCount++;
  }
  if (intlCount >= 2 && swissCount === 0) return 'intl-dev';
  if (intlCount >= 1 && purposeLower.includes('im ausland') && !purposeLower.includes('im in- und ausland')) return 'intl-dev';

  // Medical Kreislauf
  if (purposeLower.includes('kreislauf')) {
    let medicalCount = 0;
    for (const kw of MEDICAL_KREISLAUF) {
      if (purposeLower.includes(kw)) medicalCount++;
    }
    if (medicalCount >= 2) return 'medical-kreislauf';
  }

  return null;
}

// ============================================================================
// SCORING — hybrid of v2 signals + full theme matching
// ============================================================================

function scoreFoundation(esa: ESAFoundation): ScoredCandidate | null {
  const purposeLower = esa.purpose.toLowerCase();
  const nameLower = esa.name.toLowerCase();
  const fullText = `${nameLower} ${purposeLower}`;

  // Skip inactive
  if (esa.status !== 'aktiv') return null;

  // Skip empty/too-short purpose
  if (!esa.purpose || esa.purpose.length < 20) return null;

  // Check exclusions
  const exclusion = isExcluded(purposeLower, nameLower);
  if (exclusion) return null;

  // === Theme matching (from full screening) ===
  const matchedThemes: string[] = [];
  const matchedKeywords: string[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (fullText.includes(kw)) {
        if (!matchedThemes.includes(theme)) matchedThemes.push(theme);
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }
  }

  // v3 change: allow single-theme match if that theme is a core theme
  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'soziale-integration', 'digitale-souveraenitaet'];
  const hasCoreTheme = matchedThemes.some(t => coreThemes.includes(t));

  // Must match at least 1 theme (v2/full required 2)
  if (matchedThemes.length === 0) return null;
  // If only 1 non-core theme, skip (too weak)
  if (matchedThemes.length === 1 && !hasCoreTheme) return null;

  // === Signal matching (from v2) ===
  const matchedSignals: string[] = [];
  let signalScore = 0;

  for (const signal of HIGH_SIGNALS) {
    const allRequired = signal.requires.every(r => fullText.includes(r));
    if (!allRequired) continue;
    if (signal.excludes?.some(e => fullText.includes(e))) continue;
    matchedSignals.push(signal.name);
    signalScore += signal.weight;
  }

  // === Combined scoring ===
  let score = 0;
  const flags: string[] = [];

  // Core theme bonus (3 pts each)
  for (const t of coreThemes) {
    if (matchedThemes.includes(t)) score += 3;
  }

  // Climate/youth/Zurich theme bonus (2 pts each)
  if (matchedThemes.includes('klima')) score += 2;
  if (matchedThemes.includes('jugend')) score += 2;
  if (matchedThemes.includes('zuerich')) {
    score += 3;
    flags.push('zurich-theme');
  }

  // Digital sovereignty extra (from full)
  if (matchedThemes.includes('digitale-souveraenitaet')) {
    flags.push('digital-sovereignty');
  }

  // Theme count bonus
  score += matchedThemes.length;

  // Signal bonus (from v2)
  score += signalScore;
  if (signalScore >= 5) flags.push('strong-signals');

  // Funder signal bonus
  let funderScore = 0;
  for (const kw of FUNDER_KEYWORDS) {
    if (purposeLower.includes(kw)) funderScore++;
  }
  score += Math.min(funderScore, 4);
  if (funderScore >= 2) flags.push('likely-funder');

  // Operator penalty
  let operatorScore = 0;
  for (const kw of OPERATOR_KEYWORDS) {
    if (purposeLower.includes(kw)) operatorScore++;
  }
  score -= Math.min(operatorScore * 2, 6);
  if (operatorScore >= 2) flags.push('likely-operator');

  // Zurich geo bonus (city/canton)
  const zurichCities = ['zürich', 'winterthur', 'dübendorf', 'dietikon', 'kloten', 'uster', 'wädenswil', 'horgen', 'bülach', 'adliswil'];
  if (zurichCities.some(c => esa.city.toLowerCase().includes(c)) || esa.canton === 'ZH') {
    score += 3;
    flags.push('zurich-region');
  }

  // German-speaking Swiss bonus (vs. FR/IT)
  const germanCantons = ['ZH', 'BE', 'LU', 'SZ', 'ZG', 'SG', 'AG', 'TG', 'SO', 'BL', 'BS', 'SH', 'AR', 'AI', 'GL', 'NW', 'OW', 'UR'];
  if (germanCantons.includes(esa.canton)) {
    score += 1;
    flags.push('german-ch');
  }

  // After penalties, need minimum score
  if (score < 3) return null;

  // === Tiering ===
  let tier: 1 | 2 | 3 | 4;
  if (score >= 14 && (funderScore >= 2 || matchedSignals.length >= 2)) {
    tier = 1;
  } else if (score >= 8) {
    tier = 2;
  } else if (score >= 5) {
    tier = 3;
  } else {
    tier = 4;
  }

  // === Wave assignment ===
  let wave: ScoredCandidate['wave'];
  if (tier <= 2 && matchedSignals.length >= 1) {
    wave = 'wave1'; // High-signal + good tier
  } else if (tier <= 2) {
    wave = 'wave2'; // Good tier, theme-only match
  } else if (tier === 3) {
    wave = 'wave3'; // Lower tier
  } else {
    wave = 'wave4'; // Backfill
  }

  return {
    name: esa.name,
    uid: esa.uid,
    city: esa.city,
    canton: esa.canton,
    purpose: esa.purpose.replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 600),
    matchedSignals,
    matchedThemes,
    score,
    tier,
    flags,
    wave,
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ESA Screening v3 — Expanded Funnel (target: 333)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load ESA register
  const registerPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf-8'));
  const foundations: ESAFoundation[] = register.foundations;

  console.log(`\n  ESA register: ${foundations.length} foundations`);
  console.log(`  Current DB: ${STIFTUNGEN_DATA.length} foundations`);
  console.log(`  NOT_RECOMMENDED: ${NOT_RECOMMENDED.length} foundations`);
  console.log(`  Target: 333 total (need ${333 - STIFTUNGEN_DATA.length} more)`);

  // Build dedup sets
  const existingNames = buildExistingSet();
  const existingUIDs = buildExistingUIDs();
  console.log(`  Dedup set: ${existingNames.size} names, ${existingUIDs.size} UIDs`);

  // Screen
  const stats = {
    inactive: 0,
    duplicate: 0,
    excluded: { sector: 0, crypto: 0, intlDev: 0, medicalKreislauf: 0, other: 0 },
    noThemeMatch: 0,
    tooLowScore: 0,
  };
  const candidates: ScoredCandidate[] = [];

  for (const esa of foundations) {
    if (esa.status !== 'aktiv') { stats.inactive++; continue; }

    const normalized = normalizeName(esa.name);
    if (existingNames.has(normalized) || existingUIDs.has(esa.uid)) { stats.duplicate++; continue; }

    const purposeLower = esa.purpose?.toLowerCase() || '';
    const nameLower = esa.name.toLowerCase();

    // Categorize exclusion reason
    const exclusion = isExcluded(purposeLower, nameLower);
    if (exclusion) {
      if (exclusion.startsWith('sector:')) stats.excluded.sector++;
      else if (exclusion.startsWith('crypto:')) stats.excluded.crypto++;
      else if (exclusion === 'intl-dev') stats.excluded.intlDev++;
      else if (exclusion === 'medical-kreislauf') stats.excluded.medicalKreislauf++;
      else stats.excluded.other++;
      continue;
    }

    const result = scoreFoundation(esa);
    if (!result) {
      // Empty/short purpose or no themes
      if (!esa.purpose || esa.purpose.length < 20) stats.noThemeMatch++;
      else stats.noThemeMatch++;
      continue;
    }

    candidates.push(result);
  }

  // Sort by score desc
  candidates.sort((a, b) => b.score - a.score || a.tier - b.tier);

  // Stats
  const tier1 = candidates.filter(c => c.tier === 1);
  const tier2 = candidates.filter(c => c.tier === 2);
  const tier3 = candidates.filter(c => c.tier === 3);
  const tier4 = candidates.filter(c => c.tier === 4);

  const wave1 = candidates.filter(c => c.wave === 'wave1');
  const wave2 = candidates.filter(c => c.wave === 'wave2');
  const wave3 = candidates.filter(c => c.wave === 'wave3');
  const wave4 = candidates.filter(c => c.wave === 'wave4');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCREENING RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total screened:               ${foundations.length}`);
  console.log(`  Skipped (inactive):           ${stats.inactive}`);
  console.log(`  Skipped (already researched):  ${stats.duplicate}`);
  console.log(`  Excluded (sector):            ${stats.excluded.sector}`);
  console.log(`  Excluded (crypto/blockchain):  ${stats.excluded.crypto}`);
  console.log(`  Excluded (international dev):  ${stats.excluded.intlDev}`);
  console.log(`  Excluded (medical kreislauf):  ${stats.excluded.medicalKreislauf}`);
  console.log(`  No theme match / too low:     ${stats.noThemeMatch}`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  CANDIDATES:                   ${candidates.length}`);
  console.log(`    Tier 1 (excellent):         ${tier1.length}`);
  console.log(`    Tier 2 (good):              ${tier2.length}`);
  console.log(`    Tier 3 (possible):          ${tier3.length}`);
  console.log(`    Tier 4 (backfill):          ${tier4.length}`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  WAVE ASSIGNMENT:`);
  console.log(`    Wave 1 (T1-2 + signals):    ${wave1.length}`);
  console.log(`    Wave 2 (T1-2 themes only):  ${wave2.length}`);
  console.log(`    Wave 3 (T3):                ${wave3.length}`);
  console.log(`    Wave 4 (T4 backfill):       ${wave4.length}`);

  // Theme distribution
  const themeCounts: Record<string, number> = {};
  for (const c of candidates) {
    for (const t of c.matchedThemes) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }
  console.log('\n  Theme distribution:');
  for (const [t, count] of Object.entries(themeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${t}: ${count}`);
  }

  // Signal distribution
  const signalCounts: Record<string, number> = {};
  for (const c of candidates) {
    for (const s of c.matchedSignals) {
      signalCounts[s] = (signalCounts[s] || 0) + 1;
    }
  }
  if (Object.keys(signalCounts).length > 0) {
    console.log('\n  Top signals:');
    for (const [s, count] of Object.entries(signalCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      console.log(`    ${s}: ${count}`);
    }
  }

  // Top 20
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  TOP 20 CANDIDATES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const c of candidates.slice(0, 20)) {
    const flagStr = c.flags.length > 0 ? ` [${c.flags.join(', ')}]` : '';
    console.log(`\n  T${c.tier} (${c.score}pts) ${c.name} — ${c.city}, ${c.canton}${flagStr}`);
    console.log(`    Themes: ${c.matchedThemes.join(', ')}`);
    if (c.matchedSignals.length > 0) console.log(`    Signals: ${c.matchedSignals.join(', ')}`);
  }

  // Save
  const today = new Date().toISOString().split('T')[0];

  // Build queue-ready items with slugs
  const queueItems = candidates.map(c => ({
    ...c,
    slug: toSlug(c.name),
  }));

  const report = {
    date: today,
    version: 'esa-v3',
    source: 'esa-register-2026-02-16.json',
    strategy: [
      'Combines v2 precision exclusions with full screening breadth',
      'Accepts single-theme matches for core themes (v2/full required 2+)',
      'Lower score threshold (3 vs 4-5)',
      'Wave assignment for batch processing',
    ],
    currentDB: STIFTUNGEN_DATA.length,
    target: 333,
    needed: 333 - STIFTUNGEN_DATA.length,
    totalScreened: foundations.length,
    stats,
    candidateCount: candidates.length,
    tierBreakdown: { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length, tier4: tier4.length },
    waveBreakdown: { wave1: wave1.length, wave2: wave2.length, wave3: wave3.length, wave4: wave4.length },
    themeDistribution: themeCounts,
    signalDistribution: signalCounts,
    candidates: queueItems,
  };

  const outPath = path.join(process.cwd(), 'research', `esa-screening-v3-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved: ${outPath}`);
  console.log('  Done!\n');
}

main();
