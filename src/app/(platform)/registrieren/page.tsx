import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { getSession } from '@/lib/auth/access';
import { safeNextPath } from '@/lib/auth/next-path';

export const metadata: Metadata = { title: 'Konto erstellen' };

/** Same `next` handling as sign-in: someone can arrive here from either link. */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(next);

  if (await getSession()) redirect(destination);

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <AuthForm mode="signup" next={destination} />
    </main>
  );
}
