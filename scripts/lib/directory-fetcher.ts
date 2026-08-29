/**
 * Directory Fetcher — Extract contact data from curated foundation directories
 *
 * Pulls structured data from Spheriq (StiftungSchweiz) profiles.
 * Spheriq embeds entity JSON in HTML — we extract it with regex, not scraping.
 *
 * Fundraiso is JS-rendered and can't be fetched with HTTP (would need browser).
 * We only support Spheriq as it has server-rendered contact data.
 */

const SPHERIQ_BASE = 'https://app.spheriq.ch/organisation';
const SPHERIQ_PHONE = '+41 61 278 93 83'; // Spheriq's own phone, filter it

const NOISE_EMAILS = new Set([
  'office@spheriq.ch',
  'support@spheriq.ch',
  'kontakt@freihandlabor.com',
]);
const NOISE_DOMAINS = new Set([
  'spheriq.ch',
  'stiftungschweiz.ch',
  'google.com',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'sentry.io',
  'wixpress.com',
  'example.com',
  'wordpress.com',
]);

export interface DirectoryResult {
  source: 'spheriq';
  profileUrl: string;
  email?: string;
  phone?: string;
  website?: string;
}

function isNoiseEmail(email: string): boolean {
  if (NOISE_EMAILS.has(email.toLowerCase())) return true;
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && NOISE_DOMAINS.has(domain)) return true;
  if (/[{}\\]|\.png|\.jpg|\.webp|\.css/.test(email)) return true;
  if (email.length < 5 || email.length > 60) return true;
  return false;
}

function parseSpheriqHtml(html: string): Omit<DirectoryResult, 'source' | 'profileUrl'> {
  const result: Omit<DirectoryResult, 'source' | 'profileUrl'> = {};

  // 1. Entity JSON: :entity="{&quot;email&quot;:&quot;info@example.ch&quot;,...}"
  const entityMatch = html.match(/:entity="\{[^}]*\}"/);
  if (entityMatch) {
    const decoded = entityMatch[0].replace(/&quot;/g, '"');
    const emailMatch = decoded.match(/"email":"([^"]+)"/);
    if (emailMatch && emailMatch[1] !== 'null' && !isNoiseEmail(emailMatch[1])) {
      result.email = emailMatch[1].toLowerCase();
    }
  }

  // 2. mail-btn links (Spheriq's structured contact buttons)
  const mailBtnMatches = html.matchAll(/<a\s+class="mail-btn"\s+href="([^"]+)"/g);
  for (const m of mailBtnMatches) {
    const href = m[1];
    if (href.startsWith('mailto:') && !result.email) {
      const email = href.replace('mailto:', '').toLowerCase();
      if (!isNoiseEmail(email)) result.email = email;
    } else if (
      href.startsWith('http') &&
      !href.includes('spheriq') &&
      !href.includes('stiftungschweiz')
    ) {
      if (!result.website) result.website = href;
    }
  }

  // 3. Phone — from contact section, not Spheriq footer
  const phoneMatches =
    html.match(
      /(?:\+41|0041)[\s.]?\(?\d?\)?[\s./\-]?\d{2}[\s./\-]?\d{3}[\s./\-]?\d{2}[\s./\-]?\d{2}/g,
    ) || [];
  const unique = [...new Set(phoneMatches.map((p) => p.trim()))].filter((p) => p !== SPHERIQ_PHONE);
  if (unique.length > 0) result.phone = unique[0];

  return result;
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevampIT-Research/1.0)' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

/** Fetch a foundation's Spheriq profile. Tries slug first, falls back to UID search. */
export async function fetchSpheriqProfile(
  slug: string,
  uid?: string,
): Promise<DirectoryResult | null> {
  // Try direct slug match
  const directRes = await fetchWithTimeout(`${SPHERIQ_BASE}/${slug}`);
  if (directRes?.ok) {
    const finalUrl = directRes.url;
    // Spheriq redirects to /suche if not found
    if (!finalUrl.includes('/suche')) {
      const html = await directRes.text();
      const data = parseSpheriqHtml(html);
      if (data.email || data.phone || data.website) {
        return { source: 'spheriq', profileUrl: finalUrl, ...data };
      }
      // Profile found but no contact data
      return { source: 'spheriq', profileUrl: finalUrl };
    }
  }

  // Fallback: search by UID (more reliable slug matching)
  if (uid) {
    const searchRes = await fetchWithTimeout(
      `https://stiftungen.stiftungschweiz.ch/search?q=${encodeURIComponent(uid)}`,
    );
    if (searchRes?.ok && searchRes.url.includes('/organisation/')) {
      const html = await searchRes.text();
      const data = parseSpheriqHtml(html);
      return { source: 'spheriq', profileUrl: searchRes.url, ...data };
    }
  }

  return null;
}
