/**
 * Reading and claiming a foundation as a party.
 *
 * Two overlays now sit on the shared register, and keeping them straight is the
 * whole design:
 *
 *   fundraising_foundation_assessments   what ONE APPLICANT thinks of this
 *                                        foundation. Private to that applicant.
 *   funder_profiles                      what the FOUNDATION says about itself.
 *                                        Public, and authoritative where it
 *                                        disagrees with the register.
 *
 * The register itself stays what it always was: the platform's research, shared
 * by everyone, never owned by any one party.
 */

import { cache } from 'react';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { funderProfiles, foundations } from '@/lib/db/schema';
import { member, organization } from '@/lib/db/auth-schema';
import { parseFunderProfile, type FunderProfile } from './profile';

/** A foundation's own profile, or null if it has never spoken for itself. */
export const getFunderProfile = cache(
  async (foundationId: string): Promise<FunderProfile | null> => {
    const rows = await db
      .select()
      .from(funderProfiles)
      .where(eq(funderProfiles.foundationId, foundationId))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    try {
      return parseFunderProfile(row.profile, row.confirmedAt, row.updatedAt);
    } catch {
      // A malformed row must not take down a page that is mostly register
      // data. Fall back to "the foundation has not spoken", which is the
      // honest reading of a profile nobody can parse.
      return null;
    }
  },
);

/**
 * Which of these foundations have confirmed their own profile?
 *
 * For lists: a foundation that maintains its entry deserves to be shown as
 * such, and an applicant deserves to know which entries are second-hand.
 */
export async function confirmedFunderIds(): Promise<Set<string>> {
  const rows = await db
    .select({ id: funderProfiles.foundationId })
    .from(funderProfiles)
    .where(isNotNull(funderProfiles.confirmedAt));
  return new Set(rows.map((r) => r.id));
}

/** The account that speaks for this foundation, if one has claimed it. */
export async function funderAccountFor(foundationId: string): Promise<string | null> {
  const rows = await db
    .select({ id: organization.id })
    .from(organization)
    .where(and(eq(organization.foundationId, foundationId), eq(organization.kind, 'funder')))
    .limit(1);
  return rows[0]?.id ?? null;
}

export type ClaimResult = { ok: true; orgId: string } | { ok: false; error: string };

/**
 * Give a person an account that speaks for a foundation.
 *
 * The seeker side of this is `provisionOrganization`; this is its counterpart,
 * and it differs in one important way: the party already exists. A foundation
 * is in the register whether or not anybody signs in for it, so this does not
 * create the party — it attaches an account to one, and refuses if another
 * account already speaks for it.
 *
 * No host is allocated. A funder does not get a public showcase site; it
 * manages its entry through the platform surface, so there is nothing to route.
 */
export async function claimFoundation(foundationId: string, userId: string): Promise<ClaimResult> {
  const [entry] = await db
    .select({ id: foundations.id, name: foundations.name })
    .from(foundations)
    .where(eq(foundations.id, foundationId))
    .limit(1);
  if (!entry) return { ok: false, error: 'Diese Stiftung ist nicht im Register.' };

  if (await funderAccountFor(foundationId)) {
    // Loud rather than silently adding a second owner: a Gesuch is addressed to
    // one account, and two accounts claiming one foundation is a dispute the
    // platform must not resolve by itself.
    return { ok: false, error: 'Für diese Stiftung besteht bereits ein Zugang.' };
  }

  const orgId = `fnd_${foundationId}`.slice(0, 64);

  await db.transaction(async (tx) => {
    await tx.insert(organization).values({
      id: orgId,
      name: entry.name,
      // Namespaced so a foundation slug can never collide with a seeker's.
      slug: `stiftung-${foundationId}`.slice(0, 64),
      kind: 'funder',
      foundationId,
      createdAt: new Date(),
    });

    await tx.insert(member).values({
      id: `mem_${orgId}_${userId}`.slice(0, 64),
      organizationId: orgId,
      userId,
      role: 'owner',
      createdAt: new Date(),
    });
  });

  return { ok: true, orgId };
}
