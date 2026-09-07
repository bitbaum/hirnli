/**
 * Everything a customer can write about itself, and what is still missing.
 *
 * This page is the difference between a platform and a bespoke build. Every
 * other part of the migration made the product read a tenant's content instead
 * of one organisation's; without somewhere to WRITE that content, the only way
 * a new customer became functional was somebody running SQL for them, which is
 * the same dependency in a different costume.
 *
 * The "offen" count is the marker the starter text actually contains, so it
 * says what is left rather than estimating it. A block that does not exist is
 * shown as not existing, with the consequence spelled out — a missing budget
 * means a Gesuch with no budget section, which is a fact about the document
 * that goes to a funder, not an internal detail.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { collectFields } from '@/lib/content/block-fields';
import { EDITABLE_BLOCKS } from '@/lib/content/editable-blocks';
import { getVersionedOrgContent } from '@/lib/content/org-content';
import { CreateBlockButton } from './CreateBlockButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Inhalte' };

const TODO_MARKER = '[Bitte ergänzen]';

export default async function InhaltePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await getOrgAccess(slug);
  if (!access) notFound();

  const canEdit = roleAtLeast(access.role, 'admin');

  const blocks = await Promise.all(
    EDITABLE_BLOCKS.map(async (block) => {
      const stored = await getVersionedOrgContent(block.key, block.schema, {
        orgId: access.orgSlug,
      });
      const open = stored
        ? collectFields(stored.value).filter((f) => f.value.includes(TODO_MARKER)).length
        : 0;
      return { ...block, exists: stored !== null, open };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Inhalte von {access.orgName}
        </h1>
        <p className="mt-2 text-text-secondary">
          Aus diesen Angaben wird jedes Gesuch zusammengestellt. Sie gehören Ihrer Organisation und
          werden nirgends durch die einer anderen ersetzt — was hier fehlt, fehlt im Gesuch.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {blocks.map((block) => (
          <li
            key={block.key}
            className="flex flex-wrap items-start gap-4 rounded-lg border border-border-default p-4"
          >
            <div className="min-w-64 flex-1">
              <p className="font-medium text-text-primary">{block.label}</p>
              <p className="mt-1 max-w-prose text-sm text-text-muted">{block.hint}</p>
              {block.exists ? (
                <p className="mt-2 text-sm text-text-secondary">
                  {block.open === 0
                    ? 'Vollständig ausgefüllt.'
                    : `Noch ${block.open} ${block.open === 1 ? 'Feld' : 'Felder'} offen.`}
                </p>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">Noch nicht angelegt.</p>
              )}
            </div>

            {block.exists ? (
              <Link
                href={`/o/${access.orgSlug}/inhalte/${block.key}`}
                className="min-h-11 rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary hover:no-underline"
              >
                Bearbeiten
              </Link>
            ) : (
              canEdit && <CreateBlockButton orgSlug={access.orgSlug} blockKey={block.key} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
