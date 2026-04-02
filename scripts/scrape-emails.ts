/**
 * Scrape foundation websites for contact info (email, phone).
 *
 * Fetches main page + /kontakt + /impressum + /contact for each foundation
 * that has a real website but no email in the DB.
 *
 * Usage: npx tsx scripts/scrape-emails.ts [--dry-run] [--fit-min=N]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { isRegistryUrl } from '../src/lib/config/registry-domains';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');
const FIT_MIN = parseInt(process.argv.find(a => a.startsWith('--fit-min='))?.split('=')[1] || '0');

// Noise emails to filter out
const NOISE_DOMAINS = [
  'google.com', 'googleapis.com', 'cloudflare.com', 'wordpress.com', 'wordpress.org',
  'w3.org', 'schema.org', 'gravatar.com', 'example.com', 'example.org',
  'sentry.io', 'wixpress.com', 'squarespace.com', 'mailchimp.com',
  'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
  'youtube.com', 'vimeo.com', 'flickr.com', 'pinterest.com',
  'adobe.com', 'microsoft.com', 'apple.com', 'amazon.com',
  'jimdo.com', 'weebly.com', 'ionos.com', 'hostpoint.ch',
  'protection.outlook.com', 'spamhaus.org',
];

const NOISE_PREFIXES = [
  'noreply@', 'no-reply@', 'mailer-daemon@', 'postmaster@',
  'webmaster@', 'hostmaster@', 'abuse@', 'root@',
];

// Preferred email prefixes (higher priority)
const PREFERRED_PREFIXES = [
  'info@', 'kontakt@', 'contact@', 'stiftung@', 'sekretariat@',
  'office@', 'admin@', 'hello@', 'mail@', 'geschaeftsstelle@',
];

interface ScrapeResult {
  id: string;
  name: string;
  fit: number;
  website: string;
  emails: string[];
  phones: string[];
  source: string;
}

function isNoiseEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (NOISE_DOMAINS.some(d => lower.endsWith('@' + d))) return true;
  if (NOISE_PREFIXES.some(p => lower.startsWith(p))) return true;
  if (lower.includes('privacy') || lower.includes('dpo@') || lower.includes('datenschutz')) return true;
  // Filter CSS/JS artifacts
  if (lower.includes('{') || lower.includes('}') || lower.includes('\\')) return true;
  if (lower.length < 5 || lower.length > 80) return true;
  return false;
}

function pickBestEmail(emails: string[]): string | null {
  if (emails.length === 0) return null;
  // Prefer known good prefixes
  for (const prefix of PREFERRED_PREFIXES) {
    const match = emails.find(e => e.toLowerCase().startsWith(prefix));
    if (match) return match.toLowerCase();
  }
  // Otherwise first one
  return emails[0].toLowerCase();
}

function extractEmails(html: string): string[] {
  // Match emails in href="mailto:..." and plain text
  const mailtoPattern = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  const plainPattern = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g;

  const found = new Set<string>();
  let m;
  while ((m = mailtoPattern.exec(html)) !== null) found.add(m[1].toLowerCase());
  while ((m = plainPattern.exec(html)) !== null) found.add(m[1].toLowerCase());

  return [...found].filter(e => !isNoiseEmail(e));
}

function extractPhones(html: string): string[] {
  // Swiss phone numbers: +41 XX XXX XX XX or 0XX XXX XX XX
  const patterns = [
    /(?:tel:|href="tel:)?\+41[\s.\-]?\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}/gi,
    /(?:tel:|href="tel:)?0\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}/gi,
  ];

  const found = new Set<string>();
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(html)) !== null) {
      let phone = m[0].replace(/^(tel:|href="tel:)/, '').trim();
      // Normalize: +41 XX XXX XX XX
      phone = phone.replace(/[.\-]/g, ' ').replace(/\s+/g, ' ').trim();
      if (phone.startsWith('0')) {
        phone = '+41 ' + phone.slice(1);
      }
      found.add(phone);
    }
  }
  return [...found];
}

async function fetchPage(url: string, timeout = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RevampIT-Research/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.5',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html') && !ct.includes('text/plain') && !ct.includes('application/xhtml')) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function scrapeFoundation(f: { id: string; name: string; fit: number; website: string }): Promise<ScrapeResult> {
  const result: ScrapeResult = { ...f, emails: [], phones: [], source: '' };

  let baseUrl = f.website.replace(/\/$/, '');
  if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;

  const pages = [
    baseUrl,
    baseUrl + '/kontakt',
    baseUrl + '/contact',
    baseUrl + '/impressum',
    baseUrl + '/about',
    baseUrl + '/ueber-uns',
  ];

  const allEmails = new Set<string>();
  const allPhones = new Set<string>();

  for (const url of pages) {
    const html = await fetchPage(url);
    if (!html) continue;

    const emails = extractEmails(html);
    const phones = extractPhones(html);

    emails.forEach(e => allEmails.add(e));
    phones.forEach(p => allPhones.add(p));

    if (!result.source && (emails.length > 0 || phones.length > 0)) {
      result.source = url;
    }
  }

  result.emails = [...allEmails];
  result.phones = [...allPhones];
  return result;
}

async function main() {
  console.log(`=== Foundation Email Scraper ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Minimum fit: ${FIT_MIN}`);
  console.log('');

  // Get foundations with a URL but no email, then filter out registry URLs in JS (SSOT)
  const allWithUrl = await sql`
    SELECT id, name, COALESCE(website_url, config_data->>'websiteUrl') as website,
           COALESCE(fit_score,0) as fit
    FROM fundraising_foundations
    WHERE (archived=false OR archived IS NULL)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (contact_email IS NULL OR contact_email = '')
      AND COALESCE(website_url, config_data->>'websiteUrl') IS NOT NULL
      AND COALESCE(website_url, config_data->>'websiteUrl') != ''
      AND COALESCE(fit_score,0) >= ${FIT_MIN}
    ORDER BY COALESCE(fit_score,0) DESC, name
  ` as { id: string; name: string; website: string; fit: number }[];

  // Filter out registry/directory URLs using SSOT
  const foundations = allWithUrl.filter(f => !isRegistryUrl(f.website));

  console.log(`Found ${foundations.length} foundations to scrape\n`);

  let foundEmails = 0;
  let foundPhones = 0;
  let updated = 0;
  const results: ScrapeResult[] = [];

  // Process in batches of 5 for controlled parallelism
  const BATCH_SIZE = 5;
  for (let i = 0; i < foundations.length; i += BATCH_SIZE) {
    const batch = foundations.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(f => scrapeFoundation(f)));

    for (const result of batchResults) {
      const bestEmail = pickBestEmail(result.emails);
      const bestPhone = result.phones[0] || null;

      const status = bestEmail ? '✅' : '❌';
      console.log(`${status} [fit=${result.fit}] ${result.name} — ${bestEmail || 'no email found'} ${bestPhone ? '📞' + bestPhone : ''}`);

      if (bestEmail) foundEmails++;
      if (bestPhone) foundPhones++;

      if ((bestEmail || bestPhone) && !DRY_RUN) {
        // Update DB: flat columns
        const updates: Record<string, string> = {};
        if (bestEmail) updates.contact_email = bestEmail;
        if (bestPhone) updates.contact_phone = bestPhone;

        // Build dynamic update
        if (bestEmail && bestPhone) {
          await sql`UPDATE fundraising_foundations SET contact_email = ${bestEmail}, contact_phone = ${bestPhone} WHERE id = ${result.id}`;
        } else if (bestEmail) {
          await sql`UPDATE fundraising_foundations SET contact_email = ${bestEmail} WHERE id = ${result.id}`;
        } else if (bestPhone) {
          await sql`UPDATE fundraising_foundations SET contact_phone = ${bestPhone} WHERE id = ${result.id}`;
        }

        // Also update configData JSONB to keep in sync
        const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${result.id}`;
        if (row?.config_data) {
          const cd = row.config_data as Record<string, unknown>;
          if (!cd.contact) cd.contact = {};
          const contact = cd.contact as Record<string, string>;
          if (bestEmail) contact.email = bestEmail;
          if (bestPhone) contact.phone = bestPhone;
          await sql`UPDATE fundraising_foundations SET config_data = ${JSON.stringify(cd)}::jsonb WHERE id = ${result.id}`;
        }

        updated++;
      }

      results.push(result);
    }

    // Small delay between batches to be polite
    if (i + BATCH_SIZE < foundations.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Scraped: ${foundations.length} foundations`);
  console.log(`Found emails: ${foundEmails} (${Math.round(foundEmails * 100 / foundations.length)}%)`);
  console.log(`Found phones: ${foundPhones}`);
  console.log(`Updated in DB: ${updated}`);

  // Print detailed results for foundations where we found data
  console.log('\n=== ENRICHED FOUNDATIONS ===');
  results.filter(r => r.emails.length > 0 || r.phones.length > 0).forEach(r => {
    console.log(`${r.id} | fit=${r.fit} | email=${pickBestEmail(r.emails)} | phone=${r.phones[0] || ''} | source=${r.source}`);
  });
}

main().catch(console.error);
