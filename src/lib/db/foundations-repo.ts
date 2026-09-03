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
import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { db } from './client';
import { foundationAssessments, foundations } from './schema';
import { type Foundation } from '@/lib/schemas/foundation';
import { composeFoundation } from './foundation-compose';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/registry';
// Static import is safe here: foundation-quality → foundation-helpers is a
// straight line, foundation-helpers no longer imports back into this module
// (it takes `foundations: Foundation[]` as a parameter instead).
import { validateFoundationQuality } from '@/lib/domain/foundation-quality';

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
    console.error(
      '[foundations-repo] DB unreachable — is the SSH tunnel open? See docs/DEPLOYMENT.md',
      err,
    );
    return [];
  }
}

/** All active, sufficiently-confident foundations for the requesting tenant. */
export async function getAllFoundations(): Promise<Foundation[]> {
  return getFoundationsForOrg(await getCurrentOrgId());
}

/**
 * The reference tenant's foundations, for pages that belong to no tenant.
 *
 * Used by the platform page, which is org-agnostic but whose statistics are
 * not: computeFunnelStats mixes registry facts (purpose, contact, website)
 * with assessment values (fit distribution, themes, research depth), so it
 * currently describes one customer's work and presents it as the platform's.
 *
 * This function does not fix that; it makes it explicit and greppable instead
 * of arriving silently through a default. Deciding what the platform page
 * should actually report — the registry's size, or something aggregated across
 * tenants — is a product question, and pointing it at an empty registry view
 * would only replace a misleading number with a zero.
 */
export async function getReferenceTenantFoundations(): Promise<Foundation[]> {
  return getFoundationsForOrg(DEFAULT_TENANT_ID);
}

/** Look up a single foundation by its URL slug, for the requesting tenant. */
export async function getFoundationBySlug(slug: string): Promise<Foundation | undefined> {
  const all = await getAllFoundations();
  return all.find((f) => f.slug === slug);
}
