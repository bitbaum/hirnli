#!/usr/bin/env tsx
/**
 * Queue Agent Research — List P1-P3 foundations not yet researched via chatgpt-agent
 *
 * Outputs batches of 10 foundations ready for ChatGPT agent mode research.
 * Skips foundations already at chatgpt-agent or manual quality level.
 *
 * Usage:
 *   npx tsx scripts/queue-agent-research.ts              # print first batch of 10
 *   npx tsx scripts/queue-agent-research.ts --all        # print all remaining
 *   npx tsx scripts/queue-agent-research.ts --batch-size=7
 *   npx tsx scripts/queue-agent-research.ts --stats      # summary only
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { RESEARCHED_METHODS } from '../src/lib/schemas/foundation';

const sql = neon(process.env.DATABASE_URL!);
const SHOW_ALL = process.argv.includes('--all');
const STATS_ONLY = process.argv.includes('--stats');
const batchSizeArg = process.argv.find(a => a.startsWith('--batch-size='));
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 10;

async function main() {
  // Get all P1-P3 foundations (priority 1, 2, or 3) that aren't rapid depth
  const rows = await sql`
    SELECT
      id,
      fit_score,
      priority,
      config_data->>'applicationResearchMethod' AS research_method,
      config_data->>'purposeSummary' AS purpose_summary,
      config_data->>'websiteUrl' AS website_url,
      config_data->'contact'->>'email' AS email,
      name
    FROM fundraising_foundations
    WHERE
      priority IN (1, 2, 3)
      AND research_depth != 'rapid'
      AND archived = false
    ORDER BY priority ASC, fit_score DESC NULLS LAST
  `;

  const needsAgent = rows.filter(r => {
    const method = (r.research_method || 'unknown') as string;
    return !(RESEARCHED_METHODS as string[]).includes(method);
  });

  const alreadyDone = rows.length - needsAgent.length;

  console.log(`=== Agent Research Queue ===`);
  console.log(`Total P1-P3 (non-rapid): ${rows.length}`);
  console.log(`Already agent-researched: ${alreadyDone}`);
  console.log(`Remaining: ${needsAgent.length}`);
  console.log(`Batches of ${BATCH_SIZE} needed: ${Math.ceil(needsAgent.length / BATCH_SIZE)}`);

  if (STATS_ONLY) return;

  // Group by current research method for context
  const byMethod: Record<string, number> = {};
  for (const r of needsAgent) {
    const m = r.research_method || 'unknown';
    byMethod[m] = (byMethod[m] || 0) + 1;
  }
  console.log(`\nCurrent methods of remaining:`);
  for (const [m, count] of Object.entries(byMethod).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${m}: ${count}`);
  }

  const toShow = SHOW_ALL ? needsAgent : needsAgent.slice(0, BATCH_SIZE);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`NEXT BATCH (${toShow.length} foundations):`);
  console.log(`${'='.repeat(60)}\n`);

  for (const r of toShow) {
    const priority = `P${r.priority}`;
    const fit = r.fit_score ? `fit=${r.fit_score}` : 'fit=?';
    const method = r.research_method || 'unknown';
    const website = r.website_url ? r.website_url : '(no website)';
    console.log(`${r.id}`);
    console.log(`  Name: ${r.name}`);
    console.log(`  Priority: ${priority} | ${fit} | was: ${method}`);
    console.log(`  Website: ${website}`);
    if (r.email) console.log(`  Email: ${r.email}`);
    if (r.purpose_summary) {
      const summary = (r.purpose_summary as string).slice(0, 120);
      console.log(`  Purpose: ${summary}...`);
    }
    console.log();
  }

  // Also output as JSON array of slugs for easy copy-paste
  console.log(`\n--- SLUGS (JSON) ---`);
  console.log(JSON.stringify(toShow.map(r => r.id), null, 2));

  if (!SHOW_ALL && needsAgent.length > BATCH_SIZE) {
    console.log(`\n(${needsAgent.length - BATCH_SIZE} more remaining — use --all to see all)`);
  }
}

main().catch(console.error);
