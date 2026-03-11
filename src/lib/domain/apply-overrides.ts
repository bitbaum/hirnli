/**
 * applyGesuchOverrides — Merge DB overrides onto composed gesuch data
 *
 * Used by the PDF route and HTML dokument page to ensure downloaded documents
 * reflect any manual edits made on the interactive gesuch page.
 */

import type { ComposedGesuch } from './gesuch-composer';
import type { GesuchOverridesData } from '@/lib/db/schema';

export function applyGesuchOverrides<T extends ComposedGesuch>(
  gesuch: T,
  overrides: GesuchOverridesData,
): T {
  if (!overrides || Object.keys(overrides).length === 0) return gesuch;

  const result = { ...gesuch };

  if (overrides.foundationBridge) {
    result.foundationBridge = overrides.foundationBridge;
  }

  if (overrides.why && result.story.why) {
    result.story = {
      ...result.story,
      why: {
        ...result.story.why,
        ...(overrides.why.headline ? { headline: overrides.why.headline } : {}),
        ...(overrides.why.hook ? { hook: overrides.why.hook } : {}),
        ...(overrides.why.problem ? { problem: overrides.why.problem } : {}),
        ...(overrides.why.solution ? { solution: overrides.why.solution } : {}),
      },
    };
  }

  if (overrides.how?.trackRecord) {
    result.story = {
      ...result.story,
      how: {
        ...result.story.how,
        track_record: {
          ...result.story.how.track_record,
          ...(overrides.how.trackRecord.headline
            ? { headline: overrides.how.trackRecord.headline }
            : {}),
          ...(overrides.how.trackRecord.text
            ? { text: overrides.how.trackRecord.text }
            : {}),
        },
      },
    };
  }

  // Anschreiben overrides (only applies to ComposedGesuchDokument)
  if (overrides.anschreiben && 'anschreiben' in result) {
    const anschreiben = (result as Record<string, unknown>).anschreiben as Record<string, string>;
    (result as Record<string, unknown>).anschreiben = {
      ...anschreiben,
      ...(overrides.anschreiben.subject ? { subject: overrides.anschreiben.subject } : {}),
      ...(overrides.anschreiben.opening ? { opening: overrides.anschreiben.opening } : {}),
      ...(overrides.anschreiben.themeAlignment ? { themeAlignment: overrides.anschreiben.themeAlignment } : {}),
      ...(overrides.anschreiben.closing ? { closing: overrides.anschreiben.closing } : {}),
    };
  }

  return result;
}

/** Load overrides from DB — returns empty object if none saved */
export async function loadGesuchOverrides(slug: string): Promise<GesuchOverridesData> {
  try {
    const { db } = await import('@/lib/db/client');
    const { gesuchOverrides } = await import('@/lib/db/schema');
    const { eq, and } = await import('drizzle-orm');

    const { ORG_PROFILE } = await import('@/lib/config/org-profile');
    const rows = await db
      .select({ overrides: gesuchOverrides.overrides })
      .from(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_PROFILE.orgId)))
      .limit(1);

    return (rows[0]?.overrides as GesuchOverridesData) ?? {};
  } catch {
    return {};
  }
}
