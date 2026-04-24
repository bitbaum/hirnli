/**
 * Backfill fit_score + config_data.fitScore for all foundations enriched in batches 39-44
 * and fit=4 batch 1 (2026-04-24).
 *
 * ROOT CAUSE: A DB trigger `foundation_flat_sync` (BEFORE INSERT/UPDATE) reads
 * `config_data->>'fitScore'` and overwrites the flat `fit_score` column via COALESCE.
 * All patch() functions in the enrichment scripts updated `fit_score` directly but did NOT
 * update `config_data.fitScore`, so the trigger silently reverted every fit_score change.
 *
 * FIX: Use jsonb_set() to update ONLY config_data.fitScore in-place, alongside fit_score.
 * The trigger will then read the new fitScore from config_data and keep it.
 *
 * SKIP list:
 *  - archived foundations (maya-behn, circular-zuerich, pep-stiftung, walter-corti)
 *  - foundations where fit was not changed (fairster, albert-beer, options-for-growth,
 *    ernst-wilhelm-meier, gottfried-schaeppi-jecklin, max-wiederkehr, blauer-planet,
 *    gottfried-und-ursula-schaeppi-jecklin-stiftung)
 *  - batch5-5foundations already set cd.fitScore correctly for:
 *    max-roessler, stiftung-one-health, gottfried-schaerer, chana-lutomirsky-stiftung-zuerich
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const FIXES: Array<{ id: string; fit: number }> = [
  // ── Batch 39 (enrich-p4-candidates-batch2) ─────────────────────────────────
  { id: 'stiftung-opa-objective-polyglot-apprenticeship', fit: 1 },
  { id: 'stiftung-pferdehof-pfisterberg',                 fit: 1 },
  { id: 'netzwerk-stiftung-fuer-soziale-arbeit-sport-und-kultur', fit: 1 },
  { id: 'fwg-foundation',                                 fit: 4 },
  { id: 'baitella-eberle',                                fit: 5 },
  { id: 'dr-hans-duttweiler-hug-stiftung',                fit: 2 },

  // ── Batch 40 (enrich-p4-candidates-batch3) ─────────────────────────────────
  { id: 'social-gastronomy-schweiz',                      fit: 1 },
  { id: 'familie-schwarz',                                fit: 2 },
  { id: 'iw-stiftung-mensch-und-zukunft',                 fit: 3 },
  { id: 'stiftung-symphasis',                             fit: 4 },
  { id: 'appsocial-org-stiftung',                         fit: 2 },
  { id: 'creative-ai-foundation',                         fit: 3 },
  { id: 'sefa-kaya-foundation',                           fit: 2 },
  { id: 'stiftung-i-care-for-you',                        fit: 3 },

  // ── Batch 41 (enrich-p4-candidates-batch4) ─────────────────────────────────
  { id: 'jane-goodall-institut-schweiz-stiftung-fuer-forschung-bildun', fit: 1 },
  { id: 'jugendhof-stiftung-fuer-anthroposophisch-begruendete-krisenb', fit: 1 },
  { id: 'kurt-imhof-stiftung-fuer-medienqualitaet',       fit: 1 },
  { id: 'stiftung-kalaidos-fachhochschule',               fit: 0 },
  { id: 'forschungsstiftung-fuer-informationstechnologie-und-gesellsc', fit: 4 },
  { id: 'karl-margrith-wiederkehr-stiftung',              fit: 3 },
  { id: 'chana-lutomirsky-stiftung',                      fit: 1 }, // NOT the -zuerich variant
  // max-roessler, stiftung-one-health, gottfried-schaerer already fixed via cd.fitScore in batch5-5

  // ── Batch 42 (enrich-p4-candidates-batch5) ─────────────────────────────────
  { id: 'stiftung-muetterhilfe',                          fit: 0 },
  { id: 'michael-kohn-stiftung',                          fit: 3 },
  { id: 'stiftung-pfizer-forschungspreis',                fit: 0 },
  { id: 'stiftung-zur-foerderung-sozialwissenschaftlicher-forschung-u', fit: 1 },
  { id: 'aline-andrea-rutz-stiftung',                     fit: 2 },
  { id: 'arte-terra-clima-foundation',                    fit: 1 },
  { id: 'asmallworld-foundation',                         fit: 1 },
  { id: 'baasch-medicus-stiftung-zuerich',                fit: 0 },
  { id: 'costas-and-eleni-venieri-charitable-foundation', fit: 2 },
  { id: 'dr-adrian-otto-naegeli-stiftung',                fit: 3 },

  // ── Batch 43 (enrich-p4-candidates-batch6) ─────────────────────────────────
  { id: 'economic-foundation-zuerich-park-side',          fit: 1 },
  { id: 'fritz-gerber-stiftung-fuer-begabte-junge-menschen', fit: 1 },
  { id: 'geschwister-maeder-stiftung',                    fit: 0 },
  { id: 'gottlieb-naef-stiftung',                         fit: 3 },
  { id: 'guenther-caspar-stiftung-buero-ehrbar',          fit: 2 },
  { id: 'hans-wegmann-stiftung',                          fit: 1 },
  { id: 'harald-naegeli-stiftung',                        fit: 1 },
  { id: 'iduna-stiftung',                                 fit: 4 },

  // ── Batch 44 (enrich-p4-candidates-batch7) ─────────────────────────────────
  { id: 'jean-anderson-studenten-sos-stiftung',           fit: 1 },
  { id: 'jizchak-und-denise-schaechter-stiftung',         fit: 5 },
  { id: 'joseph-stiftung',                                fit: 3 },
  { id: 'kanthari-foundation-switzerland',                fit: 2 },
  { id: 'kohler-friederich-stiftung',                     fit: 4 },
  { id: 'kolianda-stiftung',                              fit: 1 },
  { id: 'liveyourdream-foundation',                       fit: 3 },
  { id: 'luiza-penha-walter-renteiro-stiftung-fuer-die-jugend-des-bez', fit: 4 },
  { id: 'mekkihelp-stiftung',                             fit: 1 },
  { id: 'oscar-seeger-stiftung',                          fit: 3 },

  // ── Fit=4 batch 1 (enrich-p4-fit4-batch1) ──────────────────────────────────
  { id: 'sozialdepartement-der-stadt-zuerich-fondsverwaltung', fit: 0 },
  { id: 'stiftung-der-islamischen-jugend',                fit: 0 },
  { id: 'stiftung-egger-looser',                          fit: 1 },
  { id: 'corvus-stiftung',                                fit: 2 },
  { id: 'stiftung-cequality',                             fit: 2 },
  { id: 'hilfswerk-der-evangelisch-reformierten-kirche-schweiz-heks', fit: 2 },
  { id: 'kk-sonnenschein-stiftung',                       fit: 3 },
  { id: 'stiftung-amos',                                  fit: 6 },
];

async function main() {
  console.log(`\nBackfilling ${FIXES.length} fit_score + config_data.fitScore values...\n`);

  let ok = 0, missing = 0, already = 0;

  for (const { id, fit } of FIXES) {
    const [row] = await sql`
      SELECT id, fit_score, config_data->>'fitScore' AS jsonb_fit
      FROM fundraising_foundations WHERE id = ${id}
    `;

    if (!row) {
      console.log(`  ❌ NOT FOUND: ${id}`);
      missing++;
      continue;
    }

    const colFit = Number(row.fit_score);
    const jsonbFit = row.jsonb_fit !== null ? Number(row.jsonb_fit) : null;

    if (colFit === fit && jsonbFit === fit) {
      console.log(`  ✓  already correct (${fit}): ${id}`);
      already++;
      continue;
    }

    // Use jsonb_set to update ONLY config_data.fitScore in-place.
    // The BEFORE trigger will then read this value and keep fit_score = fit.
    await sql`
      UPDATE fundraising_foundations
      SET fit_score   = ${fit},
          config_data = jsonb_set(config_data, '{fitScore}', ${String(fit)}::jsonb),
          updated_at  = NOW()
      WHERE id = ${id}
    `;
    console.log(`  ✅ fixed: ${id} (col: ${colFit}→${fit}, jsonb: ${jsonbFit ?? 'null'}→${fit})`);
    ok++;
  }

  console.log(`\n  Fixed: ${ok}  |  Already correct: ${already}  |  Not found: ${missing}`);

  // Verify: re-read a sample and confirm both match
  console.log('\nVerification spot-check (5 samples)...');
  const samples = FIXES.slice(0, 5);
  for (const { id, fit } of samples) {
    const [row] = await sql`
      SELECT fit_score, config_data->>'fitScore' AS jsonb_fit
      FROM fundraising_foundations WHERE id = ${id}
    `;
    if (!row) { console.log(`  ❌ ${id}: not found`); continue; }
    const pass = Number(row.fit_score) === fit && Number(row.jsonb_fit) === fit;
    console.log(`  ${pass ? '✅' : '❌'} ${id}: col=${row.fit_score} jsonb=${row.jsonb_fit} (want ${fit})`);
  }

  console.log('\nDone. Run: npm run sync && npm run build');
}
main().catch(console.error);
