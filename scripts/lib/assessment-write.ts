/**
 * Writing an organisation's assessment of a foundation, for standalone scripts.
 *
 * The scripts' counterpart to src/lib/db/assessment-write.ts. Same job, and it
 * exists for the same reason the reader in ./foundations.ts exists: these are
 * `tsx` one-shots outside any Next context, so they use the raw `pg` client
 * rather than the app's Drizzle instance.
 *
 * Why every ingestion script needs this. Until now they wrote fitScore,
 * priority, themes, tagline, researchNotes, researchDate and researchDepth into
 * `fundraising_foundations.config_data`, which was where the app read them
 * from. The read has since moved to `fundraising_foundation_assessments`, and
 * `composeFoundation` explicitly strips those keys out of the blob — so a
 * script that keeps writing them into config_data succeeds, reports the rows it
 * updated, and changes nothing anybody can see. A pipeline that appears to work
 * and silently produces no effect is worse than one that fails, so the writes
 * are moved here rather than left to rot in the blob.
 */

import { query } from './db';
import { ANALYSIS_FIELDS, type FoundationAnalysis } from '../../src/lib/schemas/foundation';

/**
 * Where each analysis field lives in `fundraising_foundation_assessments`, and
 * whether the column is JSONB.
 *
 * The app gets this mapping from Drizzle; raw SQL has to state it. Stating it
 * is the risk — a field added to `analysisSchema` and forgotten here would be
 * dropped by every script silently — so `assessment-write.test.ts` asserts this
 * object's keys are exactly ANALYSIS_FIELDS, and fails the build if they drift.
 */
export const ASSESSMENT_COLUMNS: Record<
  keyof FoundationAnalysis,
  { column: string; jsonb: boolean }
> = {
  fitScore: { column: 'fit_score', jsonb: false },
  priority: { column: 'priority', jsonb: false },
  priorityOverride: { column: 'priority_override', jsonb: false },
  themes: { column: 'themes', jsonb: true },
  tagline: { column: 'tagline', jsonb: false },
  researchNotes: { column: 'research_notes', jsonb: false },
  researchDate: { column: 'research_date', jsonb: false },
  researchDepth: { column: 'research_depth', jsonb: false },
  possiblePartners: { column: 'possible_partners', jsonb: true },
};

/** The analysis fields a script may set; all optional, since most set a few. */
export type AnalysisPatch = Partial<Record<keyof FoundationAnalysis, unknown>>;

/**
 * Split a Foundation-shaped object into the half that belongs in the shared
 * registry blob and the half that belongs to one organisation.
 *
 * The ingestion scripts build one flat object describing everything they
 * learned about a foundation. That object spans both tables, and which key goes
 * where is decided by ANALYSIS_FIELDS — the same list the read path uses, so
 * the two cannot disagree.
 */
export function splitFoundationPatch(patch: Record<string, unknown>): {
  registry: Record<string, unknown>;
  analysis: AnalysisPatch;
} {
  const analysisKeys = new Set<string>(ANALYSIS_FIELDS as unknown as string[]);
  const registry: Record<string, unknown> = {};
  const analysis: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (analysisKeys.has(key)) analysis[key] = value;
    else registry[key] = value;
  }

  return { registry, analysis: analysis as AnalysisPatch };
}

/**
 * Record one organisation's assessment, creating the row on first opinion.
 *
 * Only the fields the patch actually mentions are written, so a script that
 * learned a foundation's themes does not also reset a fit score somebody set by
 * hand. Columns absent from the patch keep their value on conflict, and take
 * the database default (fit 0, priority 4) on insert — the same unassessed
 * starting point the read composes for a tenant with no row.
 *
 * Does nothing for an empty patch, so callers need not check first.
 */
export async function upsertAssessment(
  orgId: string,
  foundationId: string,
  analysis: AnalysisPatch,
): Promise<void> {
  const entries = (Object.keys(analysis) as (keyof FoundationAnalysis)[])
    .filter((key) => ASSESSMENT_COLUMNS[key] && analysis[key] !== undefined)
    .map((key) => ({ ...ASSESSMENT_COLUMNS[key], value: analysis[key] }));

  if (entries.length === 0) return;

  // Column names come from ASSESSMENT_COLUMNS, never from the patch, so no
  // caller-supplied string reaches the statement text. Values are bound.
  const columns = ['org_id', 'foundation_id', ...entries.map((e) => e.column)];
  const values: unknown[] = [
    orgId,
    foundationId,
    // node-pg turns a JS array into a Postgres array literal, which a jsonb
    // column rejects. JSONB values are serialised here and cast below.
    ...entries.map((e) => (e.jsonb ? JSON.stringify(e.value ?? null) : e.value)),
  ];
  const placeholders = columns.map((_, i) => {
    const p = `$${i + 1}`;
    return i >= 2 && entries[i - 2].jsonb ? `${p}::jsonb` : p;
  });
  const assignments = entries.map((e) => `${e.column} = EXCLUDED.${e.column}`);

  await query(
    `INSERT INTO fundraising_foundation_assessments (${columns.join(', ')})
     VALUES (${placeholders.join(', ')})
     ON CONFLICT (org_id, foundation_id) DO UPDATE
       SET ${assignments.join(', ')}, updated_at = now()`,
    values,
  );
}

/**
 * One organisation's stored assessment, in schema field names.
 *
 * Returns an empty object when the organisation has never assessed the
 * foundation — the same "no opinion yet" the read path composes defaults for.
 *
 * Scripts that merge conditionally ("only fill what is empty", "only raise a
 * fit score, never lower it") need the current values to compare against, and
 * those values are no longer in config_data. Reading only the blob would make
 * every stored assessment look absent, so a merge meant to preserve existing
 * work would quietly overwrite it instead.
 *
 * The column list is generated from ASSESSMENT_COLUMNS rather than written out,
 * so the reader and the writer cannot disagree about where a field lives.
 */
export async function readAssessment(orgId: string, foundationId: string): Promise<AnalysisPatch> {
  const fields = Object.keys(ASSESSMENT_COLUMNS) as (keyof FoundationAnalysis)[];
  const columns = fields.map((f) => ASSESSMENT_COLUMNS[f].column);

  const rows = await query<Record<string, unknown>>(
    `SELECT ${columns.join(', ')}
       FROM fundraising_foundation_assessments
      WHERE org_id = $1 AND foundation_id = $2`,
    [orgId, foundationId],
  );
  if (rows.length === 0) return {};

  const row = rows[0];
  const assessment: AnalysisPatch = {};
  for (const field of fields) {
    const value = row[ASSESSMENT_COLUMNS[field].column];
    if (value !== null && value !== undefined) assessment[field] = value;
  }
  return assessment;
}

/**
 * Every organisation's assessment of one foundation.
 *
 * For registry-level operations — deduplication is the only one today — which
 * act on a foundation shared by all tenants rather than on one tenant's view of
 * it. Merging two duplicate registry rows must carry across the opinions of
 * every organisation that formed one, not just whoever happens to be running
 * the script, or the others lose their research to a cleanup they never saw.
 */
export async function readAssessmentsForFoundation(
  foundationId: string,
): Promise<Array<{ orgId: string } & AnalysisPatch>> {
  const fields = Object.keys(ASSESSMENT_COLUMNS) as (keyof FoundationAnalysis)[];
  const columns = fields.map((f) => ASSESSMENT_COLUMNS[f].column);

  const rows = await query<Record<string, unknown>>(
    `SELECT org_id, ${columns.join(', ')}
       FROM fundraising_foundation_assessments
      WHERE foundation_id = $1`,
    [foundationId],
  );

  return rows.map((row) => {
    const assessment: { orgId: string } & AnalysisPatch = { orgId: String(row.org_id) };
    for (const field of fields) {
      const value = row[ASSESSMENT_COLUMNS[field].column];
      if (value !== null && value !== undefined) assessment[field] = value;
    }
    return assessment;
  });
}
