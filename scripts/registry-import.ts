#!/usr/bin/env tsx
/**
 * Registry Import — Bulk-import foundations from ESA/Zefix/Fundraiso into
 * fundraising_foundation_registry WITHOUT creating analysis rows.
 *
 * This populates the universal registry (Layer 1) independently of any
 * org's analysis. Foundations imported here won't appear in STIFTUNGEN_DATA
 * until they're analyzed and added to fundraising_foundations.
 *
 * Sources:
 *   --esa <path>       ESA register JSON (research/esa-register-*.json)
 *   --fundraiso <path> Fundraiso discovery JSON (research/fundraiso-discovery-*.json)
 *   --zhaw <path>      ZHAW Fonds & Stiftungen JSON (research/zhaw-fonds-stiftungen-*.json)
 *
 * Usage:
 *   npx tsx scripts/registry-import.ts --esa research/esa-register-2026-02-16.json
 *   npx tsx scripts/registry-import.ts --fundraiso research/fundraiso-discovery-2026-02-16.json
 *   npx tsx scripts/registry-import.ts --zhaw research/zhaw-fonds-stiftungen-2024-25.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';

interface EsaFoundation {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface EsaRegister {
  downloadDate: string;
  source: string;
  count: number;
  foundations: EsaFoundation[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[àáâã]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõ]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function importEsa(filePath: string) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nImporting ESA register from ${filePath}...\n`);

  const data: EsaRegister = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  console.log(`  Source: ${data.source}`);
  console.log(`  Date: ${data.downloadDate}`);
  console.log(`  Entries: ${data.count}`);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  let imported = 0;
  let updated = 0;
  let errors = 0;
  const BATCH_SIZE = 50;

  // Process in batches to avoid overwhelming the DB
  for (let i = 0; i < data.foundations.length; i += BATCH_SIZE) {
    const batch = data.foundations.slice(i, i + BATCH_SIZE);

    for (const f of batch) {
      const slug = slugify(f.name);
      if (!slug) {
        errors++;
        continue;
      }

      // Build minimal registry data from ESA fields
      const registryData = {
        slug,
        name: f.name,
        uid: f.uid,
        officialPurpose: f.purpose,
        region: f.city || f.canton || '',
        source: 'esa' as const,
        // Minimal defaults for required registry fields
        websiteUrl: '',
        applicationMethod: 'unknown',
        status: f.status === 'aktiv' ? 'rolling' : 'closed',
        deadlineText: 'Unbekannt',
        amount: { min: null, max: null, text: 'Unbekannt' },
      };

      try {
        const result = await sql`
          INSERT INTO fundraising_foundation_registry (
            id, name, uid, official_purpose, region,
            source, registry_data, data_quality, last_verified,
            created_at, updated_at
          ) VALUES (
            ${slug}, ${f.name}, ${f.uid},
            ${f.purpose || null}, ${f.city || f.canton || null},
            ${'esa'}, ${JSON.stringify(registryData)}, ${2}, ${today},
            ${now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            uid = COALESCE(fundraising_foundation_registry.uid, ${f.uid}),
            official_purpose = COALESCE(fundraising_foundation_registry.official_purpose, ${f.purpose || null}),
            updated_at = ${now}
        `;
        // ON CONFLICT means it was an update if the row existed
        imported++;
      } catch (err) {
        // Slug collision — add uid suffix and retry
        const slugWithUid = `${slug}-${f.uid.replace(/[^0-9]/g, '').slice(-6)}`;
        try {
          await sql`
            INSERT INTO fundraising_foundation_registry (
              id, name, uid, official_purpose, region,
              source, registry_data, data_quality, last_verified,
              created_at, updated_at
            ) VALUES (
              ${slugWithUid}, ${f.name}, ${f.uid},
              ${f.purpose || null}, ${f.city || f.canton || null},
              ${'esa'}, ${JSON.stringify({ ...registryData, slug: slugWithUid })}, ${2}, ${today},
              ${now}, ${now}
            )
            ON CONFLICT (id) DO UPDATE SET
              uid = COALESCE(fundraising_foundation_registry.uid, ${f.uid}),
              official_purpose = COALESCE(fundraising_foundation_registry.official_purpose, ${f.purpose || null}),
              updated_at = ${now}
          `;
          imported++;
        } catch (retryErr) {
          console.error(`  Error: ${f.name} (${f.uid}): ${retryErr instanceof Error ? retryErr.message : retryErr}`);
          errors++;
        }
      }
    }

    // Progress
    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= data.foundations.length) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, data.foundations.length)}/${data.foundations.length}`);
    }
  }

  // Final count
  const registryCount = await sql`SELECT count(*) as cnt FROM fundraising_foundation_registry`;

  console.log(`\nImport complete:`);
  console.log(`  Processed: ${imported}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total registry rows: ${registryCount[0].cnt}`);
}

// ---------------------------------------------------------------------------
// Fundraiso import
// ---------------------------------------------------------------------------

interface FundraisoCandidate {
  name: string;
  slug: string;
  location?: string;
  foundVia: string[];
  url?: string;
}

interface FundraisoDiscovery {
  meta: {
    source: string;
    date: string;
    uniqueFoundations: number;
  };
  foundations: FundraisoCandidate[];
}

async function importFundraiso(filePath: string) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nImporting Fundraiso discoveries from ${filePath}...\n`);

  const data: FundraisoDiscovery = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  console.log(`  Source: ${data.meta.source}`);
  console.log(`  Date: ${data.meta.date}`);
  console.log(`  Entries: ${data.foundations.length}`);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  let imported = 0;
  let enriched = 0;
  let errors = 0;

  for (const f of data.foundations) {
    const slug = f.slug || slugify(f.name);
    if (!slug) {
      errors++;
      continue;
    }

    // Extract city from location (e.g., "Zürich, CH" → "Zürich")
    const city = f.location?.replace(/, ?CH$/, '').trim() || '';

    const registryData = {
      slug,
      name: f.name,
      region: city,
      source: 'fundraiso' as const,
      websiteUrl: '',
      applicationMethod: 'unknown',
      status: 'rolling',
      deadlineText: 'Unbekannt',
      amount: { min: null, max: null, text: 'Unbekannt' },
    };

    try {
      // Use COALESCE to preserve richer data from ESA if the slug already exists
      await sql`
        INSERT INTO fundraising_foundation_registry (
          id, name, region, source, registry_data,
          data_quality, last_verified, created_at, updated_at
        ) VALUES (
          ${slug}, ${f.name}, ${city || null},
          ${'fundraiso'}, ${JSON.stringify(registryData)},
          ${1}, ${today}, ${now}, ${now}
        )
        ON CONFLICT (id) DO UPDATE SET
          region = COALESCE(NULLIF(fundraising_foundation_registry.region, ''), ${city || null}),
          updated_at = ${now}
      `;
      // Check if it was an insert or update by seeing if source changed
      imported++;
    } catch (err) {
      console.error(`  Error: ${f.name}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  const registryCount = await sql`SELECT count(*) as cnt FROM fundraising_foundation_registry`;

  console.log(`\nImport complete:`);
  console.log(`  Processed: ${imported}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total registry rows: ${registryCount[0].cnt}`);
}

// ---------------------------------------------------------------------------
// ZHAW Fonds & Stiftungen import
// ---------------------------------------------------------------------------

interface ZhawFoundation {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  purpose: string;
  zielgruppe: string;
  gesuchstellende: string;
  einreichungstermin: string;
  empfangsstelle: string;
  beilagen: string;
}

interface ZhawData {
  source: string;
  date: string;
  edition: string;
  scope: string;
  count: number;
  foundations: ZhawFoundation[];
}

async function importZhaw(filePath: string) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nImporting ZHAW Fonds & Stiftungen from ${filePath}...\n`);

  const data: ZhawData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  console.log(`  Source: ${data.source}`);
  console.log(`  Edition: ${data.edition}`);
  console.log(`  Scope: ${data.scope}`);
  console.log(`  Entries: ${data.count}`);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  let imported = 0;
  let enriched = 0;
  let errors = 0;

  for (const f of data.foundations) {
    const slug = slugify(f.name);
    if (!slug) {
      errors++;
      continue;
    }

    // Determine deadline status from einreichungstermin
    let status = 'rolling';
    const dl = f.einreichungstermin.toLowerCase();
    if (dl.includes('ganzes jahr') || dl.includes('jederzeit') || dl.includes('laufend')) {
      status = 'rolling';
    } else if (/\d{1,2}\.\d{1,2}\./.test(dl)) {
      status = 'deadline';
    }

    // Build city/region — ZHAW is ZH-focused
    const region = f.city || 'Kanton Zürich';

    const registryData = {
      slug,
      name: f.name,
      region,
      source: 'zhaw' as const,
      websiteUrl: f.website ? (f.website.startsWith('http') ? f.website : `https://${f.website}`) : '',
      applicationMethod: f.empfangsstelle ? 'written' : 'unknown',
      status,
      deadlineText: f.einreichungstermin || 'Unbekannt',
      amount: { min: null, max: null, text: 'Unbekannt' },
      officialPurpose: f.purpose,
      contact: {
        email: f.email,
        phone: f.phone,
        address: [f.address, f.zip, f.city].filter(Boolean).join(', '),
      },
      zielgruppe: f.zielgruppe,
      gesuchstellende: f.gesuchstellende,
      empfangsstelle: f.empfangsstelle,
      beilagen: f.beilagen,
    };

    // ZHAW data is quite rich (purpose, contact, deadlines) → quality 3
    const dataQuality = (f.purpose && f.einreichungstermin) ? 3 : 2;

    try {
      await sql`
        INSERT INTO fundraising_foundation_registry (
          id, name, official_purpose, website_url, region,
          contact_email, contact_phone, source, registry_data,
          data_quality, last_verified, created_at, updated_at
        ) VALUES (
          ${slug}, ${f.name}, ${f.purpose || null},
          ${registryData.websiteUrl || null}, ${region || null},
          ${f.email || null}, ${f.phone || null},
          ${'zhaw'}, ${JSON.stringify(registryData)},
          ${dataQuality}, ${today}, ${now}, ${now}
        )
        ON CONFLICT (id) DO UPDATE SET
          official_purpose = COALESCE(fundraising_foundation_registry.official_purpose, ${f.purpose || null}),
          website_url = COALESCE(NULLIF(fundraising_foundation_registry.website_url, ''), ${registryData.websiteUrl || null}),
          contact_email = COALESCE(NULLIF(fundraising_foundation_registry.contact_email, ''), ${f.email || null}),
          contact_phone = COALESCE(NULLIF(fundraising_foundation_registry.contact_phone, ''), ${f.phone || null}),
          registry_data = CASE
            WHEN fundraising_foundation_registry.source = 'zhaw' THEN ${JSON.stringify(registryData)}::jsonb
            ELSE fundraising_foundation_registry.registry_data
          END,
          data_quality = GREATEST(fundraising_foundation_registry.data_quality, ${dataQuality}),
          updated_at = ${now}
      `;
      imported++;
    } catch (err) {
      console.error(`  Error: ${f.name}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  // Count how many were new vs enriched existing
  const registryCount = await sql`SELECT count(*) as cnt FROM fundraising_foundation_registry`;
  const zhawCount = await sql`SELECT count(*) as cnt FROM fundraising_foundation_registry WHERE source = 'zhaw'`;

  console.log(`\nImport complete:`);
  console.log(`  Processed: ${imported}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  ZHAW-primary entries: ${zhawCount[0].cnt}`);
  console.log(`  Total registry rows: ${registryCount[0].cnt}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage:');
    console.error('  npx tsx scripts/registry-import.ts --esa <path-to-esa-json>');
    console.error('  npx tsx scripts/registry-import.ts --fundraiso <path-to-fundraiso-json>');
    console.error('  npx tsx scripts/registry-import.ts --zhaw <path-to-zhaw-json>');
    process.exit(1);
  }

  const esaIdx = args.indexOf('--esa');
  const fundraisoIdx = args.indexOf('--fundraiso');
  const zhawIdx = args.indexOf('--zhaw');

  if (esaIdx >= 0 && args[esaIdx + 1]) {
    await importEsa(args[esaIdx + 1]);
  } else if (fundraisoIdx >= 0 && args[fundraisoIdx + 1]) {
    await importFundraiso(args[fundraisoIdx + 1]);
  } else if (zhawIdx >= 0 && args[zhawIdx + 1]) {
    await importZhaw(args[zhawIdx + 1]);
  } else {
    console.error('Unknown source. Supported: --esa <path>, --fundraiso <path>, --zhaw <path>');
    process.exit(1);
  }
}

main().catch(console.error);
