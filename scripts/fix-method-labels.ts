#!/usr/bin/env tsx
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL!);

// Foundations researched with Claude internal Agent (batches 23p, 23q, 23r)
// These were mislabeled as chatgpt-agent — fix to claude-agent
const slugs = [
  'prototype-fund', 'minerva', 'sens-suisse', 'hans-trachsler-fonds', 'camille-graeser-stiftung',
  'albert-lueck-stiftung', 'eranus-stiftung', 'anna-caroline-stiftung', 'orphelina-stiftung', 'credit-suisse-foundation',
  'swiss-re-foundation-carolina-hess', 'fuer-die-kinder-fuer-die-zukunft', 'leo-future', 'elisabeth-weber-stiftung', 'coop-nachhaltigkeit',
];

async function main() {
  for (const slug of slugs) {
    const result = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(config_data, '{applicationResearchMethod}', '"claude-agent"')
      WHERE id = ${slug}
        AND config_data->>'applicationResearchMethod' = 'chatgpt-agent'
      RETURNING id
    `;
    console.log(result.length > 0 ? `  fixed: ${slug}` : `  skipped (not chatgpt-agent): ${slug}`);
  }
  console.log('Done.');
}

main().catch(console.error);
