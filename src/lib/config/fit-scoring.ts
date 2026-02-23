/**
 * Fit Scoring Configuration — SSOT for all scoring weights, thresholds, and display
 *
 * WHY: The scoring formula was copy-pasted across 3 scripts with hardcoded magic
 * numbers. This file centralizes every constant with rationale documentation.
 * Domain logic lives in lib/domain/fit-scoring.ts; this file is config only.
 *
 * ORG-SPECIFIC: Theme classification and geographic tiers are Revamp-IT specific.
 * To support a new org, rewrite THEME_CLASSIFICATION and GEOGRAPHIC_TIERS.
 */

import type { ThemeId } from '../schemas/foundation';

// ============================================================================
// THEME CLASSIFICATION
// ============================================================================
// Themes are split into core (direct mission alignment) and secondary (tangential).
//
// WHY core weight = 1.5, cap = 3:
//   2 core matches → 3 points (near cap). Two strong overlaps are almost as
//   good as four — diminishing returns on additional core matches.
//
// WHY secondary weight = 0.5, cap = 1:
//   Tangential relevance. A climate foundation *might* fund circular economy,
//   but it's not a primary match. Capped to prevent secondary themes from
//   inflating scores beyond their actual predictive value.

export const THEME_CLASSIFICATION = {
  core: ['arbeitsintegration', 'kreislaufwirtschaft', 'digitale-bildung', 'digitale-souveraenitaet'] as ThemeId[],
  secondary: ['soziale-integration', 'klima', 'jugend', 'zuerich'] as ThemeId[],
} as const;

export const THEME_WEIGHTS = {
  /** Points per core theme match */
  coreWeight: 1.5,
  /** Max points from core themes */
  coreCap: 3,
  /** Points per secondary theme match */
  secondaryWeight: 0.5,
  /** Max points from secondary themes */
  secondaryCap: 1,
  /** Max total thematic score */
  totalCap: 4,
} as const;

// ============================================================================
// GEOGRAPHIC TIERS
// ============================================================================
// Swiss foundations strongly favor local projects. A ZH foundation is ~3x more
// likely to fund a ZH project than a remote one (based on grant distribution data).

export const GEOGRAPHIC_CONFIG = {
  /** Zürich cities — seat or common project locations in Kanton ZH */
  zurichCities: ['zürich', 'winterthur', 'uster', 'wetzikon', 'dübendorf', 'dietikon', 'horgen'],
  /** Cantons adjacent to ZH — partial geographic overlap */
  nearbyCantons: ['ZG', 'AG', 'SH', 'TG', 'SZ', 'LU'],
  /** Score tiers */
  scores: {
    zurich: 3,
    nearby: 2,
    swiss: 1,
    unknown: 0,
  },
} as const;

// ============================================================================
// ACCESS SCORING
// ============================================================================
// Open online portal = immediately actionable (highest priority for time investment).
// Invitation-only = requires relationship building first (lower priority activity).

export const ACCESS_SCORES: Record<string, number> = {
  online: 3,
  email: 2,
  invitation: 1,
};

/** Fallback score when applicationMethod is unknown but foundation is a known funder */
export const ACCESS_FUNDER_FALLBACK = 1;

// ============================================================================
// FIT THRESHOLDS
// ============================================================================
// Map composite 0-10 score to display categories 0-3.
// These thresholds should be adjusted if the scoring dimensions change.

export const FIT_THRESHOLDS = {
  /** fitScore >= high → fit=3 */
  high: 7,
  /** fitScore >= medium → fit=2 */
  medium: 4,
} as const;

// ============================================================================
// CONFIDENCE: UNASSESSED RESEARCH DEPTHS
// ============================================================================
// researchDepth values where fitScore is unreliable (auto-screened, no human review).
// Entries with these depths get fit=0 regardless of fitScore.

export const UNASSESSED_DEPTHS: string[] = ['rapid'];

// ============================================================================
// FIT DISPLAY — Labels, colors, stars for each fit level
// ============================================================================

export const FIT_DISPLAY: Record<0 | 1 | 2 | 3, {
  label: string;
  color: string;
  description: string;
  stars: string;
}> = {
  3: {
    label: 'Exzellent',
    color: 'text-success',
    description: 'Hervorragende thematische Übereinstimmung',
    stars: '★★★',
  },
  2: {
    label: 'Gut',
    color: 'text-warning',
    description: 'Gute Übereinstimmung, gezielte Argumentation nötig',
    stars: '★★☆',
  },
  1: {
    label: 'Gering',
    color: 'text-text-muted',
    description: 'Eingeschränkte Übereinstimmung',
    stars: '★☆☆',
  },
  0: {
    label: 'Nicht geprüft',
    color: 'text-text-muted',
    description: 'Nur automatisches ESA-Screening — keine manuelle Bewertung',
    stars: '○○○',
  },
};
