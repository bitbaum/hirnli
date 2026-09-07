import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { getSession } from '@/lib/auth/access';
import { safeNextPath } from '@/lib/auth/next-path';

export const metadata: Metadata = { title: 'Anmelden' };

/**
 * `next` is honoured here and in the form.
 *
 * It was honoured in neither: the guards that send people here have always
 * built a `?next=`, and this page always redirected to /start regardless — so
 * following "Geschichte erfassen" while signed out landed you on an overview
 * with no indication of what you had been trying to do.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(next);

  // Already signed in: go where they were headed, not to the front door.
  if (await getSession()) redirect(destination);

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <AuthForm mode="signin" next={destination} />
    </main>
  );
}
