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

/**
 * Check if a foundation qualifies for a gesuch page.
 * SSOT for the gesuch gate — used by both generateGesuchParams() and FoundationSidebar.
 */
export function hasGesuchPage(f: Foundation): boolean {
  if (f.needsResearch) return false;
  if (f.priority && f.priority > 2) return false;
  if (f.researchDepth === 'rapid') return false;
  return true;
}

/** Generate static params for gesuch-ready foundations only */
export function generateGesuchParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter(hasGesuchPage)
    .map((f) => ({ slug: f.slug }));
}
