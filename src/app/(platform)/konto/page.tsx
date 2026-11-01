import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getLocale, getTranslations } from 'next-intl/server';
import { authLabelsFor, isDeliverable, signInMethods } from '@bitbaum/accountkit/auth';
import { HirnliAccount } from '@/components/auth/AccountScreens';
import { getSession } from '@/lib/auth/access';
import { mailConfigured } from '@/lib/auth/server';
import { db } from '@/lib/db/client';
import { account } from '@/lib/db/auth-schema';

export const metadata: Metadata = { title: 'Konto', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** One's own account: profile, ways in (passkeys, second factor, linked sign-ins) and the way out. */
export default async function AccountPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect('/anmelden?next=%2Fkonto');
  const { user } = session;
  const linked = await db
    .select({ provider: account.providerId })
    .from(account)
    .where(eq(account.userId, user.id));
  const labels = authLabelsFor(await getLocale());
  const t = await getTranslations('common');
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {labels.account.profile}
      </h1>
      <HirnliAccount
        labels={labels}
        methods={signInMethods(process.env, mailConfigured())}
        user={{
          name: user.name ?? '',
          email: isDeliverable(user.email) ? user.email : null,
          emailVerified: Boolean(user.emailVerified),
          role: (user as { role?: string }).role ?? 'customer',
          twoFactorEnabled: Boolean((user as { twoFactorEnabled?: boolean }).twoFactorEnabled),
        }}
        linked={linked.map((row) => row.provider)}
      />
    </div>
  );
}
