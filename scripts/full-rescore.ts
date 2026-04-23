/**
 * Full-rescore: recompute fitScore for ALL foundations in the generated file.
 * Reports foundations where computed score differs from stored, then optionally applies.
 * Only upgrades — never downgrades.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { computeFitScore } from '../src/lib/domain/fit-scoring';

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');
const MIN_DELTA = parseInt(process.argv.find(a => a.startsWith('--min-delta='))?.split('=')[1] || '1');

async function main() {
  console.log(`=== Full rescore (min delta=${MIN_DELTA}, mode=${DRY_RUN ? 'DRY RUN' : 'LIVE'}) ===\n`);

  // Only rescore foundations in the generated file (data_confidence != unverified)
  const rows = await sql`
    SELECT id, fit_score, priority, config_data
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
    ORDER BY fit_score DESC
  `;

  let improved = 0, same = 0, would_downgrade = 0;
  const upgrades: Array<{slug: string; old: number; new_: number; priority: number; themes: string[]}> = [];

  for (const row of rows) {
    const cd = row.config_data as Record<string, unknown>;
    const result = computeFitScore(cd as unknown as Parameters<typeof computeFitScore>[0]);
    const computed = result.fitScore;
    const stored = row.fit_score as number;

    if (computed > stored && (computed - stored) >= MIN_DELTA) {
      improved++;
      upgrades.push({ slug: row.id as string, old: stored, new_: computed, priority: row.priority as number, themes: (cd.themes as string[]) || [] });
    } else if (computed < stored) {
      would_downgrade++;
    } else {
      same++;
    }
  }

  console.log(`Total: ${rows.length}, Upgrades (delta>=${MIN_DELTA}): ${improved}, Same: ${same}, Would-downgrade (skipped): ${would_downgrade}\n`);

  // Show top upgrades
  const top = upgrades.sort((a, b) => (b.new_ - b.old) - (a.new_ - a.old) || b.new_ - a.new_);
  console.log(`Top upgrades:`);
  for (const u of top.slice(0, 30)) {
    console.log(`  ${u.old}→${u.new_} | P${u.priority} | ${u.slug} | ${u.themes.join(',')}`);
  }

  if (!DRY_RUN && improved > 0) {
    console.log(`\nApplying ${improved} upgrades...`);
    let done = 0;
    for (const u of upgrades) {
      const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${u.slug}`;
      if (!row) continue;
      await sql`
        UPDATE fundraising_foundations
        SET config_data = jsonb_set(config_data, '{fitScore}', ${u.new_}::jsonb),
            updated_at = NOW()
        WHERE id = ${u.slug}
      `;
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${improved} done...`);
    }
    console.log(`Applied ${done} upgrades. Next: npm run sync`);
  }
}
main().catch(console.error);
