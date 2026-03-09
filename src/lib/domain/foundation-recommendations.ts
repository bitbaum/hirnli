// Foundation Recommendations — Similarity, schwerpunkt matching, action lists
// Uses fitScore for comparison and isResearched() for quality gates.

import type { Foundation } from '@/lib/schemas/foundation';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import { isResearched } from './foundation-helpers';

// ---------------------------------------------------------------------------
// Similarity weights — how much each factor contributes to the overall score
// ---------------------------------------------------------------------------
const SIMILARITY_WEIGHTS = {
  themeOverlap: 0.45,
  typeMatch: 0.20,
  fitProximity: 0.15,
  regionOverlap: 0.10,
  sdgOverlap: 0.10,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimilarFoundation {
  foundation: Foundation;
  similarity: number;
  /** Human-readable reasons in Swiss German (e.g. "3 gemeinsame Themen") */
  reasons: string[];
}

export interface FoundationRecommendations {
  /** fitScore>=7 (high fit), status open/rolling, researched — highest-value targets */
  highFitActionable: Foundation[];
  /** status=soon, sorted by deadline ascending */
  upcomingDeadlines: Foundation[];
  /** Sorted by researchDate descending — most recently updated */
  recentlyResearched: Foundation[];
  /** fitScore>=4 and not yet researched — foundations worth deeper investigation */
  needsAttention: Foundation[];
  /** Top foundations per Schwerpunkt */
  bySchwerpunkt: Record<SchwerpunktId, Foundation[]>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Jaccard index: |A ∩ B| / |A ∪ B|. Returns 0 for empty sets. */
function jaccard<T>(a: T[], b: T[]): number {
  if (a.length === 0 && b.length === 0) return 0;

  const setA = new Set(a);
  const setB = new Set(b);

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Count shared items between two arrays. */
function countShared<T>(a: T[], b: T[]): number {
  const setB = new Set(b);
  let count = 0;
  for (const item of a) {
    if (setB.has(item)) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Core: Similarity computation
// ---------------------------------------------------------------------------

/**
 * Compute similarity between two foundations (0-1).
 *
 * Weighted sum of:
 * - themeOverlap: Jaccard index of themes
 * - typeMatch: 1 if same type, 0 otherwise
 * - fitProximity: 1 - |a.fitScore - b.fitScore| / 10
 * - regionOverlap: 1 if same region, 0 otherwise
 * - sdgOverlap: Jaccard index of SDGs (0 if either has none)
 */
export function computeSimilarity(a: Foundation, b: Foundation): number {
  const themeOverlap = jaccard(a.themes, b.themes);
  const typeMatch = a.type === b.type ? 1 : 0;
  // fitScore=0 means unassessed — can't meaningfully compare
  const fitProximity = (a.fitScore === 0 || b.fitScore === 0) ? 0 : 1 - Math.abs(a.fitScore - b.fitScore) / 10;
  const regionOverlap = a.region === b.region ? 1 : 0;
  const sdgOverlap =
    a.sdgs && a.sdgs.length > 0 && b.sdgs && b.sdgs.length > 0
      ? jaccard(a.sdgs, b.sdgs)
      : 0;

  return (
    SIMILARITY_WEIGHTS.themeOverlap * themeOverlap +
    SIMILARITY_WEIGHTS.typeMatch * typeMatch +
    SIMILARITY_WEIGHTS.fitProximity * fitProximity +
    SIMILARITY_WEIGHTS.regionOverlap * regionOverlap +
    SIMILARITY_WEIGHTS.sdgOverlap * sdgOverlap
  );
}

// ---------------------------------------------------------------------------
// Build human-readable reason strings (Swiss German)
// ---------------------------------------------------------------------------

function buildReasons(target: Foundation, candidate: Foundation): string[] {
  const reasons: string[] = [];

  const sharedThemes = countShared(target.themes, candidate.themes);
  if (sharedThemes > 0) {
    reasons.push(
      sharedThemes === 1
        ? '1 gemeinsames Thema'
        : `${sharedThemes} gemeinsame Themen`,
    );
  }

  if (target.type === candidate.type) {
    reasons.push(`Gleicher Typ (${candidate.type})`);
  }

  if (target.region === candidate.region) {
    reasons.push('Gleiche Region');
  }

  if (
    target.sdgs &&
    target.sdgs.length > 0 &&
    candidate.sdgs &&
    candidate.sdgs.length > 0
  ) {
    const sharedSdgs = countShared(target.sdgs, candidate.sdgs);
    if (sharedSdgs > 0) {
      reasons.push(
        sharedSdgs === 1
          ? '1 gemeinsames SDG'
          : `${sharedSdgs} gemeinsame SDGs`,
      );
    }
  }

  if (target.fitScore > 0 && target.fitScore === candidate.fitScore) {
    reasons.push(`Gleicher Fit-Score (${candidate.fitScore}/10)`);
  }

  return reasons;
}

// ---------------------------------------------------------------------------
// Find similar foundations
// ---------------------------------------------------------------------------

/**
 * Find foundations most similar to `target` from `pool`.
 * Excludes the target itself (by slug). Returns top `limit` results sorted by
 * similarity descending.
 */
export function findSimilarFoundations(
  target: Foundation,
  pool: Foundation[],
  limit = 5,
): SimilarFoundation[] {
  return pool
    .filter((f) => f.slug !== target.slug)
    .map((f) => ({
      foundation: f,
      similarity: computeSimilarity(target, f),
      reasons: buildReasons(target, f),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Find by Schwerpunkt
// ---------------------------------------------------------------------------

/**
 * Filter foundations whose themes overlap with a Schwerpunkt's themeIds.
 * Sorted by fitScore descending, then priority ascending.
 */
export function findBySchwerpunkt(
  schwerpunktId: SchwerpunktId,
  foundations: Foundation[],
  limit = 10,
): Foundation[] {
  const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
  const themeIdSet = new Set(schwerpunkt.themeIds);

  return foundations
    .filter((f) => f.themes.some((t) => themeIdSet.has(t)))
    .sort((a, b) => {
      // fitScore descending (higher fit first)
      const fitDiff = b.fitScore - a.fitScore;
      if (fitDiff !== 0) return fitDiff;
      // priority ascending (lower priority number = higher priority)
      return a.priority - b.priority;
    })
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Aggregate recommendations
// ---------------------------------------------------------------------------

/**
 * Build a complete recommendation set from a foundation pool.
 * Pure function — no side effects, no data fetching.
 */
export function getRecommendations(
  foundations: Foundation[],
): FoundationRecommendations {
  // High fit, actionable (fitScore>=7, open/rolling, already researched)
  const highFitActionable = foundations
    .filter(
      (f) =>
        f.fitScore >= 7 &&
        (f.status === 'open' || f.status === 'rolling') &&
        isResearched(f),
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  // Upcoming deadlines (status=soon, sorted by deadline ascending)
  const upcomingDeadlines = foundations
    .filter((f) => f.status === 'soon')
    .sort((a, b) => {
      const aDeadline = a.deadline ?? a.nextDeadline ?? '';
      const bDeadline = b.deadline ?? b.nextDeadline ?? '';
      return aDeadline.localeCompare(bDeadline);
    });

  // Recently researched (sorted by researchDate descending)
  const recentlyResearched = [...foundations]
    .sort((a, b) => b.researchDate.localeCompare(a.researchDate))
    .slice(0, 5);

  // Needs attention (good fit but needs more research)
  const needsAttention = foundations
    .filter((f) => f.fitScore >= 4 && !isResearched(f))
    .sort((a, b) => {
      const fitDiff = b.fitScore - a.fitScore;
      if (fitDiff !== 0) return fitDiff;
      return a.priority - b.priority;
    })
    .slice(0, 5);

  // Top foundations per Schwerpunkt
  const bySchwerpunkt = {} as Record<SchwerpunktId, Foundation[]>;
  for (const id of SCHWERPUNKT_IDS) {
    bySchwerpunkt[id] = findBySchwerpunkt(id, foundations, 5);
  }

  return {
    highFitActionable,
    upcomingDeadlines,
    recentlyResearched,
    needsAttention,
    bySchwerpunkt,
  };
}
