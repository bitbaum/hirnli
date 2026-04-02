/**
 * Discover real foundation websites for entries that only have registry URLs.
 *
 * Strategy: generate candidate URLs from foundation name/slug, HTTP HEAD each,
 * and update the DB when a real website is found.
 *
 * Usage: npx tsx scripts/discover-websites.ts [--dry-run] [--fit-min=N]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { isRegistryUrl } from '../src/lib/config/registry-domains';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');
const FIT_MIN = parseInt(process.argv.find(a => a.startsWith('--fit-min='))?.split('=')[1] || '0');

// Swiss canton domains and known unrelated short domains — never match these
const BLOCKED_DOMAINS = new Set([
  'ag.ch', 'ai.ch', 'ar.ch', 'be.ch', 'bl.ch', 'bs.ch', 'fr.ch', 'ge.ch',
  'gl.ch', 'gr.ch', 'ju.ch', 'lu.ch', 'ne.ch', 'nw.ch', 'ow.ch', 'sg.ch',
  'sh.ch', 'so.ch', 'sz.ch', 'tg.ch', 'ti.ch', 'ur.ch', 'vd.ch', 'vs.ch',
  'zg.ch', 'zh.ch',
  'sap.ch', 'ubs.ch', 'ibm.ch', 'abb.ch', 'sbb.ch',
  'help.ch', 'pep.ch', 'opo.ch', 'ofg.ch', 'icn.ch', 'mhs.ch',
  'atc.ch', 'dsb.ch', 'mbe.ch', 'bew.ch', 'kmw.ch', 'cil.ch', 'lum.ch',
  'fes.ch', 'hiz.ch', 'jacobs.ch',
]);

/** Generate candidate URLs from foundation name and slug */
function generateCandidates(slug: string, name: string): string[] {
  const candidates: string[] = [];

  // Direct slug-based (most reliable)
  candidates.push(`https://www.${slug}.ch`);
  candidates.push(`https://${slug}.ch`);

  // With stiftung- prefix/suffix
  const cleanSlug = slug.replace(/-stiftung$/, '').replace(/^stiftung-/, '');
  if (cleanSlug !== slug) {
    candidates.push(`https://www.${cleanSlug}.ch`);
    candidates.push(`https://${cleanSlug}.ch`);
  }
  candidates.push(`https://www.stiftung-${cleanSlug}.ch`);
  candidates.push(`https://stiftung-${cleanSlug}.ch`);

  // Abbreviation patterns: "Liliane Hirzel-Atzli Stiftung" → "lha"
  // Only try abbreviation + "-stiftung.ch" pattern (bare abbreviations are too risky)
  const words = name
    .replace(/Stiftung|Foundation|Fondation|Fondazione/gi, '')
    .replace(/[^a-zA-ZäöüÄÖÜ\s-]/g, '')
    .trim()
    .split(/[\s-]+/)
    .filter(w => w.length > 0);

  if (words.length >= 2) {
    const abbr = words.map(w => w[0].toLowerCase()).join('');
    if (abbr.length >= 3 && abbr.length <= 6) {
      candidates.push(`https://www.${abbr}-stiftung.ch`);
      candidates.push(`https://${abbr}-stiftung.ch`);
    }
  }

  // .org variants for foundations with international focus
  candidates.push(`https://www.${slug}.org`);
  candidates.push(`https://${slug}.org`);

  // Filter out blocked domains
  return [...new Set(candidates)].filter(url => {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return !BLOCKED_DOMAINS.has(hostname);
    } catch { return true; }
  });
}

/** Check if a URL responds with a real page */
async function probeUrl(url: string, timeout = 6000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RevampIT-Research/1.0)',
      },
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

interface Discovery {
  id: string;
  name: string;
  fit: number;
  oldUrl: string;
  newUrl: string;
}

async function main() {
  console.log('=== Foundation Website Discovery ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Minimum fit: ${FIT_MIN}\n`);

  // Get foundations with no real website
  const rows = await sql`
    SELECT id, name, COALESCE(website_url, config_data->>'websiteUrl', '') as website,
           COALESCE(fit_score,0) as fit
    FROM fundraising_foundations
    WHERE (archived=false OR archived IS NULL)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND COALESCE(fit_score,0) >= ${FIT_MIN}
    ORDER BY COALESCE(fit_score,0) DESC, name
  ` as { id: string; name: string; website: string; fit: number }[];

  // Filter to those without a real website
  const targets = rows.filter(r => !r.website || isRegistryUrl(r.website));
  console.log(`Foundations without real website: ${targets.length}\n`);

  const discoveries: Discovery[] = [];
  let checked = 0;

  // Process in batches of 3 (be polite to servers)
  const BATCH_SIZE = 3;
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(batch.map(async (f) => {
      const candidates = generateCandidates(f.id, f.name);
      for (const url of candidates) {
        const ok = await probeUrl(url);
        if (ok) {
          return { ...f, newUrl: url };
        }
      }
      return null;
    }));

    for (const result of batchResults) {
      checked++;
      if (result) {
        console.log(`✅ [fit=${result.fit}] ${result.name} → ${result.newUrl}`);
        discoveries.push({
          id: result.id,
          name: result.name,
          fit: result.fit,
          oldUrl: result.website,
          newUrl: result.newUrl,
        });

        if (!DRY_RUN) {
          // Update websiteUrl in flat column
          await sql`UPDATE fundraising_foundations SET website_url = ${result.newUrl} WHERE id = ${result.id}`;

          // Update configData JSONB
          const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${result.id}`;
          if (row?.config_data) {
            const cd = row.config_data as Record<string, unknown>;

            // Move old registry URL to sourceLinks if it exists
            if (result.website && isRegistryUrl(result.website)) {
              if (!cd.sourceLinks) cd.sourceLinks = [];
              const links = cd.sourceLinks as { source: string; url: string }[];
              if (!links.some(l => l.url === result.website)) {
                links.push({ source: 'zefix', url: result.website });
              }
            }

            cd.websiteUrl = result.newUrl;
            await sql`UPDATE fundraising_foundations SET config_data = ${JSON.stringify(cd)}::jsonb WHERE id = ${result.id}`;
          }
        }
      } else {
        if (checked % 50 === 0) {
          console.log(`  ... checked ${checked}/${targets.length}`);
        }
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < targets.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Checked: ${targets.length} foundations`);
  console.log(`Discovered: ${discoveries.length} real websites`);
  console.log(`Updated: ${DRY_RUN ? 0 : discoveries.length}`);

  if (discoveries.length > 0) {
    console.log('\n=== DISCOVERIES ===');
    discoveries.forEach(d => {
      console.log(`${d.id} | fit=${d.fit} | ${d.newUrl} (was: ${d.oldUrl || 'none'})`);
    });
  }
}

main().catch(console.error);
