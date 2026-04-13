#!/usr/bin/env tsx
/**
 * Backfill applicationResearchMethod — mark existing ChatGPT batch results
 * with how they were researched, so data quality can be assessed.
 *
 * Batches 18-21 (agent-2026-04-13): chatgpt-agent (website visited)
 * Batches 1-17: chatgpt-search (search/training data)
 *
 * Usage:
 *   npx tsx scripts/backfill-research-method.ts --dry-run
 *   npx tsx scripts/backfill-research-method.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync, readdirSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');

// Map each batch file to the research method used
const BATCH_METHODS: Record<string, 'chatgpt-agent' | 'chatgpt-search'> = {
  'batch1-2026-04-09.json': 'chatgpt-search',
  'batch2-appmethod-2026-04-10.json': 'chatgpt-search',
  'batch3-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch4-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch5-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch6-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch7-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch8-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch9-appmethod-2026-04-12.json': 'chatgpt-search',
  'batch10-final-2026-04-12.json': 'chatgpt-search',
  'batch11-highvalue-2026-04-12.json': 'chatgpt-search',
  'batch12-relevance-2026-04-12.json': 'chatgpt-search',
  'batch13-relevance-2026-04-13.json': 'chatgpt-search',
  'batch14-relevance-2026-04-13.json': 'chatgpt-search',
  'batch15-relevance-2026-04-13.json': 'chatgpt-search',
  'batch16-ssaw-mercator-2026-04-13.json': 'chatgpt-search',
  'batch17-profil-bio-2026-04-13.json': 'chatgpt-search',
  'batch18-agent-2026-04-13.json': 'chatgpt-agent',
  'batch19-agent-2026-04-13.json': 'chatgpt-agent',
  'batch20-agent-2026-04-13.json': 'chatgpt-agent',
  'batch21-agent-2026-04-13.json': 'chatgpt-agent',
};

// Research method quality ranking (higher = better)
const METHOD_RANK: Record<string, number> = {
  'manual': 4,
  'chatgpt-agent': 3,
  'chatgpt-search': 2,
  'groq-pipeline': 1,
  'unknown': 0,
};

async function main() {
  const batchDir = 'research/chatgpt-results';
  const files = readdirSync(batchDir).filter(f => f.endsWith('.json'));

  // Build slug → method map (agent wins if a slug appears in multiple batches)
  const slugMethod = new Map<string, 'chatgpt-agent' | 'chatgpt-search'>();
  for (const file of files) {
    const method = BATCH_METHODS[file];
    if (!method) {
      console.warn(`⚠️  Unknown batch file: ${file} — skipping`);
      continue;
    }
    const raw = readFileSync(`${batchDir}/${file}`, 'utf-8');
    let entries: { slug: string }[];
    try {
      const parsed = JSON.parse(raw);
      entries = Array.isArray(parsed) ? parsed : parsed.results || [];
    } catch {
      console.warn(`⚠️  Failed to parse ${file}`);
      continue;
    }
    for (const e of entries) {
      if (!e.slug) continue;
      const existing = slugMethod.get(e.slug);
      // Keep highest quality method if duplicate
      if (!existing || METHOD_RANK[method] > METHOD_RANK[existing]) {
        slugMethod.set(e.slug, method);
      }
    }
  }

  const agentSlugs = [...slugMethod.entries()].filter(([, m]) => m === 'chatgpt-agent').map(([s]) => s);
  const searchSlugs = [...slugMethod.entries()].filter(([, m]) => m === 'chatgpt-search').map(([s]) => s);

  console.log(`=== Backfill applicationResearchMethod ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`chatgpt-agent: ${agentSlugs.length} foundations`);
  console.log(`chatgpt-search: ${searchSlugs.length} foundations\n`);

  let updated = 0;
  let skipped = 0;
  let alreadyHigher = 0;

  for (const [slug, method] of slugMethod) {
    const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row?.config_data) {
      console.log(`  ❌ ${slug}: not found`);
      skipped++;
      continue;
    }

    const cd = row.config_data as Record<string, unknown>;
    const existing = (cd.applicationResearchMethod as string) || 'unknown';
    const incomingRank = METHOD_RANK[method] ?? 0;
    const existingRank = METHOD_RANK[existing] ?? 0;

    if (existingRank >= incomingRank) {
      alreadyHigher++;
      continue;
    }

    console.log(`  ✅ ${slug}: ${existing} → ${method}`);
    cd.applicationResearchMethod = method;

    if (!DRY_RUN) {
      await sql`
        UPDATE fundraising_foundations
        SET config_data = ${JSON.stringify(cd)}::jsonb,
            updated_at = NOW()
        WHERE id = ${slug}
      `;
    }
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated} foundations`);
  console.log(`Already at higher/equal quality: ${alreadyHigher}`);
  console.log(`Not found: ${skipped}`);
  if (!DRY_RUN && updated > 0) {
    console.log('\nNext: npm run sync');
  }
}

main().catch(console.error);
