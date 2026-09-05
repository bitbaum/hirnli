/**
 * Where a tenant's narrative comes from.
 *
 * This is the seam the whole content migration turns on. `stories` is the block
 * every Gesuch is written from — the WHY per theme, the standard paragraphs,
 * the cover-letter templates, the partner highlights. It lived in
 * `src/lib/config/stories.ts`, one organisation's ~880 lines, and
 * `resolveStories(tenant)` filled the reader's NAME into it. So a second
 * customer generating a grant application got the first customer's story with
 * their own name on it — the single most consequential leak in the product,
 * because that document goes to a funder.
 *
 * It now comes from `org_content['stories']`, per tenant, and a tenant without
 * a row gets NOTHING rather than somebody else's. That is what makes onboarding
 * a real thing: a new customer writes their own story and the product composes
 * from it, exactly as it does for the first.
 *
 * The code block remains readable by the organisation it was written about,
 * until its row is the only copy. `CODE_CONTENT_OWNER` gates that, and the
 * ratchet in `no-tenant-traces.test.ts` counts the day it goes.
 */

import { z } from 'zod';
import type { Tenant } from '@/lib/tenant/profile';
import { getOrgContent } from './org-content';
import { ownsCodeContent } from './page-content';

/**
 * The stored shape, validated at the boundary.
 *
 * Deliberately loose about the INSIDE of each block and strict about the five
 * keys: the prose structure is edited by people and will grow sections, but a
 * row missing `GESUCH_TEXT` would compose a Gesuch with a hole in it, which is
 * worth failing on rather than rendering.
 */
export const storiesBlockSchema = z.object({
  CORE_FACTS: z.record(z.string(), z.unknown()),
  GESUCH_TEXT: z.record(z.string(), z.unknown()),
  WHY: z.record(z.string(), z.unknown()),
  ANSCHREIBEN_TEMPLATES: z.record(z.string(), z.unknown()),
  PARTNER_HIGHLIGHTS: z.array(z.unknown()),
  // The composer reads these too, and they were NOT in the stored block. A
  // tenant would have read its own why-sections from the database and then
  // taken this organisation's competencies, projects and citations from code,
  // inside the same document — a partially migrated story, which is worse than
  // an unmigrated one because it looks finished.
  HOW: z.record(z.string(), z.unknown()),
  PROJECTS: z.record(z.string(), z.unknown()),
  EVIDENCE: z.record(z.string(), z.unknown()),
  ANECDOTES: z.array(z.unknown()),
  PHOTO_SLOTS: z.array(z.unknown()),
});

export type StoriesBlock = z.infer<typeof storiesBlockSchema>;

/**
 * This tenant's raw story block — templates still unfilled — or null.
 *
 * Null is a normal, renderable state meaning "this organisation has not written
 * its story yet", and every caller must handle it by showing that rather than
 * substituting. Compare `parseBranding`, which falls back to no logo instead of
 * another tenant's mark.
 */
export async function getStoriesBlock(tenant: Tenant): Promise<StoriesBlock | null> {
  const stored = await getOrgContent('stories', storiesBlockSchema, { orgId: tenant.orgId });
  if (stored) return stored;

  // Transitional: the organisation the code block was written about may still
  // read it. Everyone else gets null — never this organisation's story.
  if (await ownsCodeContent('fundraising', tenant.orgId)) {
    const { STORIES_CONTENT } = await import('@/lib/config/stories');
    return storiesBlockSchema.parse(STORIES_CONTENT);
  }
  return null;
}

/** Has this tenant written the story a Gesuch is composed from? */
export async function hasStories(tenant: Tenant): Promise<boolean> {
  return (await getStoriesBlock(tenant)) !== null;
}
