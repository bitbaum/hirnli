import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { authLabelsFor, signInMethods } from '@bitbaum/accountkit/auth';
import { HirnliSignIn } from '@/components/auth/AccountScreens';
import { getSession } from '@/lib/auth/access';
import { DEFAULT_AFTER_SIGN_IN, safeNextPath } from '@/lib/auth/next-path';
import { mailConfigured } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Anmelden', robots: { index: false } };
export const dynamic = 'force-dynamic';

const withNext = (path: string, destination: string) =>
  destination === DEFAULT_AFTER_SIGN_IN ? path : `${path}?next=${encodeURIComponent(destination)}`;

/**
 * Every way in, on one screen (AccountKit's SignInForm): passkey, email and
 * password, a sign-in link by email, "Weiter mit OrangeCat"
 * (ORANGECAT_OAUTH_*), the shared sign-in (SIGNIN_*), and password recovery.
 * Options whose env is missing are hidden, never offered and broken.
 *
 * `next` is honoured here and in the form: the guards that send people here
 * build a `?next=`, and it used to be dropped on the floor.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; token?: string; method?: string }>;
}) {
  const query = await searchParams;
  const destination = safeNextPath(query.next);
  // A password-reset link lands here with its token; the form reads it.
  const recovering =
    Boolean(query.token) || (query.error === 'INVALID_TOKEN' && query.method !== 'magic-link');

  // Already signed in: go where they were headed, not to the front door.
  if (!recovering && (await getSession().catch(() => null))) redirect(destination);

  const labels = authLabelsFor(await getLocale());
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {recovering ? (labels.recovery?.reset ?? labels.signIn) : labels.signIn}
      </h1>
      <HirnliSignIn
        labels={labels}
        methods={signInMethods(process.env, mailConfigured())}
        next={destination}
        signUpHref={withNext('/registrieren', destination)}
        initialError={Boolean(query.error)}
      />
    </main>
  );
}
