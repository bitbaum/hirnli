import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { authLabelsFor, signInMethods } from '@bitbaum/accountkit/auth';
import { HirnliSignUp } from '@/components/auth/AccountScreens';
import { getSession } from '@/lib/auth/access';
import { DEFAULT_AFTER_SIGN_IN, safeNextPath } from '@/lib/auth/next-path';
import { mailConfigured } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Konto erstellen', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** Same `next` handling and the same ways in as sign-in (AccountKit's SignUpForm). */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const destination = safeNextPath((await searchParams).next);

  if (await getSession().catch(() => null)) redirect(destination);

  const labels = authLabelsFor(await getLocale());
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {labels.createAccount}
      </h1>
      <HirnliSignUp
        labels={labels}
        methods={signInMethods(process.env, mailConfigured())}
        next={destination}
        signInHref={
          destination === DEFAULT_AFTER_SIGN_IN
            ? '/anmelden'
            : `/anmelden?next=${encodeURIComponent(destination)}`
        }
      />
    </main>
  );
}
