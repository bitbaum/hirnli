#!/usr/bin/env tsx
/**
 * Import Research Results — Apply contact data from external research (ChatGPT, manual, etc.)
 *
 * Reads a JSON file of research results and writes to DB via config_data.
 * Records provenance (source, date) for every field.
 *
 * Input format (JSON array):
 * [
 *   {
 *     "slug": "foundation-slug",
 *     "email": "found@email.ch",
 *     "emailSource": "where it was found",
 *     "phone": "+41 44 123 45 67",
 *     "phoneSource": "where it was found",
 *     "website": "https://verified-website.ch",
 *     "websiteVerified": true
 *   }
 * ]
 *
 * Usage:
 *   npx tsx scripts/import-research-results.ts research/results.json --dry-run
 *   npx tsx scripts/import-research-results.ts research/results.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');
const inputFile = process.argv.find(a => a.endsWith('.json'));

if (!inputFile) {
  console.error('Usage: npx tsx scripts/import-research-results.ts <file.json> [--dry-run]');
  process.exit(1);
}

interface ResearchResult {
  slug: string;
  email?: string | null;
  emailSource?: string;
  phone?: string | null;
  phoneSource?: string;
  website?: string | null;
  websiteVerified?: boolean;
  notes?: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 60) return false;
  if (!email.includes('@') || !email.includes('.')) return false;
  if (/[{}\\]|\.png|\.jpg|\.webp|sentry|wixpress/.test(email)) return false;
  return true;
}

async function main() {
  const raw = readFileSync(inputFile!, 'utf-8');
  const results: ResearchResult[] = JSON.parse(raw);

  console.log(`=== Import Research Results ===`);
  console.log(`Input: ${inputFile} (${results.length} entries)`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  let updated = 0;
  let skipped = 0;
  let invalid = 0;

  for (const r of results) {
    if (!r.slug) { invalid++; continue; }
    if (!r.email && !r.phone && !r.website) { skipped++; continue; }

    // Validate email if provided
    if (r.email && !isValidEmail(r.email)) {
      console.log(`  ⚠️  ${r.slug}: invalid email "${r.email}" — skipping`);
      invalid++;
      continue;
    }

    // Fetch current config_data
    const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${r.slug}`;
    if (!row?.config_data) {
      console.log(`  ❌ ${r.slug}: not found in DB`);
      skipped++;
      continue;
    }

    const cd = row.config_data as Record<string, unknown>;
    let changed = false;

    // Update contact
    if (r.email || r.phone) {
      if (!cd.contact) cd.contact = {};
      const contact = cd.contact as Record<string, string>;

      if (r.email && !contact.email) {
        contact.email = r.email.toLowerCase();
        changed = true;
      }
      if (r.phone && !contact.phone) {
        contact.phone = r.phone;
        changed = true;
      }
    }

    // Update website (only if verified and current is missing/registry)
    if (r.website && r.websiteVerified) {
      const currentWeb = cd.websiteUrl as string || '';
      const isRegistry = !currentWeb || currentWeb.includes('zefix') || currentWeb.includes('fundraiso') || currentWeb.includes('stiftungschweiz');
      if (isRegistry) {
        cd.websiteUrl = r.website;
        changed = true;
      }
    }

    // Add sourceLink for provenance
    if (changed) {
      if (!cd.sourceLinks) cd.sourceLinks = [];
      const links = cd.sourceLinks as { source: string; url: string; label?: string }[];
      const sourceNote = [r.emailSource, r.phoneSource].filter(Boolean).join(', ');
      if (sourceNote && !links.some(l => l.label?.includes('Research'))) {
        links.push({
          source: 'manual',
          url: r.website || '',
          label: `Research: ${sourceNote}`,
        });
      }
    }

    if (!changed) {
      skipped++;
      continue;
    }

    const emoji = r.email ? '✅' : '📞';
    console.log(`  ${emoji} ${r.slug}: email=${r.email || '-'} phone=${r.phone || '-'} web=${r.website || '-'}`);

    if (!DRY_RUN) {
      await sql`
        UPDATE fundraising_foundations
        SET config_data = ${JSON.stringify(cd)}::jsonb,
            updated_at = NOW()
        WHERE id = ${r.slug}
      `;
    }
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped} (no new data or already has email)`);
  console.log(`Invalid: ${invalid}`);
  if (!DRY_RUN && updated > 0) {
    console.log('\nNext: npm run sync && npm run build');
  }
}

main().catch(console.error);
