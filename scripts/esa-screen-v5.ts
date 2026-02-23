#!/usr/bin/env tsx
/**
 * ESA Screening v5 — Catch-All for Remaining German-Language Foundations
 *
 * Captures the remaining ~3,167 ESA foundations not caught by v3/v4 by:
 * - Including ANY foundation with "Förderung"/"Unterstützung" funder language
 * - Including general charitable foundations (gemeinnützig, wohltätig, mildtätig)
 * - Including any foundation mentioning "Schweiz"/"schweizweit" scope
 * - Keeping hard exclusions (crypto, pure medical specialists, pure sports clubs)
 * - Minimal score threshold (1)
 *
 * Only processes foundations NOT already in v3 or v4 screening output.
 *
 * Usage: npx tsx scripts/esa-screen-v5.ts
 * Output: research/esa-screening-v5-YYYY-MM-DD.json
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
  wave: 'wave3' | 'wave4' | 'wave5';
}

// ============================================================================
// EXCLUSIONS — strict hard exclusions only
// ============================================================================

const HARD_EXCLUSIONS = [
  // Crypto/blockchain — always exclude
  'blockchain', 'crypto', 'krypto', 'token', 'defi', 'dao', 'web3',
  'nft', 'bitcoin', 'ethereum', 'protocol', 'ledger', 'dezentralisiert',
  'smart contract', 'mining', 'consensus', 'proof of', 'staking',
];

// Lighter sector exclusions — only truly irrelevant sectors
const SECTOR_EXCLUSIONS = [
  // Pure animal welfare (no tech angle)
  'tierheim', 'tierschutz', 'tierhilfe', 'tierärzt', 'tierquälerei',
  // Pure agriculture
  'alpwirtschaft', 'viehzucht', 'saatgut', 'fischerei', 'imkerei',
  // Religious institutions
  'kirchlich', 'liturgi', 'missionier', 'evangelisier', 'pfarrei', 'kirchgemeinde',
  // Family-restricted (cannot apply)
  'familienangehörig', 'nachkommen des stifters', 'stipendien an familienangehörige',
  'ausschliesslich an familienangehörige', 'nur an verwandte',
  // Municipal restricted
  'einwohnergemeinde', 'ortsbürgergemeinde', 'burgergemeinde',
  // Pure sports clubs
  'golfclub', 'tennisclub', 'schiessverein', 'fussballclub',
  // Medical specialists (narrow conditions)
  'krebsforschung', 'krebsliga', 'onkologie', 'palliativ',
  'multiple sklerose', 'parkinson', 'alzheimer', 'rheuma',
  'diabete', 'epilepsie', 'augenerkrankung', 'augenheilkunde',
  // Pure performing arts
  'orchest', 'oper', 'ballett', 'symphonie', 'philharmon',
];

const INTL_DEV_ONLY_EXCLUSIONS = [
  // Only exclude if 3+ international terms AND no Swiss angle
  'entwicklungsland', 'dritte welt', 'entwicklungszusammenarbeit',
  'humanitäre hilfe', 'lateinamerika', 'subsahara',
  'nepal', 'indien', 'global south', 'globaler süden',
  'afrika', 'asien', 'südamerika',
];

// ============================================================================
// THEME KEYWORDS — reused from v4, plus broader catch-all
// ============================================================================

const THEME_KEYWORDS: Record<string, string[]> = {
  arbeitsintegration: [
    'arbeitsintegration', 'arbeitsmarkt', 'berufliche integration',
    'beschäftigungsprogramm', 'berufsbildung', 'berufseinstieg',
    'wiedereingliederung', 'erwerbstätigkeit', 'lehrstelle',
    'umschulung', 'qualifizierung', 'arbeitstraining',
    'langzeitarbeitslos', 'berufsausbildung', 'berufslehre',
    'sozialfirma', 'sozialer betrieb',
    'lehre', 'lehrling', 'lehrabschluss', 'berufswahl',
    'berufsberatung', 'arbeitsfähig',
  ],
  kreislaufwirtschaft: [
    'kreislauf', 'recycling', 'wiederverwend', 'reparatur',
    'refurbish', 'ressourcenschon', 'zirkulär',
    'elektroschrott', 'e-waste', 'secondhand', 'second-hand',
    'wiederaufbereitung', 'zero waste', 'abfallvermeidung',
  ],
  'soziale-integration': [
    'soziale integration', 'sozial benachteiligt',
    'migrant', 'migration', 'flüchtling', 'asyl',
    'marginalisiert', 'randgruppen',
    'existenzsicher', 'sozialhilfeempfänger',
    'soziale teilhabe', 'chancengleichheit',
    'hilfsbedürftig', 'notleidend', 'bedürftige',
    'sozialhilfe', 'fürsorge',
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
    'datenschutz', 'datensouveränität',
    'digitale selbstbestimmung', 'freie software',
    'künstliche intelligenz', 'open data',
  ],
  klima: [
    'klima', 'klimaschutz', 'klimawandel',
    'co2', 'treibhausgas', 'emission',
    'erneuerbar', 'erneuerbare energie',
    'dekarbonisier', 'energiewende',
  ],
  jugend: [
    'jugend', 'jugendlich', 'junge erwachsen', 'junge menschen',
    'kinder und jugend', 'heranwachsend', 'teenager',
    'übergang schule beruf', 'ausbildungsplatz', 'lernende',
    'schüler', 'schülerin', 'schulkind',
  ],
  zuerich: [
    'zürich', 'zürch', 'winterthur',
  ],
  // Broader themes for catch-all
  bildung: [
    'bildung', 'ausbildung', 'weiterbildung', 'fortbildung',
    'schule', 'schulen', 'unterricht',
    'pädagog', 'erziehung', 'stipendien',
    'hochschul', 'universität', 'fachhochschul',
    'wissenschaft', 'forschung',
  ],
  sozial: [
    'sozial', 'gemeinnützig', 'wohltätig', 'mildtätig',
    'hilfswerk', 'wohlfahrt', 'fürsorge', 'armut',
    'benachteiligt', 'unterprivilegiert',
  ],
  umwelt: [
    'umwelt', 'umweltschutz', 'naturschutz', 'ökologie', 'ökologisch',
    'nachhaltigkeit', 'nachhaltig', 'ressourcen',
  ],
  kultur: [
    'kultur', 'kulturförderung', 'kunst', 'künstler',
    'kulturell', 'museum',
  ],
  gesundheit: [
    'gesundheit', 'gesundheitsförderung', 'prävention',
    'medizin', 'medizinisch',
  ],
};

// ============================================================================
// FUNDER / OPERATOR KEYWORDS
// ============================================================================

const FUNDER_KEYWORDS = [
  'fördert', 'förderung', 'unterstützt', 'unterstützung',
  'beiträge', 'zuwendungen', 'zuschüsse', 'finanzielle hilfe',
  'projektförderung', 'stipend', 'ausricht',
  'gewährt', 'vergibt', 'zusprech',
  'finanziell', 'gemeinnützig',
];

const OPERATOR_KEYWORDS = [
  'betreibt', 'führt', 'unterhält', 'verwaltet',
  'betrieb von', 'heim', 'klinik', 'spital',
  'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim',
  'kinderheim', 'tagesstätte', 'krippe', 'trägerin',
  'museum', 'theater',
];

// ============================================================================
// DEDUP
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
// LANGUAGE DETECTION
// ============================================================================

function isGermanLanguage(purpose: string): boolean {
  const p = purpose.toLowerCase();
  const germanIndicators = [
    'stiftung', 'bezweckt', 'förderung', 'unterstützung', 'zweck',
    'gemeinnützig', 'und', 'der', 'die', 'das', 'für', 'von',
    'zur', 'zum', 'mit', 'des', 'den', 'dem', 'ein', 'eine',
  ];
  let hits = 0;
  for (const kw of germanIndicators) {
    if (p.includes(kw)) hits++;
  }
  return hits >= 3; // At least 3 German indicators
}

// ============================================================================
// EXCLUSION CHECK — minimal for v5
// ============================================================================

function isExcluded(purposeLower: string, nameLower: string): string | null {
  // Hard exclusions always apply
  for (const kw of HARD_EXCLUSIONS) {
    if (purposeLower.includes(kw) || nameLower.includes(kw)) return `crypto:${kw}`;
  }

  // Sector exclusions — check if ONLY about excluded topic
  // v5 relaxation: if a foundation mentions BOTH excluded AND relevant topics, keep it
  const hasRelevantTopic = ['bildung', 'sozial', 'arbeit', 'beruf', 'digital',
    'technologie', 'umwelt', 'nachhaltigkeit', 'jugend', 'integration',
    'förderung', 'gemeinnützig'].some(kw => purposeLower.includes(kw));

  for (const kw of SECTOR_EXCLUSIONS) {
    if ((purposeLower.includes(kw) || nameLower.includes(kw)) && !hasRelevantTopic) {
      return `sector:${kw}`;
    }
  }

  // International dev: need 3+ keywords AND no Swiss angle
  let intlCount = 0;
  for (const kw of INTL_DEV_ONLY_EXCLUSIONS) {
    if (purposeLower.includes(kw)) intlCount++;
  }
  const swissTerms = ['schweiz', 'inland', 'zürich', 'bern', 'basel', 'luzern',
    'st. gallen', 'in- und ausland', 'im inland'];
  const hasSwissFocus = swissTerms.some(kw => purposeLower.includes(kw));
  if (intlCount >= 3 && !hasSwissFocus) return 'intl-dev-only';

  return null;
}

// ============================================================================
// SCORING — v5 catch-all scoring
// ============================================================================

function scoreFoundation(esa: ESAFoundation, v3v4Uids: Set<string>): ScoredCandidate | null {
  const purposeLower = esa.purpose.toLowerCase();
  const nameLower = esa.name.toLowerCase();
  const fullText = `${nameLower} ${purposeLower}`;

  if (esa.status !== 'aktiv') return null;
  if (!esa.purpose || esa.purpose.length < 20) return null;

  // Skip already captured
  if (v3v4Uids.has(esa.uid)) return null;

  // Must be German language
  if (!isGermanLanguage(esa.purpose)) return null;

  const exclusion = isExcluded(purposeLower, nameLower);
  if (exclusion) return null;

  // Theme matching — broader than v4
  const matchedThemes: string[] = [];
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (fullText.includes(kw)) {
        if (!matchedThemes.includes(theme)) matchedThemes.push(theme);
        break;
      }
    }
  }

  // v5 catch-all: also accept foundations with funder language even without theme match
  let funderScore = 0;
  for (const kw of FUNDER_KEYWORDS) {
    if (purposeLower.includes(kw)) funderScore++;
  }

  let operatorScore = 0;
  for (const kw of OPERATOR_KEYWORDS) {
    if (purposeLower.includes(kw)) operatorScore++;
  }

  const isFunder = funderScore > operatorScore;

  // v5 gate: must have either a theme match OR be a likely funder with gemeinnützig purpose
  if (matchedThemes.length === 0 && funderScore < 2) return null;
  // Heavy operators without themes are not interesting
  if (matchedThemes.length === 0 && operatorScore >= 3) return null;

  // Scoring
  let score = 0;
  const flags: string[] = [];

  // Core theme scoring (same as v4)
  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung',
    'soziale-integration', 'digitale-souveraenitaet'];
  for (const t of coreThemes) {
    if (matchedThemes.includes(t)) score += 3;
  }
  if (matchedThemes.includes('klima')) score += 2;
  if (matchedThemes.includes('jugend')) score += 2;
  if (matchedThemes.includes('zuerich')) { score += 3; flags.push('zurich-theme'); }

  // Broader themes (lower value)
  for (const t of ['bildung', 'sozial', 'umwelt']) {
    if (matchedThemes.includes(t)) score += 1;
  }
  // kultur and gesundheit: minimal (0.5 rounded)
  if (matchedThemes.includes('kultur')) score += 1;
  if (matchedThemes.includes('gesundheit')) score += 1;

  score += Math.min(matchedThemes.length, 3); // Theme diversity bonus, capped

  // Funder bonus
  score += Math.min(funderScore, 4);
  if (funderScore >= 2) flags.push('likely-funder');

  // Operator penalty
  score -= Math.min(operatorScore * 2, 6);
  if (operatorScore >= 2) flags.push('likely-operator');

  // Zurich geo bonus
  const zurichCities = ['zürich', 'winterthur', 'dübendorf', 'dietikon', 'kloten',
    'uster', 'wädenswil', 'horgen', 'bülach', 'adliswil'];
  if (zurichCities.some(c => esa.city.toLowerCase().includes(c)) || esa.canton === 'ZH') {
    score += 3;
    flags.push('zurich-region');
  }

  // German-speaking canton bonus
  const germanCantons = ['ZH', 'BE', 'LU', 'SZ', 'ZG', 'SG', 'AG', 'TG', 'SO',
    'BL', 'BS', 'SH', 'AR', 'AI', 'GL', 'NW', 'OW', 'UR'];
  if (germanCantons.includes(esa.canton)) {
    score += 1;
    flags.push('german-ch');
  }

  // v5: minimal score threshold
  if (score < 1) return null;

  // Tiering
  let tier: 1 | 2 | 3 | 4;
  if (score >= 14 && funderScore >= 2) tier = 1;
  else if (score >= 8) tier = 2;
  else if (score >= 5) tier = 3;
  else tier = 4;

  // All v5 candidates are wave5 (or wave3/4 if strong enough)
  let wave: ScoredCandidate['wave'];
  if (tier <= 2) wave = 'wave3';
  else if (tier === 3) wave = 'wave4';
  else wave = 'wave5';

  return {
    name: esa.name,
    uid: esa.uid,
    city: esa.city,
    canton: esa.canton,
    purpose: esa.purpose.replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 600),
    matchedSignals: [],
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
  console.log('  ESA Screening v5 — Catch-All German-Language Foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const registerPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf-8'));
  const foundations: ESAFoundation[] = register.foundations;

  console.log(`\n  ESA register: ${foundations.length} foundations`);
  console.log(`  Current DB: ${STIFTUNGEN_DATA.length} foundations`);
  console.log(`  NOT_RECOMMENDED: ${NOT_RECOMMENDED.length} foundations`);

  // Load v3+v4 UIDs to skip
  const v3Path = path.join(process.cwd(), 'research', 'esa-screening-v3-2026-02-20.json');
  const v4Path = path.join(process.cwd(), 'research', 'esa-screening-v4-2026-02-23.json');
  const v3v4Uids = new Set<string>();
  if (fs.existsSync(v3Path)) {
    const v3 = JSON.parse(fs.readFileSync(v3Path, 'utf-8'));
    for (const c of v3.candidates) v3v4Uids.add(c.uid);
  }
  if (fs.existsSync(v4Path)) {
    const v4 = JSON.parse(fs.readFileSync(v4Path, 'utf-8'));
    for (const c of v4.candidates) v3v4Uids.add(c.uid);
  }
  console.log(`  Already screened (v3+v4): ${v3v4Uids.size} UIDs`);

  const existingNames = buildExistingSet();
  const existingUIDs = buildExistingUIDs();
  console.log(`  Dedup set: ${existingNames.size} names, ${existingUIDs.size} UIDs`);

  const stats = { inactive: 0, duplicate: 0, alreadyScreened: 0, nonGerman: 0, excluded: 0, noMatch: 0 };
  const candidates: ScoredCandidate[] = [];

  for (const esa of foundations) {
    if (esa.status !== 'aktiv') { stats.inactive++; continue; }
    if (v3v4Uids.has(esa.uid)) { stats.alreadyScreened++; continue; }

    const normalized = normalizeName(esa.name);
    if (existingNames.has(normalized) || existingUIDs.has(esa.uid)) {
      stats.duplicate++;
      continue;
    }

    const result = scoreFoundation(esa, v3v4Uids);
    if (!result) {
      const purposeLower = esa.purpose?.toLowerCase() || '';
      if (!isGermanLanguage(esa.purpose)) stats.nonGerman++;
      else if (isExcluded(purposeLower, esa.name.toLowerCase())) stats.excluded++;
      else stats.noMatch++;
      continue;
    }

    candidates.push(result);
  }

  candidates.sort((a, b) => b.score - a.score || a.tier - b.tier);

  const tier1 = candidates.filter(c => c.tier === 1).length;
  const tier2 = candidates.filter(c => c.tier === 2).length;
  const tier3 = candidates.filter(c => c.tier === 3).length;
  const tier4 = candidates.filter(c => c.tier === 4).length;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  V5 CATCH-ALL RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Already screened (v3+v4): ${stats.alreadyScreened}`);
  console.log(`  Already in DB:           ${stats.duplicate}`);
  console.log(`  Non-German:              ${stats.nonGerman}`);
  console.log(`  Excluded:                ${stats.excluded}`);
  console.log(`  No match (funder<2):     ${stats.noMatch}`);
  console.log(`  ────────────────────────────────`);
  console.log(`  NEW CANDIDATES:          ${candidates.length}`);
  console.log(`    Tier 1:                ${tier1}`);
  console.log(`    Tier 2:                ${tier2}`);
  console.log(`    Tier 3:                ${tier3}`);
  console.log(`    Tier 4:                ${tier4}`);

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

  // Wave breakdown
  const wave3 = candidates.filter(c => c.wave === 'wave3').length;
  const wave4 = candidates.filter(c => c.wave === 'wave4').length;
  const wave5 = candidates.filter(c => c.wave === 'wave5').length;
  console.log('\n  Wave breakdown:');
  console.log(`    wave3: ${wave3}`);
  console.log(`    wave4: ${wave4}`);
  console.log(`    wave5: ${wave5}`);

  // Top 10
  console.log('\n  TOP 10:');
  for (const c of candidates.slice(0, 10)) {
    console.log(`  T${c.tier} (${c.score}pts) ${c.name} — ${c.city}`);
    console.log(`    Themes: ${c.matchedThemes.join(', ')}`);
  }

  // Save
  const today = new Date().toISOString().split('T')[0];
  const queueItems = candidates.map(c => ({ ...c, slug: toSlug(c.name) }));

  const report = {
    date: today,
    version: 'esa-v5',
    source: 'esa-register-2026-02-16.json',
    strategy: [
      'Catch-all for remaining German-language foundations not in v3/v4',
      'Accept any funder with funderScore >= 2 even without theme match',
      'Broader themes: bildung, sozial, umwelt, kultur, gesundheit',
      'Relaxed sector exclusions if any relevant topic present',
      'Minimal score threshold (1)',
    ],
    candidateCount: candidates.length,
    tierBreakdown: { tier1, tier2, tier3, tier4 },
    waveBreakdown: { wave3, wave4, wave5 },
    themeDistribution: themeCounts,
    candidates: queueItems,
  };

  const outPath = path.join(process.cwd(), 'research', `esa-screening-v5-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved: ${outPath}`);

  // Summary
  const totalAfter = STIFTUNGEN_DATA.length + candidates.length;
  console.log(`\n  Projected total: ${STIFTUNGEN_DATA.length} (current) + ${candidates.length} (v5) = ${totalAfter}`);
  console.log('  Done!\n');
}

main();
