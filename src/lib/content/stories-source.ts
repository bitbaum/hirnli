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
import {
  anecdoteSchema,
  anschreibenTemplateSchema,
  coreFactsContentSchema,
  evidenceSchema,
  gesuchTextSchema,
  howSectionSchema,
  kurzportraitFactSchema,
  partnerHighlightSchema,
  photoSlotSchema,
  projectSchema,
  whySectionSchema,
} from '@/lib/schemas/story';
import { getOrgContent } from './org-content';
import { ownsCodeContent } from './page-content';

/**
 * The stored shape, validated at the boundary.
 *
 * This was deliberately loose about the inside of each block while nothing read
 * it — a reader that only hands a tree to a renderer does not need types. The
 * engine does: it indexes into WHY by theme, walks HOW's competency slots and
 * resolves EVIDENCE keys, and every one of those is a place where a malformed
 * row would surface as `undefined` inside a document sent to a funder rather
 * than as an error anyone could act on.
 *
 * So the shapes the code version had to satisfy are now the shapes a stored one
 * must satisfy. Validation is strict at the seam and the composers below it can
 * be as trusting as they were when the story was a module.
 */
export const storiesBlockSchema = z.object({
  CORE_FACTS: coreFactsContentSchema,
  GESUCH_TEXT: gesuchTextSchema,
  // Keyed by theme, but not every theme required: an organisation that works in
  // two fields has two WHY sections, and the composer already renders a theme
  // it has no story for as "no story", which is true. Requiring all five would
  // make a narrow organisation write four fictions to pass validation.
  WHY: z.record(z.string(), whySectionSchema),
  // Every foundation type required, in contrast — the taxonomy is the
  // platform's, not the tenant's, and a stored block missing one composes a
  // cover letter by reading `undefined.opening` the first time that type comes
  // up. Eight sentences is a fair price for a document that cannot crash.
  ANSCHREIBEN_TEMPLATES: z.object({
    A: anschreibenTemplateSchema,
    B: anschreibenTemplateSchema,
    C: anschreibenTemplateSchema,
    D: anschreibenTemplateSchema,
    network: anschreibenTemplateSchema,
  }),
  PARTNER_HIGHLIGHTS: z.array(partnerHighlightSchema),
  HOW: howSectionSchema,
  PROJECTS: z.record(z.string(), projectSchema),
  EVIDENCE: z.record(z.string(), z.record(z.string(), evidenceSchema)),
  ANECDOTES: z.array(anecdoteSchema),
  PHOTO_SLOTS: z.array(photoSlotSchema),
  KURZPORTRAIT_FACTS: z.array(kurzportraitFactSchema),
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
