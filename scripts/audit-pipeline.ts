/**
 * Pipeline Audit — authoritative snapshot of foundation pipeline health
 *
 * Run with: npx tsx scripts/audit-pipeline.ts
 * Or:       npm run audit
 *
 * This is the SSOT for all pipeline stats cited in CLAUDE.md and docs.
 * Run it after any sync/rescore and copy the output to update those docs.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // ── 1. Funnel counts ──────────────────────────────────────────────────────
  const [totals] = await sql`
    SELECT
      COUNT(*)                                                    AS db_total,
      COUNT(*) FILTER (WHERE archived = true)                     AS archived,
      COUNT(*) FILTER (WHERE archived IS NULL OR archived = false) AS active,
      COUNT(*) FILTER (WHERE data_confidence = 'unverified'
                         AND (archived IS NULL OR archived = false)) AS unverified,
      COUNT(*) FILTER (WHERE data_confidence = 'ai-assessed'
                         AND (archived IS NULL OR archived = false)) AS ai_assessed,
      COUNT(*) FILTER (WHERE data_confidence = 'human-verified'
                         AND (archived IS NULL OR archived = false)) AS human_verified,
      COUNT(*) FILTER (WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
                         AND (archived IS NULL OR archived = false)) AS sync_eligible,
      COUNT(*) FILTER (WHERE research_depth = 'rapid')             AS depth_rapid,
      COUNT(*) FILTER (WHERE research_depth = 'standard')          AS depth_standard,
      COUNT(*) FILTER (WHERE research_depth = 'deep')              AS depth_deep
    FROM fundraising_foundations
  `;

  // ── 2. Priority breakdown (sync-eligible only — matches generated file) ──
  const prios = await sql`
    SELECT
      priority,
      COUNT(*)                                                                          AS total,
      COUNT(*) FILTER (WHERE config_data->>'applicationUrl' IS NOT NULL
                          AND config_data->>'applicationUrl' != '')                     AS with_app_url,
      COUNT(*) FILTER (WHERE config_data->>'websiteUrl'     IS NOT NULL
                          AND config_data->>'websiteUrl'     != '')                     AS with_web_url,
      COUNT(*) FILTER (WHERE config_data->'contact'->>'email' IS NOT NULL)              AS with_email
    FROM fundraising_foundations
    WHERE (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
    GROUP BY priority
    ORDER BY priority
  `;

  // ── 3. Truly unreachable P1-P3: missing both email AND appUrl ────────────
  // Foundations with appUrl or method=online are reachable via form — not a gap.
  const emailGaps = await sql`
    SELECT id, priority, fit_score,
      config_data->>'applicationMethod' AS method,
      config_data->>'applicationUrl'    AS appurl
    FROM fundraising_foundations
    WHERE priority IN (1,2,3)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
      AND (config_data->'contact'->>'email' IS NULL OR config_data->'contact'->>'email' = '')
      AND (config_data->>'applicationUrl' IS NULL OR config_data->>'applicationUrl' = '')
      AND (config_data->>'applicationMethod' IS NULL
           OR config_data->>'applicationMethod' NOT IN ('online', 'none', 'closed'))
    ORDER BY priority, fit_score DESC
  `;

  // ── 4. Missing applicationUrls for P1–P3 ─────────────────────────────────
  const gaps = await sql`
    SELECT id, priority, fit_score,
      config_data->>'applicationMethod' AS method,
      config_data->>'websiteUrl'        AS website
    FROM fundraising_foundations
    WHERE priority IN (1,2,3)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
      AND (archived IS NULL OR archived = false)
      AND (config_data->>'applicationUrl' IS NULL OR config_data->>'applicationUrl' = '')
      AND (config_data->>'applicationMethod' IS NULL OR config_data->>'applicationMethod' NOT IN ('none', 'closed'))
    ORDER BY priority, fit_score DESC
  `;

  // ── Print ─────────────────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10);
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  Foundation Pipeline Audit — ${date}`);
  console.log(`══════════════════════════════════════════════════\n`);

  console.log(`FUNNEL`);
  console.log(`  Swiss register universe ............. ~16,900 (Zefix, static)`);
  console.log(`  In DB (total)  ...................... ${totals.db_total}`);
  console.log(`  Archived ...........................  ${totals.archived}`);
  console.log(`  Active .............................  ${totals.active}`);
  console.log(`    └─ unverified (excluded from sync) ${totals.unverified}`);
  console.log(`    └─ ai-assessed ..................  ${totals.ai_assessed}`);
  console.log(`    └─ human-verified ...............  ${totals.human_verified}`);
  console.log(`  Sync-eligible (→ generated file) ...  ${totals.sync_eligible}`);
  console.log(``);

  console.log(`RESEARCH DEPTH (all active)`);
  console.log(`  rapid    (LLM-triaged only) .......  ${totals.depth_rapid}`);
  console.log(`  standard (has real website) ........  ${totals.depth_standard}`);
  console.log(`  deep     (human-verified) ..........  ${totals.depth_deep}`);
  console.log(``);

  const p1 = prios.find(r => r.priority === 1) ?? { total:0, with_app_url:0, with_web_url:0, with_email:0 };
  const p2 = prios.find(r => r.priority === 2) ?? { total:0, with_app_url:0, with_web_url:0, with_email:0 };
  const p3 = prios.find(r => r.priority === 3) ?? { total:0, with_app_url:0, with_web_url:0, with_email:0 };
  const p4 = prios.find(r => r.priority === 4) ?? { total:0, with_app_url:0, with_web_url:0, with_email:0 };
  const p13total = Number(p1.total) + Number(p2.total) + Number(p3.total);

  const pct = (n: number | string, d: number | string) =>
    d === 0 ? '—' : `${Math.round(Number(n)/Number(d)*100)}%`;

  console.log(`PRIORITY BREAKDOWN (sync-eligible, non-archived)`);
  console.log(`  ${''.padEnd(4)} ${'total'.padEnd(6)} ${'appUrl'.padEnd(12)} ${'webUrl'.padEnd(12)} ${'email'.padEnd(10)}`);
  console.log(`  ${''.padEnd(4)} ${'-----'.padEnd(6)} ${'------'.padEnd(12)} ${'------'.padEnd(12)} ${'-----'.padEnd(10)}`);
  for (const r of [p1,p2,p3,p4]) {
    const label = `P${prios.indexOf(r)+1}`;
    console.log(
      `  ${label.padEnd(4)} ${String(r.total).padEnd(6)}` +
      ` ${String(r.with_app_url).padEnd(4)} (${pct(r.with_app_url, r.total).padEnd(4)})` +
      `  ${String(r.with_web_url).padEnd(4)} (${pct(r.with_web_url, r.total).padEnd(4)})` +
      `  ${String(r.with_email).padEnd(4)} (${pct(r.with_email, r.total)})`
    );
  }
  console.log(`  P1-P3 total: ${p13total}`);
  console.log(``);

  // Email gaps (truly unreachable — no email AND no appUrl)
  if (emailGaps.length === 0) {
    console.log(`EMAIL GAPS (truly unreachable) — none ✓`);
  } else {
    console.log(`EMAIL GAPS (no email AND no appUrl) — ${emailGaps.length} P1-P3 truly unreachable`);
    console.log(`  Note: foundations with appUrl/online-form are reachable; not listed here.`);
    for (const r of emailGaps) {
      console.log(`  P${r.priority} fit=${r.fit_score} | ${r.id} (method: ${r.method ?? '—'})`);
    }
  }
  console.log(``);

  if (gaps.length === 0) {
    console.log(`APPLICATION URL GAPS — none! All P1-P3 have applicationUrl ✓`);
  } else {
    console.log(`APPLICATION URL GAPS — ${gaps.length} P1-P3 foundations missing applicationUrl`);
    console.log(`  ${''.padEnd(4)} ${'id'.padEnd(40)} ${'method'.padEnd(12)} website`);
    console.log(`  ${''.padEnd(4)} ${'--'.padEnd(40)} ${'------'.padEnd(12)} -------`);
    for (const r of gaps) {
      const web = r.website ? (r.website as string).replace(/^https?:\/\//, '').slice(0, 40) : '(none)';
      console.log(`  P${r.priority}   ${String(r.id).padEnd(40)} ${String(r.method ?? '—').padEnd(12)} ${web}`);
    }
  }

  console.log(`\n══════════════════════════════════════════════════\n`);
  console.log(`To update CLAUDE.md, replace the funnel table with:`);
  console.log(`  Pipeline ......... ${totals.db_total} (active: ${totals.active})`);
  console.log(`  Generated ........ ${totals.sync_eligible} (data_confidence ≠ unverified)`);
  console.log(`  P1-P3 (actionable) ${p13total} (P1=${p1.total}, P2=${p2.total}, P3=${p3.total})`);
}
main().catch(console.error);
