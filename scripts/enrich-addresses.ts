#!/usr/bin/env tsx
/**
 * Address Enrichment — Scrape foundation websites for Swiss postal addresses
 *
 * Targets high-priority foundations (fit>=5, P1/P2) that have a website
 * but no street address. Fetches homepage + /kontakt, /contact, /impressum
 * subpages and extracts Swiss postal addresses via regex.
 *
 * Usage:
 *   npx tsx scripts/enrich-addresses.ts --dry-run
 *   npx tsx scripts/enrich-addresses.ts --limit=20
 *   npx tsx scripts/enrich-addresses.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import type { Foundation } from '../src/lib/schemas/foundation';

const sql = neon(process.env.DATABASE_URL!);

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '100');
const CONCURRENCY = 3;
const TIMEOUT_MS = 8000;

// Subpages to try for contact info
const SUBPAGES = ['', '/kontakt', '/contact', '/impressum', '/ueber-uns', '/about', '/stiftung'];

// Swiss postal address patterns — from specific to broad
const ADDR_PATTERNS = [
  // "Strasse 123, 8001 Zürich" or "Strasse 123\n8001 Zürich"
  /([A-ZÄÖÜa-zäöüéèê][\wäöüéèê. -]+\s+\d+[a-z]?)\s*[,\n\r]\s*(?:CH-)?(\d{4})\s+([A-ZÄÖÜa-zäöüéèê][\wäöüéèê .()-]+)/gm,
  // "Strasse 123 · CH-8001 Zürich" (middot separator)
  /([A-ZÄÖÜa-zäöüéèê][\wäöüéèê. -]+\s+\d+[a-z]?)\s*[·•|]\s*(?:CH-)?(\d{4})\s+([A-ZÄÖÜa-zäöüéèê][\wäöüéèê .()-]+)/gm,
  // Postfach variant: "Strasse 123, Postfach, 8001 Zürich"
  /([A-ZÄÖÜa-zäöüéèê][\wäöüéèê. -]+\s+\d+[a-z]?)\s*,\s*(?:Postfach|PO Box)\s*\d*\s*,\s*(?:CH-)?(\d{4})\s+([A-ZÄÖÜa-zäöüéèê][\wäöüéèê .()-]+)/gmi,
  // Just "ZIP City" near address-like context when preceded by street-like text
  /([\wäöüéèê]+(?:strasse|gasse|weg|platz|rain|ring|graben|quai|allee|str\.|weg)\s+\d+[a-z]?)\s*[,\n\r·•|/]\s*(?:CH-)?(\d{4})\s+([A-ZÄÖÜa-zäöüéèê][\wäöüéèê .()-]+)/gmi,
];

interface AddressResult {
  street: string;
  zip: string;
  city: string;
  source: string;
}

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RevampInfo-AddressEnrich/1.0 (+https://revamp-info.vercel.app)' },
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Strip tags, decode entities, normalize whitespace
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function extractAddress(text: string, sourceUrl: string): AddressResult | null {
  for (const pattern of ADDR_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      const street = match[1].trim();
      const zip = match[2];
      // Clean city: stop at common terminators (phone, email, pipe, newline artifacts)
      const city = match[3].trim()
        .replace(/\s*[·•|/\\].*$/, '')
        .replace(/\s*Tel\.?.*$/i, '')
        .replace(/\s*Fon.*$/i, '')
        .replace(/\s*\+\d.*$/, '')
        .replace(/\s*\(?\d{3}.*$/, '')
        .replace(/[.\s]+$/, '');
      // Sanity check: Swiss zip is 1000-9999, city is 2+ chars
      if (parseInt(zip) >= 1000 && parseInt(zip) <= 9999 && city.length >= 2 && street.length >= 3) {
        return { street, zip, city, source: sourceUrl };
      }
    }
  }
  return null;
}

async function enrichFoundation(row: { id: string; name: string; website: string; config_data: Foundation }): Promise<AddressResult | null> {
  const base = row.website.replace(/\/+$/, '');

  for (const sub of SUBPAGES) {
    const url = base + sub;
    const text = await fetchPage(url);
    if (!text) continue;

    const addr = extractAddress(text, url);
    if (addr) return addr;
  }
  return null;
}

async function main() {
  console.log('━'.repeat(60));
  console.log('  Address Enrichment');
  console.log('━'.repeat(60));
  console.log(`  MODE: ${DRY_RUN ? 'Dry run' : 'LIVE — will update DB'}`);
  console.log(`  LIMIT: ${LIMIT}`);
  console.log();

  // Get foundations: high fit, no ZIP in address, has real website
  const rows = await sql`
    SELECT id, name,
           config_data->>'websiteUrl' as website,
           config_data as config_data
    FROM fundraising_foundations
    WHERE config_data->>'websiteUrl' IS NOT NULL
      AND config_data->>'websiteUrl' NOT LIKE '%zefix.ch%'
      AND config_data->>'websiteUrl' NOT LIKE '%stiftungschweiz.ch%'
      AND config_data->>'fitScore' IS NOT NULL
      AND (config_data->>'fitScore')::int >= 4
      AND (
        config_data->'contact'->>'address' IS NULL
        OR config_data->'contact'->>'address' NOT SIMILAR TO '%[0-9]{4}%'
      )
    ORDER BY (config_data->>'fitScore')::int DESC, (config_data->>'priority')::int ASC
    LIMIT ${LIMIT}
  ` as { id: string; name: string; website: string; config_data: Foundation }[];

  console.log(`  Found ${rows.length} foundations with website but no street address\n`);

  let enriched = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (row) => {
      const addr = await enrichFoundation(row);
      return { row, addr };
    }));

    for (const { row, addr } of results) {
      if (addr) {
        enriched++;
        const fullAddr = `${addr.street}, ${addr.zip} ${addr.city}`;
        console.log(`  ✓ ${row.name.slice(0, 40).padEnd(40)} → ${fullAddr}`);
        console.log(`    source: ${addr.source}`);

        if (!DRY_RUN) {
          // Merge address into config_data.contact
          const cd = row.config_data as Record<string, unknown>;
          const contact = (cd.contact ?? {}) as Record<string, unknown>;
          contact.address = fullAddr;
          cd.contact = contact;

          await sql`
            UPDATE fundraising_foundations
            SET config_data = ${JSON.stringify(cd)}::jsonb,
                updated_at = NOW()
            WHERE id = ${row.id}
          `;
        }
      } else {
        failed++;
        if (i + CONCURRENCY <= 20) { // Only log first failures
          console.log(`  ✗ ${row.name.slice(0, 40).padEnd(40)} — no address found`);
        }
      }
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`  RESULTS`);
  console.log('━'.repeat(60));
  console.log(`  Processed:  ${rows.length}`);
  console.log(`  Enriched:   ${enriched}`);
  console.log(`  No address: ${failed}`);
  if (DRY_RUN) console.log('\n  DRY RUN — no DB changes made.');
  else if (enriched > 0) console.log(`\n  Run 'npm run sync && npm run build' to regenerate site.`);
  console.log();
}

main().catch(console.error);
