'use server';

/**
 * Saving one of a customer's content blocks.
 *
 * Generic over the block rather than written for `stories`, because the budget
 * would otherwise have been a second copy of this file: two places to get the
 * concurrency handling right, two places to get the path rule right, and a
 * third when the next block arrives. `lib/content/editable-blocks.ts` says
 * which blocks exist and which schema validates each.
 *
 * Four checks, in this order, each because skipping it has a specific
 * consequence:
 *
 *  1. Access is resolved from the SLUG IN THE URL, never from a session's
 *     "active organisation". Someone who belongs to two organisations has two
 *     tabs open, and an ambient active-org would write one customer's content
 *     into the other's row.
 *  2. The block must be one the registry knows — a key from a form is a key
 *     from a browser.
 *  3. Field paths are matched against the stored block, so a submission can
 *     only change leaves the form actually rendered, and a number goes back as
 *     a number.
 *  4. The result is validated against the block's own schema before it is
 *     written, because every reader of this column trusts it.
 */

import { revalidatePath } from 'next/cache';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { applyFields } from '@/lib/content/block-fields';
import { editableBlock } from '@/lib/content/editable-blocks';
import {
  createOrgContent,
  getVersionedOrgContent,
  writeOrgContent,
} from '@/lib/content/org-content';

export type SaveState = { error?: string; saved?: boolean };

export async function saveBlock(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const blockKey = String(formData.get('block') ?? '');

  const access = await getOrgAccess(slug);
  if (!access) return { error: 'Kein Zugriff auf diese Organisation.' };
  if (!roleAtLeast(access.role, 'admin')) {
    return { error: 'Nur Administratorinnen und Administratoren können Inhalte ändern.' };
  }

  const block = editableBlock(blockKey);
  if (!block) return { error: 'Unbekannter Inhaltsblock.' };

  const current = await getVersionedOrgContent(block.key, block.schema, { orgId: access.orgSlug });
  if (!current) return { error: `„${block.label}“ ist für diese Organisation nicht angelegt.` };

  const expectedVersion = Number(formData.get('version'));
  if (!Number.isInteger(expectedVersion)) return { error: 'Ungültige Formulardaten.' };

  const updates = new Map<string, string>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('f:') || typeof value !== 'string') continue;
    updates.set(key.slice(2), value);
  }
  if (updates.size === 0) return { error: 'Keine Änderungen übermittelt.' };

  const applied = applyFields(current.value, updates);
  if (!applied.ok) {
    if (applied.badNumbers?.length) {
      return { error: `Bitte eine Zahl eintragen bei: ${applied.badNumbers.join(', ')}` };
    }
    // Not a user error in any useful sense — the form only renders paths that
    // exist. Saying so plainly beats a validation message that blames the
    // person for a field they were shown.
    return { error: `Unbekannte Felder: ${applied.unknownPaths.slice(0, 3).join(', ')}` };
  }

  const parsed = block.schema.safeParse(applied.block);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: `${first?.path.join('.') ?? 'Inhalt'}: ${first?.message ?? 'ungültig'}` };
  }

  const result = await writeOrgContent(block.key, parsed.data, expectedVersion, {
    orgId: access.orgSlug,
  });
  if (!result.ok) {
    return {
      error:
        'Jemand anderes hat diesen Inhalt inzwischen gespeichert. Bitte die Seite neu laden — Ihre Änderungen wurden nicht überschrieben, aber auch nicht gespeichert.',
    };
  }

  revalidatePath(`/o/${access.orgSlug}/inhalte/${block.key}`);
  revalidatePath(`/o/${access.orgSlug}`);
  return { saved: true };
}

/**
 * Start a block a customer does not have yet, from its starter shape.
 *
 * Separate from saving because it answers a different question: not "change
 * this text" but "begin at all". A budget in particular does not exist until
 * asked for — an organisation without one composes a Gesuch with no budget
 * section, which is correct — so creating it silently would change what that
 * organisation sends to funders.
 */
export async function createBlock(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const blockKey = String(formData.get('block') ?? '');

  const access = await getOrgAccess(slug);
  if (!access) return { error: 'Kein Zugriff auf diese Organisation.' };
  if (!roleAtLeast(access.role, 'admin')) {
    return { error: 'Nur Administratorinnen und Administratoren können Inhalte anlegen.' };
  }

  const block = editableBlock(blockKey);
  if (!block) return { error: 'Unbekannter Inhaltsblock.' };

  const parsed = block.schema.safeParse(block.starter);
  if (!parsed.success) {
    // The starter is ours, so a failure here is a bug rather than bad input.
    return { error: 'Die Vorlage für diesen Block ist fehlerhaft — bitte melden.' };
  }

  const created = await createOrgContent(block.key, parsed.data, { orgId: access.orgSlug });
  if (!created) return { error: 'Dieser Block ist bereits angelegt.' };

  revalidatePath(`/o/${access.orgSlug}/inhalte`);
  return { saved: true };
}
