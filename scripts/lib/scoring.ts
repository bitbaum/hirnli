/**
 * A tenant's theme priorities, for standalone scripts.
 *
 * The scripts' counterpart to `src/lib/content/scoring-source.ts`, and it
 * exists for the same reason as `scripts/lib/tenant.ts`: these are `tsx`
 * one-shots outside any Next request, so there is no `headers()` to resolve an
 * org from and no Drizzle client — just the raw `pg` connection.
 *
 * Why it matters here more than anywhere else: the ingest and enrichment
 * scripts are what WRITE fit scores into an organisation's assessments. Those
 * scores decide which foundations it is told to approach. Computing them with
 * the code module's `THEME_HIERARCHY` meant computing every organisation's
 * priorities as one organisation's — invisible while only that organisation had
 * ever run research.
 *
 * A tenant with no row gets null, and the scorer weights every theme equally.
 * That is a worse fit signal than a stated ranking and a much better one than
 * somebody else's ranking.
 */

import { query } from './db';
import type { ThemeCategory } from '../../src/lib/config/fit-scoring';

interface ScoringRow {
  engine: unknown;
}

function isCategoryArray(v: unknown): v is ThemeCategory[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (c) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as ThemeCategory).name === 'string' &&
        Array.isArray((c as ThemeCategory).members) &&
        typeof (c as ThemeCategory).weight === 'number',
    )
  );
}

/** This organisation's theme priorities, or null if it has stated none. */
export async function loadThemePriorities(orgId: string): Promise<ThemeCategory[] | null> {
  const rows = await query<ScoringRow>('select engine from org_scoring where org_id = $1', [orgId]);
  const engine = rows[0]?.engine as { dimensions?: unknown } | undefined;
  if (!engine || !Array.isArray(engine.dimensions)) return null;

  const thematic = (engine.dimensions as { id?: string; config?: { categories?: unknown } }[]).find(
    (d) => d.id === 'thematic',
  );
  const categories = thematic?.config?.categories;
  return isCategoryArray(categories) ? categories : null;
}
