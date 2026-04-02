// Scrape email and phone from foundation websites
// Hits each URL, extracts email/phone patterns from HTML
// Only updates if we actually find something

const https = require('https');
const http = require('http');
const { neon } = require('@neondatabase/serverless');

function fetchPage(url, timeout = 5000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevampIT-Research/1.0)' },
      timeout 
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        try {
          const newUrl = new URL(res.headers.location, url).href;
          fetchPage(newUrl, timeout).then(resolve);
        } catch(e) { resolve(''); }
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; if (data.length > 200000) res.destroy(); });
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function extractEmails(html) {
  const emails = new Set();
  // Standard email pattern
  const matches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const m of matches) {
    const e = m.toLowerCase();
    // Skip common junk
    if (e.includes('example.com') || e.includes('wixpress') || e.includes('sentry') || 
        e.includes('googletagmanager') || e.includes('.png') || e.includes('.jpg') ||
        e.includes('webpack') || e.includes('schema.org') || e.endsWith('.js')) continue;
    emails.add(e);
  }
  return [...emails];
}

function extractPhones(html) {
  const phones = new Set();
  // Swiss phone numbers: +41 XX XXX XX XX or 0XX XXX XX XX
  // Must start with +41 or 0 followed by proper area code (2x, 3x, 4x, 5x, 6x, 7x, 8x)
  const matches = html.match(/\+41\s?(?:\(0\))?\s?[2-9]\d\s?\d{3}\s?\d{2}\s?\d{2}/g) || [];
  for (const m of matches) {
    const clean = m.replace(/\s+/g, ' ').trim();
    phones.add(clean);
  }
  return [...phones];
}

function pickBestEmail(emails, domain) {
  // Prefer info@, kontakt@, stiftung@, then first
  const prefs = ['info@', 'kontakt@', 'contact@', 'stiftung@', 'office@', 'mail@', 'admin@'];
  for (const pref of prefs) {
    const match = emails.find(e => e.startsWith(pref));
    if (match) return match;
  }
  // Prefer email on same domain as website
  if (domain) {
    const domainEmail = emails.find(e => e.includes(domain));
    if (domainEmail) return domainEmail;
  }
  return emails[0] || null;
}

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Get foundations with real websites but missing email/phone
  const foundations = await sql`
    SELECT id, name, website_url, contact_email, contact_phone
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
    AND (archived = false OR archived IS NULL)
    AND website_url IS NOT NULL AND website_url != '' 
    AND website_url NOT LIKE '%zefix.ch%'
    AND website_url NOT LIKE '%spheriq%'
    AND website_url NOT LIKE '%fundraiso%'
    AND website_url NOT LIKE '%stiftungschweiz%'
    AND website_url NOT LIKE '%zefix.admin%'
    AND (contact_email IS NULL OR contact_email = '' OR contact_phone IS NULL OR contact_phone = '')
    ORDER BY priority ASC, fit_score DESC
  `;
  
  console.log(`Foundations with own website needing email/phone: ${foundations.length}`);
  
  let updated = 0, scraped = 0, failed = 0;
  
  for (let i = 0; i < foundations.length; i++) {
    const f = foundations[i];
    try {
      // Try main page
      let html = await fetchPage(f.website_url);
      
      // Also try /kontakt, /contact, /impressum
      const base = f.website_url.replace(/\/$/, '');
      for (const path of ['/kontakt', '/contact', '/impressum', '/about', '/ueber-uns']) {
        const extra = await fetchPage(base + path);
        html += extra;
      }
      
      scraped++;
      
      const emails = extractEmails(html);
      const phones = extractPhones(html);
      const domain = new URL(f.website_url).hostname.replace('www.', '');
      
      const newEmail = !f.contact_email ? pickBestEmail(emails, domain) : null;
      const newPhone = !f.contact_phone && phones.length > 0 ? phones[0] : null;
      
      if (newEmail || newPhone) {
        const existing = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${f.id}`;
        if (existing[0]) {
          const config = existing[0].config_data;
          if (!config.contact) config.contact = {};
          if (newEmail) {
            config.contact.email = newEmail;
            await sql`UPDATE fundraising_foundations SET contact_email = ${newEmail} WHERE id = ${f.id}`;
          }
          if (newPhone) {
            config.contact.phone = newPhone;
            await sql`UPDATE fundraising_foundations SET contact_phone = ${newPhone} WHERE id = ${f.id}`;
          }
          await sql`UPDATE fundraising_foundations SET config_data = ${JSON.stringify(config)}::jsonb, updated_at = NOW() WHERE id = ${f.id}`;
          updated++;
          console.log(`✅ ${f.name}: email=${newEmail||'(had)'} phone=${newPhone||'(had)'}`);
        }
      }
      
      if ((i+1) % 20 === 0) console.log(`  Progress: ${i+1}/${foundations.length} (updated: ${updated})`);
      
      // Rate limit - 500ms between foundations
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      failed++;
    }
  }
  
  console.log(`\nDone: scraped=${scraped} updated=${updated} failed=${failed}`);
}

main().catch(console.error);
