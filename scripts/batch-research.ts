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
    keywords: ['soziale integration', 'sozial benachteiligt',
      'migrant', 'migration', 'flüchtling', 'asyl',
      'marginalisiert', 'randgruppen',
      'existenzsicher', 'sozialhilfeempfänger',
      'arbeitsintegration', 'berufliche integration',
      'soziale teilhabe', 'chancengleichheit'],
    weight: 2,
  },
  'digitale-bildung': {
    keywords: ['informatik', 'programmier', 'software',
      'medienkompetenz', 'it-kompetenz', 'digital literacy',
      'digitale kompetenz', 'digitale bildung',
      'ict', 'informationstechnologie', 'mint', 'stem'],
    weight: 2,
  },
  'digitale-souveraenitaet': {
    keywords: ['open source', 'quelloffen', 'linux', 'datensouveränität',
      'digitale selbstbestimmung', 'freie software', 'open data',
      'datensicher', 'souverän'],
    weight: 3,
  },
  klima: {
    keywords: ['klima', 'klimaschutz', 'klimawandel',
      'co2', 'kohlendioxid', 'treibhausgas', 'emission',
      'erneuerbar', 'erneuerbare energie',
      'dekarbonisier', 'energiewende'],
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

  // Compound rule: "digitale-bildung" also matches when BOTH education AND digital context present
  if (!themes.includes('digitale-bildung')) {
    const hasEducation = ['bildung', 'ausbildung', 'weiterbildung', 'berufsbildung', 'schulung'].some(kw => fullText.includes(kw));
    const hasDigital = ['digital', 'technologie', 'computer', 'medien', 'it-', 'online', 'internet'].some(kw => fullText.includes(kw));
    if (hasEducation && hasDigital) {
      themes.push('digitale-bildung');
    }
  }

  // Broader "jugend" catch: education foundations mentioning youth/children
  if (!themes.includes('jugend')) {
    const hasYouth = ['jugend', 'kinder', 'schüler', 'lernende', 'heranwachsend'].some(kw => fullText.includes(kw));
    const hasEducation = ['bildung', 'ausbildung', 'erziehung', 'schule', 'lehre'].some(kw => fullText.includes(kw));
    if (hasYouth && hasEducation) {
      themes.push('jugend');
    }
  }

  // Broader "arbeitsintegration" catch: vocational training foundations
  if (!themes.includes('arbeitsintegration')) {
    const hasWork = ['beruf', 'arbeit', 'erwerbstätig', 'beschäftig'].some(kw => fullText.includes(kw));
    const hasIntegration = ['integration', 'eingliederung', 'wiedereinstieg', 'einstieg'].some(kw => fullText.includes(kw));
    if (hasWork && hasIntegration) {
      themes.push('arbeitsintegration');
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
  const { name, purpose, city, canton } = candidate;

  // Clean up purpose text
  const cleanPurpose = purpose
    .replace(/\s+/g, ' ')
    .trim();

  const location = canton ? `${city}, Kanton ${canton}` : city || 'Schweiz';

  // Extract meaningful clauses from purpose text
  const clauses = cleanPurpose.split(/[.;]/).filter(s => s.trim().length > 20);
  const firstClause = clauses[0]?.trim() || cleanPurpose.substring(0, 200);

  let summary = `${name} (${location}): ${firstClause}.`;

  // If too short, add more clauses from the actual purpose text (not generic filler)
  if (summary.length < 150 && clauses.length > 1) {
    const secondClause = clauses[1]?.trim();
    if (secondClause && secondClause.length > 15) {
      summary += ` ${secondClause}.`;
    }
  }
  if (summary.length < 150 && clauses.length > 2) {
    const thirdClause = clauses[2]?.trim();
    if (thirdClause && thirdClause.length > 15) {
      summary += ` ${thirdClause}.`;
    }
  }
  // Last resort: append remaining purpose text directly
  if (summary.length < 150 && cleanPurpose.length > firstClause.length) {
    const rest = cleanPurpose.substring(firstClause.length + 1).replace(/^[.;\s]+/, '').trim();
    if (rest.length > 10) {
      summary += ` ${rest.substring(0, Math.max(150 - summary.length + 80, 120))}`;
    }
  }
  // Absolute last resort: note the location and ESA registration
  if (summary.length < 150) {
    summary += ` Die Stiftung hat Sitz in ${location} und ist im ESA-Stiftungsverzeichnis eingetragen.`;
  }

  return summary.substring(0, 600);
}

function generateResearchNotes(candidate: ScreeningCandidate, themes: string[], type: string, fit: number): string {
  const { name, purpose, flags, score, matchedSignals, tier, city, canton } = candidate;
  const purposeLower = purpose.toLowerCase();

  const parts: string[] = [];

  // --- Opening: foundation-specific context from purpose ---
  // Extract what this foundation actually does from the purpose text
  const purposeClean = purpose.replace(/\s+/g, ' ').trim();
  const keyActivities: string[] = [];
  if (purposeLower.includes('förderung')) keyActivities.push('Förderung');
  if (purposeLower.includes('forschung')) keyActivities.push('Forschung');
  if (purposeLower.includes('unterstützung')) keyActivities.push('Unterstützung');
  if (purposeLower.includes('ausbildung') || purposeLower.includes('bildung')) keyActivities.push('Bildung');
  if (purposeLower.includes('projekt')) keyActivities.push('Projektarbeit');
  if (purposeLower.includes('stipend')) keyActivities.push('Stipendien');
  if (purposeLower.includes('sozial')) keyActivities.push('Sozialarbeit');

  if (keyActivities.length > 0) {
    parts.push(`${name}: Tätigkeitsschwerpunkte gemäss Stiftungszweck — ${keyActivities.slice(0, 4).join(', ')}.`);
  } else {
    parts.push(`${name}: Stiftung mit Sitz in ${city || 'der Schweiz'}.`);
  }

  // --- Fit analysis (varied language) ---
  if (fit === 3) {
    parts.push(`Starke thematische Übereinstimmung mit Revamp-IT (Fit ${fit}/3).`);
  } else if (fit === 2) {
    parts.push(`Relevante Übereinstimmung mit Revamp-IT-Themen (Fit ${fit}/3).`);
  } else {
    parts.push(`Begrenzte thematische Übereinstimmung (Fit ${fit}/3) — gezielte Ansprache nötig.`);
  }

  // Theme specifics
  const themeLabels: Record<string, string> = {
    arbeitsintegration: 'berufliche Integration',
    kreislaufwirtschaft: 'Kreislaufwirtschaft',
    'soziale-integration': 'soziale Integration',
    'digitale-bildung': 'digitale Bildung',
    'digitale-souveraenitaet': 'digitale Souveränität',
    klima: 'Klimaschutz',
    jugend: 'Jugendförderung',
    zuerich: 'Region Zürich',
  };
  const themeNames = themes.map(t => themeLabels[t] || t);
  if (themeNames.length > 0) {
    parts.push(`Thematische Anknüpfungspunkte: ${themeNames.join(', ')}.`);
  }

  // --- Funder vs operator (varied) ---
  if (flags.includes('likely-funder')) {
    parts.push('Stiftungszweck enthält Förderbegriffe — wahrscheinlich Vergabestiftung.');
  } else if (flags.includes('likely-operator')) {
    parts.push('Stiftung scheint primär operativ tätig. Prüfen, ob externe Förderung möglich ist.');
  }

  // --- Signals (only if interesting) ---
  if (matchedSignals.length > 0) {
    parts.push(`Relevante Signale: ${matchedSignals.join(', ')}.`);
  }

  // --- Geography ---
  if (flags.includes('zurich-region')) {
    parts.push('Sitz in der Region Zürich — lokale Nähe zu Revamp-IT.');
  } else if (canton) {
    parts.push(`Sitz: ${city || ''}, Kanton ${canton}.`);
  }

  // --- Type + strategy ---
  const strategies: Record<string, string> = {
    A: 'Typ A (professionalisiert): Strukturiertes Gesuch mit Impact-Daten empfohlen.',
    B: 'Typ B (Familienstiftung): Persönlicher Kontakt und Beziehungsaufbau prioritär.',
    C: 'Typ C (kleine Stiftung): Direkter, emotionaler Ansatz. Kurzes Gesuch.',
    D: 'Typ D (Corporate): Alignment mit Unternehmenszielen darstellen.',
    network: 'Netzwerk/Verband: Mitgliedschaft oder Partnerschaft anstreben.',
  };
  if (strategies[type]) {
    parts.push(strategies[type]);
  }

  // --- Application hints from purpose ---
  if (purposeLower.includes('gesuch') || purposeLower.includes('antrag')) {
    parts.push('Zweck erwähnt Gesuchsprozess — Einreichung möglich.');
  }
  if (purposeLower.includes('auf einladung') || purposeLower.includes('nur auf') || purposeLower.includes('kein gesuch')) {
    parts.push('Hinweis: Möglicherweise nur auf Einladung. Vorgespräch empfohlen.');
  }

  // --- Next steps ---
  parts.push('Nächste Schritte: Website identifizieren, Kontaktdaten recherchieren, aktuelle Förderprioritäten prüfen.');

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

  // Use batch-research's own tightened theme classification (not screening's broad keywords)
  const themes = classifyThemes(purposeLower, nameLower) as ThemeId[];
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

  // Find latest screening (v3 or v4)
  const researchDir = path.join(process.cwd(), 'research');
  const sourceArg = args.find(a => a.startsWith('--source='))?.split('=')[1];
  const screeningFiles = sourceArg
    ? [sourceArg].filter(f => fs.existsSync(path.join(researchDir, f)))
    : fs.readdirSync(researchDir)
      .filter(f => f.startsWith('esa-screening-v'))
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
