/**
 * Fit Scoring — Single scoring function (SSOT for all scripts)
 *
 * Previously copy-pasted across foundation-upsert.ts, batch-research.ts,
 * and backfill-depth-fitscore.ts. Now centralized here.
 *
 * All config (weights, thresholds, theme lists) imported from
 * lib/config/fit-scoring.ts — this file is pure computation.
 */

import {
  THEME_CLASSIFICATION,
  THEME_WEIGHTS,
  GEOGRAPHIC_CONFIG,
  ACCESS_SCORES,
  ACCESS_FUNDER_FALLBACK,
  FIT_THRESHOLDS,
  UNASSESSED_DEPTHS,
} from '../config/fit-scoring';

// ============================================================================
// Types
// ============================================================================

export interface FitScoreInput {
  themes: string[];
  canton: string;
  city: string;
  applicationMethod: string;
  isFunder: boolean;
}

export interface FitResult {
  /** Composite score 0-10 */
  fitScore: number;
  /** Per-dimension breakdown */
  thematic: number;
  geographic: number;
  access: number;
}

// ============================================================================
// Individual dimensions
// ============================================================================

/**
 * Thematic fit (0-4).
 * Core themes weighted higher than secondary themes.
 * Formula: min(round(min(coreHits × 1.5, 3) + min(secondaryHits × 0.5, 1)), 4)
 */
export function computeThematicFit(themes: string[]): number {
  const coreHits = themes.filter(t => (THEME_CLASSIFICATION.core as readonly string[]).includes(t)).length;
  const secondaryHits = themes.filter(t => (THEME_CLASSIFICATION.secondary as readonly string[]).includes(t)).length;

  const coreScore = Math.min(coreHits * THEME_WEIGHTS.coreWeight, THEME_WEIGHTS.coreCap);
  const secondaryScore = Math.min(secondaryHits * THEME_WEIGHTS.secondaryWeight, THEME_WEIGHTS.secondaryCap);

  return Math.min(Math.round(coreScore + secondaryScore), THEME_WEIGHTS.totalCap);
}

/**
 * Geographic fit (0-3).
 * ZH/Zurich cities → 3, nearby cantons → 2, Swiss → 1, unknown → 0.
 */
export function computeGeographicFit(canton: string, city: string): number {
  const cityLower = city.toLowerCase();

  if (canton === 'ZH' || GEOGRAPHIC_CONFIG.zurichCities.some(c => cityLower.includes(c))) {
    return GEOGRAPHIC_CONFIG.scores.zurich;
  }
  if ((GEOGRAPHIC_CONFIG.nearbyCantons as readonly string[]).includes(canton)) {
    return GEOGRAPHIC_CONFIG.scores.nearby;
  }
  if (canton) {
    return GEOGRAPHIC_CONFIG.scores.swiss;
  }
  return GEOGRAPHIC_CONFIG.scores.unknown;
}

/**
 * Access fit (0-3).
 * Online portal → 3, email → 2, invitation → 1, known funder → 1, unknown → 0.
 */
export function computeAccessFit(applicationMethod: string, isFunder: boolean): number {
  if (applicationMethod in ACCESS_SCORES) {
    return ACCESS_SCORES[applicationMethod];
  }
  if (isFunder) {
    return ACCESS_FUNDER_FALLBACK;
  }
  return 0;
}

// ============================================================================
// Composite score
// ============================================================================

/**
 * Compute composite fit score 0-10 with per-dimension breakdown.
 * thematic (0-4) + geographic (0-3) + access (0-3) = 0-10
 */
export function computeFitScore(input: FitScoreInput): FitResult {
  const thematic = computeThematicFit(input.themes);
  const geographic = computeGeographicFit(input.canton, input.city);
  const access = computeAccessFit(input.applicationMethod, input.isFunder);

  return {
    fitScore: thematic + geographic + access,
    thematic,
    geographic,
    access,
  };
}

// ============================================================================
// Display mapping (confidence-aware)
// ============================================================================

/**
 * Map fitScore 0-10 + researchDepth → display fit 0-3.
 *
 * fit=0 "Nicht geprüft" for unassessed research depths (rapid).
 * The fitScore is still stored and useful for prioritizing which
 * foundations to research next, but the display honestly says "not assessed."
 */
export function fitScoreToDisplay(fitScore: number, researchDepth: string | undefined): 0 | 1 | 2 | 3 {
  if (researchDepth && UNASSESSED_DEPTHS.includes(researchDepth)) {
    return 0;
  }
  if (fitScore >= FIT_THRESHOLDS.high) return 3;
  if (fitScore >= FIT_THRESHOLDS.medium) return 2;
  return 1;
}
