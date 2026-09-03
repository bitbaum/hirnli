/**
 * Everything under /o/<slug>/ acts as ONE organisation, named in the URL.
 *
 * The guard runs here rather than per page, so a new page added below is
 * protected by existing, not by remembering. `getOrgAccess` returns null both
 * for "not signed in" and "not a member" — we redirect rather than 404 for the
 * first, and treat the second the same way, because confirming that an
 * organisation exists would leak the customer list to anyone guessing slugs.
 */

import { redirect } from 'next/navigation';
import { getOrgAccess, getMyOrganizations, getSession } from '@/lib/auth/access';
import { OrgSwitcher } from '@/components/org/OrgSwitcher';

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getSession();
  if (!session) redirect(`/anmelden?next=${encodeURIComponent(`/o/${slug}`)}`);

  const access = await getOrgAccess(slug);
  if (!access) redirect('/start');

  const orgs = await getMyOrganizations();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-default bg-surface-base">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <OrgSwitcher
            current={{ slug: access.orgSlug, name: access.orgName }}
            organizations={orgs}
          />
          <span className="text-sm text-text-muted">{session.user.email}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
