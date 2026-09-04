#!/usr/bin/env tsx
/**
 * Pipeline Incremental — One command to add new foundations from ESA register
 *
 * Diffs the ESA register against the DB, generates drafts for new entries,
 * upserts them, and triggers sync. Replaces the manual multi-step workflow:
 *   esa-bulk-ingest → foundation-upsert → sync
 *
 * Usage:
 *   npx tsx scripts/pipeline-incremental.ts [--dry-run] [--limit N]
 *   npm run pipeline:incremental
 *
 * Steps:
 *   1. Read ESA register (source of truth for Swiss foundations)
 *   2. Read existing slugs + UIDs from the foundation DB
 *   3. Generate drafts for missing entries
 *   4. Upsert new drafts directly to DB
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { sql, type SqlClient } from './lib/db';
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

import type { ResearchDepth } from './lib/utilities';
import { requireOrgId } from './lib/require-org';
import { splitFoundationPatch, upsertAssessment } from './lib/assessment-write';

// Resolved before any work begins: a run that cannot say whose data it is
// producing should fail at the start, not after writing half a register.
const ORG_ID = requireOrgId();

// ============================================================================
// DRAFT GENERATION (same logic as esa-bulk-ingest.ts)
// ============================================================================

function generatePurposeSummary(entry: EsaEntry): string {
  const cleanPurpose = entry.purpose.replace(/\s+/g, ' ').trim();
  const location = entry.canton ? `${entry.city}, Kanton ${entry.canton}` : entry.city || 'Schweiz';
  const clauses = cleanPurpose.split(/[.;]/).filter((s) => s.trim().length > 20);
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
    const rest = cleanPurpose
      .substring(firstClause.length + 1)
      .replace(/^[.;\s]+/, '')
      .trim();
    if (rest.length > 10)
      summary += ` ${rest.substring(0, Math.max(150 - summary.length + 80, 120))}`;
  }
  if (summary.length < 150) {
    summary += ` Die Stiftung hat Sitz in ${location} und ist im ESA-Stiftungsverzeichnis eingetragen.`;
  }

  return summary.substring(0, 600);
}

function generateResearchNotes(
  entry: EsaEntry,
  themes: string[],
  type: string,
  funder: number,
  operator: number,
): string {
  const purposeLower = entry.purpose.toLowerCase();
  const parts: string[] = [];

  const activities: string[] = [];
  if (purposeLower.includes('förderung')) activities.push('Förderung');
  if (purposeLower.includes('forschung')) activities.push('Forschung');
  if (purposeLower.includes('unterstützung')) activities.push('Unterstützung');
  if (purposeLower.includes('ausbildung') || purposeLower.includes('bildung'))
    activities.push('Bildung');
  if (purposeLower.includes('projekt')) activities.push('Projektarbeit');
  if (purposeLower.includes('stipend')) activities.push('Stipendien');
  if (purposeLower.includes('sozial')) activities.push('Sozialarbeit');

  if (activities.length > 0) {
    parts.push(
      `${entry.name}: Tätigkeitsschwerpunkte gemäss Stiftungszweck — ${activities.slice(0, 4).join(', ')}.`,
    );
  } else {
    parts.push(`${entry.name}: Stiftung mit Sitz in ${entry.city || 'der Schweiz'}.`);
  }

  const isFunder = funder > operator;
  if (isFunder) {
    parts.push('Stiftungszweck enthält Förderbegriffe — wahrscheinlich Vergabestiftung.');
  } else if (operator >= 2) {
    parts.push('Stiftung scheint primär operativ tätig. Prüfen, ob externe Förderung möglich ist.');
  } else {
    parts.push('Keine klare Funder-/Operator-Zuordnung aus dem Stiftungszweck erkennbar.');
  }

  if (themes.length > 0) {
    parts.push(
      `Thematische Anknüpfungspunkte: ${themes.map((t) => THEME_LABELS[t] || t).join(', ')}.`,
    );
  } else {
    parts.push('Keine direkten thematischen Anknüpfungspunkte für Revamp-IT erkannt.');
  }

  if (entry.canton) {
    parts.push(`Sitz: ${entry.city || ''}, Kanton ${entry.canton}.`);
  } else if (entry.city) {
    parts.push(`Sitz: ${entry.city}.`);
  }

  const strategies: Record<string, string> = {
    A: 'Typ A (professionalisiert): Strukturiertes Gesuch mit Impact-Daten empfohlen.',
    B: 'Typ B (Familienstiftung): Persönlicher Kontakt und Beziehungsaufbau prioritär.',
    C: 'Typ C (kleine Stiftung): Direkter, emotionaler Ansatz. Kurzes Gesuch.',
    D: 'Typ D (Corporate): Alignment mit Unternehmenszielen darstellen.',
    network: 'Netzwerk/Verband: Mitgliedschaft oder Partnerschaft anstreben.',
  };
  if (strategies[type]) parts.push(strategies[type]);

  parts.push(
    'Automatisch aus ESA-Register importiert. Manuelle Recherche für Website, Kontaktdaten und aktuelle Förderprioritäten empfohlen.',
  );

  return parts.join(' ');
}

// ============================================================================
// DB UPSERT (inline — no draft files needed)
// ============================================================================

async function upsertEntry(
  sql: SqlClient,
  entry: EsaEntry,
): Promise<{ success: boolean; depth: ResearchDepth }> {
  const slug = toSlug(entry.name);
  const purposeLower = entry.purpose.toLowerCase();
  const nameLower = entry.name.toLowerCase();
  const { funder, operator } = scoreFunderOperator(entry.purpose);
  const themes = classifyThemes(purposeLower, nameLower);
  const type = classifyType(entry.purpose, entry.name, funder, operator);
  const applicationMethod = detectApplicationMethod(entry.purpose);
  const isFunder = funder > operator;

  const { fitScore } = computeFitScore({
    themes,
    canton: entry.canton || '',
    city: entry.city || '',
    applicationMethod,
    isFunder,
  });
  const researchDepth: ResearchDepth = 'rapid';
  const fitDisplay = fitScoreToDisplay(fitScore, researchDepth === 'rapid');
  // Rapid foundations are always P4 — not enough data to be actionable
  const priority: 1 | 2 | 3 | 4 = 4;

  const purposeSummary = generatePurposeSummary(entry);
  const researchNotes = generateResearchNotes(entry, themes, type, funder, operator);
  const _suggestedFit: 1 | 2 | 3 = fitScore >= 7 ? 3 : fitScore >= 4 ? 2 : 1;

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const registryData = {
    slug,
    name: entry.name,
    uid: entry.uid,
    websiteUrl: '',
    officialPurpose: entry.purpose,
    region: entry.city || 'Schweiz',
    contact: {},
    applicationMethod,
    isOperative: !isFunder,
    status: 'rolling',
    deadlineText: 'Unbekannt',
    amount: { min: null, max: null, text: 'Unbekannt' },
    source: 'esa',
    purposeSummary,
    sourceLinks: [],
  };

  const configData = {
    ...registryData,
    type,
    fit: fitDisplay,
    fitScore,
    priority,
    tagline: purposeSummary.substring(0, 80),
    themes,
    researchDate: today,
    researchNotes,
    researchDepth,
  };

  // The scrape describes a foundation and scores it for this organisation, and
  // those belong to different tables. Analysis fields left in config_data are
  // dropped by the app's composition, so they would be written nowhere.
  const { registry, analysis } = splitFoundationPatch(configData);

  try {
    // RETURNING tells us whether the row was actually inserted. On conflict
    // this statement does nothing and returns no rows — and the assessment must
    // not be written either. A foundation already in the registry may carry an
    // assessment somebody made deliberately, and overwriting it with a fresh
    // register-derived guess would silently discard real work.
    const inserted = await sql<{ id: string }>`
      INSERT INTO fundraising_foundations (
        id, name,
        source, config_data, org_id,
        created_at, updated_at, archived
      ) VALUES (
        ${slug}, ${entry.name},
        ${'automated-research'}, ${JSON.stringify(registry)},
        ${ORG_ID}, ${now}, ${now}, false
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length > 0) {
      await upsertAssessment(ORG_ID, slug, analysis);
    }

    return { success: true, depth: researchDepth };
  } catch (err) {
    console.error(`    ${entry.name}: ${err instanceof Error ? err.message : err}`);
    return { success: false, depth: researchDepth };
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Pipeline Incremental — Diff ESA → generate → upsert → sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Read ESA register
  const esaPath = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
  if (!fs.existsSync(esaPath)) {
    console.error(`  ESA register not found: ${esaPath}`);
    process.exit(1);
  }
  const register: EsaRegister = JSON.parse(fs.readFileSync(esaPath, 'utf-8'));
  console.log(`\n  ESA register: ${register.foundations.length} entries`);

  // 2. Read existing slugs + UIDs from the foundation DB
  const existingRows = await sql<{ id: string; uid: string | null }>`
    SELECT id, config_data->>'uid' AS uid FROM fundraising_foundations
  `;
  const existingSlugs = new Set(existingRows.map((r) => r.id));
  const existingUids = new Set(
    existingRows
      .map((r) => r.uid)
      .filter((uid): uid is string => !!uid && uid !== 'CHE-XXX.XXX.XXX'),
  );
  console.log(`  Existing in DB: ${existingSlugs.size} slugs`);

  // 3. Filter to missing entries
  const missing: EsaEntry[] = [];
  const slugsSeen = new Set<string>();

  for (const entry of register.foundations) {
    if (!entry.purpose || entry.purpose.length < 10) continue;
    if (entry.status && entry.status !== 'aktiv') continue;

    const slug = toSlug(entry.name);
    if (existingSlugs.has(slug)) continue;
    if (entry.uid && existingUids.has(entry.uid)) continue;
    if (slugsSeen.has(slug)) continue;
    slugsSeen.add(slug);
    missing.push(entry);
  }

  console.log(`  New (not in DB): ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n  Everything is up to date. Nothing to do.');
    console.log('  Done!\n');
    return;
  }

  let toProcess = missing;
  if (limitArg > 0) {
    toProcess = missing.slice(0, limitArg);
    console.log(`  Limit applied: processing ${toProcess.length}`);
  }
  if (dryRun) console.log('  DRY RUN — no DB writes, no sync');

  // 4. Upsert to DB
  if (!dryRun) {
    if (!process.env.DATABASE_URL) {
      console.error('  DATABASE_URL not set. Check .env.local');
      process.exit(1);
    }

    let success = 0;
    let errors = 0;
    let withThemes = 0;

    console.log(`\n  Upserting ${toProcess.length} new foundations...`);

    for (const entry of toProcess) {
      const result = await upsertEntry(sql, entry);
      if (result.success) {
        success++;
        const _slug = toSlug(entry.name);
        const purposeLower = entry.purpose.toLowerCase();
        const nameLower = entry.name.toLowerCase();
        const themes = classifyThemes(purposeLower, nameLower);
        if (themes.length > 0) withThemes++;
      } else {
        errors++;
      }
    }

    console.log(`\n  Upserted: ${success}, Errors: ${errors}, With themes: ${withThemes}`);
  } else {
    let withThemes = 0;
    for (const entry of toProcess) {
      const purposeLower = entry.purpose.toLowerCase();
      const nameLower = entry.name.toLowerCase();
      const themes = classifyThemes(purposeLower, nameLower);
      if (themes.length > 0) withThemes++;
    }
    console.log(`\n  Would upsert ${toProcess.length} foundations (${withThemes} with themes)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
