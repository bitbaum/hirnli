/**
 * Foundation Data — Runtime DB Read Layer
 *
 * Replaces the old build-time `npm run sync` → stiftungen-generated.ts cache.
 * DB is the only source of truth now; reads go through a tag-cached query so
 * the 1,683-row dataset isn't re-fetched on every request.
 *
 * Revalidates on a 1h TTL. A write (scripts/foundation-upsert.ts, POST
 * /api/foundations) won't be reflected until then, or until the app restarts —
 * Next 16's revalidateTag requires a cache-profile argument that unstable_cache
 * (a legacy, non-"use cache" primitive) doesn't cleanly interact with; not
 * worth the complexity for a low-frequency, human-triggered write path.
 */

import { unstable_cache } from 'next/cache';
import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { db } from './client';
import { foundations } from './schema';
import { foundationSchema, type Foundation } from '@/lib/schemas/foundation';
// Static import is safe here: foundation-quality → foundation-helpers is a
// straight line, foundation-helpers no longer imports back into this module
// (it takes `foundations: Foundation[]` as a parameter instead).
import { validateFoundationQuality } from '@/lib/domain/foundation-quality';

export const FOUNDATIONS_CACHE_TAG = 'foundations';

async function fetchAllFoundations(): Promise<Foundation[]> {
  let rows: { configData: unknown }[];
  try {
    rows = await db
      .select({ configData: foundations.configData })
      .from(foundations)
      .where(
        and(
          eq(foundations.archived, false),
          or(isNull(foundations.dataConfidence), ne(foundations.dataConfidence, 'unverified'))
        )
      );
  } catch (err) {
    console.error(
      '[foundations-repo] DB unreachable — is the SSH tunnel open? See docs/DEPLOYMENT.md',
      err
    );
    return [];
  }

  const valid: Foundation[] = [];
  for (const row of rows) {
    const parsed = foundationSchema.safeParse(row.configData);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      const id = (row.configData as { slug?: string } | null)?.slug ?? '(unknown slug)';
      console.warn(`[foundations-repo] invalid config_data for ${id}, skipped: ${parsed.error.issues[0]?.message}`);
    }
  }
  valid.sort((a, b) => a.slug.localeCompare(b.slug));

  if (process.env.NODE_ENV !== 'test') {
    const violations = validateFoundationQuality(valid);
    if (violations.length > 0) {
      const msg = violations.map((v) => `  ${v.slug}: ${v.issues.join('; ')}`).join('\n');
      console.warn(
        `[Foundation Quality Gate] ${violations.length} researched entries (tier >= profiliert) have quality issues:\n${msg}`
      );
    }
  }

  return valid;
}

const cachedFetchAllFoundations = unstable_cache(fetchAllFoundations, ['foundations-all'], {
  tags: [FOUNDATIONS_CACHE_TAG],
  revalidate: 3600,
});

/** All active, sufficiently-confident foundations. Cached; use for bulk aggregation/filtering. */
export async function getAllFoundations(): Promise<Foundation[]> {
  return cachedFetchAllFoundations();
}

/** Look up a single foundation by its URL slug. */
export async function getFoundationBySlug(slug: string): Promise<Foundation | undefined> {
  const all = await getAllFoundations();
  return all.find((f) => f.slug === slug);
}
