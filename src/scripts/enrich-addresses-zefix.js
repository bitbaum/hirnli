// Batch enrich ALL foundations missing addresses from Zefix SHAB
// Free, authoritative, scalable

const https = require('https');
const { neon } = require('@neondatabase/serverless');

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(null); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    }).on('error', reject);
  });
}

function extractAddress(shabPubs) {
  if (!shabPubs || !shabPubs.length) return null;
  const sorted = shabPubs.sort((a, b) => b.shabDate.localeCompare(a.shabDate));
  for (const pub of sorted) {
    const msg = (pub.message || '').replace(/&amp;/g, '&');
    const domMatch = msg.match(/Domizil(?:\s+neu)?:\s*([^.]+)/i);
    if (domMatch) return domMatch[1].trim().replace(/<[^>]+>/g, '');
    const addrMatch = msg.match(/(?:c\/o[^,]+,\s*)?([A-ZÀ-Ü][a-zà-ü]*(?:strasse|gasse|weg|platz|rain|allee|quai)\s+\d+[a-z]?)\s*,\s*(\d{4})\s+([A-ZÀ-Ü][a-zà-ü]+)/i);
    if (addrMatch) return `${addrMatch[1]}, ${addrMatch[2]} ${addrMatch[3]}`;
  }
  return null;
}

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Get ALL visible foundations missing addresses
  const gaps = await sql`
    SELECT id, name, config_data->>'uid' as uid, config_data->'contact'->>'address' as addr
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
    AND (archived = false OR archived IS NULL)
    AND (
      config_data->'contact'->>'address' IS NULL
      OR config_data->'contact'->>'address' = ''
      OR config_data->'contact'->>'address' NOT SIMILAR TO '%[0-9]%'
    )
    ORDER BY priority ASC, fit_score DESC
  `;
  
  console.log(`Foundations missing street addresses: ${gaps.length}`);
  
  let found = 0, notFound = 0, errors = 0;
  const toUpdate = [];
  
  for (let i = 0; i < gaps.length; i++) {
    const f = gaps[i];
    try {
      const search = await postJson('https://www.zefix.ch/ZefixREST/api/v1/firm/search.json', 
        { name: f.name, searchType: 'exact' });
      
      if (!search || !search.list || search.list.length === 0) {
        notFound++;
        continue;
      }
      
      const detail = await fetchJson(`https://www.zefix.ch/ZefixREST/api/v1/firm/${search.list[0].ehraid}`);
      if (!detail) { notFound++; continue; }
      
      const addr = extractAddress(detail.shabPub);
      if (addr) {
        toUpdate.push({ slug: f.id, address: addr });
        found++;
      } else {
        notFound++;
      }
      
      if ((i+1) % 50 === 0) console.log(`  Progress: ${i+1}/${gaps.length} (found: ${found})`);
      await new Promise(r => setTimeout(r, 150)); // Rate limit
    } catch (e) {
      errors++;
    }
  }
  
  console.log(`\nZefix lookup complete: found=${found} notFound=${notFound} errors=${errors}`);
  
  // Write to DB
  let written = 0;
  for (const u of toUpdate) {
    try {
      const existing = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${u.slug}`;
      if (!existing[0]) continue;
      const config = existing[0].config_data;
      if (!config.contact) config.contact = {};
      config.contact.address = u.address;
      await sql`UPDATE fundraising_foundations SET config_data = ${JSON.stringify(config)}::jsonb, updated_at = NOW() WHERE id = ${u.slug}`;
      written++;
    } catch (e) {}
  }
  
  console.log(`Written to DB: ${written} addresses`);
}

main().catch(console.error);
