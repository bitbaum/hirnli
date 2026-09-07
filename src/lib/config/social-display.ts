/**
 * One organisation's social figures, as they are shown on its own pages.
 *
 * These lived in `config/stories.ts` beside the Gesuch narrative. That module
 * has gone: the story it held now lives in `org_content['stories']`, per
 * tenant, and keeping four display strings alive was the only thing preventing
 * its deletion.
 *
 * They stay in code because the pages that read them — `/wirkung` and the
 * fundraising dashboard — are still code-owned and gated by
 * `ownsCodeContent`. A tenant that does not own that content never reaches
 * these values. When those pages move to `org_content`, this file goes with
 * them rather than being migrated separately.
 *
 * The metric IDs in a stored `CORE_FACTS.metrics` are references; nothing
 * resolves them at runtime, so these are the display values.
 */

export const SOCIAL_DISPLAY = {
  practitioners_total: '100+',
  success_rate: '~40%',
  success_rate_numeric: 40,
  capacity: '8-10',
} as const;
