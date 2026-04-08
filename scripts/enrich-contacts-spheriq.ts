#!/usr/bin/env tsx
/**
 * ⚠️  CAUTION: Direct DB writer — no provenance tracking.
 * Data written by this script has no source/confidence metadata.
 * ALWAYS run with --dry-run first and verify output manually.
 *
 * Enrich foundation contacts via Spheriq (StiftungSchweiz) profile pages.
 *
 * Strategy: Spheriq profile pages contain contact data in the raw HTML even
 * without login — entity JSON blobs have emails, and `mail-btn` links have
 * website URLs and mailto links. We fetch the HTML and extract with regex.
 *
 * After Spheriq extraction, for foundations with real websites but still no
 * email, we scrape the foundation website itself (homepage + /kontakt etc.).
 *
 * Usage:
 *   npx tsx scripts/enrich-contacts-spheriq.ts --dry-run             # Preview
 *   npx tsx scripts/enrich-contacts-spheriq.ts                       # Write to DB
 *   npx tsx scripts/enrich-contacts-spheriq.ts --fit-min=4           # Only high-fit
 *   npx tsx scripts/enrich-contacts-spheriq.ts --limit=100           # Limit count
 *   npx tsx scripts/enrich-contacts-spheriq.ts --phase=spheriq       # Only Spheriq
 *   npx tsx scripts/enrich-contacts-spheriq.ts --phase=websites      # Only website scrape
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { fetchRaw } from './lib/web-extract';
import { extractEmails, extractPhones } from './lib/contact-extractor';
import { isRegistryUrl } from '../src/lib/config/registry-domains';

// ============================================================================
// CONFIG
// ============================================================================

const SPHERIQ_BASE = 'https://app.spheriq.ch/organisation';
const CONCURRENCY = 5;
const SPHERIQ_DELAY_MS = 300; // Be polite to Spheriq
const WEBSITE_DELAY_MS = 200;
const PROGRESS_INTERVAL = 50;

// Subpages to try when scraping foundation websites
const CONTACT_SUBPAGES = ['/kontakt', '/contact', '/impressum', '/ueber-uns', '/about', '/stiftung'];

// Noise domains to filter from Spheriq extractions
const SPHERIQ_NOISE_EMAILS = new Set([
  'office@spheriq.ch', 'support@spheriq.ch', 'kontakt@freihandlabor.com',
  'info@example.com', 'test@test.com',
]);

const NOISE_EMAIL_DOMAINS = new Set([
  'spheriq.ch', 'stiftungschweiz.ch', 'google.com', 'googleapis.com',
  'cloudflare.com', 'wordpress.com', 'w3.org', 'schema.org',
  'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
  'youtube.com', 'example.com', 'sentry.io', 'intercom.io',
]);

// ============================================================================
// Types
// ============================================================================

interface DBRow {
  id: string;
  name: string;
  config_data: Record<string, unknown>;
}

interface EnrichResult {
  id: string;
  name: string;
  source: 'spheriq' | 'website';
  email?: string;
  phone?: string;
  websiteUrl?: string;
}

// ============================================================================
// Spheriq extraction
// ============================================================================

function isNoiseEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (SPHERIQ_NOISE_EMAILS.has(lower)) return true;
  const domain = lower.split('@')[1];
  if (!domain) return true;
  if (NOISE_EMAIL_DOMAINS.has(domain)) return true;
  // Filter CSS/JS/image artifacts
  if (lower.includes('{') || lower.includes('}') || lower.includes('\\')) return true;
  if (lower.length < 5 || lower.length > 80) return true;
  // Filter image/file extensions mistaken for emails
  if (/\.(png|jpg|jpeg|gif|svg|css|js|pdf|webp|woff|woff2|ttf|eot|ico)$/i.test(lower)) return true;
  // Filter hex-hash-like local parts (CSS class names, UUIDs)
  if (/^[a-f0-9]{8,}@/.test(lower)) return true;
  // Filter domains that look like version numbers or IPs
  if (/^\d+\.\d+\.\d+/.test(domain)) return true;
  if (/\.(webp|png|jpg)$/.test(domain)) return true;
  // Must have a valid-looking TLD (2-6 chars, alpha only)
  const tld = domain.split('.').pop() || '';
  if (!/^[a-z]{2,6}$/.test(tld)) return true;
  return false;
}

/** Build Spheriq slug from foundation name (they keep "Stiftung" etc.) */
function toSpheriqSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function fetchSpheriqPage(name: string): Promise<string | null> {
  const slug = toSpheriqSlug(name);
  try {
    const url = `${SPHERIQ_BASE}/${slug}`;
    const html = await fetchRaw(url);
    // Spheriq returns a tiny redirect page (< 500 bytes) for 404s
    if (html.length < 500) return null;
    return html;
  } catch {
    return null;
  }
}

function extractFromSpheriq(html: string): { email?: string; website?: string; phone?: string } {
  const result: { email?: string; website?: string; phone?: string } = {};

  // 1. Entity JSON: :entity="{&quot;email&quot;:&quot;info@example.ch&quot;,...}"
  const entityMatch = html.match(/:entity="\{[^}]*\}"/);
  if (entityMatch) {
    const decoded = entityMatch[0].replace(/&quot;/g, '"');
    const emailMatch = decoded.match(/"email":"([^"]+)"/);
    if (emailMatch && emailMatch[1] !== 'null' && !isNoiseEmail(emailMatch[1])) {
      result.email = emailMatch[1].toLowerCase();
    }
  }

  // 2. mail-btn links: <a class="mail-btn" href="mailto:..."> and <a class="mail-btn" href="https://...">
  const mailBtnMatches = html.matchAll(/<a\s+class="mail-btn"\s+href="([^"]+)"/g);
  for (const m of mailBtnMatches) {
    const href = m[1];
    if (href.startsWith('mailto:') && !result.email) {
      const email = href.replace('mailto:', '').toLowerCase();
      if (!isNoiseEmail(email)) {
        result.email = email;
      }
    } else if (href.startsWith('http') && !href.includes('spheriq') && !href.includes('stiftungschweiz') && !href.includes('javascript')) {
      if (!result.website) {
        result.website = href;
      }
    }
  }

  // 3. Phone — only from the contact section, not from Spheriq's own footer
  // Look for phone near the foundation's entity/contact area, not in the page template
  // Spheriq's own phone (+41 61 278 93 83) appears in footer — filter it out
  const SPHERIQ_PHONE = '+41 61 278 93 83';
  const phoneMatches = html.match(/(?:\+41|0041)[\s.]?\(?\d?\)?[\s./\-]?\d{2}[\s./\-]?\d{3}[\s./\-]?\d{2}[\s./\-]?\d{2}/g) || [];
  const uniquePhones = [...new Set(phoneMatches.map(p => p.trim()))].filter(p => p !== SPHERIQ_PHONE);
  if (uniquePhones.length > 0) {
    result.phone = uniquePhones[0];
  }

  return result;
}

// ============================================================================
// Website scraping (for foundations with real website but no email)
// ============================================================================

async function scrapeWebsiteForEmail(websiteUrl: string): Promise<{ email?: string; phone?: string }> {
  const result: { email?: string; phone?: string } = {};

  // Try homepage first
  try {
    const html = await fetchRaw(websiteUrl);
    const emails = extractEmails(html).filter(e => !isNoiseEmail(e));
    const phones = extractPhones(html);
    if (emails.length > 0) result.email = pickBestEmail(emails);
    if (phones.length > 0) result.phone = phones[0];
    if (result.email) return result;
  } catch { /* continue to subpages */ }

  // Try subpages
  let baseUrl: string;
  try {
    const parsed = new URL(websiteUrl);
    baseUrl = `${parsed.protocol}//${parsed.host}`;
  } catch {
    return result;
  }

  for (const subpage of CONTACT_SUBPAGES) {
    try {
      const html = await fetchRaw(`${baseUrl}${subpage}`);
      const emails = extractEmails(html).filter(e => !isNoiseEmail(e));
      const phones = extractPhones(html);
      if (emails.length > 0 && !result.email) result.email = pickBestEmail(emails);
      if (phones.length > 0 && !result.phone) result.phone = phones[0];
      if (result.email) break;
    } catch { /* subpage doesn't exist */ }
  }

  return result;
}

const PREFERRED_PREFIXES = [
  'info@', 'kontakt@', 'contact@', 'stiftung@', 'sekretariat@',
  'office@', 'admin@', 'hello@', 'mail@', 'geschaeftsstelle@',
];

function pickBestEmail(emails: string[]): string {
  if (emails.length === 0) return '';
  for (const prefix of PREFERRED_PREFIXES) {
    const match = emails.find(e => e.toLowerCase().startsWith(prefix));
    if (match) return match.toLowerCase();
  }
  return emails[0].toLowerCase();
}

// ============================================================================
// DB operations
// ============================================================================

async function updateFoundation(
  sql: NeonQueryFunction<false, false>,
  id: string,
  updates: { email?: string; phone?: string; websiteUrl?: string },
) {
  // Ensure contact object exists
  if (updates.email || updates.phone) {
    await sql`UPDATE fundraising_foundations
      SET config_data = CASE
        WHEN config_data->'contact' IS NULL
        THEN jsonb_set(config_data, '{contact}', '{}'::jsonb)
        ELSE config_data
      END
      WHERE id = ${id} AND config_data->'contact' IS NULL`;
  }

  if (updates.email) {
    await sql`UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{contact,email}', to_jsonb(${updates.email}::text)),
          updated_at = NOW()
      WHERE id = ${id}`;
  }

  if (updates.phone) {
    await sql`UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{contact,phone}', to_jsonb(${updates.phone}::text)),
          updated_at = NOW()
      WHERE id = ${id}`;
  }

  if (updates.websiteUrl) {
    await sql`UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{websiteUrl}', to_jsonb(${updates.websiteUrl}::text)),
          updated_at = NOW()
      WHERE id = ${id}`;
  }
}

async function queryFoundationsNoEmail(sql: NeonQueryFunction<false, false>): Promise<DBRow[]> {
  const rows = await sql`
    SELECT id, name, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
    AND archived = false
    AND (config_data->'contact'->>'email' IS NULL OR config_data->'contact'->>'email' = '')
    ORDER BY (config_data->>'fitScore')::int DESC NULLS LAST, id
  `;
  return rows as unknown as DBRow[];
}

async function queryFoundationsWithWebsiteNoEmail(sql: NeonQueryFunction<false, false>): Promise<DBRow[]> {
  const rows = await sql`
    SELECT id, name, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
    AND archived = false
    AND config_data->>'websiteUrl' IS NOT NULL
    AND config_data->>'websiteUrl' != ''
    AND (config_data->'contact'->>'email' IS NULL OR config_data->'contact'->>'email' = '')
    ORDER BY (config_data->>'fitScore')::int DESC NULLS LAST, id
  `;
  return rows as unknown as DBRow[];
}

function applyFilters(rows: DBRow[], fitMin: number, limit: number): DBRow[] {
  let filtered = rows;
  if (fitMin > 0) {
    filtered = filtered.filter(r => {
      const score = parseInt(String(r.config_data?.fitScore ?? '0'), 10);
      return score >= fitMin;
    });
  }
  if (limit > 0) {
    filtered = filtered.slice(0, limit);
  }
  return filtered;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fitMin = parseInt(args.find(a => a.startsWith('--fit-min='))?.split('=')[1] || '0');
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
  const phase = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'all';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Foundation Contact Enrichment — Spheriq + Website Scraping');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'WRITE TO DB'}`);
  console.log(`  Phase: ${phase}`);
  if (fitMin > 0) console.log(`  Fit minimum: ${fitMin}`);
  if (limit > 0) console.log(`  Limit: ${limit}`);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // ── Phase 1: Spheriq scraping ──────────────────────────────────────────
  if (phase === 'all' || phase === 'spheriq') {
    console.log('\n── Phase 1: Spheriq Profile Scraping ──────────────────────');

    const allRows = await queryFoundationsNoEmail(sql);
    const rows = applyFilters(allRows, fitMin, limit);
    console.log(`  Foundations without email: ${allRows.length} (processing: ${rows.length})`);

    let processed = 0;
    let foundEmail = 0;
    let foundWebsite = 0;
    let foundPhone = 0;
    const results: EnrichResult[] = [];

    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const batch = rows.slice(i, i + CONCURRENCY);

      const batchResults = await Promise.all(batch.map(async (row) => {
        const html = await fetchSpheriqPage(row.name);
        if (!html) return null;

        const extracted = extractFromSpheriq(html);
        if (!extracted.email && !extracted.website && !extracted.phone) return null;

        const existing = row.config_data;
        const existingContact = (existing?.contact || {}) as Record<string, string>;
        const existingWebsite = (existing?.websiteUrl || '') as string;

        const result: EnrichResult = { id: row.id, name: row.name, source: 'spheriq' };
        let hasNew = false;

        if (extracted.email && !existingContact.email) {
          result.email = extracted.email;
          hasNew = true;
        }
        if (extracted.phone && !existingContact.phone) {
          result.phone = extracted.phone;
          hasNew = true;
        }
        if (extracted.website && (!existingWebsite || isRegistryUrl(existingWebsite))) {
          result.websiteUrl = extracted.website;
          hasNew = true;
        }

        return hasNew ? result : null;
      }));

      for (const r of batchResults) {
        if (r) {
          results.push(r);
          if (r.email) foundEmail++;
          if (r.websiteUrl) foundWebsite++;
          if (r.phone) foundPhone++;
        }
      }

      processed += batch.length;
      if (processed % PROGRESS_INTERVAL === 0 || processed === rows.length) {
        console.log(`  [${processed}/${rows.length}] emails: ${foundEmail}, websites: ${foundWebsite}, phones: ${foundPhone}`);
      }

      await new Promise(r => setTimeout(r, SPHERIQ_DELAY_MS));
    }

    console.log(`\n  Spheriq results:`);
    console.log(`    New emails:   ${foundEmail}`);
    console.log(`    New websites: ${foundWebsite}`);
    console.log(`    New phones:   ${foundPhone}`);

    if (results.length > 0) {
      console.log(`\n  Sample (first 20):`);
      for (const r of results.slice(0, 20)) {
        const parts = [];
        if (r.email) parts.push(`email: ${r.email}`);
        if (r.websiteUrl) parts.push(`web: ${r.websiteUrl}`);
        if (r.phone) parts.push(`phone: ${r.phone}`);
        console.log(`    ${r.name.substring(0, 45).padEnd(47)} ${parts.join(', ')}`);
      }
      if (results.length > 20) console.log(`    ... and ${results.length - 20} more`);
    }

    if (!dryRun && results.length > 0) {
      console.log(`\n  Writing ${results.length} updates to DB...`);
      let written = 0;
      for (const r of results) {
        try {
          await updateFoundation(sql, r.id, {
            email: r.email,
            phone: r.phone,
            websiteUrl: r.websiteUrl,
          });
          written++;
        } catch (err) {
          console.error(`    Error updating ${r.id}: ${err}`);
        }
      }
      console.log(`  Written: ${written}`);
    }
  }

  // ── Phase 2: Website scraping ──────────────────────────────────────────
  if (phase === 'all' || phase === 'websites') {
    console.log('\n── Phase 2: Website Scraping for Email ─────────────────────');

    const allRows = await queryFoundationsWithWebsiteNoEmail(sql);
    const filtered = applyFilters(allRows, fitMin, 0); // no limit for phase 2

    // Filter to only real websites
    const withRealWebsites = filtered.filter(r => {
      const url = r.config_data?.websiteUrl as string;
      return url && !isRegistryUrl(url);
    });

    if (limit > 0) {
      withRealWebsites.splice(limit);
    }

    console.log(`  Foundations with real website but no email: ${withRealWebsites.length}`);

    let processed = 0;
    let foundEmail = 0;
    let foundPhone = 0;
    const results: EnrichResult[] = [];

    for (let i = 0; i < withRealWebsites.length; i += CONCURRENCY) {
      const batch = withRealWebsites.slice(i, i + CONCURRENCY);

      const batchResults = await Promise.all(batch.map(async (row) => {
        const url = row.config_data?.websiteUrl as string;
        const scraped = await scrapeWebsiteForEmail(url);
        if (!scraped.email && !scraped.phone) return null;

        const existingContact = (row.config_data?.contact || {}) as Record<string, string>;
        const result: EnrichResult = { id: row.id, name: row.name, source: 'website' };
        let hasNew = false;

        if (scraped.email && !existingContact.email) {
          result.email = scraped.email;
          hasNew = true;
        }
        if (scraped.phone && !existingContact.phone) {
          result.phone = scraped.phone;
          hasNew = true;
        }

        return hasNew ? result : null;
      }));

      for (const r of batchResults) {
        if (r) {
          results.push(r);
          if (r.email) foundEmail++;
          if (r.phone) foundPhone++;
        }
      }

      processed += batch.length;
      if (processed % PROGRESS_INTERVAL === 0 || processed === withRealWebsites.length) {
        console.log(`  [${processed}/${withRealWebsites.length}] emails: ${foundEmail}, phones: ${foundPhone}`);
      }

      await new Promise(r => setTimeout(r, WEBSITE_DELAY_MS));
    }

    console.log(`\n  Website scraping results:`);
    console.log(`    New emails:  ${foundEmail}`);
    console.log(`    New phones:  ${foundPhone}`);

    if (results.length > 0) {
      console.log(`\n  Sample (first 20):`);
      for (const r of results.slice(0, 20)) {
        const parts = [];
        if (r.email) parts.push(`email: ${r.email}`);
        if (r.phone) parts.push(`phone: ${r.phone}`);
        console.log(`    ${r.name.substring(0, 45).padEnd(47)} ${parts.join(', ')}`);
      }
    }

    if (!dryRun && results.length > 0) {
      console.log(`\n  Writing ${results.length} updates to DB...`);
      let written = 0;
      for (const r of results) {
        try {
          await updateFoundation(sql, r.id, { email: r.email, phone: r.phone });
          written++;
        } catch (err) {
          console.error(`    Error updating ${r.id}: ${err}`);
        }
      }
      console.log(`  Written: ${written}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const finalCounts = await sql`
    SELECT
      COUNT(CASE WHEN config_data->'contact'->>'email' IS NOT NULL AND config_data->'contact'->>'email' != '' THEN 1 END) as emails,
      COUNT(CASE WHEN config_data->'contact'->>'phone' IS NOT NULL AND config_data->'contact'->>'phone' != '' THEN 1 END) as phones,
      COUNT(CASE WHEN config_data->>'websiteUrl' IS NOT NULL AND config_data->>'websiteUrl' != '' THEN 1 END) as websites
    FROM fundraising_foundations
  `;
  console.log(`  DB totals: ${JSON.stringify(finalCounts[0])}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
