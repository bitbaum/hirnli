/**
 * Foundation Data — Runtime DB Read Layer
 *
 * Replaces the old build-time `npm run sync` → stiftungen-generated.ts cache.
 * DB is the only source of truth now; reads go through unstable_cache so the
 * dataset benefits from in-process caching instead of hitting the DB on every
 * request.
 *
 * A read composes two things: the shared registry row (`fundraising_foundations`,
 * one per foundation for every tenant together) and the reading tenant's own
 * assessment (`fundraising_foundation_assessments`, one per org per foundation).
 * The composed object has the same shape the whole app already consumes, so no
 * consumer knows the difference.
 *
 * Until this change, no read anywhere filtered by org at all — `org_id` was a
 * column nothing selected on. One customer's fit scores and private research
 * notes were simply what every reader got.
 *
 * KNOWN LIMITATION: the serialized payload (~3.6MB) exceeds Next's 2MB
 * per-entry cap for its persistent/on-disk cache handler — confirmed via a
 * real `npm run build` (see "Failed to set Next.js data cache ... items over
 * 2MB can not be cached"). The call still succeeds and returns correct data;
 * unstable_cache's in-memory layer still helps within a single running
 * process, but the entry won't survive across server restarts/build workers,
 * so a cold process pays a full DB query + Zod-parse on first request. This
 * is a light query (indexed) so it's an accepted tradeoff, not a correctness
 * issue. A custom cache handler (next.config `cacheHandler`) would remove the
 * 2MB cap if this becomes a real perf problem.
 *
 * Revalidates on a 1h TTL. A write (scripts/foundation-upsert.ts, POST
 * /api/foundations) won't be reflected until then, or until the process
 * restarts — Next 16's revalidateTag requires a cache-profile argument that
 * unstable_cache (a legacy, non-"use cache" primitive) doesn't cleanly
 * interact with; not worth the complexity for a low-frequency, human-
 * triggered write path.
 */

import { unstable_cache } from 'next/cache';
import { and, eq, isNull, ne, or, sql } from 'drizzle-orm';
import { db } from './client';
import { foundationAssessments, foundations } from './schema';
import { type Foundation } from '@/lib/schemas/foundation';
import { composeFoundation } from './foundation-compose';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
// Static import is safe here: foundation-quality → foundation-helpers is a
// straight line, foundation-helpers no longer imports back into this module
// (it takes `foundations: Foundation[]` as a parameter instead).
import { validateFoundationQuality } from '@/lib/domain/foundation-quality';
import { getFunderProfile } from '@/lib/funder/repo';
import { applyFunderProfile } from '@/lib/funder/overlay';

export const FOUNDATIONS_CACHE_TAG = 'foundations';

async function fetchFoundationsForOrg(orgId: string): Promise<Foundation[]> {
  // No try/catch here: a DB failure must THROW so unstable_cache never stores
  // the failure. A caught-and-returned [] is a tiny value that — unlike the
  // >2MB real dataset — fits the disk cache and gets served for the full 1h
  // TTL. Observed: a DATABASE_URL-less build cached [] into .next/cache and
  // `next start` then rendered every page empty. The graceful fallback lives
  // in getFoundationsForOrg(), OUTSIDE the cache wrapper.
  //
  // LEFT JOIN, not INNER: a tenant browses the whole shared registry and its
  // own assessments overlay it. An inner join would show a new customer an
  // empty product — the registry of researched foundations is the thing they
  // are here for, and forming opinions about it is the work they come to do.
  const rows = await db
    .select({ configData: foundations.configData, assessment: foundationAssessments })
    .from(foundations)
    .leftJoin(
      foundationAssessments,
      and(
        eq(foundationAssessments.foundationId, foundations.id),
        eq(foundationAssessments.orgId, orgId),
      ),
    )
    .where(
      and(
        eq(foundations.archived, false),
        or(isNull(foundations.dataConfidence), ne(foundations.dataConfidence, 'unverified')),
      ),
    );

  const valid: Foundation[] = [];
  for (const row of rows) {
    const composed = composeFoundation(row.configData, row.assessment, (slug, message) =>
      console.warn(`[foundations-repo] invalid foundation ${slug}, skipped: ${message}`),
    );
    if (composed) valid.push(composed);
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

/**
 * One organisation's foundations, cached.
 *
 * The org id is part of the cache key, not merely of the query. A per-tenant
 * result stored under a shared key is the same cross-tenant leak as an
 * unscoped query, arriving by a different route and much harder to see: the
 * first tenant to warm the cache would decide what every other tenant reads.
 */
export async function getFoundationsForOrg(orgId: string): Promise<Foundation[]> {
  try {
    return await unstable_cache(() => fetchFoundationsForOrg(orgId), ['foundations-all', orgId], {
      tags: [FOUNDATIONS_CACHE_TAG],
      revalidate: 3600,
    })();
  } catch (err) {
    // A deploy defect must not be served as an empty page.
    //
    // This catch used to swallow everything and blame the SSH tunnel. On
    // 2026-09-04 migration 0012 created fundraising_foundation_assessments as
    // `postgres` while the app connects as its own role, so every read raised
    // 42501 permission denied — and this line reported "DB unreachable",
    // returned [], and the export endpoint answered 200 with a header row and
    // no data. Nothing was down, nothing alerted, and the site simply claimed
    // the customer had no foundations.
    //
    // The two cases are genuinely different and must be treated differently.
    // Postgres class 42 (syntax error or access rule violation: undefined
    // table, undefined column, insufficient privilege) means the running code
    // and the database schema disagree. That is a defect in what was deployed:
    // it will still be true on the next request, and on every request until
    // someone changes something. Anything else — a refused connection, a
    // timeout, a restarting server — is infrastructure, plausibly transient,
    // and worth degrading gracefully for rather than showing an error page.
    //
    // So class 42 rethrows and surfaces, and only the transient case falls
    // back to [].
    if (isSchemaOrPermissionError(err)) {
      console.error(
        `[foundations-repo] schema/permission error for org ${orgId} — the deployed code and the database disagree. Not falling back to an empty list.`,
        err,
      );
      throw err;
    }
    console.error('[foundations-repo] DB unreachable — see docs/DEPLOYMENT.md', err);
    return [];
  }
}

/**
 * Does this error mean the code and the database disagree?
 *
 * Postgres signals that whole family with SQLSTATE class 42 — 42P01 undefined
 * table, 42703 undefined column, 42501 insufficient privilege. Matching the
 * class rather than listing individual codes is deliberate: the next member of
 * the family should be caught the first time it happens, not after someone
 * adds it to a list.
 *
 * node-postgres wraps the driver error in a DrizzleQueryError, so the code can
 * be one `cause` deep.
 */
export function isSchemaOrPermissionError(err: unknown): boolean {
  for (let e: unknown = err, depth = 0; e && depth < 5; depth++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === 'string' && code.startsWith('42')) return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

/** All active, sufficiently-confident foundations for the requesting tenant. */
export async function getAllFoundations(): Promise<Foundation[]> {
  return getFoundationsForOrg(await getCurrentOrgId());
}

/**
 * The shared foundation registry, with no tenant's opinions attached.
 *
 * For the platform pages, which belong to no tenant. This used to load the
 * REFERENCE tenant's foundations — registry facts joined to that customer's
 * assessments — so the product page's funnel described one customer's research
 * and presented it as the platform's. Naming that customer to get the number
 * also meant the platform surface could not render without it.
 *
 * The registry is genuinely shared: every tenant browses the same Swiss
 * foundations. What differs is the assessments, and those are exactly the part
 * the platform must not borrow. Fit distribution and research depth therefore
 * read as unassessed here, which is correct — the platform has not assessed
 * anything, its customers have.
 */
export async function getRegistryFoundations(): Promise<Foundation[]> {
  const rows = await db
    .select({ configData: foundations.configData, assessment: sql`NULL` })
    .from(foundations)
    .where(
      and(
        eq(foundations.archived, false),
        or(isNull(foundations.dataConfidence), ne(foundations.dataConfidence, 'unverified')),
      ),
    );

  return rows
    .map((row) => composeFoundation(row.configData, null))
    .filter((f): f is Foundation => f !== undefined);
}

/**
 * Look up a single foundation by its URL slug, for the requesting tenant.
 *
 * Three layers meet here, and the order is the point: the shared register, the
 * requesting tenant's own assessment of it, and — last, so it wins — whatever
 * the foundation has confirmed about itself. A foundation that maintains its
 * entry is more current than anyone's research into it.
 */
export async function getFoundationBySlug(
  slug: string,
): Promise<(Foundation & { funderConfirmed: boolean }) | undefined> {
  const all = await getAllFoundations();
  const found = all.find((f) => f.slug === slug);
  if (!found) return undefined;

  // `slug` IS the register's primary key — verified across all 16,623 rows,
  // where `id = config_data->>'slug'` holds without exception. The composed
  // Foundation exposes only `slug`, so this is the join key.
  return applyFunderProfile(found, await getFunderProfile(found.slug));
}
