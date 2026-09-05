import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';
import { db } from '@/lib/db/client';
import { orgDomains } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/Button';
import { hasStories } from '@/lib/content/stories-source';
import { getTenantById } from '@/lib/tenant/resolve';

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

  // Where this organisation's own site lives. A tenant is not usable until it
  // has a host, so showing the link is also the check that provisioning
  // completed — an org with no domain row is a half-made account.
  const [domain] = await db
    .select({ host: orgDomains.host })
    .from(orgDomains)
    .where(eq(orgDomains.orgId, access.orgSlug))
    .limit(1);

  const tenant = await getTenantById(access.orgSlug);
  const storyWritten = await hasStories(tenant);

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
          <dt className="text-sm text-text-muted">Adresse</dt>
          <dd className="mt-1 font-mono text-sm text-text-primary">
            {domain?.host ?? 'noch keine'}
          </dd>
        </div>
      </dl>

      {/* The one thing that decides whether the product works for them: a
          Gesuch is composed from the story block, and a tenant without one
          gets nothing rather than another organisation's. */}
      {!storyWritten && (
        <p className="max-w-prose rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
          Für Gesuche fehlt noch Ihre Erzählung — worum es {access.orgName} geht, welches Problem
          Sie adressieren und was Sie dagegen tun. Bis dahin bleiben Gesuch-Vorlagen leer; sie
          werden bewusst nicht mit den Texten einer anderen Organisation gefüllt.
        </p>
      )}

      {domain?.host && (
        <div className="mt-2 flex flex-wrap gap-3">
          <Button href={`https://${domain.host}`} target="_blank">
            Zur eigenen Seite →
          </Button>
          <Button
            href={`https://${domain.host}/fundraising/stiftungen`}
            variant="secondary"
            target="_blank"
          >
            Stiftungen durchsuchen
          </Button>
        </div>
      )}
    </div>
  );
}
