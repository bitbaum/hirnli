import type { Foundation } from '@/lib/schemas/foundation';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';

/** Look up a foundation by its URL slug */
export function getFoundationBySlug(slug: string): Foundation | undefined {
  return STIFTUNGEN_DATA.find((f) => f.slug === slug);
}

/** Generate static params for all foundation slugs (used by Next.js generateStaticParams) */
export function generateFoundationParams(): { slug: string }[] {
  return STIFTUNGEN_DATA.map((f) => ({ slug: f.slug }));
}

/** Generate static params for gesuch-ready foundations only (priority 1-2) */
export function generateGesuchParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter((f) => !f.needsResearch && (!f.priority || f.priority <= 2))
    .map((f) => ({ slug: f.slug }));
}
