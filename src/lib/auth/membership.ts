/**
 * Who belongs to an organisation, and how someone joins one.
 *
 * Better Auth's organisation plugin has provided invitations since the day it
 * was enabled — `org_invitations` has been in the schema, and the API endpoints
 * have existed. Nothing ever called them. Both customers therefore have zero
 * members, so nobody can reach their account area at all, and an organisation
 * with no members has nobody who could invite the first one.
 *
 * ── TWO DELIBERATE DEPARTURES FROM THE PLUGIN'S DEFAULTS ─────────────────────
 *
 * 1. The organisation is named EXPLICITLY on every call. The plugin's endpoints
 *    fall back to `session.activeOrganizationId` when `organizationId` is
 *    absent, and `access.ts` explains at length why this product does not trust
 *    that: one cookie, many tabs, and the acting organisation changes under you.
 *    Every function here takes a slug, resolves it through `getOrgAccess`, and
 *    passes the resulting id.
 *
 * 2. No email is sent, and none is pretended. Production has no
 *    `RESEND_API_KEY`, so the plugin's `sendInvitationEmail` hook is not
 *    configured — an invitation is created and the LINK is handed back to the
 *    admin to pass on. Saying "we emailed them" when nothing was sent is the
 *    failure this avoids; the invitation is real either way.
 */

import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invitation, member, user } from '@/lib/db/auth-schema';
import { getAuth } from './server';
import { getOrgAccess } from './access';
import { isLastOwner, mayGrantRole, normalizeRole, roleAtLeast, type OrgRole } from './roles';

export interface OrgMember {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  role: OrgRole;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string | null;
  expiresAt: Date;
}

/** Everyone who belongs to this organisation. */
export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  const rows = await db
    .select({
      memberId: member.id,
      userId: member.userId,
      name: user.name,
      email: user.email,
      role: member.role,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, orgId));

  return rows.map((r) => ({ ...r, role: normalizeRole(r.role) }));
}

/** Invitations that have neither been accepted nor cancelled. */
export async function listPendingInvitations(orgId: string): Promise<PendingInvitation[]> {
  const rows = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    })
    .from(invitation)
    .where(and(eq(invitation.organizationId, orgId), eq(invitation.status, 'pending')));

  return rows.map(({ status: _status, ...rest }) => rest);
}

export type InviteResult = { ok: true; invitationId: string } | { ok: false; error: string };

/**
 * Invite someone to an organisation named by SLUG.
 *
 * The caller's right to do so is checked here rather than trusted from the
 * page: a server action is an endpoint, reachable by anyone who can shape a
 * request, and a check in the component that renders the form protects nothing.
 */
export async function inviteToOrg(
  slug: string,
  email: string,
  role: OrgRole,
): Promise<InviteResult> {
  const access = await getOrgAccess(slug);
  if (!access) return { ok: false, error: 'Kein Zugriff auf diese Organisation.' };
  if (!roleAtLeast(access.role, 'admin')) {
    return { ok: false, error: 'Nur Administratorinnen und Administratoren können einladen.' };
  }
  if (!mayGrantRole(access.role, role)) {
    return { ok: false, error: 'Nur Eigentümerinnen und Eigentümer können Eigentum vergeben.' };
  }

  try {
    const result = await getAuth().api.createInvitation({
      body: { email, role, organizationId: access.orgId },
      headers: await headers(),
    });
    return { ok: true, invitationId: result.id };
  } catch (error) {
    return { ok: false, error: messageFor(error, 'Einladung konnte nicht erstellt werden.') };
  }
}

/** Withdraw an invitation that has not been accepted. */
export async function cancelOrgInvitation(
  slug: string,
  invitationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const access = await getOrgAccess(slug);
  if (!access || !roleAtLeast(access.role, 'admin')) {
    return { ok: false, error: 'Kein Zugriff.' };
  }

  // Scoped to THIS organisation before touching it: an invitation id is opaque,
  // and without this an admin of one customer could cancel another customer's
  // invitations by id alone.
  const rows = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(and(eq(invitation.id, invitationId), eq(invitation.organizationId, access.orgId)))
    .limit(1);
  if (!rows[0]) return { ok: false, error: 'Einladung nicht gefunden.' };

  try {
    await getAuth().api.cancelInvitation({
      body: { invitationId },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: messageFor(error, 'Einladung konnte nicht zurückgezogen werden.') };
  }
}

/** Remove someone from an organisation. */
export async function removeOrgMember(
  slug: string,
  memberId: string,
): Promise<{ ok: boolean; error?: string }> {
  const access = await getOrgAccess(slug);
  if (!access || !roleAtLeast(access.role, 'admin')) {
    return { ok: false, error: 'Kein Zugriff.' };
  }

  const members = await listOrgMembers(access.orgId);
  const target = members.find((m) => m.memberId === memberId);
  if (!target) return { ok: false, error: 'Mitglied nicht gefunden.' };

  if (
    isLastOwner(
      members.map((m) => m.role),
      target.role,
    )
  ) {
    return {
      ok: false,
      error:
        'Das ist die einzige Eigentümerin bzw. der einzige Eigentümer — erst eine weitere Person ernennen.',
    };
  }

  try {
    await getAuth().api.removeMember({
      body: { memberIdOrEmail: memberId, organizationId: access.orgId },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: messageFor(error, 'Mitglied konnte nicht entfernt werden.') };
  }
}

function messageFor(error: unknown, fallback: string): string {
  // Better Auth throws APIError with a `body.message`; anything else is ours.
  const body = (error as { body?: { message?: string } } | null)?.body;
  return body?.message ?? fallback;
}
