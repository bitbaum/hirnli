/**
 * Writing an organisation's assessment of a foundation.
 *
 * The counterpart to `foundation-compose.ts`, and it exists because the read
 * side moved first. Once a read takes fitScore, priority, themes, tagline and
 * researchNotes from `fundraising_foundation_assessments`, a write that puts
 * them into `config_data` still succeeds, still returns 200, and has no visible
 * effect whatsoever — the value sits in the blob where nothing reads it any
 * more. The edit panel would appear to save and the page would keep showing the
 * old text.
 *
 * That failure has no error to notice, which is why the split has to be made in
 * both directions before either is finished.
 *
 * So a write arriving as one Foundation-shaped object is separated here: the
 * registry facts stay in `config_data`, the analysis fields go to the asking
 * organisation's assessment row. Both halves use ANALYSIS_FIELDS, derived from
 * the Zod schema, so read and write cannot disagree about where a field lives.
 */

import { sql } from 'drizzle-orm';
import { db } from './client';
import { foundationAssessments, type NewFoundationAssessment } from './schema';
import { ANALYSIS_FIELDS } from '@/lib/schemas/foundation';

/**
 * The analysis fields a caller may set, all optional — a PATCH sends a few.
 *
 * Derived from the table's insert type rather than listed again, so a column
 * added to the assessment table is writable without editing this file, and a
 * column's nullability is stated in exactly one place. That second property is
 * load-bearing: fit_score and priority are NOT NULL, so this type refuses a
 * null and forces the caller to say what a cleared score means, rather than
 * letting a null reach the database and fail at runtime.
 *
 * The four columns removed are not the caller's to set: the two key columns are
 * arguments to `upsertAssessment`, and the timestamps are the database's.
 */
export type AnalysisPatch = Partial<
  Omit<NewFoundationAssessment, 'orgId' | 'foundationId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Divide an incoming Foundation-shaped patch into the half that belongs to the
 * shared registry and the half that belongs to one organisation.
 *
 * The client sends both together and should keep being allowed to: the edit
 * panel updates a contact address and a research note in the same action,
 * which is one edit to a person and two tables underneath. Splitting it is this
 * module's job, not the caller's.
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
 * Record one organisation's assessment, creating the row if this is the first
 * opinion it has expressed about the foundation.
 *
 * An upsert rather than an update: a tenant reading the shared registry has no
 * assessment row until it writes one, so the first edit has to create it. The
 * NOT NULL columns it does not mention fall back to their database defaults
 * (fit 0, priority 4) — the same unassessed starting point the read composes.
 *
 * Does nothing when the patch contains no analysis fields, so a caller that
 * only touched registry facts need not check first.
 */
export async function upsertAssessment(
  orgId: string,
  foundationId: string,
  analysis: AnalysisPatch,
): Promise<void> {
  if (Object.keys(analysis).length === 0) return;

  await db
    .insert(foundationAssessments)
    .values({ orgId, foundationId, ...analysis })
    .onConflictDoUpdate({
      target: [foundationAssessments.orgId, foundationAssessments.foundationId],
      // Only the fields this write actually mentioned. A full `set(analysis)`
      // of a partial patch would be right, but spelling out updatedAt matters:
      // without it a row's timestamp would claim the assessment was last
      // touched whenever it was created.
      set: { ...analysis, updatedAt: sql`now()` },
    });
}

/**
 * Record the first assessments for foundations this organisation just created.
 *
 * A plain insert, not an upsert, and deliberately so: both callers create the
 * foundation rows in the same request, having already rejected slugs that
 * exist. An assessment row therefore cannot be there yet, and a conflict would
 * mean the dedup check was wrong — which should surface as an error rather than
 * be absorbed by an ON CONFLICT clause.
 *
 * One statement for the whole batch, because an import of a few thousand
 * foundations otherwise becomes a few thousand round trips.
 */
export async function insertAssessments(
  orgId: string,
  rows: Array<{ foundationId: string } & AnalysisPatch>,
): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(foundationAssessments).values(rows.map((row) => ({ orgId, ...row })));
}

/**
 * The subset of an assessment that the `fundraising_foundations` flat columns
 * still duplicate, shaped for a Drizzle update of that table.
 *
 * TEMPORARY — deleted in the stage that drops the flat columns.
 *
 * fit_score, priority, research_depth and research_date exist twice: once here
 * per organisation, and once as columns on the shared registry table, where
 * `GET /api/foundations` filters and sorts on them. Migration 0003 added a
 * trigger to keep those columns derived from config_data after 535 production
 * mismatches; now that the analysis fields have left config_data, the trigger's
 * COALESCE simply falls through and the columns hold whatever they held before.
 *
 * Not writing them would therefore not be "leaving them alone" — it would let
 * an edited score silently stop matching the list it is filtered by, which is
 * the exact drift the trigger was introduced to end. So they are written, from
 * the same patch object that feeds the assessment row, in this one function, so
 * there is a single place to delete rather than four call sites to find.
 */
export function legacyFlatColumns(analysis: AnalysisPatch): {
  fitScore?: number;
  priority?: number;
  researchDepth?: string | null;
  researchDate?: string | null;
} {
  return {
    ...(analysis.fitScore !== undefined && { fitScore: analysis.fitScore }),
    ...(analysis.priority !== undefined && { priority: analysis.priority }),
    ...(analysis.researchDepth !== undefined && { researchDepth: analysis.researchDepth }),
    ...(analysis.researchDate !== undefined && { researchDate: analysis.researchDate }),
  };
}
