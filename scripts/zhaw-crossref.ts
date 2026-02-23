#!/usr/bin/env tsx
/**
 * ZHAW Cross-Reference — Enrich existing drafts with ZHAW contact data
 *
 * Reads 184 Zürich foundations from ZHAW Soziale Arbeit dataset and matches
 * against existing draft JSON files by slug and fuzzy name. For matches,
 * imports: website, email, phone, einreichungstermin (deadline), zielgruppe.
 *
 * Usage:
 *   npx tsx scripts/zhaw-crossref.ts [--dry-run] [--drafts-dir research/drafts/2026-02-23]
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface ZhawFoundation {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  purpose: string;
  zielgruppe: string;
  gesuchstellende: string;
  einreichungstermin: string;
  empfangsstelle: string;
  beilagen: string;
}

interface ZhawData {
  source: string;
  date: string;
  edition: string;
  scope: string;
  count: number;
  foundations: ZhawFoundation[];
}

interface DraftFile {
  slug: string;
  name: string;
  timestamp: string;
  queueItem: {
    name: string;
    slug: string;
    tier: number;
    evScore: number;
    websiteUrl: string;
    esaMatch: {
      uid: string;
      name: string;
      purpose: string;
      canton: string;
      city: string;
      status: string;
    };
    candidate: {
      name: string;
      slug: string;
      location?: string;
      foundVia?: string[];
    };
  };
  analysis: {
    isFunder: boolean;
    funderConfidence: string;
    reasoning: string;
    themes: string[];
    suggestedType: string;
    suggestedFit: number;
    suggestedPriority: number;
    purposeSummary: string;
    researchNotes: string;
    applicationMethod: string;
    contactInfo: {
      email?: string;
      phone?: string;
      address?: string;
    };
    grantRange: Record<string, unknown>;
    warnings: string[];
  };
  _meta?: Record<string, unknown>;
  _zhaw?: Record<string, unknown>;
}

// ============================================================================
// SLUG HELPERS
// ============================================================================

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Normalize a name for fuzzy comparison — strips common prefixes/suffixes */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/stiftung/g, '')
    .replace(/\b(der|die|das|und|für|von|zu|des)\b/g, '')
    .replace(/[^a-zäöü0-9]/g, '')
    .trim();
}

/** Check if website URL looks like a Zefix placeholder */
function isZefixUrl(url: string): boolean {
  return url.includes('zefix.ch') || url.includes('uid.admin.ch');
}

/** Ensure URL has protocol prefix */
function normalizeUrl(url: string): string {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

/** Extract website URL from ZHAW — sometimes embedded in purpose field */
function extractWebsite(zhaw: ZhawFoundation): string {
  // Direct website field
  if (zhaw.website) return normalizeUrl(zhaw.website);

  // Sometimes website is embedded in the purpose field (e.g., "www.akk-stiftung.ch Unterstützung...")
  const purposeMatch = zhaw.purpose.match(/(?:www\.[a-z0-9-]+\.[a-z]{2,})/i);
  if (purposeMatch) return normalizeUrl(purposeMatch[0]);

  return '';
}

/** Extract email from ZHAW — sometimes embedded in purpose field */
function extractEmail(zhaw: ZhawFoundation): string {
  if (zhaw.email) return zhaw.email.trim();

  // Sometimes email is embedded in the purpose field
  const emailMatch = zhaw.purpose.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) return emailMatch[0];

  return '';
}

// ============================================================================
// MATCHING
// ============================================================================

function buildMatchIndex(drafts: Map<string, DraftFile>): {
  bySlug: Map<string, string>; // normalized slug → draft slug
  byName: Map<string, string>; // normalized name → draft slug
} {
  const bySlug = new Map<string, string>();
  const byName = new Map<string, string>();

  for (const [slug, draft] of drafts) {
    bySlug.set(slug, slug);
    byName.set(normalizeName(draft.name), slug);
  }

  return { bySlug, byName };
}

function findMatch(
  zhaw: ZhawFoundation,
  index: ReturnType<typeof buildMatchIndex>,
): string | null {
  // 1. Exact slug match
  const zhawSlug = slugify(zhaw.name);
  if (index.bySlug.has(zhawSlug)) return index.bySlug.get(zhawSlug)!;

  // 2. Normalized name match
  const zhawNorm = normalizeName(zhaw.name);
  if (index.byName.has(zhawNorm)) return index.byName.get(zhawNorm)!;

  // 3. Substring match — check if ZHAW name core appears in any draft name
  for (const [normName, slug] of index.byName) {
    if (zhawNorm.length >= 6 && normName.includes(zhawNorm)) return slug;
    if (normName.length >= 6 && zhawNorm.includes(normName)) return slug;
  }

  return null;
}

// ============================================================================
// ENRICHMENT
// ============================================================================

function enrichDraft(draft: DraftFile, zhaw: ZhawFoundation): { changed: boolean; fields: string[] } {
  const fields: string[] = [];

  // Website — prefer ZHAW over Zefix placeholder
  const zhawWebsite = extractWebsite(zhaw);
  if (zhawWebsite && (!draft.queueItem.websiteUrl || isZefixUrl(draft.queueItem.websiteUrl))) {
    draft.queueItem.websiteUrl = zhawWebsite;
    fields.push('website');
  }

  // Email
  const zhawEmail = extractEmail(zhaw);
  if (zhawEmail && !draft.analysis.contactInfo.email) {
    draft.analysis.contactInfo.email = zhawEmail;
    fields.push('email');
  }

  // Phone
  if (zhaw.phone && !draft.analysis.contactInfo.phone) {
    draft.analysis.contactInfo.phone = zhaw.phone;
    fields.push('phone');
  }

  // Address — ZHAW has full street addresses
  if (zhaw.address && zhaw.city) {
    const zhawAddress = `${zhaw.address}, ${zhaw.zip} ${zhaw.city}`;
    if (!draft.analysis.contactInfo.address || !draft.analysis.contactInfo.address.includes(zhaw.address)) {
      draft.analysis.contactInfo.address = zhawAddress;
      fields.push('address');
    }
  }

  // Store ZHAW-specific metadata for upsert to use
  draft._zhaw = {
    source: 'zhaw-soziale-arbeit-2024-25',
    einreichungstermin: zhaw.einreichungstermin || undefined,
    zielgruppe: zhaw.zielgruppe || undefined,
    gesuchstellende: zhaw.gesuchstellende || undefined,
    beilagen: zhaw.beilagen || undefined,
    website: zhawWebsite || undefined,
    email: zhawEmail || undefined,
    phone: zhaw.phone || undefined,
  };
  fields.push('_zhaw');

  return { changed: fields.length > 1, fields }; // >1 because _zhaw is always added
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const draftsDirArg = args.find(a => a.startsWith('--drafts-dir='))?.split('=')[1];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ZHAW Cross-Reference — Enrich drafts with ZHAW data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  DRY RUN — no files will be written');

  // Load ZHAW data
  const zhawPath = path.join(process.cwd(), 'research', 'zhaw-fonds-stiftungen-2024-25.json');
  if (!fs.existsSync(zhawPath)) {
    console.error('  ZHAW data not found at:', zhawPath);
    process.exit(1);
  }
  const zhawData: ZhawData = JSON.parse(fs.readFileSync(zhawPath, 'utf-8'));
  console.log(`  ZHAW foundations: ${zhawData.foundations.length}`);

  // Find drafts directory
  const draftsBase = path.join(process.cwd(), 'research', 'drafts');
  let draftsDir: string;
  if (draftsDirArg) {
    draftsDir = path.resolve(draftsDirArg);
  } else {
    const allDirs = fs.readdirSync(draftsBase).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    const latest = allDirs[allDirs.length - 1];
    if (!latest) {
      console.error('  No draft directories found');
      process.exit(1);
    }
    draftsDir = path.join(draftsBase, latest);
  }
  console.log(`  Drafts directory: ${draftsDir}`);

  // Load all drafts
  const draftFiles = fs.readdirSync(draftsDir).filter(f => f.endsWith('.json'));
  console.log(`  Draft files: ${draftFiles.length}`);

  const drafts = new Map<string, DraftFile>();
  for (const file of draftFiles) {
    const draft: DraftFile = JSON.parse(fs.readFileSync(path.join(draftsDir, file), 'utf-8'));
    drafts.set(draft.slug, draft);
  }

  // Build match index
  const index = buildMatchIndex(drafts);

  // Process ZHAW foundations
  let matched = 0;
  let enriched = 0;
  let unmatched = 0;
  const enrichedDetails: string[] = [];
  const unmatchedNames: string[] = [];

  for (const zhaw of zhawData.foundations) {
    const draftSlug = findMatch(zhaw, index);

    if (draftSlug) {
      matched++;
      const draft = drafts.get(draftSlug)!;
      const { changed, fields } = enrichDraft(draft, zhaw);

      if (changed) {
        enriched++;
        enrichedDetails.push(`  ${draft.name} ← ${fields.filter(f => f !== '_zhaw').join(', ')}`);

        if (!dryRun) {
          fs.writeFileSync(
            path.join(draftsDir, `${draftSlug}.json`),
            JSON.stringify(draft, null, 2),
          );
        }
      }
    } else {
      unmatched++;
      if (unmatchedNames.length < 15) {
        unmatchedNames.push(`  ${zhaw.name} (${zhaw.city})`);
      }
    }
  }

  // Results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Matched: ${matched} / ${zhawData.foundations.length}`);
  console.log(`  Enriched (data added): ${enriched}`);
  console.log(`  Unmatched: ${unmatched}`);

  if (enrichedDetails.length > 0) {
    console.log('\n  Enriched foundations:');
    enrichedDetails.forEach(d => console.log(d));
  }

  if (unmatchedNames.length > 0) {
    console.log(`\n  Sample unmatched (${unmatched} total):`);
    unmatchedNames.forEach(n => console.log(n));
  }

  if (!dryRun && enriched > 0) {
    console.log(`\n  Next steps:`);
    console.log(`    npx tsx scripts/foundation-upsert.ts ${draftsDir}/*.json`);
    console.log(`    npm run sync && npm run build`);
  }
  console.log('  Done!\n');
}

main();
