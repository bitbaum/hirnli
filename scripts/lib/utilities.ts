/** Shared utilities for pipeline scripts */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Research Depth — SSOT for pipeline depth classification
// ============================================================================

export type ResearchDepth = 'rapid' | 'standard' | 'deep';

export function computeResearchDepth(opts: {
  hasRealWebsite: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasDeadline: boolean;
  hasGrantRange: boolean;
}): ResearchDepth {
  const { hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange } = opts;
  const hasContactDetail = hasEmail || hasPhone;

  if (hasRealWebsite && hasContactDetail && hasDeadline && hasGrantRange) return 'deep';
  if (hasRealWebsite && hasContactDetail) return 'standard';
  return 'rapid';
}

// ============================================================================
// Slugify — Canonical URL-safe slug generation
// ============================================================================

/**
 * Generate a URL-safe slug from a foundation name.
 * Handles Swiss German umlauts (ä→ae, ö→oe, ü→ue), French accents, and ß→ss.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
