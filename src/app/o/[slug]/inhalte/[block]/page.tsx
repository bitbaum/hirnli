/**
 * Where a customer writes one of its content blocks.
 *
 * Generic over the block: the registry decides which exist, and adding one
 * there makes it editable here. The story and the budget differ in what they
 * hold, not in how they are edited.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { collectFields } from '@/lib/content/block-fields';
import { editableBlock } from '@/lib/content/editable-blocks';
import { getVersionedOrgContent } from '@/lib/content/org-content';
import { BlockEditorForm } from './BlockEditorForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ block: string }>;
}): Promise<Metadata> {
  const { block } = await params;
  return { title: editableBlock(block)?.label ?? 'Inhalte' };
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string; block: string }>;
}) {
  const { slug, block: blockKey } = await params;

  const definition = editableBlock(blockKey);
  if (!definition) notFound();

  // The layout above already redirected anyone without access; this is the
  // narrower question of whether THIS person may edit.
  const access = await getOrgAccess(slug);
  if (!access) notFound();

  const stored = await getVersionedOrgContent(definition.key, definition.schema, {
    orgId: access.orgSlug,
  });

  const back = (
    <Link href={`/o/${access.orgSlug}/inhalte`} className="text-sm text-text-primary underline">
      ← Alle Inhalte
    </Link>
  );

  if (!stored) {
    return (
      <div className="flex max-w-prose flex-col gap-4">
        {back}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{definition.label}</h1>
        <p className="text-text-secondary">
          Für {access.orgName} ist dieser Block noch nicht angelegt. Sie können ihn auf der
          Übersicht starten.
        </p>
      </div>
    );
  }

  if (!roleAtLeast(access.role, 'admin')) {
    return (
      <div className="flex max-w-prose flex-col gap-4">
        {back}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{definition.label}</h1>
        <p className="text-text-secondary">
          Ihre Rolle in {access.orgName} erlaubt das Lesen, aber nicht das Ändern dieser Inhalte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-prose flex-col gap-2">
        {back}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {definition.label} von {access.orgName}
        </h1>
        <p className="text-text-secondary">{definition.hint}</p>
      </div>

      <BlockEditorForm
        orgSlug={access.orgSlug}
        blockKey={definition.key}
        version={stored.version}
        fields={collectFields(stored.value)}
      />
    </div>
  );
}
