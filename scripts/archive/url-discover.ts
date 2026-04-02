#!/usr/bin/env tsx
/**
 * URL Discovery — Find real website URLs for foundations with only Zefix/registry URLs
 *
 * Swiss foundations commonly have .ch domains matching their name.
 * This script generates candidate URLs from foundation names and HEAD-verifies them.
 *
 * Strategy:
 *   1. Query DB for foundations where website_url is null or contains zefix.ch/uid.admin.ch
 *   2. Generate candidate URLs from foundation name (strip prefixes, try .ch/.org)
 *   3. HTTP HEAD each candidate (timeout 5s, follow redirects)
 *   4. Record verified URLs
 *
 * Usage:
 *   npx tsx scripts/url-discover.ts --dry-run       # Preview discoveries
 *   npx tsx scripts/url-discover.ts                  # Write results to JSON
 *   npx tsx scripts/url-discover.ts --limit=50       # Test with 50 foundations
 *
 * Output:
 *   research/url-discovery/YYYY-MM-DD.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { headRequest } from './lib/web-extract';

// ============================================================================
// CONFIG
// ============================================================================

const CONCURRENCY = 10; // Parallel HEAD requests
const PROGRESS_INTERVAL = 50;

// ============================================================================
// Types
// ============================================================================

interface DBCandidate {
  id: string;
  name: string;
  website_url: string | null;
}

interface UrlDiscovery {
  slug: string;
  name: string;
  candidateUrl: string;
  finalUrl: string;
  statusCode: number;
}

// ============================================================================
// Name → URL candidate generation
// ============================================================================

// Prefixes/suffixes to strip from foundation names
const STRIP_PATTERNS = [
  /^stiftung\s+/i,
  /^fondation\s+/i,
  /^fondazione\s+/i,
  /^foundation\s+/i,
  /\s+stiftung$/i,
  /\s+fondation$/i,
  /\s+fondazione$/i,
  /\s+foundation$/i,
  /\s+schweiz$/i,
  /\s+suisse$/i,
  /\s+svizzera$/i,
];

function nameToUrlCandidates(name: string): string[] {
  const candidates: string[] = [];

  // 1. Clean name → domain-friendly string
  const clean = name.toLowerCase();

  // Strip common prefixes/suffixes
  let stripped = clean;
  for (const pat of STRIP_PATTERNS) {
    stripped = stripped.replace(pat, '').trim();
  }

  // Convert special chars
  const domainify = (s: string): string => {
    return s
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/é|è|ê/g, 'e').replace(/à|â/g, 'a').replace(/ô/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const fullDomain = domainify(clean);
  const strippedDomain = domainify(stripped);

  // Also try without hyphens (some foundations use single-word domains)
  const noHyphen = strippedDomain.replace(/-/g, '');

  // 2. Generate candidates (most likely first)
  const seen = new Set<string>();
  const add = (domain: string) => {
    if (domain.length < 3 || domain.length > 40) return;
    if (seen.has(domain)) return;
    seen.add(domain);
    candidates.push(`https://${domain}.ch`);
    candidates.push(`https://www.${domain}.ch`);
  };

  // "stiftung-name" → name.ch, stiftung-name.ch
  add(strippedDomain);
  add(fullDomain);

  // Try without hyphens: "ernstgoehnerstiftung.ch"
  if (noHyphen !== strippedDomain) {
    add(noHyphen);
  }

  // "Stiftung XY" → stiftungxy.ch (common pattern)
  const fullNoHyphen = fullDomain.replace(/-/g, '');
  if (fullNoHyphen !== noHyphen && fullNoHyphen !== fullDomain) {
    add(fullNoHyphen);
  }

  // Also try .org for foundations
  if (strippedDomain.length >= 4) {
    const orgUrl = `https://${strippedDomain}.org`;
    if (!seen.has(strippedDomain + '.org')) {
      candidates.push(orgUrl);
    }
  }

  return candidates;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  URL Discovery — Find real websites for Swiss foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  MODE: Dry run');
  if (limit) console.log(`  LIMIT: ${limit} foundations`);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Query foundations needing URL discovery
  console.log('\nQuerying foundations with registry-only URLs...');
  const rows = await sql`
    SELECT id, name, website_url
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
      AND archived = false
      AND (
        website_url IS NULL
        OR website_url = ''
        OR website_url LIKE '%zefix%'
        OR website_url LIKE '%uid.admin%'
      )
    ORDER BY id
  ` as unknown as DBCandidate[];

  const candidates = limit ? rows.slice(0, limit) : rows;
  console.log(`  Found ${rows.length} foundations needing URL discovery`);
  if (limit) console.log(`  Processing first ${candidates.length}`);

  // Generate all candidate URLs
  const toCheck: { slug: string; name: string; url: string }[] = [];
  for (const row of candidates) {
    const urls = nameToUrlCandidates(row.name);
    for (const url of urls) {
      toCheck.push({ slug: row.id, name: row.name, url });
    }
  }
  console.log(`  Generated ${toCheck.length} candidate URLs to verify\n`);

  // HEAD-verify in batches
  const discoveries: UrlDiscovery[] = [];
  const checkedSlugs = new Set<string>();
  let processed = 0;
  let headRequests = 0;

  // Process candidates grouped by slug (stop checking a slug once we find a match)
  const bySlug = new Map<string, typeof toCheck>();
  for (const item of toCheck) {
    const list = bySlug.get(item.slug) || [];
    list.push(item);
    bySlug.set(item.slug, list);
  }

  const slugEntries = Array.from(bySlug.entries());

  // Process in batches of CONCURRENCY slugs at a time
  for (let i = 0; i < slugEntries.length; i += CONCURRENCY) {
    const batch = slugEntries.slice(i, i + CONCURRENCY);

    const batchPromises = batch.map(async ([slug, urlCandidates]) => {
      if (checkedSlugs.has(slug)) return;

      for (const candidate of urlCandidates) {
        headRequests++;
        const result = await headRequest(candidate.url);

        if (result.ok) {
          discoveries.push({
            slug,
            name: candidate.name,
            candidateUrl: candidate.url,
            finalUrl: result.finalUrl,
            statusCode: result.statusCode,
          });
          checkedSlugs.add(slug);
          return; // Found a match, stop checking this slug
        }
      }
    });

    await Promise.all(batchPromises);
    processed += batch.length;

    if (processed % PROGRESS_INTERVAL === 0 || processed === slugEntries.length) {
      console.log(`  Checked ${processed}/${slugEntries.length} foundations, ${discoveries.length} found so far (${headRequests} HEAD requests)`);
    }
  }

  // Results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Foundations checked:  ${slugEntries.length}`);
  console.log(`  HEAD requests made:   ${headRequests}`);
  console.log(`  URLs discovered:      ${discoveries.length}`);
  console.log(`  Hit rate:             ${(discoveries.length / slugEntries.length * 100).toFixed(1)}%`);

  if (discoveries.length > 0) {
    console.log('\n  Sample discoveries (first 20):');
    for (const d of discoveries.slice(0, 20)) {
      console.log(`    ${d.name.substring(0, 45).padEnd(47)} → ${d.candidateUrl}`);
    }
    if (discoveries.length > 20) {
      console.log(`    ... and ${discoveries.length - 20} more`);
    }
  }

  // Write output
  if (!dryRun && discoveries.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const outDir = path.join(process.cwd(), 'research', 'url-discovery');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${today}.json`);

    const output = {
      date: today,
      totalChecked: slugEntries.length,
      totalDiscovered: discoveries.length,
      headRequests,
      discoveries,
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`\nWrote ${discoveries.length} discoveries to: research/url-discovery/${today}.json`);
    console.log('\nNext: npx tsx scripts/web-enrich.ts');
  } else if (dryRun) {
    console.log('\n  DRY RUN — no files written.');
  } else {
    console.log('\n  No URLs discovered.');
  }

  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
