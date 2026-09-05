/**
 * Where signing in lands you.
 *
 * One organisation is the common case, so skip the interstitial and go
 * straight in. Several, and you pick — the URL then carries the choice, which
 * is what makes two organisations safe to work on side by side.
 *
 * No organisations means a real person with no customer yet: say so plainly,
 * and give them the way to create one.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyOrganizations, getSession } from '@/lib/auth/access';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Organisation wählen' };

export default async function StartPage() {
  const session = await getSession();
  if (!session) redirect('/anmelden');

  const orgs = await getMyOrganizations();

  if (orgs.length === 1) redirect(`/o/${orgs[0].slug}`);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Organisation wählen</h1>

      {orgs.length === 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {/* This used to be the end of the road: "ask whoever invited you",
              with nobody able to be that inviter because nothing created
              organisations. */}
          <p className="text-text-secondary">
            Dieses Konto gehört noch zu keiner Organisation. Erstellen Sie eine — oder bitten Sie,
            falls Sie eine Einladung erwarten, die einladende Person, sie an {session.user.email} zu
            senden.
          </p>
          <Button href="/organisation-erstellen">Organisation erstellen</Button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {orgs.map((o) => (
            <li key={o.id}>
              <Link
                href={`/o/${o.slug}`}
                className="flex min-h-11 items-center justify-between rounded-lg border border-border-default px-4 py-3 hover:bg-surface-raised hover:no-underline"
              >
                <span className="font-medium text-text-primary">{o.name}</span>
                <span className="text-sm text-text-muted">{o.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
