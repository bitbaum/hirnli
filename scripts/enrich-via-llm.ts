#!/usr/bin/env tsx
/**
 * Foundation Enrichment via LLM — 2-pass approach
 *
 * Pass 1: Ask Groq for website URLs (from training data) → verify with HEAD
 * Pass 2: Scrape verified websites → ask Groq to extract email/phone/address
 *
 * This replaces the old url-discover.ts (2% hit rate via name guessing)
 * with LLM-based discovery (40%+ hit rate from training knowledge).
 *
 * Usage:
 *   npx tsx scripts/enrich-via-llm.ts --dry-run --limit=10
 *   npx tsx scripts/enrich-via-llm.ts --limit=100
 *   npx tsx scripts/enrich-via-llm.ts --pass=1    # Only discover websites
 *   npx tsx scripts/enrich-via-llm.ts --pass=2    # Only extract contacts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { callGroqJSON, GROQ_MODELS } from './lib/groq-client';
import type { Foundation } from '../src/lib/schemas/foundation';

const sql = neon(process.env.DATABASE_URL!);

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '500');
const PASS = process.argv.find(a => a.startsWith('--pass='))?.split('=')[1];
const BATCH_SIZE = 10; // Foundations per LLM call
const TIMEOUT_MS = 8000;

// ============================================================================
// Pass 1: Discover website URLs via LLM
// ============================================================================

interface DBRow {
  id: string;
  name: string;
  region: string;
  website: string | null;
  config_data: Foundation;
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'RevampInfo-Verify/1.0' },
    });
    clearTimeout(timeout);
    return res.ok || res.status === 405; // Some servers reject HEAD but are live
  } catch {
    return false;
  }
}

async function discoverWebsites(rows: DBRow[]): Promise<Map<string, string>> {
  const discovered = new Map<string, string>();
  let verified = 0;
  let llmFound = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const list = batch.map((r, j) => `${j + 1}. ${r.name} (${r.region || 'Schweiz'})`).join('\n');

    const result = await callGroqJSON(
      `Für jede Schweizer Stiftung, gib die offizielle Website-URL zurück.
Antworte als JSON-Objekt: {"results": [{"nr": 1, "website": "https://... oder null"}]}
NUR echte URLs die du sicher kennst. Lieber null als raten.`,
      list,
      { temperature: 0, model: GROQ_MODELS['70b'] },
    );

    if (result.ok) {
      const data = result.data as { results?: { nr: number; website: string | null }[] };
      const results = data.results ?? (Array.isArray(result.data) ? result.data : []);

      for (const item of results) {
        const idx = (item.nr ?? 0) - 1;
        const row = batch[idx];
        const url = item.website;
        if (!row || !url || !url.startsWith('http')) continue;

        llmFound++;
        // Verify the URL actually exists
        const isLive = await verifyUrl(url);
        if (isLive) {
          verified++;
          discovered.set(row.id, url);
          console.log(`  ✓ ${row.name.slice(0, 40).padEnd(40)} → ${url}`);
        }
      }
    }

    // Rate limit: Groq free tier
    if (i + BATCH_SIZE < rows.length) {
      await new Promise(r => setTimeout(r, 1500));
    }

    if ((i + BATCH_SIZE) % 50 === 0) {
      console.log(`  ... ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} checked, ${verified} verified`);
    }
  }

  console.log(`\n  LLM suggested: ${llmFound}, verified live: ${verified}`);
  return discovered;
}

// ============================================================================
// Pass 2: Extract contacts from websites via LLM
// ============================================================================

const CONTACT_PAGES = ['', '/kontakt', '/contact', '/impressum', '/ueber-uns', '/about'];

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RevampInfo-Research/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, '\n')
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
      .replace(/\n{3,}/g, '\n').trim().slice(0, 6000);
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchContactContent(baseUrl: string): Promise<string> {
  const base = baseUrl.replace(/\/+$/, '');
  const parts: string[] = [];
  for (const sub of CONTACT_PAGES) {
    const text = await fetchPageText(base + sub);
    if (text.length > 100) {
      parts.push(`[${sub || '/'}]\n${text.slice(0, 3000)}`);
      if (parts.join('\n').length > 10000) break;
    }
  }
  return parts.join('\n\n').slice(0, 12000);
}

interface ExtractedContact {
  email: string | null;
  phone: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
}

async function extractContacts(rows: DBRow[]): Promise<{ id: string; contact: ExtractedContact }[]> {
  const results: { id: string; contact: ExtractedContact }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const website = (row.config_data as Record<string, unknown>).websiteUrl as string;
    if (!website || website.includes('zefix.ch')) continue;

    const content = await fetchContactContent(website);
    if (!content || content.length < 100) continue;

    const result = await callGroqJSON(
      `Extrahiere die Kontaktdaten der STIFTUNG (nicht Webdesigner/Partner).
JSON: {"email": "... oder null", "phone": "+41... oder null", "street": "Strasse Nr oder null", "zip": "4-stellige PLZ oder null", "city": "Ort oder null"}
NUR Daten die im Text stehen. Nichts erfinden.`,
      `Stiftung: ${row.name}\n\n${content}`,
      { temperature: 0, model: GROQ_MODELS['70b'] },
    );

    if (result.ok) {
      const d = result.data as Record<string, string | null>;
      const contact: ExtractedContact = {
        email: d.email && d.email.includes('@') ? d.email : null,
        phone: d.phone && (d.phone.includes('+') || d.phone.includes('0')) ? d.phone : null,
        street: d.street && d.street.length > 3 ? d.street : null,
        zip: d.zip && /^\d{4}$/.test(d.zip) ? d.zip : null,
        city: d.city && d.city.length > 1 ? d.city : null,
      };

      if (contact.email || contact.zip) {
        results.push({ id: row.id, contact });
        const addr = [contact.street, contact.zip, contact.city].filter(Boolean).join(', ');
        console.log(`  📧 ${row.name.slice(0, 35).padEnd(35)} → ${contact.email ?? '-'} | ${addr || '-'} | ${contact.phone ?? '-'}`);
      }
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 2000));

    if ((i + 1) % 20 === 0) {
      console.log(`  ... ${i + 1}/${rows.length} scraped, ${results.length} enriched`);
    }
  }

  return results;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('━'.repeat(60));
  console.log('  Foundation Enrichment via LLM');
  console.log('━'.repeat(60));
  console.log(`  MODE: ${DRY_RUN ? 'Dry run' : 'LIVE'}`);
  console.log(`  LIMIT: ${LIMIT}`);
  console.log(`  PASS: ${PASS || 'both'}\n`);

  // ── PASS 1: Discover websites ──
  if (!PASS || PASS === '1') {
    console.log('── Pass 1: Discover website URLs via LLM ──\n');

    const noWebsite = await sql`
      SELECT id, name, config_data->>'region' as region,
             config_data->>'websiteUrl' as website,
             config_data as config_data
      FROM fundraising_foundations
      WHERE (config_data->>'websiteUrl' IS NULL
             OR config_data->>'websiteUrl' LIKE '%zefix.ch%'
             OR config_data->>'websiteUrl' LIKE '%stiftungschweiz.ch%'
             OR config_data->>'websiteUrl' = '')
        AND config_data->>'fitScore' IS NOT NULL
        AND (config_data->>'fitScore')::int >= 3
      ORDER BY (config_data->>'fitScore')::int DESC,
               (config_data->>'priority')::int ASC
      LIMIT ${LIMIT}
    ` as DBRow[];

    console.log(`  ${noWebsite.length} foundations without website\n`);
    const discovered = await discoverWebsites(noWebsite);

    if (!DRY_RUN && discovered.size > 0) {
      for (const [id, url] of discovered) {
        const row = noWebsite.find(r => r.id === id)!;
        const cd = row.config_data as Record<string, unknown>;
        cd.websiteUrl = url;
        await sql`
          UPDATE fundraising_foundations
          SET config_data = ${JSON.stringify(cd)}::jsonb, updated_at = NOW()
          WHERE id = ${id}
        `;
      }
      console.log(`\n  Saved ${discovered.size} new website URLs to DB`);
    }
  }

  // ── PASS 2: Extract contacts from websites ──
  if (!PASS || PASS === '2') {
    console.log('\n── Pass 2: Extract contacts from websites ──\n');

    const withWebsite = await sql`
      SELECT id, name, config_data->>'region' as region,
             config_data->>'websiteUrl' as website,
             config_data as config_data
      FROM fundraising_foundations
      WHERE config_data->>'websiteUrl' IS NOT NULL
        AND config_data->>'websiteUrl' NOT LIKE '%zefix.ch%'
        AND config_data->>'websiteUrl' NOT LIKE '%stiftungschweiz.ch%'
        AND config_data->>'websiteUrl' != ''
        AND (
          config_data->'contact'->>'email' IS NULL
          OR config_data->'contact'->>'address' IS NULL
          OR config_data->'contact'->>'address' NOT SIMILAR TO '%[0-9]{4}%'
        )
      ORDER BY (config_data->>'fitScore')::int DESC NULLS LAST
      LIMIT ${LIMIT}
    ` as DBRow[];

    console.log(`  ${withWebsite.length} foundations with website but missing contacts\n`);
    const contacts = await extractContacts(withWebsite);

    if (!DRY_RUN && contacts.length > 0) {
      let newEmails = 0, newAddresses = 0, newPhones = 0;

      for (const { id, contact } of contacts) {
        const row = withWebsite.find(r => r.id === id)!;
        const cd = row.config_data as Record<string, unknown>;
        const existing = (cd.contact ?? {}) as Record<string, string | undefined>;
        let changed = false;

        if (contact.email && !existing.email) { existing.email = contact.email; newEmails++; changed = true; }
        if (contact.phone && !existing.phone) { existing.phone = contact.phone; newPhones++; changed = true; }
        if (contact.zip && contact.city && (!existing.address || !/\d{4}/.test(existing.address))) {
          existing.address = contact.street
            ? `${contact.street}, ${contact.zip} ${contact.city}`
            : `${contact.zip} ${contact.city}`;
          newAddresses++;
          changed = true;
        }

        if (changed) {
          cd.contact = existing;
          await sql`
            UPDATE fundraising_foundations
            SET config_data = ${JSON.stringify(cd)}::jsonb, updated_at = NOW()
            WHERE id = ${id}
          `;
        }
      }

      console.log(`\n  Saved: ${newEmails} emails, ${newAddresses} addresses, ${newPhones} phones`);
    }
  }

  console.log('\n━'.repeat(60));
  if (!DRY_RUN) console.log('  Run: npm run sync && npm run build');
  else console.log('  DRY RUN — no changes made');
  console.log('━'.repeat(60));
}

main().catch(console.error);
