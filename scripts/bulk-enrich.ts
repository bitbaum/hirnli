#!/usr/bin/env tsx
/**
 * Bulk Foundation Enrichment — Cross-source data backfill
 *
 * Reads all foundations from DB (via sync pipeline) and enriches them using
 * data we already have from cheap sources:
 *
 *   1. ESA purpose text → theme classification (classifyThemes)
 *   2. ESA city/canton → address backfill (buildAddress)
 *   3. ESA purpose text → funder/operator classification (scoreFunderOperator)
 *   4. Fundraiso discovery → website URL matching (by name/slug)
 *
 * This script does NOT write to DB directly. It produces enrichment drafts
 * that feed into foundation-upsert.ts (same pipeline as deep research).
 *
 * The goal: promote ~4,000-6,000 foundations from verzeichnet → erfasst/profiliert
 * without any human research time.
 *
 * Usage:
 *   npx tsx scripts/bulk-enrich.ts --dry-run       # Preview changes
 *   npx tsx scripts/bulk-enrich.ts                  # Write drafts
 *   npx tsx scripts/bulk-enrich.ts --stats-only     # Just show current tier distribution
 *
 * Output:
 *   research/bulk-enrichment/YYYY-MM-DD/  (one JSON per enriched foundation)
 *
 * Next steps after running:
 *   npx tsx scripts/foundation-upsert.ts research/bulk-enrichment/YYYY-MM-DD/
 *   npm run sync && npm run build
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { classifyThemes, scoreFunderOperator, classifyType } from './lib/theme-classifier';
import { isRegistryUrl } from '../src/lib/config/registry-domains';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import type { Foundation } from '../src/lib/schemas/foundation';

// ============================================================================
// CONFIG
// ============================================================================

const ESA_PATH = path.join(process.cwd(), 'research', 'esa-register-2026-02-16.json');
const FUNDRAISO_PATH = path.join(process.cwd(), 'research', 'fundraiso-discovery-2026-02-16.json');

// Canton full names for address building
const CANTON_NAMES: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen',
  AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen',
  GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau', TI: 'Tessin', VD: 'Waadt',
  VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};

// ============================================================================
// TYPES
// ============================================================================

interface ESAEntry {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface ESARegister {
  downloadDate: string;
  source: string;
  count: number;
  foundations: ESAEntry[];
}

interface FundraisoEntry {
  name: string;
  slug: string;
  location: string;
  foundVia: string[];
  url?: string;
}

interface FundraisoDiscovery {
  meta: { uniqueFoundations: number };
  foundations: FundraisoEntry[];
}

interface EnrichmentChange {
  slug: string;
  name: string;
  field: string;
  from: string;
  to: string;
}

interface TierCounts {
  verzeichnet: number;
  erfasst: number;
  profiliert: number;
  recherchiert: number;
  anwendungsbereit: number;
}

// Foundation row from DB
interface DBRow {
  id: string;
  name: string;
  config_data: Foundation;
}

// ============================================================================
// HELPERS
// ============================================================================

function buildAddress(city: string, canton: string): string {
  const cantonName = CANTON_NAMES[canton] || canton;
  if (city && cantonName) return `${city}, Kanton ${cantonName}, Schweiz`;
  if (city) return `${city}, Schweiz`;
  return 'Schweiz';
}

// isRegistryUrl imported from src/lib/config/registry-domains

/** Normalize name for fuzzy matching */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

/** Compute quality tier for a foundation (mirrors foundation-helpers.ts logic) */
function getQualityTier(f: Foundation): string {
  const realWeb = !!f.websiteUrl && !isRegistryUrl(f.websiteUrl);
  const directContact = !!(f.contact?.email || f.contact?.phone);
  const hasAppUrl = !!f.applicationUrl;
  const hasGrantRange = !!(f.amount?.min || f.amount?.max);
  const hasThemes = f.themes.length > 0;
  const hasContactInfo = directContact || !!f.contact?.address;
  const hasRegistryData = !!f.officialPurpose || hasThemes || (f.fitScore ?? 0) > 0;

  if (realWeb && directContact && hasAppUrl && hasGrantRange) return 'anwendungsbereit';
  if (realWeb && directContact) return 'recherchiert';
  if (hasThemes && hasContactInfo) return 'profiliert';
  if (hasRegistryData) return 'erfasst';
  return 'verzeichnet';
}

function computeTierCounts(foundations: Foundation[]): TierCounts {
  const counts: TierCounts = { verzeichnet: 0, erfasst: 0, profiliert: 0, recherchiert: 0, anwendungsbereit: 0 };
  for (const f of foundations) {
    const tier = getQualityTier(f) as keyof TierCounts;
    counts[tier]++;
  }
  return counts;
}

// ============================================================================
// LOADING DATA
// ============================================================================

function loadESA(): Map<string, ESAEntry> {
  if (!fs.existsSync(ESA_PATH)) {
    console.log('  ESA register not found, skipping ESA enrichment');
    return new Map();
  }
  const data: ESARegister = JSON.parse(fs.readFileSync(ESA_PATH, 'utf-8'));
  console.log(`  ESA register: ${data.foundations.length} entries`);

  // Index by UID for fast lookup
  const byUid = new Map<string, ESAEntry>();
  for (const entry of data.foundations) {
    byUid.set(entry.uid, entry);
  }
  return byUid;
}

function loadFundraiso(): { byName: Map<string, FundraisoEntry>; bySlug: Map<string, FundraisoEntry> } {
  if (!fs.existsSync(FUNDRAISO_PATH)) {
    console.log('  Fundraiso discovery not found, skipping Fundraiso matching');
    return { byName: new Map(), bySlug: new Map() };
  }
  const data: FundraisoDiscovery = JSON.parse(fs.readFileSync(FUNDRAISO_PATH, 'utf-8'));
  console.log(`  Fundraiso discovery: ${data.foundations.length} entries`);

  const byName = new Map<string, FundraisoEntry>();
  const bySlug = new Map<string, FundraisoEntry>();
  for (const entry of data.foundations) {
    byName.set(normalizeName(entry.name), entry);
    bySlug.set(entry.slug, entry);
  }
  return { byName, bySlug };
}

async function loadFoundationsFromDB(): Promise<DBRow[]> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, name, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
    ORDER BY id
  `;
  return rows as unknown as DBRow[];
}

// ============================================================================
// ENRICHMENT LOGIC
// ============================================================================

interface EnrichmentResult {
  foundation: Foundation;
  changes: EnrichmentChange[];
  wasEnriched: boolean;
}

function enrichFoundation(
  f: Foundation,
  esaByUid: Map<string, ESAEntry>,
  fundraisoByName: Map<string, FundraisoEntry>,
  fundraisoBySlug: Map<string, FundraisoEntry>,
): EnrichmentResult {
  const changes: EnrichmentChange[] = [];
  // Work on a shallow copy of config_data fields
  const enriched = { ...f, contact: { ...f.contact }, amount: { ...f.amount } };

  // --- 1. ESA Purpose → Theme Classification ---
  const esa = f.uid ? esaByUid.get(f.uid) : undefined;

  // Backfill officialPurpose from ESA if missing
  if (!enriched.officialPurpose && esa?.purpose) {
    enriched.officialPurpose = esa.purpose;
    changes.push({
      slug: f.slug, name: f.name,
      field: 'officialPurpose',
      from: '(empty)',
      to: `ESA purpose (${esa.purpose.length} chars)`,
    });
  }

  // Theme classification from purpose + name
  const purposeText = enriched.officialPurpose || '';
  if (enriched.themes.length === 0 && purposeText.length > 20) {
    const classified = classifyThemes(purposeText.toLowerCase(), enriched.name.toLowerCase());
    if (classified.length > 0) {
      enriched.themes = classified;
      changes.push({
        slug: f.slug, name: f.name,
        field: 'themes',
        from: '[]',
        to: JSON.stringify(classified),
      });
    }
  }

  // --- 2. ESA City/Canton → Address Backfill ---
  if (!enriched.contact?.address && esa?.city) {
    const address = buildAddress(esa.city, esa.canton);
    enriched.contact = enriched.contact || {};
    enriched.contact.address = address;
    changes.push({
      slug: f.slug, name: f.name,
      field: 'contact.address',
      from: '(empty)',
      to: address,
    });
  }

  // Region backfill from ESA city
  if ((!enriched.region || enriched.region === 'Schweiz') && esa?.city) {
    enriched.region = esa.city;
    changes.push({
      slug: f.slug, name: f.name,
      field: 'region',
      from: enriched.region || 'Schweiz',
      to: esa.city,
    });
  }

  // --- 3. Funder/Operator Classification ---
  if (enriched.isOperative === undefined && purposeText.length > 20) {
    const scores = scoreFunderOperator(purposeText);
    const isOperative = scores.operator > scores.funder && scores.operator >= 2;
    enriched.isOperative = isOperative;
    if (isOperative) {
      changes.push({
        slug: f.slug, name: f.name,
        field: 'isOperative',
        from: 'undefined',
        to: `true (funder=${scores.funder}, operator=${scores.operator})`,
      });
    }
  }

  // Type classification from ESA purpose
  if (enriched.type === 'C' && purposeText.length > 50) {
    const scores = scoreFunderOperator(purposeText);
    const newType = classifyType(purposeText, enriched.name, scores.funder, scores.operator);
    if (newType !== 'C') {
      changes.push({
        slug: f.slug, name: f.name,
        field: 'type',
        from: enriched.type,
        to: newType,
      });
      enriched.type = newType;
    }
  }

  // --- 4. Fundraiso Website URL Matching ---
  if (isRegistryUrl(enriched.websiteUrl)) {
    const normalizedName = normalizeName(enriched.name);
    const fundraisoMatch = fundraisoBySlug.get(enriched.slug) || fundraisoByName.get(normalizedName);
    if (fundraisoMatch?.url) {
      changes.push({
        slug: f.slug, name: f.name,
        field: 'websiteUrl',
        from: enriched.websiteUrl || '(empty)',
        to: `Fundraiso: ${fundraisoMatch.url}`,
      });
      enriched.websiteUrl = fundraisoMatch.url;
    }
  }

  // --- Recompute fit score if themes changed ---
  if (changes.some(c => c.field === 'themes')) {
    const esa2 = f.uid ? esaByUid.get(f.uid) : undefined;
    const { fitScore } = computeFitScore({
      themes: enriched.themes as string[],
      canton: esa2?.canton || '',
      city: esa2?.city || enriched.region || '',
      applicationMethod: enriched.applicationMethod || 'unknown',
      isFunder: enriched.isOperative === false || enriched.isOperative === undefined,
    });
    const depth = enriched.researchDepth || 'rapid';
    const fitDisplay = fitScoreToDisplay(fitScore, depth === 'rapid');

    if (fitScore !== (enriched.fitScore || 0)) {
      enriched.fitScore = fitScore;
      enriched.fit = fitDisplay; // DEPRECATED: kept for DB backward compat
    }
  }

  return {
    foundation: enriched as Foundation,
    changes,
    wasEnriched: changes.length > 0,
  };
}

// ============================================================================
// DRAFT GENERATION (ResearchDraft compatible)
// ============================================================================

function buildDraft(enriched: Foundation, esa: ESAEntry | undefined) {
  // Build a ResearchDraft-compatible object for foundation-upsert.ts
  const scores = scoreFunderOperator(enriched.officialPurpose || '');
  return {
    slug: enriched.slug,
    name: enriched.name,
    timestamp: new Date().toISOString(),
    queueItem: {
      name: enriched.name,
      slug: enriched.slug,
      tier: 4, // bulk enrichment is always lowest research tier
      evScore: 0,
      websiteUrl: enriched.websiteUrl || '',
      esaMatch: {
        uid: enriched.uid || '',
        name: esa?.name || enriched.name,
        purpose: enriched.officialPurpose || '',
        canton: esa?.canton || '',
        city: esa?.city || enriched.region || 'Schweiz',
        status: esa?.status || 'aktiv',
      },
      candidate: {
        name: enriched.name,
        slug: enriched.slug,
        location: enriched.region || 'Schweiz',
        foundVia: ['bulk-enrich'],
      },
      scores: {
        funderScore: scores.funder,
        operatorScore: scores.operator,
        socialScore: 0,
        confidence: 'low' as const,
      },
    },
    analysis: {
      isFunder: !enriched.isOperative,
      funderConfidence: 'low' as const,
      reasoning: 'Bulk enrichment from ESA register + Fundraiso cross-reference',
      themes: enriched.themes,
      suggestedType: enriched.type,
      suggestedFit: enriched.fit,
      suggestedPriority: enriched.priority,
      purposeSummary: enriched.purposeSummary || buildMinimalPurposeSummary(enriched, esa),
      researchNotes: enriched.researchNotes || buildMinimalResearchNotes(enriched, esa),
      applicationMethod: enriched.applicationMethod === 'post' ? 'unknown'
        : (enriched.applicationMethod as 'online' | 'email' | 'unknown') || 'unknown',
      contactInfo: {
        email: enriched.contact?.email,
        phone: enriched.contact?.phone,
        address: enriched.contact?.address,
      },
      grantRange: {
        min: enriched.amount?.min ?? undefined,
        max: enriched.amount?.max ?? undefined,
      },
      warnings: ['Bulk enrichment — not manually verified'],
    },
    _meta: {
      source: 'bulk-enrich',
      enrichmentDate: new Date().toISOString().split('T')[0],
    },
  };
}

function buildMinimalPurposeSummary(f: Foundation, esa?: ESAEntry): string {
  const city = esa?.city || f.region || 'Schweiz';
  const purpose = f.officialPurpose || '';
  // Truncate purpose to first 200 chars for summary
  const excerpt = purpose.length > 200
    ? purpose.substring(0, 197).replace(/\s+\S*$/, '') + '...'
    : purpose;
  return `${f.name} (${city}): ${excerpt || 'Keine detaillierte Zweckbeschreibung verfügbar. Weitere Recherche empfohlen.'}`;
}

function buildMinimalResearchNotes(f: Foundation, esa?: ESAEntry): string {
  const city = esa?.city || f.region || 'Schweiz';
  const canton = esa?.canton || '';
  const themes = f.themes.length > 0 ? `Themen: ${f.themes.join(', ')}. ` : '';
  const operative = f.isOperative ? 'Primär operativ tätig (kein Förderer). ' : '';
  return `${f.name}: Automatisch angereichert aus ESA-Register und Fundraiso-Daten. Sitz: ${city}${canton ? ` (${canton})` : ''}. ${themes}${operative}Manuelle Recherche für Website, direkte Kontaktdaten und Förderprioritäten empfohlen. Datenqualität: bulk-enrichment (nicht manuell verifiziert).`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const statsOnly = args.includes('--stats-only');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Bulk Foundation Enrichment');
  console.log('  Cross-source data backfill from ESA + Fundraiso');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  MODE: Dry run (no files written)');
  if (statsOnly) console.log('  MODE: Stats only');

  // Load data sources
  console.log('\n📦 Loading data sources...');
  const dbRows = await loadFoundationsFromDB();
  console.log(`  Database: ${dbRows.length} foundations`);

  const foundations = dbRows.map(r => r.config_data);

  const esaByUid = loadESA();
  const { byName: fundraisoByName, bySlug: fundraisoBySlug } = loadFundraiso();

  // Show current tier distribution
  const beforeCounts = computeTierCounts(foundations);
  console.log('\n📊 Current Tier Distribution:');
  console.log(`  verzeichnet:      ${beforeCounts.verzeichnet.toLocaleString()}`);
  console.log(`  erfasst:          ${beforeCounts.erfasst.toLocaleString()}`);
  console.log(`  profiliert:       ${beforeCounts.profiliert.toLocaleString()}`);
  console.log(`  recherchiert:     ${beforeCounts.recherchiert.toLocaleString()}`);
  console.log(`  anwendungsbereit: ${beforeCounts.anwendungsbereit.toLocaleString()}`);
  console.log(`  TOTAL:            ${foundations.length.toLocaleString()}`);

  if (statsOnly) {
    process.exit(0);
  }

  // Run enrichment
  console.log('\n🔄 Enriching foundations...\n');

  const allChanges: EnrichmentChange[] = [];
  const enrichedFoundations: Foundation[] = [];
  const enrichedDrafts: { slug: string; draft: ReturnType<typeof buildDraft> }[] = [];

  // Track per-field stats
  const fieldStats: Record<string, number> = {};

  let processed = 0;
  for (const f of foundations) {
    const result = enrichFoundation(f, esaByUid, fundraisoByName, fundraisoBySlug);

    if (result.wasEnriched) {
      allChanges.push(...result.changes);
      enrichedFoundations.push(result.foundation);
      for (const c of result.changes) {
        fieldStats[c.field] = (fieldStats[c.field] || 0) + 1;
      }

      const esa = f.uid ? esaByUid.get(f.uid) : undefined;
      enrichedDrafts.push({ slug: f.slug, draft: buildDraft(result.foundation, esa) });
    }

    processed++;
    if (processed % 5000 === 0) {
      console.log(`  Processed ${processed.toLocaleString()}/${foundations.length.toLocaleString()}...`);
    }
  }

  // Compute after-enrichment tier counts
  const afterFoundations = foundations.map(f => {
    const enriched = enrichedFoundations.find(e => e.slug === f.slug);
    return enriched || f;
  });
  const afterCounts = computeTierCounts(afterFoundations);

  // Display results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ENRICHMENT RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Foundations processed: ${foundations.length.toLocaleString()}`);
  console.log(`  Foundations enriched:  ${enrichedFoundations.length.toLocaleString()}`);
  console.log(`  Total field changes:   ${allChanges.length.toLocaleString()}`);

  console.log('\n  Per-field changes:');
  const sortedFields = Object.entries(fieldStats).sort((a, b) => b[1] - a[1]);
  for (const [field, count] of sortedFields) {
    console.log(`    ${field.padEnd(25)} ${count.toLocaleString()}`);
  }

  console.log('\n  Tier Distribution (Before → After):');
  const tiers = ['verzeichnet', 'erfasst', 'profiliert', 'recherchiert', 'anwendungsbereit'] as const;
  for (const tier of tiers) {
    const before = beforeCounts[tier];
    const after = afterCounts[tier];
    const delta = after - before;
    const deltaStr = delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : '';
    console.log(`    ${tier.padEnd(20)} ${before.toLocaleString().padStart(7)} → ${after.toLocaleString().padStart(7)}${deltaStr}`);
  }

  // Count funder/operator classification
  const operativeCount = enrichedFoundations.filter(f => f.isOperative === true).length;
  const funderCount = enrichedFoundations.filter(f => f.isOperative === false).length;
  console.log(`\n  Funder/Operator: ${funderCount} funders, ${operativeCount} operatives detected`);

  // Write drafts (unless dry run)
  if (!dryRun && enrichedDrafts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const outDir = path.join(process.cwd(), 'research', 'bulk-enrichment', today);
    fs.mkdirSync(outDir, { recursive: true });

    let written = 0;
    for (const { slug, draft } of enrichedDrafts) {
      const outPath = path.join(outDir, `${slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(draft, null, 2));
      written++;
    }

    console.log(`\n💾 Wrote ${written} draft files to: research/bulk-enrichment/${today}/`);
    console.log('\n📋 Next steps:');
    console.log(`   npx tsx scripts/foundation-upsert.ts research/bulk-enrichment/${today}/`);
    console.log('   npm run sync && npm run build');
  } else if (dryRun) {
    console.log('\n  DRY RUN — no files written.');

    // Show sample changes (first 20)
    if (allChanges.length > 0) {
      console.log('\n  Sample changes (first 20):');
      for (const c of allChanges.slice(0, 20)) {
        console.log(`    ${c.name.substring(0, 40).padEnd(42)} ${c.field.padEnd(20)} ${c.from.substring(0, 20)} → ${c.to.substring(0, 40)}`);
      }
      if (allChanges.length > 20) {
        console.log(`    ... and ${allChanges.length - 20} more changes`);
      }
    }
  } else {
    console.log('\n  No foundations needed enrichment.');
  }

  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
