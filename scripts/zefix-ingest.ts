#!/usr/bin/env tsx
/**
 * Zefix Ingest — Filter, cross-reference, and upsert Zefix foundations to DB
 *
 * Reads a zefix-register-*.json file, filters out pension/non-charitable
 * foundations, cross-references against existing DB entries, classifies themes
 * by name (Zefix has no purpose text), and upserts new entries.
 *
 * Usage:
 *   npx tsx scripts/zefix-ingest.ts [--dry-run] [--limit N] [--skip-sync]
 *   npm run zefix:ingest
 *
 * Requires: research/zefix-register-*.json (from zefix-download.ts)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';
import {
  classifyThemes,
  toSlug,
  THEME_LABELS,
} from './lib/theme-classifier';

// ============================================================================
// Types
// ============================================================================

interface ZefixEntry {
  name: string;
  uid: string;
  city: string;
  status: string;
  cantonalExcerptWeb: string;
}

interface ZefixRegister {
  meta: {
    source: string;
    date: string;
    total: number;
    sparqlBatches?: number;
    searches?: { term: string; count: number }[];
    duplicatesRemoved: number;
  };
  foundations: ZefixEntry[];
}

type ResearchDepth = 'rapid' | 'standard' | 'deep';

// ============================================================================
// EXCLUSION FILTER — Non-charitable foundation patterns
// ============================================================================

const EXCLUDE_PATTERNS = [
  // Pension / retirement (2nd + 3rd pillar)
  /\bbvg\b/i,
  /\bpensionskasse\b/i,
  /\bpensionsfonds\b/i,
  /\bsammelstiftung\b/i,
  /\bpersonalf[uü]rsorge/i,
  /\bpersonalvorsorge/i,
  /\bpersonalstiftung/i,
  /\bvorsorgestiftung/i,
  /\bfreiz[uü]gigkeitsstiftung/i,
  /\banlagestiftung/i,
  /\b2\.\s*s[aä]ule/i,
  /\b3\.\s*s[aä]ule/i,
  /\bs[aä]ule\s*3a/i,
  /\bwohlfahrtsfonds/i,
  /\bwohlfahrtsstiftung/i,
  // Family foundations (private, non-granting)
  /\bfamilienstiftung/i,
  /\bfamilienrat\b/i,
  // French pension terms
  /\bpatronale?\b/i,
  /\bpr[eé]voyance/i,
  /\bcaisse\s+de\s+pension/i,
  /\blpp\b/i,
  /\bfonds\s+de\s+pr[eé]voyance/i,
  /\binstitution\s+de\s+pr[eé]voyance/i,
  // Italian pension terms
  /\bprevidenza/i,
  /\bcassa\s+pensione/i,
  /\bfondo\s+di\s+previdenza/i,
  // Supervisory authorities (not foundations)
  /\baufsichtsbeh[oö]rde/i,
  /\bstiftungsaufsicht/i,
  /\baufsicht\s+(?:lpp|bvg)/i,
  /\bautorit[eé]\s+de\s+surveillance/i,
  // Dissolved / in liquidation
  /\bin\s+liquidation\b/i,
  /\ben\s+liquidation\b/i,
  /\bin\s+liq\.\b/i,
];

function isExcluded(name: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(name));
}

// ============================================================================
// FIND LATEST REGISTER FILE
// ============================================================================

function findLatestRegister(): string | null {
  const researchDir = path.join(process.cwd(), 'research');
  if (!fs.existsSync(researchDir)) return null;

  const files = fs.readdirSync(researchDir)
    .filter(f => f.startsWith('zefix-register-') && f.endsWith('.json'))
    .sort()
    .reverse();

  return files.length > 0 ? path.join(researchDir, files[0]) : null;
}

// ============================================================================
// DRAFT GENERATION (name-only — no purpose text from Zefix)
// ============================================================================

function generateNameOnlySummary(entry: ZefixEntry): string {
  const location = entry.city || 'Schweiz';
  return `${entry.name} (${location}): Stiftung gemäss Handelsregister. Keine detaillierte Zweckbeschreibung aus Zefix verfügbar. Weitere Recherche zu Förderzweck und Aktivitäten empfohlen.`;
}

function generateNameOnlyResearchNotes(
  entry: ZefixEntry,
  themes: string[],
): string {
  const parts: string[] = [];

  parts.push(`${entry.name}: Aus Zefix-Handelsregister importiert.`);

  if (themes.length > 0) {
    parts.push(`Mögliche thematische Anknüpfungspunkte (aus Name abgeleitet): ${themes.map(t => THEME_LABELS[t] || t).join(', ')}.`);
  } else {
    parts.push('Keine thematischen Anknüpfungspunkte aus dem Namen erkennbar.');
  }

  if (entry.city) {
    parts.push(`Sitz: ${entry.city}.`);
  }

  if (entry.cantonalExcerptWeb) {
    parts.push(`Kantonaler Handelsregisterauszug verfügbar.`);
  }

  parts.push('Automatisch aus Zefix importiert. Manuelle Recherche für Stiftungszweck, Website, Kontaktdaten und Förderprioritäten erforderlich.');

  return parts.join(' ');
}

// ============================================================================
// DB UPSERT
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertEntry(
  sql: any,
  entry: ZefixEntry,
): Promise<{ success: boolean }> {
  const slug = toSlug(entry.name);
  const nameLower = entry.name.toLowerCase();
  // Zefix has no purpose text — classify from name only
  const themes = classifyThemes('', nameLower);
  const isFunder = false; // Can't determine without purpose text
  const applicationMethod = 'unknown';

  const { fitScore } = computeFitScore({
    themes, canton: '', city: entry.city || '',
    applicationMethod, isFunder,
  });
  const researchDepth: ResearchDepth = 'rapid';
  const fitDisplay = fitScoreToDisplay(fitScore, researchDepth);

  // Priority: conservative since we have minimal data
  let priority: 1 | 2 | 3 | 4;
  if (fitScore >= 7) priority = 2;
  else if (fitScore >= 4) priority = 3;
  else priority = 4;

  const purposeSummary = generateNameOnlySummary(entry);
  const researchNotes = generateNameOnlyResearchNotes(entry, themes);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const registryData = {
    slug,
    name: entry.name,
    uid: entry.uid,
    websiteUrl: entry.cantonalExcerptWeb || '',
    officialPurpose: '',
    region: entry.city || 'Schweiz',
    contact: {},
    applicationMethod,
    isOperative: false,
    status: 'rolling',
    deadlineText: 'Unbekannt',
    amount: { min: null, max: null, text: 'Unbekannt' },
    source: 'zefix',
    purposeSummary,
    sourceLinks: entry.cantonalExcerptWeb
      ? [{ source: 'zefix', url: entry.cantonalExcerptWeb, label: 'Handelsregister' }]
      : [],
  };

  const configData = {
    ...registryData,
    type: 'C' as const, // Conservative — minimal data
    fit: fitDisplay,
    fitScore,
    priority,
    tagline: `${entry.name} — Handelsregister`,
    themes,
    researchDate: today,
    needsResearch: true,
    researchNotes,
    researchDepth,
  };

  try {
    await sql`
      INSERT INTO fundraising_foundation_registry (
        id, name, uid, official_purpose, website_url, region,
        application_method, is_operative, source, registry_data,
        data_quality, last_verified, created_at, updated_at
      ) VALUES (
        ${slug}, ${entry.name}, ${entry.uid || null},
        ${null}, ${entry.cantonalExcerptWeb || null}, ${entry.city || 'Schweiz'},
        ${applicationMethod}, ${false}, ${'zefix'},
        ${JSON.stringify(registryData)}, ${2}, ${today}, ${now}, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO fundraising_foundations (
        id, name, website_url, fit_score, priority,
        focus_areas, geographic_scope, organization_type,
        application_method, research_depth, research_date,
        data_quality, source, config_data, org_id,
        created_at, updated_at, archived
      ) VALUES (
        ${slug}, ${entry.name}, ${entry.cantonalExcerptWeb || null},
        ${fitScore}, ${priority},
        ${JSON.stringify(themes)}, ${entry.city || 'Schweiz'},
        ${'foundation'},
        ${applicationMethod}, ${researchDepth}, ${today},
        ${2}, ${'automated-research'}, ${JSON.stringify(configData)},
        ${'revamp-it'}, ${now}, ${now}, false
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return { success: true };
  } catch (err) {
    console.error(`    ${entry.name}: ${err instanceof Error ? err.message : err}`);
    return { success: false };
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipSync = args.includes('--skip-sync');
  const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Zefix Ingest — Filter + cross-ref + upsert to DB');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Find and read register file
  const registerPath = findLatestRegister();
  if (!registerPath) {
    console.error('  No zefix-register-*.json found in research/');
    console.error('  Run: npm run zefix:download');
    process.exit(1);
  }

  const register: ZefixRegister = JSON.parse(fs.readFileSync(registerPath, 'utf-8'));
  console.log(`\n  Register: ${path.basename(registerPath)}`);
  console.log(`  Entries: ${register.foundations.length}`);

  // 2. Filter: active only
  const active = register.foundations.filter(e =>
    !e.status || e.status === 'EXISTIEREND' || e.status === ''
  );
  console.log(`  Active: ${active.length} (filtered ${register.foundations.length - active.length} inactive)`);

  // 3. Filter: exclude pension/non-charitable
  const charitable = active.filter(e => !isExcluded(e.name));
  const excluded = active.length - charitable.length;
  console.log(`  Charitable: ${charitable.length} (excluded ${excluded} pension/non-charitable)`);

  // 4. Read existing slugs + UIDs from stiftungen-generated.ts
  const genPath = path.join(process.cwd(), 'src', 'lib', 'config', 'foundations', 'stiftungen-generated.ts');
  const genContent = fs.readFileSync(genPath, 'utf-8');
  const existingSlugs = new Set<string>();
  for (const m of genContent.matchAll(/"slug":\s*"([^"]+)"/g)) {
    existingSlugs.add(m[1]);
  }
  const existingUids = new Set<string>();
  for (const m of genContent.matchAll(/"uid":\s*"([^"]+)"/g)) {
    if (m[1] && m[1] !== '' && m[1] !== 'CHE-XXX.XXX.XXX') existingUids.add(m[1]);
  }
  console.log(`  Existing in DB: ${existingSlugs.size} slugs, ${existingUids.size} UIDs`);

  // 5. Build normalized-name index for fuzzy dedup
  // Catches "Stiftung X" vs "Stiftung X, Basel" and case/hyphen variations
  function normalizeName(name: string): string {
    let n = name.toLowerCase().trim();
    n = n.replace(/,\s*[a-zäöüéèà\s-]+$/i, ''); // strip trailing ", City"
    n = n.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
    n = n.replace(/é/g, 'e').replace(/è/g, 'e').replace(/à/g, 'a');
    n = n.replace(/[^a-z0-9]/g, '');
    return n;
  }

  const existingNormNames = new Set<string>();
  for (const m of genContent.matchAll(/"name":\s*"([^"]+)"/g)) {
    existingNormNames.add(normalizeName(m[1]));
  }

  // 6. Cross-reference: skip already in DB
  const missing: ZefixEntry[] = [];
  const slugsSeen = new Set<string>();
  let skippedBySlug = 0;
  let skippedByUid = 0;
  let skippedByName = 0;

  for (const entry of charitable) {
    const slug = toSlug(entry.name);

    // Skip if slug already exists
    if (existingSlugs.has(slug)) { skippedBySlug++; continue; }
    // Skip if UID already exists
    if (entry.uid && existingUids.has(entry.uid)) { skippedByUid++; continue; }
    // Skip if normalized name matches (catches case/hyphen/suffix variations)
    if (existingNormNames.has(normalizeName(entry.name))) { skippedByName++; continue; }
    // Skip duplicates within this batch
    if (slugsSeen.has(slug)) continue;

    slugsSeen.add(slug);
    missing.push(entry);
  }

  console.log(`  Skipped by slug: ${skippedBySlug}`);
  console.log(`  Skipped by UID: ${skippedByUid}`);
  console.log(`  Skipped by name: ${skippedByName}`);
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

  // 6. Classify + stats
  let withThemes = 0;
  for (const entry of toProcess) {
    const nameLower = entry.name.toLowerCase();
    const themes = classifyThemes('', nameLower);
    if (themes.length > 0) withThemes++;
  }

  if (dryRun) {
    console.log(`\n  Would upsert ${toProcess.length} foundations (${withThemes} with themes)`);
    console.log('\n  Sample entries:');
    for (const e of toProcess.slice(0, 10)) {
      const themes = classifyThemes('', e.name.toLowerCase());
      const themeStr = themes.length > 0 ? ` [${themes.join(', ')}]` : '';
      console.log(`    - ${e.name} (${e.uid}) — ${e.city}${themeStr}`);
    }
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Done!\n');
    return;
  }

  // 7. Upsert to DB
  if (!process.env.DATABASE_URL) {
    console.error('  DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  let success = 0;
  let errors = 0;

  console.log(`\n  Upserting ${toProcess.length} new foundations...`);

  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    const result = await upsertEntry(sql, entry);
    if (result.success) {
      success++;
    } else {
      errors++;
    }

    if ((i + 1) % 500 === 0) {
      console.log(`    Progress: ${i + 1}/${toProcess.length} (${success} ok, ${errors} err)`);
    }
  }

  console.log(`\n  Upserted: ${success}, Errors: ${errors}, With themes: ${withThemes}`);

  // 8. Sync
  if (!skipSync && success > 0) {
    console.log('\n  Running sync...');
    const { execSync } = require('child_process');
    try {
      execSync('npm run sync', { stdio: 'inherit', cwd: process.cwd() });
    } catch {
      console.error('  Sync failed. Run manually: npm run sync');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Zefix ingest failed:', err);
  process.exit(1);
});
