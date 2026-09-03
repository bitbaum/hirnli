/**
 * Building one tenant's view of a foundation, in one place.
 *
 * A foundation as the app consumes it is two records joined: the shared
 * registry row (what the foundation is) and the reading organisation's own
 * assessment (what that organisation thinks of it). Composing them is a small
 * function with one sharp edge, and there are two readers — the app's
 * `foundations-repo.ts` and the pipeline scripts' `scripts/lib/foundations.ts`
 * — so it lives here rather than twice.
 *
 * That duplication was already costing something. The two readers had
 * independently drifted on their WHERE clause: the app matched
 * `archived = false` while the scripts accepted `archived = false OR archived
 * IS NULL`, so an audit script and the page it audited could disagree about
 * which foundations exist.
 *
 * Deliberately free of Next.js imports. The scripts run under `tsx`, outside
 * any Next request or build context, so anything reaching for `next/cache` or
 * `next/headers` cannot be shared with them.
 */

import { ANALYSIS_FIELDS, foundationSchema, type Foundation } from '@/lib/schemas/foundation';

/**
 * One organisation's assessment, normalised.
 *
 * Not the Drizzle row type: the scripts read the same table over raw SQL and
 * get snake_case keys back. Both callers map into this shape, so the
 * composition below has exactly one input format to reason about.
 */
export interface AssessmentValues {
  fitScore: number;
  priority: number;
  priorityOverride: boolean;
  themes: unknown;
  tagline: string | null;
  researchNotes: string | null;
  researchDate: string | null;
  researchDepth: string | null;
  possiblePartners: unknown;
}

/**
 * What a foundation looks like to an organisation that has not assessed it.
 *
 * Not "unknown", and emphatically not the previous tenant's numbers: a fit
 * score of 0 at the lowest priority is the honest description of an opinion
 * nobody has formed yet. `tagline` and `researchDate` are empty strings rather
 * than absent because the schema requires strings, and display code already
 * handles both — FitAnalysis renders `researchDate || UNKNOWN_FIELD`, and
 * foundation-research-stats counts an empty researchDate as stale.
 *
 * Exported so a test can assert that its keys are exactly ANALYSIS_FIELDS, and
 * that assertion is the one with teeth here. Finding out why took a deliberate
 * attempt to break this module: removing the deletion loop in
 * composeFoundation changes nothing observable, because this object names all
 * nine analysis fields, so spreading it already overrides every one of them —
 * including those set to `undefined`, which Zod then strips. A test that
 * removes the loop and checks for leakage therefore passes either way. It looks
 * like a guard and guards nothing.
 *
 * The real failure mode is narrower: a field added to `analysisSchema` and not
 * added here. This object then stops covering it, the spread leaves the blob's
 * value untouched, and one organisation's number reappears under another's
 * name. The deletion loop is the backstop for that case; the key-set test is
 * what makes the omission fail loudly rather than ship.
 */
export const UNASSESSED_ANALYSIS = {
  fitScore: 0,
  priority: 4,
  priorityOverride: false,
  themes: [] as string[],
  tagline: '',
  researchNotes: undefined,
  researchDate: '',
  researchDepth: undefined,
  possiblePartners: undefined,
} as const;

/**
 * Compose a foundation from the shared registry blob and one tenant's
 * assessment. Returns undefined if the result does not satisfy the schema,
 * which is the contract the single-source read had before the split.
 *
 * The order of operations is the whole point. `config_data` still contains
 * Revamp-IT's values for every analysis field, because migration 0012 copied
 * them into the assessment table without removing them from the blob. So this
 * deletes the analysis keys outright before applying the assessment, rather
 * than spreading the assessment over the blob: under a merge, a tenant holding
 * no assessment row would inherit whatever the blob happened to say, and
 * another organisation's fit scores and private research notes would render as
 * its own. `ANALYSIS_FIELDS` is derived from the Zod schema so the list cannot
 * fall out of step with it.
 */
export function composeFoundation(
  blob: unknown,
  assessment: AssessmentValues | null,
  onInvalid?: (slug: string, message: string) => void,
): Foundation | undefined {
  if (blob === null || typeof blob !== 'object') return undefined;

  const registryOnly: Record<string, unknown> = { ...(blob as Record<string, unknown>) };
  for (const key of ANALYSIS_FIELDS) delete registryOnly[key];

  const analysis = assessment
    ? {
        fitScore: assessment.fitScore,
        priority: assessment.priority,
        priorityOverride: assessment.priorityOverride,
        themes: assessment.themes,
        tagline: assessment.tagline ?? '',
        researchNotes: assessment.researchNotes ?? undefined,
        researchDate: assessment.researchDate ?? '',
        researchDepth: assessment.researchDepth ?? undefined,
        possiblePartners: assessment.possiblePartners ?? undefined,
      }
    : UNASSESSED_ANALYSIS;

  const parsed = foundationSchema.safeParse({ ...registryOnly, ...analysis });
  if (parsed.success) return parsed.data;

  onInvalid?.(
    String(registryOnly.slug ?? '(unknown slug)'),
    parsed.error.issues[0]?.message ?? 'unknown validation error',
  );
  return undefined;
}
