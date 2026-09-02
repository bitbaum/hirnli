import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const access = await getOrgAccess(slug);
  return { title: access ? access.orgName : 'Organisation' };
}

export default async function OrgHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await getOrgAccess(slug);
  // The layout already redirected; this satisfies the type and covers the
  // theoretical case of membership being revoked between the two calls.
  if (!access) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">{access.orgName}</h1>
      <p className="max-w-prose text-text-secondary">
        Sie arbeiten als <strong className="text-text-primary">{access.orgName}</strong>. Die
        Organisation steht in der Adresse — zwei Organisationen lassen sich damit gleichzeitig in
        zwei Tabs bearbeiten, ohne dass die eine die andere überschreibt.
      </p>
      <dl className="mt-2 grid gap-px overflow-hidden rounded-lg border border-border-default bg-border-default sm:grid-cols-3">
        <div className="bg-surface-base p-4">
          <dt className="text-sm text-text-muted">Kennung</dt>
          <dd className="mt-1 font-mono text-text-primary">{access.orgSlug}</dd>
        </div>
        <div className="bg-surface-base p-4">
          <dt className="text-sm text-text-muted">Ihre Rolle</dt>
          <dd className="mt-1 text-text-primary">{access.role}</dd>
        </div>
        <div className="bg-surface-base p-4">
          <dt className="text-sm text-text-muted">Fundraising</dt>
          <dd className="mt-1 text-text-primary">wird angebunden</dd>
        </div>
      </dl>
    </div>
  );
}
