#!/usr/bin/env tsx
/**
 * Web Enrichment — Scrape foundation websites for contact data
 *
 * Fetches foundation websites and extracts email, phone, application method,
 * and grant range using regex-based extraction (no LLM). Tries subpages
 * (/kontakt, /contact, /foerderung, /stiftung) if homepage yields nothing.
 *
 * Input sources:
 *   1. Foundations with real website URLs already in DB
 *   2. Newly discovered URLs from url-discover.ts output
 *
 * Output: ResearchDraft-compatible JSON files for foundation-upsert.ts
 *
 * Usage:
 *   npx tsx scripts/web-enrich.ts --dry-run                     # Preview
 *   npx tsx scripts/web-enrich.ts                               # Write drafts
 *   npx tsx scripts/web-enrich.ts --urls=research/url-discovery/2026-03-04.json
 *   npx tsx scripts/web-enrich.ts --limit=50
 *
 * Output:
 *   research/web-enrichment/YYYY-MM-DD/  (one JSON per enriched foundation)
 *
 * Next:
 *   npx tsx scripts/foundation-upsert.ts research/web-enrichment/YYYY-MM-DD/
 *   npm run sync && npm run build
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { fetchRaw, stripHtml } from './lib/web-extract';
import { isRegistryUrl } from '../src/lib/config/registry-domains';
import { extractContactData, type ExtractedContact } from './lib/contact-extractor';
import type { Foundation } from '../src/lib/schemas/foundation';

// ============================================================================
// CONFIG
// ============================================================================

const CONCURRENCY = 5;
const PROGRESS_INTERVAL = 25;

// Subpages to try if homepage yields no contact data
const SUBPAGES = ['/kontakt', '/contact', '/foerderung', '/stiftung', '/ueber-uns', '/about'];

// ============================================================================
// Types
// ============================================================================

interface DBRow {
  id: string;
  name: string;
  config_data: Foundation;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface UrlDiscoveryFile {
  discoveries: { slug: string; name: string; candidateUrl: string; finalUrl: string }[];
}

interface EnrichmentResult {
  slug: string;
  name: string;
  url: string;
  contact: ExtractedContact;
  pagesScraped: string[];
  hadDataBefore: { email: boolean; phone: boolean };
}

// ============================================================================
// Fetching + extraction
// ============================================================================

async function fetchAndExtract(url: string): Promise<{ text: string; contact: ExtractedContact } | null> {
  try {
    const html = await fetchRaw(url);
    const text = stripHtml(html);
    if (text.length < 50) return null;
    const contact = extractContactData(text);
    return { text, contact };
  } catch {
    return null;
  }
}

function hasUsefulData(contact: ExtractedContact): boolean {
  return (
    contact.emails.length > 0 ||
    contact.phones.length > 0 ||
    contact.applicationMethod !== 'unknown' ||
    contact.grantRange.min !== undefined ||
    contact.grantRange.max !== undefined
  );
}

function mergeContacts(a: ExtractedContact, b: ExtractedContact): ExtractedContact {
  return {
    emails: Array.from(new Set([...a.emails, ...b.emails])),
    phones: Array.from(new Set([...a.phones, ...b.phones])),
    applicationMethod: a.applicationMethod !== 'unknown' ? a.applicationMethod : b.applicationMethod,
    grantRange: {
      min: a.grantRange.min ?? b.grantRange.min,
      max: a.grantRange.max ?? b.grantRange.max,
    },
  };
}

async function scrapeFoundation(url: string): Promise<{ contact: ExtractedContact; pagesScraped: string[] }> {
  const pagesScraped: string[] = [];
  let combined: ExtractedContact = {
    emails: [],
    phones: [],
    applicationMethod: 'unknown',
    grantRange: {},
  };

  // 1. Try homepage
  const homepage = await fetchAndExtract(url);
  if (homepage) {
    combined = homepage.contact;
    pagesScraped.push(url);
  }

  // 2. If homepage didn't yield email/phone, try subpages
  if (combined.emails.length === 0 && combined.phones.length === 0) {
    // Parse base URL properly
    let baseUrl: string;
    try {
      const parsed = new URL(url);
      baseUrl = `${parsed.protocol}//${parsed.host}`;
    } catch {
      baseUrl = url.replace(/\/+$/, '');
    }

    for (const subpage of SUBPAGES) {
      const subUrl = `${baseUrl}${subpage}`;
      const result = await fetchAndExtract(subUrl);
      if (result) {
        pagesScraped.push(subUrl);
        combined = mergeContacts(combined, result.contact);
        // Stop once we have contact data
        if (combined.emails.length > 0 || combined.phones.length > 0) break;
      }
    }
  }

  return { contact: combined, pagesScraped };
}

// ============================================================================
// Draft generation (ResearchDraft-compatible for foundation-upsert.ts)
// ============================================================================

function buildEnrichmentDraft(result: EnrichmentResult, existing: Foundation) {
  const c = result.contact;
  const email = c.emails[0] || existing.contact?.email;
  const phone = c.phones[0] || existing.contact?.phone;
  const method = c.applicationMethod !== 'unknown' ? c.applicationMethod
    : (existing.applicationMethod || 'unknown');

  return {
    slug: result.slug,
    name: result.name,
    timestamp: new Date().toISOString(),
    queueItem: {
      name: result.name,
      slug: result.slug,
      tier: 4,
      evScore: 0,
      websiteUrl: result.url,
      esaMatch: {
        uid: existing.uid || '',
        name: existing.name || result.name,
        purpose: existing.officialPurpose || '',
        canton: '',
        city: existing.region || 'Schweiz',
        status: 'aktiv',
      },
      candidate: {
        name: result.name,
        slug: result.slug,
        location: existing.region || 'Schweiz',
        foundVia: ['web-enrich'],
      },
      scores: {
        funderScore: 0,
        operatorScore: 0,
        socialScore: 0,
        confidence: 'low' as const,
      },
    },
    analysis: {
      isFunder: existing.isOperative === false || existing.isOperative === undefined,
      funderConfidence: 'low' as const,
      reasoning: `Web enrichment: scraped ${result.pagesScraped.length} page(s) from ${result.url}`,
      themes: existing.themes || [],
      suggestedType: existing.type || 'C',
      suggestedFit: existing.fit || 0,
      suggestedPriority: existing.priority || 4,
      purposeSummary: existing.purposeSummary || `${result.name}: Keine detaillierte Zweckbeschreibung verfügbar. Website: ${result.url}. Weitere Recherche empfohlen.`,
      researchNotes: existing.researchNotes || `${result.name}: Automatisch angereichert via Web-Scraping. Website: ${result.url}. ${c.emails.length > 0 ? `E-Mail gefunden: ${c.emails[0]}. ` : ''}${c.phones.length > 0 ? `Telefon gefunden: ${c.phones[0]}. ` : ''}${c.applicationMethod !== 'unknown' ? `Bewerbungsmethode: ${c.applicationMethod}. ` : ''}Manuelle Verifikation empfohlen.`,
      applicationMethod: method as 'online' | 'email' | 'invitation' | 'unknown',
      contactInfo: {
        email,
        phone,
        address: existing.contact?.address,
      },
      grantRange: {
        min: c.grantRange.min ?? existing.amount?.min ?? undefined,
        max: c.grantRange.max ?? existing.amount?.max ?? undefined,
      },
      warnings: ['Web enrichment — not manually verified'],
    },
    _meta: {
      source: 'web-enrich',
      enrichmentDate: new Date().toISOString().split('T')[0],
      pagesScraped: result.pagesScraped,
    },
  };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const urlsArg = args.find(a => a.startsWith('--urls='));
  const urlsFile = urlsArg ? urlsArg.split('=')[1] : undefined;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Web Enrichment — Scrape foundation websites for contact data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  MODE: Dry run');
  if (limit) console.log(`  LIMIT: ${limit} foundations`);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Load discovered URLs if provided
  const discoveredUrls = new Map<string, string>();
  if (urlsFile) {
    const urlsPath = path.resolve(urlsFile);
    if (fs.existsSync(urlsPath)) {
      const data: UrlDiscoveryFile = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
      for (const d of data.discoveries) {
        discoveredUrls.set(d.slug, d.candidateUrl);
      }
      console.log(`  Loaded ${discoveredUrls.size} discovered URLs from ${urlsFile}`);
    } else {
      console.error(`  URL discovery file not found: ${urlsFile}`);
    }
  }

  // Query foundations that could benefit from web enrichment:
  // - Have a real website URL (not zefix/uid.admin) OR have a discovered URL
  // - Missing direct contact (email/phone)
  console.log('\nQuerying foundations for web enrichment...');
  const rows = await sql`
    SELECT id, name, config_data, website_url, contact_email, contact_phone
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
      AND archived = false
    ORDER BY id
  ` as unknown as DBRow[];

  // Filter to foundations that:
  // 1. Have a real website (or discovered URL) AND
  // 2. Are missing email or phone
  const enrichable = rows.filter(row => {
    const url = discoveredUrls.get(row.id) || row.website_url;
    if (!url || isRegistryUrl(url)) return false;

    // Only enrich if missing contact data
    const hasEmail = !!(row.contact_email || row.config_data?.contact?.email);
    const hasPhone = !!(row.contact_phone || row.config_data?.contact?.phone);
    return !hasEmail || !hasPhone;
  });

  const toProcess = limit ? enrichable.slice(0, limit) : enrichable;
  console.log(`  Total in DB: ${rows.length}`);
  console.log(`  Eligible for enrichment: ${enrichable.length}`);
  console.log(`  Processing: ${toProcess.length}\n`);

  // Scrape in batches
  const results: EnrichmentResult[] = [];
  let processed = 0;
  let scraped = 0;
  let enriched = 0;

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);

    const batchPromises = batch.map(async (row) => {
      const url = discoveredUrls.get(row.id) || row.website_url!;
      scraped++;

      try {
        const { contact, pagesScraped } = await scrapeFoundation(url);

        if (hasUsefulData(contact)) {
          const hasEmailBefore = !!(row.contact_email || row.config_data?.contact?.email);
          const hasPhoneBefore = !!(row.contact_phone || row.config_data?.contact?.phone);

          // Only count as enriched if we found something new
          const foundNewEmail = contact.emails.length > 0 && !hasEmailBefore;
          const foundNewPhone = contact.phones.length > 0 && !hasPhoneBefore;
          const foundNewMethod = contact.applicationMethod !== 'unknown';
          const foundNewRange = contact.grantRange.min !== undefined || contact.grantRange.max !== undefined;

          if (foundNewEmail || foundNewPhone || foundNewMethod || foundNewRange) {
            enriched++;
            results.push({
              slug: row.id,
              name: row.name,
              url,
              contact,
              pagesScraped,
              hadDataBefore: { email: hasEmailBefore, phone: hasPhoneBefore },
            });
          }
        }
      } catch {
        // Skip failed scrapes silently
      }
    });

    await Promise.all(batchPromises);
    processed += batch.length;

    if (processed % PROGRESS_INTERVAL === 0 || processed === toProcess.length) {
      console.log(`  Scraped ${processed}/${toProcess.length}, enriched ${enriched} (${results.length} with new data)`);
    }
  }

  // Stats
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Foundations scraped:  ${scraped}`);
  console.log(`  Enriched (new data):  ${results.length}`);

  const newEmails = results.filter(r => r.contact.emails.length > 0 && !r.hadDataBefore.email).length;
  const newPhones = results.filter(r => r.contact.phones.length > 0 && !r.hadDataBefore.phone).length;
  const newMethods = results.filter(r => r.contact.applicationMethod !== 'unknown').length;
  const newRanges = results.filter(r => r.contact.grantRange.min !== undefined || r.contact.grantRange.max !== undefined).length;

  console.log(`  New emails found:     ${newEmails}`);
  console.log(`  New phones found:     ${newPhones}`);
  console.log(`  App methods found:    ${newMethods}`);
  console.log(`  Grant ranges found:   ${newRanges}`);

  if (results.length > 0) {
    console.log('\n  Sample results (first 15):');
    for (const r of results.slice(0, 15)) {
      const parts = [];
      if (r.contact.emails.length > 0) parts.push(`email: ${r.contact.emails[0]}`);
      if (r.contact.phones.length > 0) parts.push(`phone: ${r.contact.phones[0]}`);
      if (r.contact.applicationMethod !== 'unknown') parts.push(`method: ${r.contact.applicationMethod}`);
      console.log(`    ${r.name.substring(0, 40).padEnd(42)} ${parts.join(', ')}`);
    }
    if (results.length > 15) {
      console.log(`    ... and ${results.length - 15} more`);
    }
  }

  // Write drafts
  if (!dryRun && results.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const outDir = path.join(process.cwd(), 'research', 'web-enrichment', today);
    fs.mkdirSync(outDir, { recursive: true });

    let written = 0;
    for (const result of results) {
      const existing = rows.find(r => r.id === result.slug)!;
      const draft = buildEnrichmentDraft(result, existing.config_data);
      const outPath = path.join(outDir, `${result.slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(draft, null, 2));
      written++;
    }

    console.log(`\nWrote ${written} enrichment drafts to: research/web-enrichment/${today}/`);
    console.log('\nNext steps:');
    console.log(`  npx tsx scripts/foundation-upsert.ts research/web-enrichment/${today}/`);
    console.log('  npm run sync && npm run build');
  } else if (dryRun) {
    console.log('\n  DRY RUN — no files written.');
  } else {
    console.log('\n  No new data found.');
  }

  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
