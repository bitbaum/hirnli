/**
 * Fit Scoring Configuration — Declarative scoring engine config
 *
 * WHY: Adding a new scoring dimension should require only config changes,
 * not new domain functions. This file declares WHAT to score; the domain
 * engine (lib/domain/fit-scoring.ts) handles HOW.
 *
 * COMPUTE TYPES (extend in domain when genuinely new pattern needed):
 *   weightedCategoryMatch — count tags in buckets, weight + cap each
 *   tieredLookup          — ordered tiers, first match wins
 *   directMap             — key→value map with fallbacks
 *
 * ORG-SPECIFIC: Theme classification and geographic tiers are Revamp-IT specific.
 * To support a new org, rewrite the dimension configs below.
 */

import type { ThemeId } from '../schemas/foundation';

// ============================================================================
// Type definitions — co-located with config so they're always in sync
// ============================================================================

// --- Match conditions (used by tieredLookup) ---

export interface MatchConditionEq {
  field: string;
  op: 'eq';
  value: string | number | boolean;
}

export interface MatchConditionIn {
  field: string;
  op: 'in';
  values: readonly string[];
}

export interface MatchConditionContainsAny {
  field: string;
  op: 'containsAny';
  values: readonly string[];
}

export interface MatchConditionTruthy {
  field: string;
  op: 'truthy';
}

export type MatchCondition =
  | MatchConditionEq
  | MatchConditionIn
  | MatchConditionContainsAny
  | MatchConditionTruthy;

export type MatchExpression =
  | MatchCondition
  | { type: 'or'; conditions: MatchCondition[] };

// --- Compute type configs ---

export interface WeightedCategoryMatchConfig {
  categories: readonly {
    name: string;
    members: readonly string[];
    weight: number;
    cap: number;
  }[];
  totalCap: number;
  round: boolean;
}

export interface TieredLookupConfig {
  tiers: readonly {
    score: number;
    match: MatchExpression;
  }[];
  defaultScore: number;
}

export interface DirectMapConfig {
  field: string;
  map: Record<string, number>;
  fallbacks: readonly {
    condition: MatchCondition;
    score: number;
  }[];
  defaultScore: number;
}

export type ComputeConfig =
  | WeightedCategoryMatchConfig
  | TieredLookupConfig
  | DirectMapConfig;

// --- Dimension + engine ---

export interface ScoringDimensionConfig<T extends ComputeConfig = ComputeConfig> {
  id: string;
  label: string;
  maxScore: number;
  computeType: 'weightedCategoryMatch' | 'tieredLookup' | 'directMap';
  inputFields: readonly string[];
  config: T;
}

export interface ScoringEngineConfig {
  dimensions: readonly ScoringDimensionConfig[];
  composite: { method: 'sum' };
  display: {
    thresholds: readonly { level: number; minScore: number }[];
    defaultLevel: number;
    confidenceGate: {
      field: string;
      excludeValues: readonly string[];
      gateLevel: number;
    };
  };
}

// ============================================================================
// ENGINE CONFIG
// ============================================================================

export const SCORING_ENGINE: ScoringEngineConfig = {
  dimensions: [
    // ------------------------------------------------------------------
    // Thematic fit (0-4)
    // Core themes weighted higher than secondary. Two strong core overlaps
    // are almost as good as four — diminishing returns via cap.
    // ------------------------------------------------------------------
    {
      id: 'thematic',
      label: 'Thematischer Fit',
      maxScore: 4,
      computeType: 'weightedCategoryMatch',
      inputFields: ['themes'],
      config: {
        categories: [
          {
            name: 'core',
            members: [
              'arbeitsintegration',
              'kreislaufwirtschaft',
              'digitale-bildung',
              'digitale-souveraenitaet',
            ] satisfies ThemeId[],
            weight: 1.5,
            cap: 3,
          },
          {
            name: 'secondary',
            members: [
              'soziale-integration',
              'klima',
              'jugend',
              'zuerich',
            ] satisfies ThemeId[],
            weight: 0.5,
            cap: 1,
          },
        ],
        totalCap: 4,
        round: true,
      } satisfies WeightedCategoryMatchConfig,
    },
    // ------------------------------------------------------------------
    // Geographic fit (0-3)
    // Swiss foundations strongly favor local projects. ZH ~3x more likely
    // to fund a ZH project than a remote one (based on grant distribution).
    // ------------------------------------------------------------------
    {
      id: 'geographic',
      label: 'Geographischer Fit',
      maxScore: 3,
      computeType: 'tieredLookup',
      inputFields: ['canton', 'city'],
      config: {
        tiers: [
          {
            score: 3,
            match: {
              type: 'or',
              conditions: [
                { field: 'canton', op: 'eq', value: 'ZH' },
                { field: 'city', op: 'containsAny', values: ['zürich', 'winterthur', 'uster', 'wetzikon', 'dübendorf', 'dietikon', 'horgen'] },
              ],
            },
          },
          {
            score: 2,
            match: { field: 'canton', op: 'in', values: ['ZG', 'AG', 'SH', 'TG', 'SZ', 'LU'] },
          },
          {
            score: 1,
            match: { field: 'canton', op: 'truthy' },
          },
        ],
        defaultScore: 0,
      } satisfies TieredLookupConfig,
    },
    // ------------------------------------------------------------------
    // Access fit (0-3)
    // Open online portal = immediately actionable (highest priority).
    // Invitation-only = requires relationship building first (lower).
    // ------------------------------------------------------------------
    {
      id: 'access',
      label: 'Zugangs-Fit',
      maxScore: 3,
      computeType: 'directMap',
      inputFields: ['applicationMethod', 'isFunder'],
      config: {
        field: 'applicationMethod',
        map: { online: 3, email: 2, invitation: 1 },
        fallbacks: [
          { condition: { field: 'isFunder', op: 'eq', value: true }, score: 1 },
        ],
        defaultScore: 0,
      } satisfies DirectMapConfig,
    },
  ],
  composite: { method: 'sum' },
  display: {
    // Descending order — first match wins
    thresholds: [
      { level: 3, minScore: 7 },
      { level: 2, minScore: 4 },
    ],
    defaultLevel: 1,
    confidenceGate: {
      field: 'researchDepth',
      excludeValues: ['rapid'],
      gateLevel: 0,
    },
  },
};

// ============================================================================
// FIT DISPLAY — Labels, colors, stars for each fit level
// ============================================================================
// Not part of engine config — purely presentation, consumed by UI components.

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
