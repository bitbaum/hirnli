'use server';

/**
 * Creating an organisation, from the form.
 *
 * A server action rather than an API route: this is one form, submitted once,
 * by a signed-in person, and the result is a redirect. A route handler would
 * add a fetch, a JSON contract and a second place to check the session.
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/access';
import { provisionOrganization } from '@/lib/tenant/provision';
import { newOrganizationSchema } from '@/lib/tenant/org-naming';

export type CreateOrgState = { error?: string };

export async function createOrganization(
  _prev: CreateOrgState,
  formData: FormData,
): Promise<CreateOrgState> {
  const session = await getSession();
  // Not a redirect to the login page: an unauthenticated POST here is not a
  // person who wandered in, and saying "sign in" would be a lie about what
  // happened.
  if (!session) return { error: 'Nicht angemeldet.' };

  const parsed = newOrganizationSchema.safeParse({
    name: formData.get('name'),
    legalForm: formData.get('legalForm'),
    founded: formData.get('founded'),
    location: formData.get('location'),
    email: formData.get('email'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Bitte alle Felder ausfüllen.' };
  }

  const result = await provisionOrganization(parsed.data, session.user.id);
  if (!result.ok) return { error: result.error };

  redirect(`/o/${result.slug}`);
}
