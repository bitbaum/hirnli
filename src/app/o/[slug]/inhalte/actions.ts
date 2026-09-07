'use server';

/**
 * Saving a tenant's story, from the editor.
 *
 * Three checks, in this order, and each one exists because skipping it has a
 * specific consequence:
 *
 *  1. Access is resolved from the SLUG IN THE URL, never from a session's
 *     "active organisation". A person who belongs to two organisations has two
 *     tabs open, and an ambient active-org would write one organisation's story
 *     into the other's row.
 *  2. Field paths are matched against the stored block, so a submission can
 *     only change strings the form actually showed.
 *  3. The result is validated against the block's schema before it is written,
 *     because every reader of this column trusts it.
 */

import { revalidatePath } from 'next/cache';
import { getOrgAccess } from '@/lib/auth/access';
import { roleAtLeast } from '@/lib/auth/roles';
import { applyFields } from '@/lib/content/block-fields';
import { getVersionedOrgContent, writeOrgContent } from '@/lib/content/org-content';
import { storiesBlockSchema } from '@/lib/content/stories-source';

export type SaveState = { error?: string; saved?: boolean };

export async function saveStory(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const slug = String(formData.get('orgSlug') ?? '');
  const access = await getOrgAccess(slug);
  if (!access) return { error: 'Kein Zugriff auf diese Organisation.' };
  // The policy lives in roles.ts, not in a comparison here — a hand-written
  // check is a second place the rule can be stated, and the two drift.
  if (!roleAtLeast(access.role, 'admin')) {
    return { error: 'Nur Administratorinnen und Administratoren können Inhalte ändern.' };
  }

  const current = await getVersionedOrgContent('stories', storiesBlockSchema, {
    orgId: access.orgSlug,
  });
  if (!current) return { error: 'Für diese Organisation ist noch kein Textblock angelegt.' };

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
    // Not a user error in any useful sense — the form only renders paths that
    // exist. Saying so plainly beats a validation message that blames the
    // person for a field they were shown.
    return { error: `Unbekannte Felder: ${applied.unknownPaths.slice(0, 3).join(', ')}` };
  }

  const parsed = storiesBlockSchema.safeParse(applied.block);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: `${first?.path.join('.') ?? 'Inhalt'}: ${first?.message ?? 'ungültig'}` };
  }

  const result = await writeOrgContent('stories', parsed.data, expectedVersion, {
    orgId: access.orgSlug,
  });
  if (!result.ok) {
    return {
      error:
        'Jemand anderes hat diesen Text inzwischen gespeichert. Bitte die Seite neu laden — Ihre Änderungen wurden nicht überschrieben, aber auch nicht gespeichert.',
    };
  }

  revalidatePath(`/o/${access.orgSlug}/inhalte`);
  revalidatePath(`/o/${access.orgSlug}`);
  return { saved: true };
}
