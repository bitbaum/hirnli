/**
 * Foundation Data — Runtime DB Read Layer
 *
 * Replaces the old build-time `npm run sync` → stiftungen-generated.ts cache.
 * DB is the only source of truth now; reads go through unstable_cache so the
 * 1,683-row dataset benefits from in-process caching instead of hitting the
 * DB on every request.
 *
 * KNOWN LIMITATION: the serialized payload (~3.6MB) exceeds Next's 2MB
 * per-entry cap for its persistent/on-disk cache handler — confirmed via a
 * real `npm run build` (see "Failed to set Next.js data cache ... items over
 * 2MB can not be cached"). The call still succeeds and returns correct data;
 * unstable_cache's in-memory layer still helps within a single running
 * process, but the entry won't survive across server restarts/build workers,
 * so a cold process pays a full DB query + Zod-parse on first request. This
 * is a light query (1,683 rows, indexed) so it's an accepted tradeoff, not a
 * correctness issue. A custom cache handler (next.config `cacheHandler`)
 * would remove the 2MB cap if this becomes a real perf problem.
 *
 * Revalidates on a 1h TTL. A write (scripts/foundation-upsert.ts, POST
 * /api/foundations) won't be reflected until then, or until the process
 * restarts — Next 16's revalidateTag requires a cache-profile argument that
 * unstable_cache (a legacy, non-"use cache" primitive) doesn't cleanly
 * interact with; not worth the complexity for a low-frequency, human-
 * triggered write path.
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
  // No try/catch here: a DB failure must THROW so unstable_cache never stores
  // the failure. A caught-and-returned [] is a tiny value that — unlike the
  // >2MB real dataset — fits the disk cache and gets served for the full 1h
  // TTL. Observed: a DATABASE_URL-less build cached [] into .next/cache and
  // `next start` then rendered every page empty. The graceful fallback lives
  // in getAllFoundations(), OUTSIDE the cache wrapper.
  const rows: { configData: unknown }[] = await db
    .select({ configData: foundations.configData })
    .from(foundations)
    .where(
      and(
        eq(foundations.archived, false),
        or(isNull(foundations.dataConfidence), ne(foundations.dataConfidence, 'unverified')),
      ),
    );

  const valid: Foundation[] = [];
  for (const row of rows) {
    const parsed = foundationSchema.safeParse(row.configData);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      const id = (row.configData as { slug?: string } | null)?.slug ?? '(unknown slug)';
      console.warn(
        `[foundations-repo] invalid config_data for ${id}, skipped: ${parsed.error.issues[0]?.message}`,
      );
    }
  }
  valid.sort((a, b) => a.slug.localeCompare(b.slug));

  if (process.env.NODE_ENV !== 'test') {
    const violations = validateFoundationQuality(valid);
    if (violations.length > 0) {
      const msg = violations.map((v) => `  ${v.slug}: ${v.issues.join('; ')}`).join('\n');
      console.warn(
        `[Foundation Quality Gate] ${violations.length} researched entries (tier >= profiliert) have quality issues:\n${msg}`,
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
  try {
    return await cachedFetchAllFoundations();
  } catch (err) {
    console.error(
      '[foundations-repo] DB unreachable — is the SSH tunnel open? See docs/DEPLOYMENT.md',
      err,
    );
    return [];
  }
}

/** Look up a single foundation by its URL slug. */
export async function getFoundationBySlug(slug: string): Promise<Foundation | undefined> {
  const all = await getAllFoundations();
  return all.find((f) => f.slug === slug);
}
