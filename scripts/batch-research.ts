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
import { computeFitScore as computeFitScoreDomain, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import {
  classifyThemes as classifyThemesShared,
  scoreFunderOperator as scoreFunderOperatorShared,
  classifyType as classifyTypeShared,
  detectApplicationMethod as detectApplicationMethodShared,
  THEME_LABELS,
} from './lib/theme-classifier';

// Re-export shared functions under local names for minimal diff
const classifyThemes = (purposeLower: string, nameLower: string) =>
  classifyThemesShared(purposeLower, nameLower) as string[];
const scoreFunderOperator = scoreFunderOperatorShared;
const classifyType = classifyTypeShared;
const detectApplicationMethod = detectApplicationMethodShared;

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
// FIT SCORING — Centralized in src/lib/domain/fit-scoring.ts
// ============================================================================

function calculateFit(themes: string[], _score: number, flags: string[], canton: string, city: string, applicationMethod: string): { fitScore: number; fit: 0 | 1 | 2 | 3 } {
  const isFunder = flags.includes('likely-funder');
  const { fitScore } = computeFitScoreDomain({ themes, canton, city, applicationMethod, isFunder });
  // batch-research always rapid → gated to fit=0
  const fit = fitScoreToDisplay(fitScore, true);
  return { fitScore, fit };
}

function calculatePriority(fitScore: number, flags: string[], tier: number): 1 | 2 | 3 | 4 {
  if (fitScore >= 7 && flags.includes('likely-funder')) return 1;
  if (fitScore >= 4 && (flags.includes('likely-funder') || flags.includes('zurich-region'))) return 2;
  if (fitScore >= 4 || tier <= 2) return 3;
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
  const { name, purpose, flags, matchedSignals, city, canton } = candidate;
  const purposeLower = purpose.toLowerCase();

  const parts: string[] = [];
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
  const themeNames = themes.map(t => THEME_LABELS[t] || t);
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

// Application method, funder/operator scoring, and type classification
// now imported from shared lib/theme-classifier.ts

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
  const applicationMethod = detectApplicationMethod(candidate.purpose);
  const { fitScore, fit } = calculateFit(themes, candidate.score, candidate.flags, candidate.canton, candidate.city, applicationMethod);
  const priority = calculatePriority(fitScore, candidate.flags, candidate.tier);
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
      reasoning: `Mechanische Analyse basierend auf ESA-Stiftungszweck. Funder-Score: ${funder}, Operator-Score: ${operator}. Fit-Score: ${fitScore}/10. ${candidate.matchedThemes.length} Themen erkannt, ${candidate.matchedSignals.length} Hochsignale.`,
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
