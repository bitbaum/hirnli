#!/usr/bin/env tsx
/**
 * Foundation Enrichment — Add address + Zefix URLs to partial entries
 *
 * Reads all draft files, enriches with:
 * - contactInfo.address from ESA city/canton data
 * - websiteUrl from Zefix UID lookup URL
 * - sourceLinks with Zefix entry
 *
 * Then re-upserts to DB so needsResearch can flip to false.
 *
 * Usage: npx tsx scripts/enrich-foundations.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

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
      location: string;
      foundVia: string[];
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
}

// Canton full names for address
const CANTON_NAMES: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen',
  AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen',
  GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau', TI: 'Tessin', VD: 'Waadt',
  VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};

function buildAddress(city: string, canton: string): string {
  const cantonName = CANTON_NAMES[canton] || canton;
  if (city && cantonName) return `${city}, Kanton ${cantonName}, Schweiz`;
  if (city) return `${city}, Schweiz`;
  return 'Schweiz';
}

function buildZefixUrl(uid: string): string {
  if (!uid || uid.length < 5) return '';
  // Zefix uses the UID format CHE-XXX.XXX.XXX
  return `https://www.zefix.ch/de/search/entity/list?mainSearch=${encodeURIComponent(uid)}`;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Foundation Enrichment — Address + Zefix URLs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  DRY RUN — no files will be written');

  // Find latest drafts directory
  const allDraftDirs = fs.readdirSync(path.join(process.cwd(), 'research', 'drafts'))
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  const latestDate = allDraftDirs[allDraftDirs.length - 1] || new Date().toISOString().split('T')[0];
  const draftsDir = path.join(process.cwd(), 'research', 'drafts', latestDate);
  console.log(`  Using drafts from: ${latestDate}`);
  if (!fs.existsSync(draftsDir)) {
    console.error(`  Drafts directory not found: ${draftsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(draftsDir).filter(f => f.endsWith('.json'));
  console.log(`\n  Found ${files.length} draft files`);

  let enriched = 0;
  let alreadyComplete = 0;
  let noUid = 0;

  for (const file of files) {
    const filePath = path.join(draftsDir, file);
    const draft: DraftFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const esa = draft.queueItem.esaMatch;
    const hasWebsite = !!draft.queueItem.websiteUrl;
    const hasAddress = !!draft.analysis.contactInfo.address;

    // Skip if already complete
    if (hasWebsite && hasAddress) {
      alreadyComplete++;
      continue;
    }

    let changed = false;

    // Add address from ESA city/canton
    if (!hasAddress && esa.city) {
      draft.analysis.contactInfo.address = buildAddress(esa.city, esa.canton);
      changed = true;
    }

    // Add Zefix URL as websiteUrl if none exists (or no real website)
    const isZefix = draft.queueItem.websiteUrl?.includes('zefix.ch') || draft.queueItem.websiteUrl?.includes('uid.admin.ch');
    if ((!hasWebsite || isZefix) && esa.uid) {
      // Only set Zefix URL if there's no URL at all — ZHAW crossref may have set a real one
      if (!hasWebsite) {
        draft.queueItem.websiteUrl = buildZefixUrl(esa.uid);
        changed = true;
      }
    } else if (!hasWebsite) {
      noUid++;
    }

    if (changed && !dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(draft, null, 2));
      enriched++;
    } else if (changed) {
      enriched++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Already complete: ${alreadyComplete}`);
  console.log(`  No UID (can't build Zefix URL): ${noUid}`);

  if (!dryRun && enriched > 0) {
    console.log(`\n  Next steps:`);
    console.log(`    npx tsx scripts/foundation-upsert.ts ${draftsDir}/*.json`);
    console.log(`    npm run sync && npm run build`);
  }
  console.log('  Done!\n');
}

main();
