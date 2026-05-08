// Foundation Helpers — Tier system, research status, fit display, access gates
// See CLAUDE.md § Scoring Model for the 3-layer architecture.
// All computed from scoring engines — no stored booleans.

import { QualityTier } from '@/lib/schemas/foundation';
import type { Foundation } from '@/lib/schemas/foundation';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { computeReadinessScore } from './foundation-scores';
import { fitScoreToDisplay } from './fit-scoring';
import { QUALITY_THRESHOLDS } from '@/lib/config/fit-scoring';
import { isRegistryUrl } from '@/lib/config/registry-domains';

/** All tiers in ascending order — derived from schema so adding a tier updates all maps */
export const QUALITY_TIERS: QualityTier[] = [...QualityTier.options];

/** Ordered tier ranks for comparisons — derived from schema order */
const TIER_RANK = Object.fromEntries(
  QualityTier.options.map((tier, i) => [tier, i + 1])
) as Record<QualityTier, number>;

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
  recherchiert: 'bg-primary/10 text-primary-text',
  profiliert: 'bg-amber-bg text-amber-text',
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

// -- Research status -----------------------------------------------------------

/**
 * Whether a foundation has been sufficiently researched.
 * Derived from readiness tier: profiliert or above means researched.
 * (The deprecated `needsResearch` boolean was removed from the schema —
 * this is now the canonical signal.)
 */
export function isResearched(f: Foundation): boolean {
  return tierAtLeast(getQualityTier(f), 'profiliert');
}

/** Returns true when the foundation is in the actionable priority range (P1-P3). */
export function isActionablePriority(f: Foundation): boolean {
  return f.priority >= 1 && f.priority <= 3;
}

// -- Fit display level --------------------------------------------------------

/**
 * Map fitScore (0-10) → display level (0-3) for stars and labels.
 * 7-10 → 3 (★★★), 4-6 → 2 (★★☆), 1-3 → 1 (★☆☆), 0 → 0 (unassessed).
 * Foundations below profiliert tier are gated to 0 (insufficient data for display).
 */
export function getFitLevel(f: Foundation): 0 | 1 | 2 | 3 {
  const isGated = !tierAtLeast(getQualityTier(f), 'profiliert');
  return fitScoreToDisplay(f.fitScore, isGated);
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
 * Requires tier >= recherchiert AND computed priority P1-P3 AND at least one theme.
 * P3 ("watch for timing") still gets a Gesuch for when the timing is right.
 * P4 ("maintain relationship") does not.
 * Themes are required because composeGesuch() depends on theme→story mapping
 * to assemble the document; without themes the page renders an error state.
 */
export function hasGesuchPage(f: Foundation): boolean {
  if (!tierAtLeast(getQualityTier(f), 'recherchiert')) return false;
  if (!isActionablePriority(f)) return false;
  // No themes = composeGesuch returns ready=false; skip Gesuch generation
  if (!f.themes || f.themes.length === 0) return false;
  return true;
}

/** Generate static params for gesuch-ready foundations only */
export function generateGesuchParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter(hasGesuchPage)
    .map((f) => ({ slug: f.slug }));
}

/**
 * Returns true if this foundation has structural data gaps that reduce Gesuch quality.
 * Mirrors the structural checks in scripts/gesuch-audit.ts.
 * Use with hasGesuchPage() to find actionable gaps: hasGesuchPage(f) && hasGesuchDataGaps(f).
 */
export function hasGesuchDataGaps(f: Foundation): boolean {
  const lacksContact = !f.contact?.email && !f.contact?.phone;
  const thinResearchNotes = !f.researchNotes || f.researchNotes.length < QUALITY_THRESHOLDS.researchNotesMinChars;
  const thinPurposeSummary = !f.purposeSummary || f.purposeSummary.length < QUALITY_THRESHOLDS.purposeSummaryMinChars;
  const lacksWebsite = !f.websiteUrl || isRegistryUrl(f.websiteUrl);
  return lacksContact || thinResearchNotes || thinPurposeSummary || lacksWebsite;
}
