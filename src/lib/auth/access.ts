/**
 * Org access control — the confidentiality boundary of the platform.
 *
 * Two customers may be chasing the same foundation. One's fit scores, research
 * notes and pipeline must never be visible to the other, so "which
 * organisation is this request acting as?" is a security question, not a UI
 * preference.
 *
 * THE RULE: the acting organisation comes from the URL, and access is checked
 * against a membership row every time.
 *
 * Better Auth's organisation plugin offers `session.activeOrganizationId`, and
 * using it here would be the obvious shortcut. It is the wrong primitive for
 * this product:
 *
 *   - One cookie, many tabs. Open evig in a second tab and the first tab's
 *     "active org" changes underneath you. The next save writes a customer's
 *     data into another customer's account, with the UI showing the old one.
 *   - It makes the authorisation input mutable by a request the user did not
 *     intend to make. URL-scoped access can be wrong, but it is wrong
 *     *visibly* — the address bar says which org you are in.
 *
 * So `activeOrganizationId` is treated as "last used", good only for deciding
 * where to send someone who lands on `/`. It never grants anything.
 */

import { cache } from 'react';
import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { getAuth } from './server';
import { db } from '@/lib/db/client';
import { member, organization } from '@/lib/db/auth-schema';
import { normalizeRole, type OrgRole } from './roles';

/** Seeker looks for funding; funder gives it. Both are accounts here. */
export type OrgKind = 'seeker' | 'funder';

export type OrgAccess = {
  userId: string;
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: OrgRole;
  /**
   * What sort of party this account is.
   *
   * Load-bearing, not informational: a seeker has an `org_profiles` row and a
   * public site, a funder has neither and speaks for a register entry instead.
   * Code that reads a seeker's profile for a funder account throws.
   */
  kind: OrgKind;
  /** The register entry a funder speaks for. Null for seekers. */
  foundationId: string | null;
};

/** Current session, or null. Deduped per request. */
export const getSession = cache(async () => {
  return getAuth().api.getSession({ headers: await headers() });
});

/** Every organisation this user belongs to, for the switcher. */
export const getMyOrganizations = cache(async () => {
  const s = await getSession();
  if (!s?.user) return [];
  return db
    .select({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, s.user.id));
});

/**
 * Resolve access to one organisation BY SLUG, for the signed-in user.
 *
 * Returns null rather than throwing so callers choose their own failure —
 * a page redirects to sign-in, an API route answers 403. Returning null for
 * both "not signed in" and "not a member" is deliberate: telling an outsider
 * that an org exists but they lack access leaks the customer list.
 */
export async function getOrgAccess(slug: string): Promise<OrgAccess | null> {
  const s = await getSession();
  if (!s?.user) return null;

  const rows = await db
    .select({
      orgId: organization.id,
      orgSlug: organization.slug,
      orgName: organization.name,
      role: member.role,
      kind: organization.kind,
      foundationId: organization.foundationId,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, s.user.id), eq(organization.slug, slug)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    userId: s.user.id,
    orgId: row.orgId,
    orgSlug: row.orgSlug,
    orgName: row.orgName,
    role: normalizeRole(row.role),
    // Unknown values read as 'seeker': everything that existed before the
    // column did was one, and defaulting the other way would send a real
    // customer down a path that assumes it has no profile.
    kind: row.kind === 'funder' ? 'funder' : 'seeker',
    foundationId: row.foundationId ?? null,
  };
}
