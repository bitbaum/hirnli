'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth/server';
import { getSession } from '@/lib/auth/access';

export type AcceptState = { error?: string };

/**
 * Accept an invitation.
 *
 * The authorisation is Better Auth's and is deliberately not duplicated here:
 * it requires the invitation to be pending and unexpired, and the signed-in
 * address to equal the invited one, case-insensitively. Re-implementing that
 * check would create a second rule to drift from the first.
 */
export async function acceptInvitation(
  _prev: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const invitationId = String(formData.get('invitationId') ?? '');
  const session = await getSession();
  if (!session) return { error: 'Bitte zuerst anmelden.' };

  let slug: string | null = null;
  try {
    const result = await getAuth().api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    });
    slug = result?.member?.organizationId ?? null;
  } catch (error) {
    const body = (error as { body?: { message?: string } } | null)?.body;
    return {
      error:
        body?.message ??
        'Diese Einladung lässt sich nicht annehmen. Möglicherweise ist sie abgelaufen, zurückgezogen, oder sie war an eine andere Adresse gerichtet.',
    };
  }

  // The plugin answers with the organisation's ID; /start resolves the slug and
  // sends a person with exactly one organisation straight into it.
  redirect(slug ? '/start' : '/start');
}
