/**
 * Who may act for this organisation.
 *
 * The account area has been unreachable since it was built: both customers have
 * zero members, and Better Auth's invitation endpoints — enabled, with their
 * table in the schema — were never called by anything. This page is the caller.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { listOrgMembers, listPendingInvitations } from '@/lib/auth/membership';
import { PLATFORM_HOST } from '@/lib/tenant/registry';
import { MembersClient } from './MembersClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mitglieder' };

export default async function MitgliederPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await getOrgAccess(slug);
  if (!access) notFound();

  const [members, invitations] = await Promise.all([
    listOrgMembers(access.orgId),
    listPendingInvitations(access.orgId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Mitglieder von {access.orgName}
        </h1>
        <p className="mt-2 text-text-secondary">
          Konten gehören Personen, nicht Organisationen. Wer hier steht, kann für {access.orgName}{' '}
          handeln — und dieselbe Person kann zu mehreren Organisationen gehören, ohne dass sich die
          eine auf die andere auswirkt.
        </p>
      </div>

      <MembersClient
        orgSlug={access.orgSlug}
        platformHost={PLATFORM_HOST}
        canInvite={roleAtLeast(access.role, 'admin')}
        isOwner={access.role === 'owner'}
        members={members}
        invitations={invitations}
      />
    </div>
  );
}
