#!/usr/bin/env tsx
/**
 * ESA Bulk Ingest — Ingest ALL remaining ESA foundations not yet in DB
 *
 * Reads the ESA register, filters out foundations already in stiftungen-generated.ts,
 * generates ResearchDraft JSONs for the rest, then upserts them to the DB.
 *
 * WHY: We're building a universal Swiss foundation database to serve multiple
 * Vereine. Every ESA foundation should exist in the registry — org-specific
 * scoring is a layer on top.
 *
 * Usage:
 *   npx tsx scripts/esa-bulk-ingest.ts [--dry-run] [--limit N]
 *
 * Pipeline:
 *   1. Read ESA register (5,392 entries)
 *   2. Read existing slugs from stiftungen-generated.ts
 *   3. Generate drafts for missing entries
 *   4. Write to research/drafts/YYYY-MM-DD/
 *   5. Then run: npx tsx scripts/foundation-upsert.ts research/drafts/YYYY-MM-DD/
 */

import * as fs from 'fs';
import * as path from 'path';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import {
  classifyThemes,
  scoreFunderOperator,
  classifyType,
  detectApplicationMethod,
  toSlug,
  THEME_LABELS,
} from './lib/theme-classifier';

// ============================================================================
// TYPES
// ============================================================================

interface EsaEntry {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface EsaRegister {
  downloadDate: string;
  source: string;
  count: number;
  foundations: EsaEntry[];
}

// ============================================================================
// PURPOSE SUMMARY & RESEARCH NOTES
// ============================================================================

function generatePurposeSummary(entry: EsaEntry): string {
  const cleanPurpose = entry.purpose.replace(/\s+/g, ' ').trim();
  const location = entry.canton ? `${entry.city}, Kanton ${entry.canton}` : entry.city || 'Schweiz';
  const clauses = cleanPurpose.split(/[.;]/).filter(s => s.trim().length > 20);
  const firstClause = clauses[0]?.trim() || cleanPurpose.substring(0, 200);

  let summary = `${entry.name} (${location}): ${firstClause}.`;

  if (summary.length < 150 && clauses.length > 1) {
    const second = clauses[1]?.trim();
    if (second && second.length > 15) summary += ` ${second}.`;
  }
  if (summary.length < 150 && clauses.length > 2) {
    const third = clauses[2]?.trim();
    if (third && third.length > 15) summary += ` ${third}.`;
  }
  if (summary.length < 150 && cleanPurpose.length > firstClause.length) {
    const rest = cleanPurpose.substring(firstClause.length + 1).replace(/^[.;\s]+/, '').trim();
    if (rest.length > 10) summary += ` ${rest.substring(0, Math.max(150 - summary.length + 80, 120))}`;
  }
  if (summary.length < 150) {
    summary += ` Die Stiftung hat Sitz in ${location} und ist im ESA-Stiftungsverzeichnis eingetragen.`;
  }

  return summary.substring(0, 600);
}

function generateResearchNotes(entry: EsaEntry, themes: string[], type: string, funder: number, operator: number): string {
  const purposeLower = entry.purpose.toLowerCase();
  const parts: string[] = [];

  // Key activities
  const activities: string[] = [];
  if (purposeLower.includes('förderung')) activities.push('Förderung');
  if (purposeLower.includes('forschung')) activities.push('Forschung');
  if (purposeLower.includes('unterstützung')) activities.push('Unterstützung');
  if (purposeLower.includes('ausbildung') || purposeLower.includes('bildung')) activities.push('Bildung');
  if (purposeLower.includes('projekt')) activities.push('Projektarbeit');
  if (purposeLower.includes('stipend')) activities.push('Stipendien');
  if (purposeLower.includes('sozial')) activities.push('Sozialarbeit');

  if (activities.length > 0) {
    parts.push(`${entry.name}: Tätigkeitsschwerpunkte gemäss Stiftungszweck — ${activities.slice(0, 4).join(', ')}.`);
  } else {
    parts.push(`${entry.name}: Stiftung mit Sitz in ${entry.city || 'der Schweiz'}.`);
  }

  // Funder/operator
  const isFunder = funder > operator;
  if (isFunder) {
    parts.push('Stiftungszweck enthält Förderbegriffe — wahrscheinlich Vergabestiftung.');
  } else if (operator >= 2) {
    parts.push('Stiftung scheint primär operativ tätig. Prüfen, ob externe Förderung möglich ist.');
  } else {
    parts.push('Keine klare Funder-/Operator-Zuordnung aus dem Stiftungszweck erkennbar.');
  }

  // Themes
  if (themes.length > 0) {
    parts.push(`Thematische Anknüpfungspunkte: ${themes.map(t => THEME_LABELS[t] || t).join(', ')}.`);
  } else {
    parts.push('Keine direkten thematischen Anknüpfungspunkte für Revamp-IT erkannt.');
  }

  // Geography
  if (entry.canton) {
    parts.push(`Sitz: ${entry.city || ''}, Kanton ${entry.canton}.`);
  } else if (entry.city) {
    parts.push(`Sitz: ${entry.city}.`);
  }

  // Type strategy
  const strategies: Record<string, string> = {
    A: 'Typ A (professionalisiert): Strukturiertes Gesuch mit Impact-Daten empfohlen.',
    B: 'Typ B (Familienstiftung): Persönlicher Kontakt und Beziehungsaufbau prioritär.',
    C: 'Typ C (kleine Stiftung): Direkter, emotionaler Ansatz. Kurzes Gesuch.',
    D: 'Typ D (Corporate): Alignment mit Unternehmenszielen darstellen.',
    network: 'Netzwerk/Verband: Mitgliedschaft oder Partnerschaft anstreben.',
  };
  if (strategies[type]) parts.push(strategies[type]);

  parts.push('Automatisch aus ESA-Register importiert. Manuelle Recherche für Website, Kontaktdaten und aktuelle Förderprioritäten empfohlen.');

  return parts.join(' ');
}

// ============================================================================
// DRAFT GENERATION
// ============================================================================

function generateDraft(entry: EsaEntry): object {
  const slug = toSlug(entry.name);
  const purposeLower = entry.purpose.toLowerCase();
  const nameLower = entry.name.toLowerCase();
  const { funder, operator } = scoreFunderOperator(entry.purpose);
  const themes = classifyThemes(purposeLower, nameLower);
  const type = classifyType(entry.purpose, entry.name, funder, operator);
  const applicationMethod = detectApplicationMethod(entry.purpose);
  const isFunder = funder > operator;
  const funderConfidence = funder >= 3 ? 'high' : funder >= 2 ? 'medium' : 'low';

  const { fitScore } = computeFitScore({
    themes, canton: entry.canton || '', city: entry.city || '',
    applicationMethod, isFunder,
  });
  // suggestedFit is the raw assessment (1-3), NOT the display value (which gets gated to 0 for rapid)
  const suggestedFit: 1 | 2 | 3 = fitScore >= 7 ? 3 : fitScore >= 4 ? 2 : 1;

  const purposeSummary = generatePurposeSummary(entry);
  const researchNotes = generateResearchNotes(entry, themes, type, funder, operator);

  return {
    slug,
    name: entry.name,
    timestamp: new Date().toISOString(),
    queueItem: {
      name: entry.name,
      slug,
      tier: 4, // Unscreened → lowest tier
      evScore: 0.1,
      websiteUrl: '',
      esaMatch: {
        uid: entry.uid,
        name: entry.name,
        purpose: entry.purpose,
        canton: entry.canton || '',
        city: entry.city || '',
        status: entry.status || 'aktiv',
      },
      candidate: {
        name: entry.name,
        slug,
        location: entry.city ? `${entry.city}${entry.canton ? `, ${entry.canton}` : ''}` : 'Schweiz',
        foundVia: ['esa-bulk-ingest'],
      },
    },
    analysis: {
      isFunder,
      funderConfidence: funderConfidence as 'high' | 'medium' | 'low',
      reasoning: `Bulk-Import aus ESA-Register. Funder-Score: ${funder}, Operator-Score: ${operator}. Keine manuelle Prüfung.`,
      themes,
      suggestedType: type,
      suggestedFit,
      suggestedPriority: 4,
      purposeSummary,
      researchNotes,
      applicationMethod,
      contactInfo: {},
      grantRange: {},
      warnings: ['Bulk-Import — keine manuelle Prüfung, keine Website-Recherche'],
    },
    _meta: {
      source: 'esa-bulk-ingest',
      importDate: new Date().toISOString().split('T')[0],
    },
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ESA Bulk Ingest — Import all remaining ESA foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Read ESA register
  const esaPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  if (!fs.existsSync(esaPath)) {
    console.error(`  ESA register not found: ${esaPath}`);
    process.exit(1);
  }
  const register: EsaRegister = JSON.parse(fs.readFileSync(esaPath, 'utf-8'));
  console.log(`\n  ESA register: ${register.foundations.length} entries`);

  // 2. Read existing slugs from stiftungen-generated.ts
  const genPath = path.join(process.cwd(), 'src', 'lib', 'config', 'foundations', 'stiftungen-generated.ts');
  const genContent = fs.readFileSync(genPath, 'utf-8');
  const existingSlugs = new Set<string>();
  const slugMatches = genContent.matchAll(/"slug":\s*"([^"]+)"/g);
  for (const m of slugMatches) {
    existingSlugs.add(m[1]);
  }
  console.log(`  Existing in DB: ${existingSlugs.size} slugs`);

  // Also collect existing UIDs for dedup
  const existingUids = new Set<string>();
  const uidMatches = genContent.matchAll(/"uid":\s*"([^"]+)"/g);
  for (const m of uidMatches) {
    if (m[1] && m[1] !== '' && m[1] !== 'CHE-XXX.XXX.XXX') existingUids.add(m[1]);
  }

  // 3. Filter to missing entries
  const missing: EsaEntry[] = [];
  const slugsSeen = new Set<string>();

  for (const entry of register.foundations) {
    if (!entry.purpose || entry.purpose.length < 10) continue; // Skip entries with no real purpose
    if (entry.status && entry.status !== 'aktiv') continue; // Skip inactive

    const slug = toSlug(entry.name);
    if (existingSlugs.has(slug)) continue; // Already in DB by slug
    if (entry.uid && existingUids.has(entry.uid)) continue; // Already in DB by UID
    if (slugsSeen.has(slug)) continue; // Dedup within batch
    slugsSeen.add(slug);
    missing.push(entry);
  }

  console.log(`  Missing (not in DB): ${missing.length}`);

  let toProcess = missing;
  if (limitArg > 0) {
    toProcess = missing.slice(0, limitArg);
    console.log(`  Limit applied: processing ${toProcess.length}`);
  }
  if (dryRun) console.log('  DRY RUN — no files will be written');

  // 4. Generate drafts
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.join(process.cwd(), 'research', 'drafts', today);
  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;
  let withThemes = 0;
  let withoutThemes = 0;

  for (const entry of toProcess) {
    const slug = toSlug(entry.name);
    const draftPath = path.join(outDir, `${slug}.json`);

    // Skip if draft already exists
    if (!dryRun && fs.existsSync(draftPath)) {
      skipped++;
      continue;
    }

    const draft = generateDraft(entry);
    const themes = (draft as { analysis: { themes: string[] } }).analysis.themes;
    if (themes.length > 0) withThemes++;
    else withoutThemes++;

    if (!dryRun) {
      fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2));
    }
    generated++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Drafts generated: ${generated}`);
  console.log(`  Skipped (exists): ${skipped}`);
  console.log(`  With themes:      ${withThemes}`);
  console.log(`  Without themes:   ${withoutThemes}`);
  if (!dryRun && generated > 0) {
    console.log(`  Output: ${outDir}/`);
    console.log(`\n  Next steps:`);
    console.log(`    npx tsx scripts/foundation-upsert.ts ${outDir}/`);
    console.log(`    npm run sync && npm run build`);
  }
  console.log('  Done!\n');
}

main();
