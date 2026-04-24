/**
 * Bulk downgrade fit=4 rapid foundations that have ONLY the 'zuerich' theme
 * and NO officialPurpose text.
 *
 * These 137 foundations were LLM-triaged to fit=4 based solely on their Zürich
 * location. Sampling reveals they are uniformly:
 *   - Employee welfare funds (Fürsorgestiftungen) for specific companies
 *   - Single-institution support foundations (women's shelter financing, ZHdK, etc.)
 *   - Church/society foundations (Dreikönige, Allerheiligen, Herrenstuben)
 *   - Collective pension/benefit foundations (columna-*, AXA)
 *   - Specialized research or alumni funds
 *
 * All are structurally inaccessible to Revamp-IT (closed constituencies, no
 * external grant programs). Fit→2 (cautious, not zero — not individually verified,
 * but no credible path to engagement given the pattern).
 *
 * Exceptions (already researched, kept at fit=4): blauer-planet, iduna-stiftung,
 * kohler-friederich-stiftung, luiza-penha-*, forschungsstiftung-IT
 * Exceptions (in fit=4 but with different themes): not affected by this query
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// Foundations already researched — keep their fit=4 as-is
const SKIP_IDS = new Set([
  'blauer-planet',                          // suspended im Aufbau, genuine fit, revisit 12-18m
  'iduna-stiftung',                         // batch43: benachteiligte Jugend CH+Asien, fit=4 correct
  'kohler-friederich-stiftung',             // batch44: closed to new apps but real fit
  'luiza-penha-walter-renteiro-stiftung-fuer-die-jugend-des-bez', // batch44: Bezirk Meilen geo
  'forschungsstiftung-fuer-informationstechnologie-und-gesellsc',  // batch41: IT+Gesellschaft
  'ernst-wilhelm-meier-stiftung',           // batch43: ZH disadvantaged people, kept at 5
  'stiftung-symphasis',                     // batch40: closed Apr 2026, kept at 4
]);

async function main() {
  // Step 1: Find all candidates
  const rows = await sql`
    SELECT id, fit_score, config_data->>'officialPurpose' AS purpose
    FROM fundraising_foundations
    WHERE research_depth = 'rapid'
      AND priority = 4
      AND archived = false
      AND fit_score = 4
      AND data_confidence = 'ai-assessed'
      AND config_data->>'themes' = '["zuerich"]'
      AND (config_data->>'officialPurpose' IS NULL OR length(config_data->>'officialPurpose') < 50)
    ORDER BY id ASC
  `;

  const candidates = rows.filter(r => !SKIP_IDS.has(r.id as string));
  console.log(`\nFound ${rows.length} zuerich-only no-purpose fit=4 foundations`);
  console.log(`After skipping ${rows.length - candidates.length} already-researched: ${candidates.length} to downgrade\n`);

  let ok = 0;
  for (const row of candidates) {
    await sql`
      UPDATE fundraising_foundations
      SET fit_score   = 2,
          config_data = jsonb_set(
            jsonb_set(config_data, '{fitScore}', '2'::jsonb),
            '{researchNotes}',
            '"Kein öffentlicher Stiftungszweck auffindbar. Einziges Themen-Tag: zuerich (Standort). Stichprobe dieser Kategorie zeigt ausschliesslich Fürsorgestiftungen für Firmenmitarbeitende, kirchliche Fonds, Einzel-Institutions-Stiftungen und kollektive Pensionskassengebilde — allesamt für externe NGOs strukturell nicht zugänglich. Revamp-IT hat keine realistische Förderperspektive."'::jsonb
          ),
          updated_at  = NOW()
      WHERE id = ${row.id as string}
    `;
    ok++;
    if (ok % 20 === 0) process.stdout.write(`  ${ok}/${candidates.length}...\n`);
  }

  console.log(`\n  ✅ Downgraded ${ok} foundations: fit 4→2 + researchNotes added`);
  console.log('\nRun: npm run sync && npm run build');
}
main().catch(console.error);
