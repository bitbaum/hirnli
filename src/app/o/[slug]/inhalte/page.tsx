/**
 * Where a customer writes the story their Gesuche are composed from.
 *
 * This page is the difference between a platform and a bespoke build. Every
 * other part of the migration made the product read a tenant's content instead
 * of one organisation's; without somewhere to WRITE that content, the only way
 * a new customer became functional was somebody running SQL for them, which is
 * the same dependency in a different costume.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { collectFields } from '@/lib/content/block-fields';
import { getVersionedOrgContent } from '@/lib/content/org-content';
import { storiesBlockSchema } from '@/lib/content/stories-source';
import { StoryEditorForm } from './StoryEditorForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Inhalte' };

export default async function InhaltePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The layout above already redirected anyone without access; this is the
  // narrower question of whether THIS person may edit.
  const access = await getOrgAccess(slug);
  if (!access) notFound();

  const stored = await getVersionedOrgContent('stories', storiesBlockSchema, {
    orgId: access.orgSlug,
  });

  if (!stored) {
    return (
      <div className="max-w-prose">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Inhalte</h1>
        <p className="mt-4 text-text-secondary">
          Für {access.orgName} ist noch kein Textblock angelegt. Organisationen, die über die
          Registrierung erstellt wurden, bekommen eine Vorlage mitgeliefert; ältere Konten nicht.
          Melden Sie sich bei uns, dann legen wir die Vorlage an.
        </p>
      </div>
    );
  }

  if (!roleAtLeast(access.role, 'admin')) {
    return (
      <div className="max-w-prose">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Inhalte</h1>
        <p className="mt-4 text-text-secondary">
          Ihre Rolle in {access.orgName} erlaubt das Lesen, aber nicht das Ändern dieser Texte.
        </p>
      </div>
    );
  }

  const fields = collectFields(stored.value);

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Inhalte von {access.orgName}
        </h1>
        <p className="mt-2 text-text-secondary">
          Aus diesen Texten wird jedes Gesuch zusammengestellt. Sie gehören Ihrer Organisation und
          werden nirgends durch die Texte einer anderen ersetzt — was hier leer bleibt, bleibt im
          Gesuch leer.
        </p>
      </div>

      <StoryEditorForm orgSlug={access.orgSlug} version={stored.version} fields={fields} />
    </div>
  );
}
