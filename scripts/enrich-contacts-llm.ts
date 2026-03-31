#!/usr/bin/env tsx
/**
 * Contact Enrichment via LLM — Find website, email, phone, address for foundations
 *
 * For each foundation: fetches website content (homepage + /kontakt + /impressum),
 * sends to Groq LLM to extract structured contact data. Updates DB directly.
 *
 * Usage:
 *   npx tsx scripts/enrich-contacts-llm.ts --dry-run --limit=5
 *   npx tsx scripts/enrich-contacts-llm.ts --limit=50
 *   npx tsx scripts/enrich-contacts-llm.ts              # all eligible
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { callGroqJSON, GROQ_MODELS } from './lib/groq-client';
import type { Foundation } from '../src/lib/schemas/foundation';

const sql = neon(process.env.DATABASE_URL!);

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '200');
const TIMEOUT_MS = 8000;
const CONCURRENCY = 2; // Groq rate limits

// Pages to try for contact info
const CONTACT_PAGES = ['', '/kontakt', '/contact', '/impressum', '/ueber-uns', '/about', '/stiftung'];

// ============================================================================
// Web fetching
// ============================================================================

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
      .replace(/\n{3,}/g, '\n')
      .trim()
      .slice(0, 8000); // Limit context for LLM
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
    const url = base + sub;
    const text = await fetchPageText(url);
    if (text && text.length > 100) {
      parts.push(`--- ${url} ---\n${text.slice(0, 4000)}`);
      if (parts.join('\n').length > 12000) break; // Enough context
    }
  }
  return parts.join('\n\n').slice(0, 15000);
}

// ============================================================================
// LLM extraction
// ============================================================================

const EXTRACT_PROMPT = `Du erhältst den Textinhalt einer Schweizer Stiftungswebsite. Extrahiere die Kontaktdaten der STIFTUNG (nicht von Partnern, Webdesignern, oder anderen Organisationen).

Antworte NUR mit einem JSON-Objekt:
{
  "email": "info@example.ch oder null wenn nicht gefunden",
  "phone": "+41 XX XXX XX XX oder null",
  "street": "Strassenname Hausnummer oder null",
  "zip": "4-stellige PLZ oder null",
  "city": "Ortsname oder null"
}

Regeln:
- NUR Kontaktdaten der Stiftung selbst, nicht von Webdesignern oder Hosting-Firmen
- Schweizer PLZ ist immer 4-stellig (1000-9999)
- Wenn "CH-" vor der PLZ steht, entferne das Präfix
- Wenn keine Strasse gefunden, aber Stadt/PLZ, gib nur Stadt und PLZ
- Wenn gar nichts gefunden: alle Felder null
- Bevorzuge info@, kontakt@, stiftung@ E-Mail-Adressen
- Ignoriere noreply@, webmaster@, datenschutz@ Adressen`;

interface ExtractedContact {
  email: string | null;
  phone: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
}

async function extractContactsViaLLM(websiteContent: string, foundationName: string): Promise<ExtractedContact | null> {
  if (!websiteContent || websiteContent.length < 50) return null;

  try {
    const result = await callGroqJSON(
      EXTRACT_PROMPT,
      `Stiftung: ${foundationName}\n\nWebsite-Inhalt:\n${websiteContent}`,
      { temperature: 0, model: GROQ_MODELS['70b'] },
    );

    if (!result.ok) return null;
    const r = result.data as Record<string, unknown>;

    return {
      email: typeof r.email === 'string' && r.email.includes('@') ? r.email : null,
      phone: typeof r.phone === 'string' && r.phone.includes('+') ? r.phone : null,
      street: typeof r.street === 'string' && r.street.length > 3 ? r.street : null,
      zip: typeof r.zip === 'string' && /^\d{4}$/.test(r.zip) ? r.zip : null,
      city: typeof r.city === 'string' && r.city.length > 1 ? r.city : null,
    };
  } catch (e) {
    return null;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('━'.repeat(60));
  console.log('  Contact Enrichment via LLM (Groq)');
  console.log('━'.repeat(60));
  console.log(`  MODE: ${DRY_RUN ? 'Dry run' : 'LIVE — will update DB'}`);
  console.log(`  LIMIT: ${LIMIT}\n`);

  // Get foundations with website but missing email OR street address
  const rows = await sql`
    SELECT id, name,
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
    ORDER BY (config_data->>'fitScore')::int DESC NULLS LAST,
             (config_data->>'priority')::int ASC NULLS LAST
    LIMIT ${LIMIT}
  ` as { id: string; name: string; website: string; config_data: Foundation }[];

  console.log(`  Found ${rows.length} foundations to enrich\n`);

  let enriched = 0;
  let newEmails = 0;
  let newAddresses = 0;
  let newPhones = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);

    const results = await Promise.all(batch.map(async (row) => {
      try {
        const content = await fetchContactContent(row.website);
        if (!content) return { row, contact: null };
        const contact = await extractContactsViaLLM(content, row.name);
        return { row, contact };
      } catch {
        return { row, contact: null };
      }
    }));

    for (const { row, contact } of results) {
      if (!contact) {
        errors++;
        continue;
      }

      const cd = row.config_data as Record<string, unknown>;
      const existing = (cd.contact ?? {}) as Record<string, string | undefined>;
      let changed = false;

      // Only fill in MISSING data — never overwrite existing
      if (contact.email && !existing.email) {
        existing.email = contact.email;
        newEmails++;
        changed = true;
      }
      if (contact.phone && !existing.phone) {
        existing.phone = contact.phone;
        newPhones++;
        changed = true;
      }
      if (contact.zip && contact.city) {
        const currentAddr = existing.address ?? '';
        const hasZip = /\d{4}/.test(currentAddr);
        if (!hasZip) {
          const street = contact.street ?? '';
          existing.address = street
            ? `${street}, ${contact.zip} ${contact.city}`
            : `${contact.zip} ${contact.city}`;
          newAddresses++;
          changed = true;
        }
      }

      if (changed) {
        enriched++;
        cd.contact = existing;
        const emoji = contact.email ? '📧' : contact.zip ? '📍' : '📞';
        console.log(`  ${emoji} ${row.name.slice(0, 40).padEnd(40)} → email: ${contact.email ?? '-'} | ${contact.street ?? '-'}, ${contact.zip ?? '-'} ${contact.city ?? '-'} | ${contact.phone ?? '-'}`);

        if (!DRY_RUN) {
          await sql`
            UPDATE fundraising_foundations
            SET config_data = ${JSON.stringify(cd)}::jsonb,
                updated_at = NOW()
            WHERE id = ${row.id}
          `;
        }
      }
    }

    // Progress
    if ((i + CONCURRENCY) % 20 === 0 || i + CONCURRENCY >= rows.length) {
      console.log(`  ... ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length} processed, ${enriched} enriched`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('  RESULTS');
  console.log('━'.repeat(60));
  console.log(`  Processed:      ${rows.length}`);
  console.log(`  Enriched:       ${enriched}`);
  console.log(`  New emails:     ${newEmails}`);
  console.log(`  New addresses:  ${newAddresses}`);
  console.log(`  New phones:     ${newPhones}`);
  console.log(`  Errors/empty:   ${errors}`);
  if (DRY_RUN) console.log('\n  DRY RUN — no DB changes made.');
  else if (enriched > 0) console.log('\n  Run: npm run sync && npm run build');
  console.log();
}

main().catch(console.error);
