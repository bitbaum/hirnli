/**
 * A tenant's own scoring priorities.
 *
 * `org_scoring` has existed since migration 0007 and holds a complete engine
 * per organisation — dimensions, categories, weights. It was seeded and never
 * read: every tenant's fit breakdown was computed from the code module's
 * `THEME_HIERARCHY`, which names one organisation's core fields of work
 * (labour integration, circular economy, digital education, digital
 * sovereignty). A second customer opening the "Fit" tab on any foundation saw
 * its themes weighted by somebody else's priorities.
 *
 * Only the THEMATIC dimension is read from here, and deliberately so. The other
 * dimensions of the fit and readiness engines ask how well-researched the
 * FOUNDATION is — application method, documented deadlines, known grant range —
 * which is the same question whoever is asking. Priorities are the part that
 * belongs to the applicant.
 *
 * Null is a normal state meaning "this organisation has not stated priorities",
 * and the caller weights every matched theme equally rather than borrowing a
 * hierarchy. Compare `getStoriesBlock`: absence is answered with nothing, never
 * with somebody else's.
 */

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { orgScoring } from '@/lib/db/schema';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import type { ThemeCategory } from '@/lib/config/fit-scoring';

/**
 * One weighted group of themes, validated at the boundary.
 *
 * The TYPE comes from `config/fit-scoring.ts`, which is where the engine
 * defines what it reads; this is only the runtime check that a stored row
 * matches it. Declaring a second `ThemeCategory` here would be a second
 * definition of the same shape, and the two would drift on `cap` — which is
 * exactly what happened before this comment existed.
 */
const themeCategorySchema = z.object({
  name: z.string(),
  members: z.array(z.string()),
  weight: z.number(),
  cap: z.number(),
}) satisfies z.ZodType<ThemeCategory>;

/** Just enough of the stored engine to find the thematic dimension. */
const storedEngineSchema = z.object({
  dimensions: z.array(
    z.object({
      id: z.string(),
      config: z
        .object({ categories: z.array(themeCategorySchema).optional() })
        .partial()
        .optional(),
    }),
  ),
});

/**
 * This tenant's theme priorities, or null if it has not stated any.
 *
 * Deliberately forgiving about the rest of the stored engine: only the
 * categories are read, so an engine that has drifted in some other dimension
 * still yields priorities rather than throwing. That is the opposite of the
 * rule for `org_content`, where a malformed row throws — because there the row
 * IS the content, and here it is a weighting that has an honest default.
 */
export async function getThemePriorities(orgId?: string): Promise<ThemeCategory[] | null> {
  const id = orgId ?? (await getCurrentOrgId());

  const rows = await db
    .select({ engine: orgScoring.engine })
    .from(orgScoring)
    .where(eq(orgScoring.orgId, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const parsed = storedEngineSchema.safeParse(row.engine);
  if (!parsed.success) return null;

  const categories = parsed.data.dimensions.find((d) => d.id === 'thematic')?.config?.categories;
  return categories && categories.length > 0 ? categories : null;
}
