#!/usr/bin/env tsx
/**
 * Full ESA Register Screening
 *
 * Screens ALL 5,392 ESA foundations against Revamp-IT themes using
 * purpose text keyword matching. Deduplicates against current DB
 * and NOT_RECOMMENDED list.
 *
 * Usage: npx tsx scripts/esa-screen-full.ts
 * Output: research/esa-full-screening-YYYY-MM-DD.json
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
  purpose: string; // truncated
  matchedThemes: string[];
  matchedKeywords: string[];
  themeCount: number;
  score: number;
  tier: 1 | 2 | 3;
  flags: string[];
}

// ============================================================================
// KEYWORD SETS — expanded with platform/digital terms
// ============================================================================

const THEME_KEYWORDS: Record<string, string[]> = {
  // Core themes (high weight)
  arbeitsintegration: [
    'arbeitsintegration', 'arbeitsmarkt', 'berufliche integration',
    'beschäftigungsprogramm', 'berufsbildung', 'berufseinstieg',
    'wiedereingliederung', 'erwerbstätigkeit', 'praktik', 'lehrstelle',
    'umschulung', 'qualifizierung', 'arbeitstraining',
    'langzeitarbeitslos', 'stellensuch', 'sozialhilfe',
  ],
  kreislaufwirtschaft: [
    'kreislauf', 'recycling', 'wiederverwend', 'reparatur',
    'refurbish', 'abfall', 'ressourcenschon', 'zirkulär',
    'elektroschrott', 'e-waste', 'secondhand', 'second-hand',
    'wiederaufbereitung', 'lebensdauer', 'nachhaltige nutzung',
    'gebraucht', 'repair',
  ],
  'soziale-integration': [
    'soziale integration', 'benachteiligt', 'chancengleich',
    'inklusion', 'bedürftig', 'armut', 'sozialhilfe',
    'migrant', 'migration', 'flüchtling', 'asyl',
    'niederschwellig', 'teilhabe', 'partizipation',
    'soziale gerechtigkeit', 'existenzsicher',
    'marginalisiert', 'randgruppen',
  ],
  'digitale-bildung': [
    'digital', 'bildung', 'informatik', 'technologie',
    'computer', 'ausbildung', 'weiterbildung',
    'medienkompetenz', 'it-kompetenz', 'digital literacy',
    'digitale kompetenz', 'programmier', 'software',
    'ict', 'informationstechnologie',
  ],
  'digitale-souveraenitaet': [
    'open source', 'souverän', 'quelloffen', 'linux',
    'open-source', 'datenschutz', 'datensouveränität',
    'digitale selbstbestimmung', 'freie software',
    'künstliche intelligenz', 'open data',
  ],
  klima: [
    'klima', 'umwelt', 'nachhaltigkeit', 'co2',
    'ökologie', 'ökologisch', 'umweltschutz', 'klimaschutz',
    'emission', 'treibhausgas', 'erneuerbar',
  ],
  jugend: [
    'jugend', 'jugendlich', 'junge erwachsen', 'junge menschen',
    'kinder und jugend', 'heranwachsend', 'teenager',
    'übergang schule beruf', 'ausbildungsplatz',
  ],
  zuerich: [
    'zürich', 'zürch', 'winterthur',
  ],
};

// High-value keywords that indicate strong funder potential
const FUNDER_KEYWORDS = [
  'fördert', 'förderung', 'unterstützt', 'unterstützung',
  'beiträge', 'zuwendungen', 'zuschüsse', 'finanzielle hilfe',
  'projektförderung', 'stipend', 'ausricht',
  'gewährt', 'vergab', 'vergibt', 'zusprech',
];

// Operator keywords — foundations that run programs, not fund
const OPERATOR_KEYWORDS = [
  'betreibt', 'führt', 'unterhält', 'verwaltet',
  'betrieb von', 'heim', 'klinik', 'spital', 'hospital',
  'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim',
  'kinderheim', 'tagesstätte', 'krippe', 'trägerin',
  'museum', 'theater', 'orchest', 'kapelle',
  'kirchgemeinde', 'pfarrei', 'gemeinde',
];

// Sector exclusions — very unlikely to fund IT/integration
const EXCLUSION_KEYWORDS = [
  'tierheim', 'tierschutz', 'tierhilfe',
  'alpwirtschaft', 'landwirtschaft', 'bauern',
  'denkmalpflege', 'denkmalschutz', 'heimatschutz',
  'kirchlich', 'liturgi', 'missionier', 'evangelisier',
  'familienangehörig', 'nachkommen des stifters',
  'stipendien an familienangehörige',
  'einwohnergemeinde', 'ortsbürgergemeinde',
  'golf', 'tennis', 'schiess', 'fussball', 'sportverein',
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

  // DB foundations
  for (const f of STIFTUNGEN_DATA) {
    names.add(normalizeName(f.name));
  }

  // NOT_RECOMMENDED
  for (const f of NOT_RECOMMENDED) {
    names.add(normalizeName(f.name));
  }

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

function scoreFoundation(esa: ESAFoundation): ScoredCandidate | null {
  const purposeLower = esa.purpose.toLowerCase();
  const nameLower = esa.name.toLowerCase();

  // Skip dissolved/inactive
  if (esa.status !== 'aktiv') return null;

  // Skip empty purpose
  if (!esa.purpose || esa.purpose.length < 30) return null;

  // Check sector exclusions
  for (const kw of EXCLUSION_KEYWORDS) {
    if (purposeLower.includes(kw) && !purposeLower.includes('digital') && !purposeLower.includes('bildung')) {
      return null;
    }
  }

  // Match themes
  const matchedThemes: string[] = [];
  const matchedKeywords: string[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (purposeLower.includes(kw) || nameLower.includes(kw)) {
        if (!matchedThemes.includes(theme)) matchedThemes.push(theme);
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }
  }

  // Must match at least 2 themes
  if (matchedThemes.length < 2) return null;

  // Calculate score
  let score = 0;
  const flags: string[] = [];

  // Core theme bonus (3 pts each)
  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'soziale-integration'];
  for (const t of coreThemes) {
    if (matchedThemes.includes(t)) score += 3;
  }

  // Digital bonus (2 pts)
  if (matchedThemes.includes('digitale-souveraenitaet')) {
    score += 2;
    flags.push('digital-sovereignty');
  }

  // Zurich bonus (3 pts)
  if (matchedThemes.includes('zuerich') || esa.city.toLowerCase().includes('zürich') || esa.city.toLowerCase().includes('winterthur')) {
    score += 3;
    flags.push('zurich-based');
  }

  // Funder signal bonus
  let funderScore = 0;
  for (const kw of FUNDER_KEYWORDS) {
    if (purposeLower.includes(kw)) funderScore++;
  }
  score += Math.min(funderScore, 3); // Cap at 3

  if (funderScore >= 2) flags.push('likely-funder');

  // Operator penalty
  let operatorScore = 0;
  for (const kw of OPERATOR_KEYWORDS) {
    if (purposeLower.includes(kw)) operatorScore++;
  }
  score -= Math.min(operatorScore, 4); // Cap penalty at 4

  if (operatorScore >= 3) flags.push('likely-operator');

  // Theme count bonus
  score += matchedThemes.length;

  // Tiering
  let tier: 1 | 2 | 3;
  if (score >= 10 && funderScore >= 2) {
    tier = 1;
  } else if (score >= 6) {
    tier = 2;
  } else {
    tier = 3;
  }

  return {
    name: esa.name,
    uid: esa.uid,
    city: esa.city,
    canton: esa.canton,
    purpose: esa.purpose.replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 600),
    matchedThemes,
    matchedKeywords,
    themeCount: matchedThemes.length,
    score,
    tier,
    flags,
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ESA Full Register Screening');
  console.log('  Screening all 5,392 ESA foundations against Revamp-IT themes');
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
  let skippedInactive = 0;
  let skippedDuplicate = 0;
  let skippedNoMatch = 0;
  const candidates: ScoredCandidate[] = [];

  for (const esa of foundations) {
    // Skip inactive
    if (esa.status !== 'aktiv') {
      skippedInactive++;
      continue;
    }

    // Deduplicate
    const normalized = normalizeName(esa.name);
    if (existingNames.has(normalized) || existingUIDs.has(esa.uid)) {
      skippedDuplicate++;
      continue;
    }

    // Score
    const result = scoreFoundation(esa);
    if (!result) {
      skippedNoMatch++;
      continue;
    }

    candidates.push(result);
  }

  // Sort by score desc, then tier asc
  candidates.sort((a, b) => b.score - a.score || a.tier - b.tier);

  // Stats
  const tier1 = candidates.filter(c => c.tier === 1);
  const tier2 = candidates.filter(c => c.tier === 2);
  const tier3 = candidates.filter(c => c.tier === 3);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total ESA foundations:     ${foundations.length}`);
  console.log(`  Skipped (inactive):        ${skippedInactive}`);
  console.log(`  Skipped (already in DB):   ${skippedDuplicate}`);
  console.log(`  Skipped (no theme match):  ${skippedNoMatch}`);
  console.log(`  ────────────────────────────────────`);
  console.log(`  CANDIDATES FOUND:          ${candidates.length}`);
  console.log(`    Tier 1 (high priority):  ${tier1.length}`);
  console.log(`    Tier 2 (good fit):       ${tier2.length}`);
  console.log(`    Tier 3 (possible fit):   ${tier3.length}`);

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

  // Top 20
  console.log('\n  TOP 20 CANDIDATES:');
  for (const c of candidates.slice(0, 20)) {
    const flagStr = c.flags.length > 0 ? ` [${c.flags.join(', ')}]` : '';
    console.log(`    T${c.tier} (${c.score}pts) ${c.name} — ${c.city}${flagStr}`);
    console.log(`      Themes: ${c.matchedThemes.join(', ')}`);
  }

  // Save
  const today = new Date().toISOString().split('T')[0];
  const report = {
    date: today,
    version: 'esa-full-1.0',
    source: 'esa-register-2026-02-16.json',
    totalScreened: foundations.length,
    skipped: { inactive: skippedInactive, duplicate: skippedDuplicate, noMatch: skippedNoMatch },
    candidateCount: candidates.length,
    tierBreakdown: { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length },
    themeDistribution: themeCounts,
    candidates,
  };

  const outPath = path.join(process.cwd(), 'research', `esa-full-screening-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report: ${outPath}`);
  console.log('✅ Done!\n');
}

main();
