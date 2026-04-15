#!/usr/bin/env tsx
/**
 * Shows foundations that need ChatGPT agent re-research:
 * 1. claude-agent results with missing/unknown data (blocked sites, SSL errors, etc.)
 * 2. Count of foundations not yet researched at all
 */
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { RESEARCHED_METHODS } from '../src/lib/schemas/foundation';
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // claude-agent results that are incomplete
  const incomplete = await sql`
    SELECT id, name, config_data->>'websiteUrl' as website,
           config_data->>'purposeSummary' as purposeSummary,
           config_data->>'acceptsApplications' as accepts
    FROM fundraising_foundations
    WHERE priority IN (1,2,3) AND research_depth != 'rapid' AND archived = false
      AND config_data->>'applicationResearchMethod' = 'claude-agent'
      AND (
        config_data->>'purposeSummary' IS NULL
        OR config_data->>'acceptsApplications' = 'unknown'
        OR config_data->>'acceptsApplications' IS NULL
      )
    ORDER BY priority ASC, fit_score DESC
  `;

  console.log('=== claude-agent results needing ChatGPT upgrade ===');
  for (const r of incomplete) {
    const reason = !r.purposesummary ? 'no purposeSummary (blocked/SSL)' : `acceptsApplications=${r.accepts||'null'}`;
    console.log(`  ${r.id} | ${(r.name as string).padEnd(45)} | ${reason} | ${r.website||'-'}`);
  }
  console.log(`\n  Total needing upgrade: ${incomplete.length}`);

  // Not yet researched at all — filter in JS using RESEARCHED_METHODS as SSOT
  const all = await sql`
    SELECT COUNT(*) as count
    FROM fundraising_foundations
    WHERE priority IN (1,2,3) AND research_depth != 'rapid' AND archived = false
      AND id NOT IN ('seif','stiftung-raphael','jugendhilfeverein-des-bezirkes-dielsdorf','z43-netzero','responsability')
  `;
  const remaining = await sql`
    SELECT config_data->>'applicationResearchMethod' as method
    FROM fundraising_foundations
    WHERE priority IN (1,2,3) AND research_depth != 'rapid' AND archived = false
      AND id NOT IN ('seif','stiftung-raphael','jugendhilfeverein-des-bezirkes-dielsdorf','z43-netzero','responsability')
  `;
  const notResearched = remaining.filter(r => !RESEARCHED_METHODS.includes((r.method || 'unknown') as any));
  console.log(`\n=== Not yet researched (P1-P3, non-rapid): ${notResearched.length} foundations ===`);
}
main().catch(console.error);
