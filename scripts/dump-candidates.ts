#!/usr/bin/env tsx
/**
 * Dump candidate data for inline Claude triage.
 * Reads phase1 results + DB purpose text → outputs JSON for analysis.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';

const MIN_FIT = parseInt(process.argv.find(a => a.startsWith('--min-fit='))?.split('=')[1] || '4', 10);
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch='))?.split('=')[1] || '50', 10);
const BATCH_NUM = parseInt(process.argv.find(a => a.startsWith('--batch-num='))?.split('=')[1] || '0', 10);

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // Load phase1 candidates
  const today = new Date().toISOString().split('T')[0];
  const phase1File = path.resolve(`research/pipeline-graduate/phase1-${today}.json`);
  const phase1 = JSON.parse(fs.readFileSync(phase1File, 'utf-8'));

  // Load processed slugs
  const processedFile = path.resolve(`research/pipeline-graduate/phase2-processed-${today}.json`);
  const processed = new Set<string>(
    fs.existsSync(processedFile) ? JSON.parse(fs.readFileSync(processedFile, 'utf-8')) : []
  );

  // Filter high-value unprocessed
  const candidates = phase1.items.filter((i: any) =>
    (i.themes.length > 0 || i.funderScore >= 2) &&
    !processed.has(i.slug) &&
    i.fitScore >= MIN_FIT
  );

  // Get batch
  const start = BATCH_NUM * BATCH_SIZE;
  const batch = candidates.slice(start, start + BATCH_SIZE);

  if (batch.length === 0) {
    console.error(`No candidates in batch ${BATCH_NUM} (total: ${candidates.length})`);
    process.exit(1);
  }

  // Fetch purpose text from DB
  const slugs = batch.map((c: any) => c.slug);
  const rows = await sql`
    SELECT
      f.id as slug,
      f.name,
      COALESCE(r.official_purpose, f.config_data->>'officialPurpose', f.config_data->>'purposeSummary') as purpose
    FROM fundraising_foundations f
    LEFT JOIN fundraising_foundation_registry r ON r.id = f.id
    WHERE f.id = ANY(${slugs})
  ` as { slug: string; name: string; purpose: string | null }[];

  const purposeMap = new Map(rows.map(r => [r.slug, r.purpose || '']));

  // Build output
  const output = batch.map((c: any) => ({
    slug: c.slug,
    name: c.name,
    fitScore: c.fitScore,
    themes: c.themes,
    funderScore: c.funderScore,
    operatorScore: c.operatorScore,
    isFunder: c.isFunder,
    purpose: (purposeMap.get(c.slug) || '').substring(0, 500),
  }));

  console.log(JSON.stringify(output, null, 2));
  console.error(`Batch ${BATCH_NUM}: ${output.length} candidates (${start}-${start + batch.length} of ${candidates.length})`);
}

main().catch(err => { console.error(err); process.exit(1); });
