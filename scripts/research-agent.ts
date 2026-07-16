#!/usr/bin/env tsx
/**
 * Research Agent — Intelligent foundation contact enrichment
 *
 * Works like a human researcher: search, find, verify, extract, record.
 *
 * Four phases per foundation:
 *   1. DISCOVER — Find the foundation in directories + web search
 *   2. VERIFY   — Confirm candidate websites actually belong to the foundation
 *   3. EXTRACT  — Pull contact data from verified sources (regex, not guessing)
 *   4. RECONCILE — Compare sources, pick best, tag provenance
 *
 * Principles:
 *   - Don't guess URLs — search for them
 *   - Don't guess emails — read them from the actual page
 *   - Don't scrape blindly — verify website ownership first
 *   - Cross-reference sources — multiple sources agreeing = higher confidence
 *   - Record provenance — every field tagged with where it came from
 *   - LLM for judgment only — "is this the right site?" not "what's the email?"
 *
 * Output: ResearchDraft JSON files (NOT direct DB writes).
 * Feed through foundation-upsert.ts to update DB.
 *
 * Usage:
 *   npx tsx scripts/research-agent.ts --dry-run --limit=5     # Preview 5
 *   npx tsx scripts/research-agent.ts --dry-run               # Preview all
 *   npx tsx scripts/research-agent.ts --limit=50              # Process 50
 *   npx tsx scripts/research-agent.ts                         # All eligible
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { mkdirSync, writeFileSync } from 'fs';
import { sql } from './lib/db';
import { fetchSpheriqProfile } from './lib/directory-fetcher';
import { searchFoundationWebsite } from './lib/web-search';
import { verifyWebsite } from './lib/website-verifier';
import { extractContactData } from './lib/contact-extractor';
import { reconcileContacts, type ContactCandidate } from './lib/source-reconciler';
import { extractWebContent } from './lib/web-extract';
import { isRegistryUrl } from '../src/lib/config/registry-domains';

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
const DELAY_MS = 500;

// Contact subpages to try on verified websites
const CONTACT_PAGES = ['/kontakt', '/contact', '/impressum', '/ueber-uns', '/about'];

interface FoundationInput {
  id: string;
  name: string;
  uid: string | null;
  purpose: string;
  currentWebsite: string | null;
}

interface ResearchResult {
  slug: string;
  name: string;
  email?: string;
  emailSource?: string;
  emailConfidence?: string;
  phone?: string;
  phoneSource?: string;
  website?: string;
  websiteVerified: boolean;
  sourceLinks: { source: string; url: string; label?: string }[];
  conflicts: string[];
  phases: string[];  // log of what happened
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Phase 1: DISCOVER — Find the foundation in directories + web search
 */
async function discover(f: FoundationInput): Promise<{
  spheriq: Awaited<ReturnType<typeof fetchSpheriqProfile>>;
  searchResults: Awaited<ReturnType<typeof searchFoundationWebsite>>;
}> {
  const spheriq = await fetchSpheriqProfile(f.id, f.uid ?? undefined);
  await sleep(300);

  const searchResults = await searchFoundationWebsite(f.name);
  await sleep(300);

  return { spheriq, searchResults };
}

/**
 * Phase 2: VERIFY — Confirm candidate websites belong to the foundation
 */
async function verify(
  f: FoundationInput,
  candidates: string[],
): Promise<{ verifiedUrl: string | null; verificationLog: string[] }> {
  const log: string[] = [];

  for (const url of candidates) {
    // Skip registry/directory URLs — we want the foundation's own site
    if (isRegistryUrl(url)) {
      log.push(`Skip registry: ${url}`);
      continue;
    }

    const result = await verifyWebsite(url, f.name, f.purpose);
    log.push(`${result.verified ? 'VERIFIED' : 'REJECTED'}: ${url} — ${result.reason}`);

    if (result.verified) {
      return { verifiedUrl: url, verificationLog: log };
    }
    await sleep(300);
  }

  return { verifiedUrl: null, verificationLog: log };
}

/**
 * Phase 3: EXTRACT — Pull contact data from verified sources
 */
async function extract(
  verifiedUrl: string | null,
  spheriqData: Awaited<ReturnType<typeof fetchSpheriqProfile>>,
): Promise<ContactCandidate[]> {
  const candidates: ContactCandidate[] = [];

  // Extract from Spheriq profile
  if (spheriqData?.email || spheriqData?.phone) {
    candidates.push({
      email: spheriqData.email,
      phone: spheriqData.phone,
      source: 'spheriq',
      sourceUrl: spheriqData.profileUrl,
    });
  }

  // Extract from verified website (homepage + contact pages)
  if (verifiedUrl) {
    const baseUrl = verifiedUrl.replace(/\/$/, '');
    const pagesToTry = [baseUrl, ...CONTACT_PAGES.map(p => baseUrl + p)];

    for (const pageUrl of pagesToTry) {
      const extracted = await extractWebContent(pageUrl);
      if (!extracted.ok || !extracted.content) continue;

      const contacts = extractContactData(extracted.content);
      if (contacts.emails.length > 0 || contacts.phones.length > 0) {
        const pageName = pageUrl === baseUrl ? 'homepage' : pageUrl.replace(baseUrl, '');
        candidates.push({
          email: contacts.emails[0],
          phone: contacts.phones[0],
          source: `website:${pageName}`,
          sourceUrl: pageUrl,
        });
      }
      await sleep(200);
    }
  }

  return candidates;
}

/**
 * Process one foundation through all 4 phases
 */
async function researchFoundation(f: FoundationInput): Promise<ResearchResult> {
  const result: ResearchResult = {
    slug: f.id,
    name: f.name,
    websiteVerified: false,
    sourceLinks: [],
    conflicts: [],
    phases: [],
  };

  // Phase 1: Discover
  result.phases.push('Phase 1: Discover');
  const { spheriq, searchResults } = await discover(f);

  if (spheriq) {
    result.phases.push(`  Spheriq: ${spheriq.profileUrl} (email=${spheriq.email || 'none'})`);
    result.sourceLinks.push({ source: 'stiftungschweiz', url: spheriq.profileUrl, label: 'StiftungSchweiz Profil' });
  } else {
    result.phases.push('  Spheriq: not found');
  }
  if (searchResults.length > 0) {
    result.phases.push(`  Search: ${searchResults.length} results`);
  } else {
    result.phases.push('  Search: no results (API not configured?)');
  }

  // Phase 2: Verify website candidates
  result.phases.push('Phase 2: Verify');
  const candidateUrls: string[] = [];
  // Add Spheriq website if found
  if (spheriq?.website) candidateUrls.push(spheriq.website);
  // Add current website if it's a real one (not registry)
  if (f.currentWebsite && !isRegistryUrl(f.currentWebsite)) candidateUrls.push(f.currentWebsite);
  // Add search results
  for (const sr of searchResults) {
    if (!isRegistryUrl(sr.url) && !candidateUrls.includes(sr.url)) {
      candidateUrls.push(sr.url);
    }
  }

  const { verifiedUrl, verificationLog } = await verify(f, candidateUrls.slice(0, 5));
  result.phases.push(...verificationLog.map(l => `  ${l}`));

  if (verifiedUrl) {
    result.website = verifiedUrl;
    result.websiteVerified = true;
    result.sourceLinks.push({ source: 'website', url: verifiedUrl });
  }

  // Phase 3: Extract contacts from verified sources
  result.phases.push('Phase 3: Extract');
  const candidates = await extract(verifiedUrl, spheriq);
  result.phases.push(`  Found ${candidates.length} contact candidates from ${candidates.map(c => c.source).join(', ') || 'none'}`);

  // Phase 4: Reconcile
  result.phases.push('Phase 4: Reconcile');
  const reconciled = reconcileContacts(candidates);
  result.email = reconciled.email;
  result.emailSource = reconciled.emailSource;
  result.emailConfidence = reconciled.emailConfidence;
  result.phone = reconciled.phone;
  result.phoneSource = reconciled.phoneSource;
  result.conflicts = reconciled.conflicts;

  if (reconciled.email) {
    result.phases.push(`  Email: ${reconciled.email} (${reconciled.emailConfidence}, from ${reconciled.emailSource})`);
  }
  if (reconciled.phone) {
    result.phases.push(`  Phone: ${reconciled.phone} (from ${reconciled.phoneSource})`);
  }
  if (reconciled.conflicts.length > 0) {
    result.phases.push(`  Conflicts: ${reconciled.conflicts.join('; ')}`);
  }

  return result;
}

async function main() {
  console.log('=== Foundation Research Agent ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no file output)' : 'LIVE'}`);
  if (LIMIT) console.log(`Limit: ${LIMIT}`);
  console.log('');

  // Get foundations missing email, prioritized
  const rows = await sql`
    SELECT id, name,
           config_data->>'uid' as uid,
           COALESCE(config_data->>'officialPurpose', config_data->>'purposeSummary', '') as purpose,
           config_data->>'websiteUrl' as website
    FROM fundraising_foundations
    WHERE (config_data->'contact'->>'email' IS NULL OR config_data->'contact'->>'email' = '')
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND config_data IS NOT NULL
      AND (archived = false OR archived IS NULL)
    ORDER BY COALESCE(fit_score, 0) DESC, name
    ${LIMIT ? sql`LIMIT ${LIMIT}` : sql``}
  ` as { id: string; name: string; uid: string | null; purpose: string; website: string | null }[];

  console.log(`Foundations to research: ${rows.length}\n`);

  // Output directory
  const today = new Date().toISOString().split('T')[0];
  const outDir = `research/agent/${today}`;
  if (!DRY_RUN) {
    mkdirSync(outDir, { recursive: true });
  }

  let foundEmail = 0;
  let foundPhone = 0;
  let foundWebsite = 0;
  const results: ResearchResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const f: FoundationInput = {
      id: rows[i].id,
      name: rows[i].name,
      uid: rows[i].uid,
      purpose: rows[i].purpose,
      currentWebsite: rows[i].website,
    };

    console.log(`[${i + 1}/${rows.length}] ${f.name}`);
    const result = await researchFoundation(f);
    results.push(result);

    const status = result.email ? '✅' : result.phone ? '📞' : '❌';
    console.log(`  ${status} email=${result.email || '-'} phone=${result.phone || '-'} web=${result.websiteVerified ? '✓' : '-'}`);

    if (result.email) foundEmail++;
    if (result.phone) foundPhone++;
    if (result.websiteVerified) foundWebsite++;

    // Write individual draft (for foundation-upsert.ts)
    if (!DRY_RUN && (result.email || result.phone || result.website)) {
      const draft = {
        slug: result.slug,
        name: result.name,
        contact: {
          ...(result.email && { email: result.email }),
          ...(result.phone && { phone: result.phone }),
        },
        ...(result.website && { websiteUrl: result.website }),
        sourceLinks: result.sourceLinks,
        _meta: {
          emailSource: result.emailSource,
          emailConfidence: result.emailConfidence,
          phoneSource: result.phoneSource,
          websiteVerified: result.websiteVerified,
          researchDate: today,
          conflicts: result.conflicts,
          agent: 'research-agent',
        },
      };
      writeFileSync(`${outDir}/${result.slug}.json`, JSON.stringify(draft, null, 2));
    }

    if (i < rows.length - 1) await sleep(DELAY_MS);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Researched: ${rows.length}`);
  console.log(`Found email: ${foundEmail} (${Math.round(foundEmail * 100 / rows.length)}%)`);
  console.log(`Found phone: ${foundPhone}`);
  console.log(`Verified website: ${foundWebsite}`);
  if (!DRY_RUN) {
    console.log(`\nDrafts written to: ${outDir}/`);
    console.log('Next: review drafts, then run foundation-upsert.ts to update DB');
  }

  // Write summary log
  if (!DRY_RUN) {
    const summary = results.map(r => ({
      slug: r.slug,
      email: r.email || null,
      emailConfidence: r.emailConfidence || null,
      phone: r.phone || null,
      website: r.website || null,
      conflicts: r.conflicts,
    }));
    writeFileSync(`${outDir}/_summary.json`, JSON.stringify(summary, null, 2));
  }
}

main().catch(console.error);
