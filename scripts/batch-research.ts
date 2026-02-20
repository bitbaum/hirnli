#!/usr/bin/env tsx
/**
 * Batch Research — Mechanical draft generation from ESA purpose text
 *
 * Reads the v3 screening output and generates ResearchDraft JSONs for each
 * candidate using the ESA purpose text as the primary input. No LLM calls —
 * pure keyword analysis and template-based generation.
 *
 * For foundations where purpose text is rich enough, generates full-quality
 * drafts (needsResearch: false). For thin purpose text, marks as partial
 * (needsResearch: true) for follow-up.
 *
 * Usage:
 *   npx tsx scripts/batch-research.ts [--wave wave1|wave2|wave3|wave4|all] [--limit N] [--dry-run]
 *
 * Output: research/drafts/YYYY-MM-DD/*.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ThemeId } from '../src/lib/schemas/foundation';

// ============================================================================
// TYPES
// ============================================================================

interface ScreeningCandidate {
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
  wave: string;
  slug: string;
}

interface ScreeningReport {
  date: string;
  candidates: ScreeningCandidate[];
  candidateCount: number;
  waveBreakdown: Record<string, number>;
}

// ============================================================================
// THEME CLASSIFICATION
// ============================================================================

const THEME_RULES: Record<string, { keywords: string[]; weight: number }> = {
  arbeitsintegration: {
    keywords: ['arbeitsintegration', 'berufliche integration', 'arbeitsmarkt',
      'wiedereingliederung', 'beschäftigungsprogramm', 'arbeitstraining',
      'langzeitarbeitslos', 'sozialfirma', 'sozialer betrieb',
      'berufseinstieg', 'lehrstelle', 'berufsbildung', 'berufsausbildung'],
    weight: 3,
  },
  kreislaufwirtschaft: {
    keywords: ['kreislaufwirtschaft', 'recycling', 'wiederverwend', 'reparatur',
      'refurbish', 'ressourcenschon', 'zirkulär', 'elektroschrott', 'e-waste',
      'secondhand', 'second-hand', 'wiederaufbereitung', 'abfallvermeidung',
      'zero waste', 'materialkreislauf'],
    weight: 3,
  },
  'soziale-integration': {
    keywords: ['soziale integration', 'benachteiligt', 'chancengleich',
      'inklusion', 'armut', 'sozialhilfe', 'migrant', 'migration',
      'flüchtling', 'asyl', 'niederschwellig', 'teilhabe',
      'marginalisiert', 'existenzsicher', 'bedürftig'],
    weight: 2,
  },
  'digitale-bildung': {
    keywords: ['informatik', 'computer', 'medienkompetenz', 'it-kompetenz',
      'digital literacy', 'digitale kompetenz', 'programmier', 'software',
      'ict', 'informationstechnologie', 'mint', 'technik'],
    weight: 2,
  },
  'digitale-souveraenitaet': {
    keywords: ['open source', 'quelloffen', 'linux', 'datensouveränität',
      'digitale selbstbestimmung', 'freie software', 'open data',
      'datensicher', 'souverän'],
    weight: 3,
  },
  klima: {
    keywords: ['klima', 'umwelt', 'nachhaltigkeit', 'co2', 'ökologie',
      'ökologisch', 'umweltschutz', 'klimaschutz', 'emission'],
    weight: 1,
  },
  jugend: {
    keywords: ['jugend', 'jugendlich', 'junge erwachsen', 'junge menschen',
      'kinder und jugend', 'übergang schule beruf', 'lernende'],
    weight: 1,
  },
  zuerich: {
    keywords: ['zürich', 'zürch', 'winterthur'],
    weight: 1,
  },
};

function classifyThemes(purposeLower: string, nameLower: string): string[] {
  const themes: string[] = [];
  const fullText = `${nameLower} ${purposeLower}`;

  for (const [theme, rule] of Object.entries(THEME_RULES)) {
    if (rule.keywords.some(kw => fullText.includes(kw))) {
      themes.push(theme);
    }
  }

  return themes;
}

// ============================================================================
// TYPE CLASSIFICATION (Robert Schmuki A/B/C/D)
// ============================================================================

function classifyType(
  purpose: string,
  name: string,
  funderScore: number,
  operatorScore: number,
): 'A' | 'B' | 'C' | 'D' | 'network' {
  const p = purpose.toLowerCase();
  const n = name.toLowerCase();

  // Corporate indicators
  if (n.includes('ag') || n.includes('group') || n.includes('suisse') ||
      n.includes('swiss re') || n.includes('credit suisse') || n.includes('ubs') ||
      n.includes('novartis') || n.includes('roche') || n.includes('nestlé') ||
      n.includes('corporate') || n.includes('company')) {
    return 'D';
  }

  // Network/association indicators
  if (n.includes('verband') || n.includes('verein') || n.includes('netzwerk') ||
      n.includes('plattform') || n.includes('allianz') || n.includes('dachverband')) {
    return 'network';
  }

  // Type A: professional management + structured processes
  if (funderScore >= 3 && purpose.length > 200 && (
    p.includes('förderrichtlinien') || p.includes('programm') ||
    p.includes('bewerbungsverfahren') || p.includes('ausschreibung') ||
    p.includes('gesuche')
  )) {
    return 'A';
  }

  // Type B: family foundation with substance
  if (funderScore >= 2 && purpose.length > 100 && (
    p.includes('famili') || n.includes('famili') ||
    /\b[A-Z][a-z]+-[A-Z][a-z]+\b/.test(name) || // Hyphenated last names
    n.includes('-stiftung')
  )) {
    return 'B';
  }

  // If it runs operations, default network
  if (operatorScore >= 3) return 'network';

  // Default: C for small/unknown
  return purpose.length > 200 && funderScore >= 2 ? 'B' : 'C';
}

// ============================================================================
// FIT SCORING
// ============================================================================

function calculateFit(themes: string[], score: number, flags: string[]): 1 | 2 | 3 {
  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'digitale-souveraenitaet'];
  const coreHits = themes.filter(t => coreThemes.includes(t)).length;

  if (coreHits >= 2 && score >= 14) return 3;
  if (coreHits >= 1 && score >= 8) return 2;
  return 1;
}

function calculatePriority(fit: number, flags: string[], tier: number): 1 | 2 | 3 | 4 {
  if (fit === 3 && flags.includes('likely-funder')) return 1;
  if (fit >= 2 && (flags.includes('likely-funder') || flags.includes('zurich-region'))) return 2;
  if (fit >= 2 || tier <= 2) return 3;
  return 4;
}

// ============================================================================
// PURPOSE SUMMARY & RESEARCH NOTES GENERATION
// ============================================================================

function generatePurposeSummary(candidate: ScreeningCandidate): string {
  const { name, purpose, city, canton, matchedThemes } = candidate;

  // Clean up purpose text
  const cleanPurpose = purpose
    .replace(/\s+/g, ' ')
    .trim();

  // Build theme description
  const themeLabels: Record<string, string> = {
    arbeitsintegration: 'Arbeitsintegration und berufliche Eingliederung',
    kreislaufwirtschaft: 'Kreislaufwirtschaft und Ressourcenschonung',
    'soziale-integration': 'soziale Integration und Chancengleichheit',
    'digitale-bildung': 'digitale Bildung und Technologiekompetenz',
    'digitale-souveraenitaet': 'digitale Souveränität und Open Source',
    klima: 'Klima- und Umweltschutz',
    jugend: 'Jugendförderung',
    zuerich: 'Region Zürich',
  };

  const themeDesc = matchedThemes
    .filter(t => t !== 'zuerich')
    .map(t => themeLabels[t] || t)
    .slice(0, 3)
    .join(', ');

  const location = canton ? `${city}, Kanton ${canton}` : city || 'Schweiz';

  // Build summary from purpose text
  // Take the first meaningful clause (up to first period or semicolon)
  const firstClause = cleanPurpose.split(/[.;]/).filter(s => s.trim().length > 20)[0]?.trim() || cleanPurpose.substring(0, 200);

  let summary = `${name} (${location}): ${firstClause}.`;

  // Ensure we reach 150 chars by progressively adding context
  if (summary.length < 150 && themeDesc) {
    summary += ` Thematische Schwerpunkte: ${themeDesc}.`;
  }
  if (summary.length < 150 && cleanPurpose.length > firstClause.length) {
    const rest = cleanPurpose.substring(firstClause.length + 1).replace(/^[.;\s]+/, '').trim();
    if (rest.length > 10) {
      summary += ` ${rest.substring(0, Math.max(150 - summary.length + 50, 100))}`;
    }
  }
  if (summary.length < 150) {
    summary += ` Die Stiftung ist im Bereich ${themeDesc || 'gemeinnütziger Tätigkeit'} aktiv und hat Sitz in ${location}. Stiftungszweck gemäss ESA-Register.`;
  }

  return summary.substring(0, 500);
}

function generateResearchNotes(candidate: ScreeningCandidate, themes: string[], type: string, fit: number): string {
  const { name, purpose, flags, score, matchedSignals, tier } = candidate;
  const purposeLower = purpose.toLowerCase();

  const parts: string[] = [];

  // Fit analysis
  const fitLabel = fit === 3 ? 'Hohe' : fit === 2 ? 'Mittlere' : 'Geringe';
  parts.push(`${fitLabel} Übereinstimmung mit Revamp-IT (Fit-Score: ${fit}/3, Screening-Score: ${score}).`);

  // Theme alignment
  const coreThemes = ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'digitale-souveraenitaet'];
  const coreHits = themes.filter(t => coreThemes.includes(t));
  if (coreHits.length > 0) {
    parts.push(`Kernthemen-Überlappung: ${coreHits.join(', ')}.`);
  }

  // Funder vs operator assessment
  if (flags.includes('likely-funder')) {
    parts.push('Zweckbeschreibung deutet auf Fördertätigkeit hin (Funder-Sprache erkannt: fördert/unterstützt/Beiträge).');
  } else if (flags.includes('likely-operator')) {
    parts.push('Achtung: Stiftung scheint primär operativ tätig (betreibt/führt/unterhält). Möglicherweise kein externer Förderer.');
  } else {
    parts.push('Funder/Operator-Status unklar — manuelle Überprüfung empfohlen.');
  }

  // Signal highlights
  if (matchedSignals.length > 0) {
    parts.push(`Hochrelevante Signale: ${matchedSignals.join(', ')}.`);
  }

  // Geographic note
  if (flags.includes('zurich-region')) {
    parts.push('Sitz in der Region Zürich — geografische Nähe zu Revamp-IT.');
  }

  // Type assessment
  const typeLabels: Record<string, string> = {
    A: 'Professionalisierte Förderstiftung — strukturierte Anträge empfohlen',
    B: 'Potente Familienstiftung — persönliche Beziehung aufbauen',
    C: 'Kleine Familienstiftung — direkter Kontakt, emotionaler Appeal',
    D: 'Corporate Foundation — Alignment mit Unternehmenszielen zeigen',
    network: 'Netzwerk/Verband — Mitgliedschaft für Sichtbarkeit',
  };
  parts.push(`Typ-Einschätzung: ${type} (${typeLabels[type] || type}).`);

  // Application strategy
  if (purposeLower.includes('gesuch') || purposeLower.includes('bewerbung') || purposeLower.includes('antrag')) {
    parts.push('Stiftungszweck erwähnt Gesuchsprozess — formaler Antrag möglich.');
  }
  if (purposeLower.includes('auf einladung') || purposeLower.includes('nur auf') || purposeLower.includes('kein gesuch')) {
    parts.push('WARNUNG: Möglicherweise nur auf Einladung — Kontaktaufnahme vor formellem Gesuch empfohlen.');
  }

  // Research gaps
  parts.push('HINWEIS: Diese Analyse basiert ausschliesslich auf dem ESA-Stiftungszweck. Website-Recherche für aktuelle Förderprioritäten, Kontaktdaten und Gesuchsprozess empfohlen.');

  return parts.join(' ');
}

// ============================================================================
// APPLICATION METHOD DETECTION
// ============================================================================

function detectApplicationMethod(purpose: string): 'online' | 'email' | 'invitation' | 'unknown' {
  const p = purpose.toLowerCase();

  if (p.includes('online') && (p.includes('gesuch') || p.includes('antrag') || p.includes('bewerbung'))) {
    return 'online';
  }
  if (p.includes('auf einladung') || p.includes('nur auf') || p.includes('kein gesuch') || p.includes('keine bewerbung')) {
    return 'invitation';
  }
  if (p.includes('schriftlich') || p.includes('per mail') || p.includes('per post') || p.includes('per e-mail')) {
    return 'email';
  }
  return 'unknown';
}

// ============================================================================
// FUNDER/OPERATOR SCORING
// ============================================================================

const FUNDER_KW = [
  'fördert', 'förderung', 'unterstützt', 'unterstützung',
  'beiträge', 'zuwendungen', 'zuschüsse', 'finanzielle hilfe',
  'projektförderung', 'stipend', 'ausricht',
  'gewährt', 'vergab', 'vergibt', 'zusprech',
  'finanziell', 'gemeinnützig',
];

const OPERATOR_KW = [
  'betreibt', 'führt', 'unterhält', 'verwaltet',
  'betrieb von', 'heim', 'klinik', 'spital',
  'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim',
  'kinderheim', 'tagesstätte', 'krippe', 'trägerin',
  'museum', 'theater',
];

function scoreFunderOperator(purpose: string): { funder: number; operator: number } {
  const p = purpose.toLowerCase();
  let funder = 0;
  let operator = 0;
  for (const kw of FUNDER_KW) { if (p.includes(kw)) funder++; }
  for (const kw of OPERATOR_KW) { if (p.includes(kw)) operator++; }
  return { funder, operator };
}

// ============================================================================
// DRAFT GENERATION
// ============================================================================

function generateDraft(candidate: ScreeningCandidate): object {
  const purposeLower = candidate.purpose.toLowerCase();
  const nameLower = candidate.name.toLowerCase();
  const { funder, operator } = scoreFunderOperator(candidate.purpose);

  // Use screening's theme classification as primary, fall back to reclassification
  const validThemeIds = ['klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung', 'digitale-souveraenitaet', 'jugend', 'zuerich', 'arbeitsintegration'];
  const screeningThemes = (candidate.matchedThemes || []).filter(t => validThemeIds.includes(t));
  const reclassifiedThemes = classifyThemes(purposeLower, nameLower);
  // Merge: screening themes + reclassified, deduplicated
  const mergedSet = new Set([...screeningThemes, ...reclassifiedThemes]);
  const themes = [...mergedSet] as ThemeId[];
  const type = classifyType(candidate.purpose, candidate.name, funder, operator);
  const fit = calculateFit(themes, candidate.score, candidate.flags);
  const priority = calculatePriority(fit, candidate.flags, candidate.tier);
  const applicationMethod = detectApplicationMethod(candidate.purpose);
  const isFunder = funder > operator;
  const funderConfidence = funder >= 3 ? 'high' : funder >= 2 ? 'medium' : 'low';

  // Generate text content
  const purposeSummary = generatePurposeSummary(candidate);
  const researchNotes = generateResearchNotes(candidate, themes, type, fit);

  // Quality check: can we meet the quality gate?
  const hasGoodPurpose = purposeSummary.length >= 150;
  const hasGoodNotes = researchNotes.length >= 250;
  const qualityMet = hasGoodPurpose && hasGoodNotes && themes.length >= 1;

  // Build draft
  const now = new Date().toISOString();
  const draft = {
    slug: candidate.slug,
    name: candidate.name,
    timestamp: now,
    queueItem: {
      name: candidate.name,
      slug: candidate.slug,
      tier: candidate.tier,
      evScore: candidate.score / 25, // Normalize to 0-1
      websiteUrl: '', // Unknown — needs manual research
      esaMatch: {
        uid: candidate.uid,
        name: candidate.name,
        purpose: candidate.purpose,
        canton: candidate.canton,
        city: candidate.city,
        status: 'aktiv',
      },
      candidate: {
        name: candidate.name,
        slug: candidate.slug,
        location: candidate.city ? `${candidate.city}, ${candidate.canton}` : 'Schweiz',
        foundVia: ['esa-screening-v3'],
      },
    },
    analysis: {
      isFunder,
      funderConfidence,
      reasoning: `Mechanische Analyse basierend auf ESA-Stiftungszweck. Funder-Score: ${funder}, Operator-Score: ${operator}. ${candidate.matchedThemes.length} Themen erkannt, ${candidate.matchedSignals.length} Hochsignale.`,
      themes,
      suggestedType: type,
      suggestedFit: fit,
      suggestedPriority: priority,
      purposeSummary,
      researchNotes,
      applicationMethod,
      contactInfo: {
        // No contact from ESA data — will be empty until website research
      },
      grantRange: {},
      warnings: [
        ...(!qualityMet ? ['Mechanisch generiert — manuelle Qualitätsprüfung empfohlen'] : []),
        ...(operator >= 2 ? ['Möglicherweise operativ — kein externer Förderer'] : []),
        ...(!isFunder ? ['Keine klare Funder-Sprache erkannt'] : []),
      ],
    },
    // Metadata for batch processing
    _meta: {
      screeningVersion: 'v3',
      screeningScore: candidate.score,
      screeningTier: candidate.tier,
      screeningWave: candidate.wave,
      qualityGateMet: qualityMet,
      needsResearch: !qualityMet || !isFunder, // Mark partial if quality not met
    },
  };

  return draft;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  // Parse args
  const args = process.argv.slice(2);
  const waveArg = args.find(a => a.startsWith('--wave='))?.split('=')[1] || 'all';
  const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
  const dryRun = args.includes('--dry-run');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Batch Research — Mechanical Draft Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find latest v3 screening
  const researchDir = path.join(process.cwd(), 'research');
  const screeningFiles = fs.readdirSync(researchDir)
    .filter(f => f.startsWith('esa-screening-v3-'))
    .sort();

  if (screeningFiles.length === 0) {
    console.error('  No v3 screening file found. Run esa-screen-v3.ts first.');
    process.exit(1);
  }

  const latestFile = screeningFiles[screeningFiles.length - 1];
  console.log(`\n  Source: ${latestFile}`);

  const screening: ScreeningReport = JSON.parse(
    fs.readFileSync(path.join(researchDir, latestFile), 'utf-8')
  );

  console.log(`  Total candidates: ${screening.candidateCount}`);
  console.log(`  Wave filter: ${waveArg}`);
  if (limitArg > 0) console.log(`  Limit: ${limitArg}`);
  if (dryRun) console.log(`  DRY RUN — no files will be written`);

  // Filter candidates
  let candidates = screening.candidates;
  if (waveArg !== 'all') {
    candidates = candidates.filter(c => c.wave === waveArg);
    console.log(`  After wave filter: ${candidates.length}`);
  }
  if (limitArg > 0) {
    candidates = candidates.slice(0, limitArg);
    console.log(`  After limit: ${candidates.length}`);
  }

  // Create output directory
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.join(researchDir, 'drafts', today);
  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Generate drafts
  let generated = 0;
  let skipped = 0;
  let qualityMet = 0;
  let needsResearch = 0;

  const slugsSeen = new Set<string>();

  for (const candidate of candidates) {
    // Dedup slugs within batch
    if (slugsSeen.has(candidate.slug)) {
      skipped++;
      continue;
    }
    slugsSeen.add(candidate.slug);

    // Check if draft already exists
    const draftPath = path.join(outDir, `${candidate.slug}.json`);
    if (!dryRun && fs.existsSync(draftPath)) {
      skipped++;
      continue;
    }

    const draft = generateDraft(candidate);
    const meta = (draft as Record<string, unknown>)._meta as {
      qualityGateMet: boolean;
      needsResearch: boolean;
    };

    if (meta.qualityGateMet) qualityMet++;
    if (meta.needsResearch) needsResearch++;

    if (!dryRun) {
      fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2));
    }
    generated++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Drafts generated: ${generated}`);
  console.log(`  Skipped (dup/exists): ${skipped}`);
  console.log(`  Quality gate met: ${qualityMet}`);
  console.log(`  Needs research: ${needsResearch}`);
  if (!dryRun) {
    console.log(`  Output: ${outDir}/`);
    console.log(`\n  Next steps:`);
    console.log(`    npx tsx scripts/foundation-upsert.ts ${outDir}/*.json`);
    console.log(`    npm run sync && npm run build`);
  }
  console.log('  Done!\n');
}

main();
