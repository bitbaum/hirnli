'use server';

/**
 * Managing who belongs to an organisation.
 *
 * Every action takes the SLUG from the form and resolves access through it.
 * A server action is an endpoint: it is reachable by anyone who can shape a
 * request, so a check in the page that renders the form protects nothing. The
 * authorisation lives in `lib/auth/membership.ts`, once, for all three.
 */

import { revalidatePath } from 'next/cache';
import { cancelOrgInvitation, inviteToOrg, removeOrgMember } from '@/lib/auth/membership';
import { ORG_ROLES, type OrgRole } from '@/lib/auth/roles';

export type MembersState = {
  error?: string;
  /** Shown so an admin can pass the link on: no mail is sent from here. */
  inviteLink?: string;
  invitedEmail?: string;
};

function isRole(v: unknown): v is OrgRole {
  return typeof v === 'string' && (ORG_ROLES as readonly string[]).includes(v);
}

export async function inviteMember(_prev: MembersState, formData: FormData): Promise<MembersState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const role = formData.get('role');

  if (!email.includes('@')) return { error: 'Bitte eine gültige E-Mail-Adresse angeben.' };
  if (!isRole(role)) return { error: 'Unbekannte Rolle.' };

  const result = await inviteToOrg(slug, email, role);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/o/${slug}/mitglieder`);
  return { inviteLink: `/einladung/${result.invitationId}`, invitedEmail: email };
}

export async function cancelInvitation(
  _prev: MembersState,
  formData: FormData,
): Promise<MembersState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const result = await cancelOrgInvitation(slug, String(formData.get('invitationId') ?? ''));
  if (!result.ok) return { error: result.error ?? 'Fehlgeschlagen.' };
  revalidatePath(`/o/${slug}/mitglieder`);
  return {};
}

export async function removeMember(_prev: MembersState, formData: FormData): Promise<MembersState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const result = await removeOrgMember(slug, String(formData.get('memberId') ?? ''));
  if (!result.ok) return { error: result.error ?? 'Fehlgeschlagen.' };
  revalidatePath(`/o/${slug}/mitglieder`);
  return {};
}
