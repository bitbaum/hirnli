import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { computeReadinessScore, computePriorityScore } from './foundation-scores';

// -- Quality Tiers (SSOT) -----------------------------------------------------
// 5-tier system computed from readiness score (0-100 → tier label).
// Readiness measures "can we produce a great, tailored document?"
// All weights and thresholds live in config (lib/config/fit-scoring.ts).

/** Ordered tier ranks for comparisons */
const TIER_RANK: Record<QualityTier, number> = {
  verzeichnet: 1,
  erfasst: 2,
  profiliert: 3,
  recherchiert: 4,
  anwendungsbereit: 5,
};

/** All tiers in ascending order */
export const QUALITY_TIERS: QualityTier[] = [
  'verzeichnet',
  'erfasst',
  'profiliert',
  'recherchiert',
  'anwendungsbereit',
];

/** Check if a tier meets a minimum threshold */
export function tierAtLeast(tier: QualityTier, minimum: QualityTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

/** Determine the quality tier for a foundation from its readiness score */
export function getQualityTier(f: Foundation): QualityTier {
  return computeReadinessScore(f).tier;
}

// -- Tier display config -------------------------------------------------------

export const TIER_LABELS: Record<QualityTier, string> = {
  anwendungsbereit: 'Anwendungsbereit',
  recherchiert: 'Recherchiert',
  profiliert: 'Profiliert',
  erfasst: 'Erfasst',
  verzeichnet: 'Verzeichnet',
};

export const TIER_COLORS: Record<QualityTier, string> = {
  anwendungsbereit: 'bg-success-bg text-success',
  recherchiert: 'bg-blue-100 text-blue-800',
  profiliert: 'bg-amber-100 text-amber-700',
  erfasst: 'bg-grey-light text-text-muted',
  verzeichnet: 'bg-bg-light text-text-muted',
};

export const TIER_DESCRIPTIONS: Record<QualityTier, string> = {
  anwendungsbereit: 'Umfassende Daten für massgeschneidertes Gesuch vorhanden.',
  recherchiert: 'Stiftungszweck, Kontakt und Themenzuordnung vorhanden.',
  profiliert: 'Grundlegende Informationen und einige Kontaktdaten vorhanden.',
  erfasst: 'Minimale Daten — weitere Recherche nötig.',
  verzeichnet: 'Nur Name im System. Keine weiteren Daten.',
};

// -- Tier counts ---------------------------------------------------------------

/** Compute tier counts from a list of foundations */
export function computeTierCounts(foundations: Foundation[]): Record<QualityTier, number> {
  const counts: Record<QualityTier, number> = {
    verzeichnet: 0,
    erfasst: 0,
    profiliert: 0,
    recherchiert: 0,
    anwendungsbereit: 0,
  };
  for (const f of foundations) {
    counts[getQualityTier(f)]++;
  }
  return counts;
}

/** Count foundations at or above a minimum tier */
export function countAtLeast(foundations: Foundation[], minimum: QualityTier): number {
  return foundations.filter((f) => tierAtLeast(getQualityTier(f), minimum)).length;
}

// -- Promotion steps -----------------------------------------------------------

export interface TierPromotion {
  currentTier: QualityTier;
  nextTier: QualityTier | null;
  /** Top improvements from readiness score — sorted by impact */
  improvements: { label: string; points: number; dimension: string }[];
}

/** Returns what fields are missing to reach the next tier */
export function getTierPromotionSteps(f: Foundation): TierPromotion {
  const result = computeReadinessScore(f);
  const currentTier = result.tier;

  // Find next tier
  const currentRank = TIER_RANK[currentTier];
  const nextTier = QUALITY_TIERS.find(t => TIER_RANK[t] === currentRank + 1) ?? null;

  return {
    currentTier,
    nextTier,
    improvements: result.topImprovements,
  };
}

// -- Foundation lookup ---------------------------------------------------------

/** Look up a foundation by its URL slug */
export function getFoundationBySlug(slug: string): Foundation | undefined {
  return STIFTUNGEN_DATA.find((f) => f.slug === slug);
}

// -- Static param generation ---------------------------------------------------

/**
 * Generate static params for foundation detail pages.
 * Pre-generates profiliert+ tiers.
 * Lower tiers (verzeichnet, erfasst) are rendered dynamically (dynamicParams = true).
 */
export function generateFoundationParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter((f) => tierAtLeast(getQualityTier(f), 'profiliert'))
    .map((f) => ({ slug: f.slug }));
}

/**
 * Check if a foundation qualifies for a gesuch page.
 * SSOT for the gesuch gate — used by both generateGesuchParams() and FoundationSidebar.
 * Requires tier >= recherchiert AND computed priority P1-P3.
 * P3 ("watch for timing") still gets a Gesuch for when the timing is right.
 * P4 ("maintain relationship") does not.
 */
export function hasGesuchPage(f: Foundation): boolean {
  if (!tierAtLeast(getQualityTier(f), 'recherchiert')) return false;
  const priority = computePriorityScore(f);
  if (priority.level > 3) return false;
  return true;
}

/** Generate static params for gesuch-ready foundations only */
export function generateGesuchParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter(hasGesuchPage)
    .map((f) => ({ slug: f.slug }));
}
