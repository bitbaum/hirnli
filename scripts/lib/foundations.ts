/**
 * Foundation data reader for standalone pipeline scripts.
 *
 * Same query, filter and composition as src/lib/db/foundations-repo.ts (the
 * app's read layer), but without unstable_cache — that's a Next.js server API
 * and doesn't work outside a Next request/build context, which is exactly the
 * environment these `tsx` scripts run in. Scripts are one-shot, so an uncached
 * query per run is fine.
 *
 * The composition itself is NOT duplicated here; both readers call
 * `composeFoundation` from src/lib/db/foundation-compose.ts. They used to hold
 * separate implementations and had already drifted: this file accepted
 * `archived IS NULL` where the app matched `archived = false`, so an audit
 * script and the page it audited could disagree about which foundations exist.
 * The WHERE clause below now mirrors the app's exactly.
 */

import { sql } from './db';
import { type Foundation } from '../../src/lib/schemas/foundation';
import { composeFoundation, type AssessmentValues } from '../../src/lib/db/foundation-compose';

interface Row {
  config_data: unknown;
  // NULL for every column when this organisation has not assessed the
  // foundation — the LEFT JOIN's miss, not a missing foundation.
  fit_score: number | null;
  priority: number | null;
  priority_override: boolean | null;
  themes: unknown;
  tagline: string | null;
  research_notes: string | null;
  research_date: string | null;
  research_depth: string | null;
  possible_partners: unknown;
}

/**
 * All active, sufficiently-confident foundations as `orgId` sees them.
 *
 * The org id is a required parameter, deliberately. These scripts audit and
 * validate foundation data, and an audit that does not state whose data it
 * examined reports one tenant's numbers as though they were everyone's. Callers
 * get theirs from `requireOrgId()`, which refuses to guess.
 */
export async function getAllFoundations(orgId: string): Promise<Foundation[]> {
  const rows = await sql<Row>`
    SELECT f.config_data,
           a.fit_score, a.priority, a.priority_override, a.themes,
           a.tagline, a.research_notes, a.research_date, a.research_depth,
           a.possible_partners
      FROM fundraising_foundations f
      LEFT JOIN fundraising_foundation_assessments a
             ON a.foundation_id = f.id AND a.org_id = ${orgId}
     WHERE f.archived = false
       AND (f.data_confidence IS NULL OR f.data_confidence != 'unverified')
  `;

  const valid: Foundation[] = [];
  for (const row of rows) {
    const composed = composeRow(row);
    if (composed) valid.push(composed);
  }
  valid.sort((a, b) => a.slug.localeCompare(b.slug));
  return valid;
}

/** Turn one joined row into a Foundation as this organisation sees it. */
function composeRow(row: Row): Foundation | undefined {
  // A row with no fit_score is a LEFT JOIN miss: this organisation has no
  // assessment, so it gets the unassessed defaults rather than the blob's
  // leftover values from whoever researched the foundation first.
  const assessment: AssessmentValues | null =
    row.fit_score === null
      ? null
      : {
          fitScore: row.fit_score,
          priority: row.priority ?? 4,
          priorityOverride: row.priority_override ?? false,
          themes: row.themes,
          tagline: row.tagline,
          researchNotes: row.research_notes,
          researchDate: row.research_date,
          researchDepth: row.research_depth,
          possiblePartners: row.possible_partners,
        };

  return composeFoundation(row.config_data, assessment);
}

/**
 * One foundation by id, as `orgId` sees it, with no archived or confidence
 * filter applied.
 *
 * For write paths that read back what they just wrote. `getAllFoundations`
 * deliberately hides archived and unverified rows because it answers "what is
 * this organisation working with"; a script correcting a row it just inserted
 * is asking a different question and must see the row regardless of how the
 * list view would treat it.
 */
export async function getFoundationById(
  orgId: string,
  id: string,
): Promise<Foundation | undefined> {
  const [row] = await sql<Row>`
    SELECT f.config_data,
           a.fit_score, a.priority, a.priority_override, a.themes,
           a.tagline, a.research_notes, a.research_date, a.research_depth,
           a.possible_partners
      FROM fundraising_foundations f
      LEFT JOIN fundraising_foundation_assessments a
             ON a.foundation_id = f.id AND a.org_id = ${orgId}
     WHERE f.id = ${id}
  `;
  return row ? composeRow(row) : undefined;
}
