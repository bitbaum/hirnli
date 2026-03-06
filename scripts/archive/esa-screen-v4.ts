#!/usr/bin/env tsx
/**
 * ESA Screening v4 — Recovery Screening for V3 Excluded Candidates
 *
 * Captures foundations missed by v3 screening by:
 * - Adding German-language education synonyms (schule, lehre, pädagog)
 * - Adding community/social support keywords
 * - Relaxing sector exclusions for school-related foundations
 * - Lowering score threshold to 2
 *
 * Only processes foundations NOT already in DB (v3 already captured 1650).
 *
 * Usage: npx tsx scripts/esa-screen-v4.ts
 * Output: research/esa-screening-v4-YYYY-MM-DD.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import { NOT_RECOMMENDED } from '../src/lib/config/foundations/metadata';

// ============================================================================
// TYPES (same as v3)
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
// EXCLUSIONS — kept from v3 but relaxed for schools
// ============================================================================

const HARD_EXCLUSIONS = [
  // Crypto/blockchain — always exclude
  'blockchain', 'crypto', 'krypto', 'token', 'defi', 'dao', 'web3',
  'nft', 'bitcoin', 'ethereum', 'protocol', 'ledger', 'dezentralisiert',
  'smart contract', 'mining', 'consensus', 'proof of', 'staking',
];

const SECTOR_EXCLUSIONS = [
  // Animals
  'tierheim', 'tierschutz', 'tierhilfe', 'tierärzt',
  // Agriculture
  'alpwirtschaft', 'landwirtschaft', 'bauern', 'saatgut', 'fischerei', 'imkerei',
  // Heritage/religion
  'denkmalpflege', 'denkmalschutz', 'heimatschutz',
  'kirchlich', 'liturgi', 'missionier', 'evangelisier', 'pfarrei', 'kirchgemeinde',
  // Family-restricted
  'familienangehörig', 'nachkommen des stifters', 'stipendien an familienangehörige',
  // Municipal
  'einwohnergemeinde', 'ortsbürgergemeinde', 'burgergemeinde',
  // Sports clubs
  'golf', 'tennis', 'schiess', 'fussball', 'sportverein',
  // Medical specialists
  'krebsforschung', 'krebsliga', 'onkologie', 'palliativ',
  'multiple sklerose', 'parkinson', 'alzheimer', 'rheuma',
  'diabete', 'epilepsie', 'augenerkrankung', 'augenheilkunde',
  'hörbehindert', 'gehörlos',
  // Arts/culture
  'orchest', 'oper', 'ballett', 'symphonie', 'philharmon',
  'musikschule', 'konservatorium',
  // Nature conservation
  'wildtier', 'vogelschutz', 'naturschutzgebiet', 'moorschutz', 'waldschutz',
];

const INTL_DEV_EXCLUSIONS = [
  'entwicklungsland', 'dritte welt', 'entwicklungszusammenarbeit',
  'humanitäre hilfe', 'lateinamerika', 'afrika', 'asien',
  'nepal', 'indien', 'global south', 'globaler süden',
];

// ============================================================================
// V4 EXPANDED THEME KEYWORDS — broader education + community
// ============================================================================

const THEME_KEYWORDS: Record<string, string[]> = {
  // v3 themes kept as-is
  arbeitsintegration: [
    'arbeitsintegration', 'arbeitsmarkt', 'berufliche integration',
    'beschäftigungsprogramm', 'berufsbildung', 'berufseinstieg',
    'wiedereingliederung', 'erwerbstätigkeit', 'lehrstelle',
    'umschulung', 'qualifizierung', 'arbeitstraining',
    'langzeitarbeitslos', 'berufsausbildung', 'berufslehre',
    'sozialfirma', 'sozialer betrieb',
    // v4 additions: broader vocational training
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
    // v4 additions: community support
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
    // v4 additions: broader youth/education
    'schüler', 'schülerin', 'schulkind',
    'schulbildung', 'grundschul', 'primarschul',
    'sekundarschul', 'gymnasial',
  ],
  zuerich: [
    'zürich', 'zürch', 'winterthur',
  ],
  // v4 NEW: broader education theme (maps to jugend for scoring)
  bildung: [
    'schule', 'schulen', 'unterricht',
    'pädagog', 'heilpädagog', 'erziehung',
    'stipendien', 'studierende', 'studierend',
    'hochschul', 'universität', 'fachhochschul',
    'wissenschaft', 'forschung und lehre',
    'weiterbildung', 'fortbildung', 'bildungsförder',
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
// EXCLUSION CHECK — relaxed for school-related foundations
// ============================================================================

function isExcluded(purposeLower: string, nameLower: string): string | null {
  // Hard exclusions always apply
  for (const kw of HARD_EXCLUSIONS) {
    if (purposeLower.includes(kw) || nameLower.includes(kw)) return `crypto:${kw}`;
  }

  // Sector exclusions — v4 relaxes for education context
  const hasEducationContext = ['bildung', 'schule', 'schulen', 'pädagog', 'erziehung',
    'ausbildung', 'lehre', 'stipendien', 'digital', 'informatik',
    'wissenschaft', 'forschung'].some(kw => purposeLower.includes(kw));

  for (const kw of SECTOR_EXCLUSIONS) {
    if (purposeLower.includes(kw) && !hasEducationContext) return `sector:${kw}`;
  }

  // International dev (need 2+ keywords AND no Swiss angle)
  let intlCount = 0;
  for (const kw of INTL_DEV_EXCLUSIONS) {
    if (purposeLower.includes(kw)) intlCount++;
  }
  const swissTerms = ['schweiz', 'inland', 'zürich', 'bern', 'basel', 'luzern', 'st. gallen', 'in- und ausland'];
  const hasSwisFocus = swissTerms.some(kw => purposeLower.includes(kw));
  if (intlCount >= 2 && !hasSwisFocus) return 'intl-dev';

  return null;
}

// ============================================================================
// SCORING
// ============================================================================

function scoreFoundation(esa: ESAFoundation): ScoredCandidate | null {
  const purposeLower = esa.purpose.toLowerCase();
  const nameLower = esa.name.toLowerCase();
  const fullText = `${nameLower} ${purposeLower}`;

  if (esa.status !== 'aktiv') return null;
  if (!esa.purpose || esa.purpose.length < 20) return null;

  const exclusion = isExcluded(purposeLower, nameLower);
  if (exclusion) return null;

  // Theme matching
  const matchedThemes: string[] = [];
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (theme === 'bildung') continue; // Score 'bildung' separately
    for (const kw of keywords) {
      if (fullText.includes(kw)) {
        if (!matchedThemes.includes(theme)) matchedThemes.push(theme);
        break;
      }
    }
  }

  // Check broader 'bildung' keywords — map to 'jugend' if youth context, else boost score
  let hasBroadEducation = false;
  for (const kw of THEME_KEYWORDS.bildung) {
    if (fullText.includes(kw)) {
      hasBroadEducation = true;
      break;
    }
  }

  // If broad education match + youth context → add jugend
  if (hasBroadEducation && !matchedThemes.includes('jugend')) {
    const hasYouth = ['jugend', 'kinder', 'schüler', 'junge'].some(kw => fullText.includes(kw));
    if (hasYouth) matchedThemes.push('jugend');
  }

  // Must match at least 1 theme OR have broad education
  if (matchedThemes.length === 0 && !hasBroadEducation) return null;

  // Scoring
  let score = 0;
  const flags: string[] = [];

  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'soziale-integration', 'digitale-souveraenitaet'];
  for (const t of coreThemes) {
    if (matchedThemes.includes(t)) score += 3;
  }
  if (matchedThemes.includes('klima')) score += 2;
  if (matchedThemes.includes('jugend')) score += 2;
  if (matchedThemes.includes('zuerich')) { score += 3; flags.push('zurich-theme'); }

  // Broad education bonus (lower than theme match)
  if (hasBroadEducation) score += 2;

  score += matchedThemes.length;

  // Funder bonus
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

  // Zurich geo bonus
  const zurichCities = ['zürich', 'winterthur', 'dübendorf', 'dietikon', 'kloten', 'uster', 'wädenswil', 'horgen', 'bülach', 'adliswil'];
  if (zurichCities.some(c => esa.city.toLowerCase().includes(c)) || esa.canton === 'ZH') {
    score += 3;
    flags.push('zurich-region');
  }

  // German-speaking bonus
  const germanCantons = ['ZH', 'BE', 'LU', 'SZ', 'ZG', 'SG', 'AG', 'TG', 'SO', 'BL', 'BS', 'SH', 'AR', 'AI', 'GL', 'NW', 'OW', 'UR'];
  if (germanCantons.includes(esa.canton)) {
    score += 1;
    flags.push('german-ch');
  }

  // V4: lower minimum score (2 vs v3's 3)
  if (score < 2) return null;

  // Tiering (same logic as v3)
  let tier: 1 | 2 | 3 | 4;
  if (score >= 14 && (funderScore >= 2)) tier = 1;
  else if (score >= 8) tier = 2;
  else if (score >= 5) tier = 3;
  else tier = 4;

  // All v4 candidates are wave3 or wave4
  const wave: ScoredCandidate['wave'] = tier <= 3 ? 'wave3' : 'wave4';

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
  console.log('  ESA Screening v4 — Recovery Screening');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const registerPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf-8'));
  const foundations: ESAFoundation[] = register.foundations;

  console.log(`\n  ESA register: ${foundations.length} foundations`);
  console.log(`  Current DB: ${STIFTUNGEN_DATA.length} foundations`);
  console.log(`  NOT_RECOMMENDED: ${NOT_RECOMMENDED.length} foundations`);

  const existingNames = buildExistingSet();
  const existingUIDs = buildExistingUIDs();
  console.log(`  Dedup set: ${existingNames.size} names, ${existingUIDs.size} UIDs`);

  const stats = { inactive: 0, duplicate: 0, excluded: 0, noMatch: 0 };
  const candidates: ScoredCandidate[] = [];

  for (const esa of foundations) {
    if (esa.status !== 'aktiv') { stats.inactive++; continue; }

    const normalized = normalizeName(esa.name);
    if (existingNames.has(normalized) || existingUIDs.has(esa.uid)) {
      stats.duplicate++;
      continue;
    }

    const result = scoreFoundation(esa);
    if (!result) {
      const purposeLower = esa.purpose?.toLowerCase() || '';
      const nameLower = esa.name.toLowerCase();
      if (isExcluded(purposeLower, nameLower)) stats.excluded++;
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
  console.log('  V4 RECOVERY RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Already in DB:     ${stats.duplicate}`);
  console.log(`  Excluded:          ${stats.excluded}`);
  console.log(`  No theme match:    ${stats.noMatch}`);
  console.log(`  ────────────────────────────────`);
  console.log(`  NEW CANDIDATES:    ${candidates.length}`);
  console.log(`    Tier 1:          ${tier1}`);
  console.log(`    Tier 2:          ${tier2}`);
  console.log(`    Tier 3:          ${tier3}`);
  console.log(`    Tier 4:          ${tier4}`);

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
    version: 'esa-v4',
    source: 'esa-register-2026-02-16.json',
    strategy: [
      'Recovery screening for v3-excluded candidates',
      'Broader education keywords (schule, lehre, pädagog)',
      'Relaxed sector exclusions for education context',
      'Lower score threshold (2)',
    ],
    candidateCount: candidates.length,
    tierBreakdown: { tier1, tier2, tier3, tier4 },
    waveBreakdown: {
      wave3: candidates.filter(c => c.wave === 'wave3').length,
      wave4: candidates.filter(c => c.wave === 'wave4').length,
    },
    themeDistribution: themeCounts,
    candidates: queueItems,
  };

  const outPath = path.join(process.cwd(), 'research', `esa-screening-v4-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved: ${outPath}`);
  console.log('  Done!\n');
}

main();
