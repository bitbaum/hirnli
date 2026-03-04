/**
 * Scoring Configuration — Declarative config for all scoring engines
 *
 * THREE SCORING LAYERS (each computed independently from foundation data):
 *   Fit (0-10)       — "Does this foundation match our mission?"
 *   Readiness (0-100) — "Can we produce a great, tailored document?"
 *   Priority (0-100)  — "Should we invest effort right now?"
 *
 * Fit and Readiness are independent inputs. Priority depends on both.
 * All weights, thresholds, and penalties live HERE (config). The domain
 * engine (lib/domain/fit-scoring.ts) handles HOW to evaluate them.
 *
 * COMPUTE TYPES (extend in domain when genuinely new pattern needed):
 *   weightedCategoryMatch — count tags in buckets, weight + cap each
 *   tieredLookup          — ordered tiers, first match wins
 *   directMap             — key→value map with fallbacks
 *   additiveChecks        — independent boolean checks, sum points
 *
 * ORG-SPECIFIC: Theme classification, geographic tiers, readiness weights,
 * and priority formula are Revamp-IT specific. To support a new org,
 * rewrite the dimension configs below.
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

export interface AdditiveChecksConfig {
  checks: readonly {
    label: string;           // Human-readable name (for UI inspection)
    match: MatchExpression;  // Reuses existing match system
    score: number;           // Points if condition is true
  }[];
}

export type ComputeConfig =
  | WeightedCategoryMatchConfig
  | TieredLookupConfig
  | DirectMapConfig
  | AdditiveChecksConfig;

// --- Dimension + engine ---

export interface ScoringDimensionConfig<T extends ComputeConfig = ComputeConfig> {
  id: string;
  label: string;
  maxScore: number;
  computeType: 'weightedCategoryMatch' | 'tieredLookup' | 'directMap' | 'additiveChecks';
  inputFields: readonly string[];
  config: T;
}

/** Dimension floor: if a dimension scores below `ifBelow`, cap composite at `capTotal` */
export interface DimensionFloor {
  dimensionId: string;
  ifBelow: number;
  capTotal: number;
}

export interface ScoringEngineConfig {
  dimensions: readonly ScoringDimensionConfig[];
  composite: {
    method: 'sum';
    dimensionFloors?: readonly DimensionFloor[];
  };
  display: {
    thresholds: readonly { level: number; minScore: number }[];
    defaultLevel: number;
    confidenceGate?: {
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
  composite: {
    method: 'sum',
    // Dealbreakers: if a critical dimension scores 0, cap the total.
    // A Mexico-targeting foundation with perfect thematic overlap still shouldn't
    // get 3 stars. Zero geographic = max fit 3. Zero thematic = max fit 2.
    dimensionFloors: [
      { dimensionId: 'geographic', ifBelow: 1, capTotal: 3 },
      { dimensionId: 'thematic', ifBelow: 1, capTotal: 2 },
    ],
  },
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

// ============================================================================
// READINESS ENGINE — "Can we produce a great, tailored document?"
// ============================================================================
// Dimensions organized by PURPOSE (what each piece of data enables),
// not by data type. Weights reflect impact on Gesuch/document quality.
//
// Input: flat boolean record from foundationToReadinessInput() mapper.
// Engine: generic additiveChecks — sum points for each true condition.
//
// ORG-SPECIFIC: Weights are calibrated against Revamp-IT's 210-foundation
// dataset. New orgs may adjust weights (e.g. financial calibration matters
// more for large-grant seekers). The checks themselves are mostly universal.

export const READINESS_ENGINE: ScoringEngineConfig = {
  dimensions: [
    // ------------------------------------------------------------------
    // Tailoring Intelligence (0-35)
    // "Can we write a foundation-specific pitch?"
    // Without purposeSummary and researchNotes, the Gesuch is generic.
    // These are the highest-value fields for document quality.
    // ------------------------------------------------------------------
    {
      id: 'tailoring',
      label: 'Massschneiderung',
      maxScore: 35,
      computeType: 'additiveChecks',
      inputFields: [
        'hasPurposeSummary', 'hasResearchNotes', 'hasThemes',
        'hasPastGrantees', 'hasApplicationProcess',
      ],
      config: {
        checks: [
          { label: 'Stiftungszweck dokumentiert', match: { field: 'hasPurposeSummary', op: 'eq', value: true }, score: 12 },
          { label: 'Strategische Fit-Analyse', match: { field: 'hasResearchNotes', op: 'eq', value: true }, score: 10 },
          { label: 'Themen zugeordnet', match: { field: 'hasThemes', op: 'eq', value: true }, score: 5 },
          { label: 'Frühere Förderprojekte bekannt', match: { field: 'hasPastGrantees', op: 'eq', value: true }, score: 4 },
          { label: 'Bewerbungsprozess dokumentiert', match: { field: 'hasApplicationProcess', op: 'eq', value: true }, score: 4 },
        ],
      } satisfies AdditiveChecksConfig,
    },
    // ------------------------------------------------------------------
    // Actionability (0-30)
    // "Can we actually submit something?"
    // Email/phone + applicationUrl are the hard requirements.
    // ------------------------------------------------------------------
    {
      id: 'actionability',
      label: 'Handlungsfähigkeit',
      maxScore: 30,
      computeType: 'additiveChecks',
      inputFields: [
        'hasDirectContact', 'hasApplicationUrl', 'hasKnownMethod',
        'acceptsApplications', 'hasDeadlineInfo',
      ],
      config: {
        checks: [
          { label: 'E-Mail oder Telefon', match: { field: 'hasDirectContact', op: 'eq', value: true }, score: 10 },
          { label: 'Bewerbungs-URL', match: { field: 'hasApplicationUrl', op: 'eq', value: true }, score: 10 },
          { label: 'Bewerbungsmethode bekannt', match: { field: 'hasKnownMethod', op: 'eq', value: true }, score: 5 },
          { label: 'Nimmt Gesuche an', match: { field: 'acceptsApplications', op: 'eq', value: 'yes' }, score: 3 },
          { label: 'Frist bekannt', match: { field: 'hasDeadlineInfo', op: 'eq', value: true }, score: 2 },
        ],
      } satisfies AdditiveChecksConfig,
    },
    // ------------------------------------------------------------------
    // Financial Calibration (0-20)
    // "Can we propose a realistic budget?"
    // Knowing their grant range lets us calibrate our ask.
    // ------------------------------------------------------------------
    {
      id: 'financial',
      label: 'Finanzielle Klarheit',
      maxScore: 20,
      computeType: 'additiveChecks',
      inputFields: [
        'hasAmountRange', 'hasBudgetOrExpenditure', 'hasCapital',
        'hasSmallProjects',
      ],
      config: {
        checks: [
          { label: 'Förderbereich bekannt (min/max)', match: { field: 'hasAmountRange', op: 'eq', value: true }, score: 10 },
          { label: 'Jahresbudget oder Förderausgaben', match: { field: 'hasBudgetOrExpenditure', op: 'eq', value: true }, score: 5 },
          { label: 'Stiftungsvermögen bekannt', match: { field: 'hasCapital', op: 'eq', value: true }, score: 3 },
          { label: 'Kleinprojekte-Info', match: { field: 'hasSmallProjects', op: 'eq', value: true }, score: 2 },
        ],
      } satisfies AdditiveChecksConfig,
    },
    // ------------------------------------------------------------------
    // Foundation Profile (0-15)
    // "Do we have enough context for credibility?"
    // Minor signals that improve Gesuch quality at the margin.
    // ------------------------------------------------------------------
    {
      id: 'profile',
      label: 'Stiftungsprofil',
      maxScore: 15,
      computeType: 'additiveChecks',
      inputFields: [
        'hasOwnWebsite', 'hasFounded', 'hasBoardMembers',
        'hasAddress', 'hasSourceLinks',
      ],
      config: {
        checks: [
          { label: 'Eigene Website (nicht Zefix/UID)', match: { field: 'hasOwnWebsite', op: 'eq', value: true }, score: 5 },
          { label: 'Gründungsjahr bekannt', match: { field: 'hasFounded', op: 'eq', value: true }, score: 3 },
          { label: 'Stiftungsrat bekannt', match: { field: 'hasBoardMembers', op: 'eq', value: true }, score: 3 },
          { label: 'Adresse vorhanden', match: { field: 'hasAddress', op: 'eq', value: true }, score: 2 },
          { label: 'Quellen verlinkt', match: { field: 'hasSourceLinks', op: 'eq', value: true }, score: 2 },
        ],
      } satisfies AdditiveChecksConfig,
    },
  ],
  composite: { method: 'sum' },
  display: {
    // Readiness → 5-tier labels (calibrated against 210-foundation dataset)
    // Avg readiness ~47, median ~46. Thresholds set so:
    //   ~10% anwendungsbereit, ~40% recherchiert, ~35% profiliert, ~15% erfasst
    thresholds: [
      { level: 5, minScore: 70 },  // anwendungsbereit
      { level: 4, minScore: 45 },  // recherchiert
      { level: 3, minScore: 25 },  // profiliert
      { level: 2, minScore: 10 },  // erfasst
    ],
    defaultLevel: 1,  // verzeichnet
  },
};

// ============================================================================
// PRIORITY FORMULA — "Should we invest effort right now?"
// ============================================================================
// Fit is a MULTIPLIER (gate), not an addend. Bad fit = zero priority.
// Within the fit gate, readiness determines how actionable it is.
//
// Formula: priority = fitNorm × (baseFitFloor + readinessScale × readiness/100)
//          × min(applicable penalties) + grantBonus
//
// baseFitFloor (30): A perfect-fit foundation with zero data gets 30/100
//   priority — worth researching (P3 territory).
// readinessScale (70): Data quality adds up to 70 more points.
// Together: fit=10 + readiness=100 → 100. fit=10 + readiness=0 → 30.
//           fit=0 + readiness=100 → 0. Fit gates everything.
//
// ORG-SPECIFIC: target grant range, penalty values.

export const PRIORITY_FORMULA = {
  // Fit as gate, readiness as scale
  baseFitFloor: 30,     // priority from pure fit (no data) as % of max
  readinessScale: 70,   // how much readiness contributes on top

  // Hard constraints — use min (harshest) when multiple apply
  penalties: {
    operative: 0.05,         // not a funder — near zero
    noApplications: 0.15,    // policy block — very low
    closed: 0.4,             // temporary — can't act NOW
    invitationOnly: 0.5,     // possible with relationship building
  },

  // Grant size match — bonus when their range overlaps our target
  grantMatch: {
    targetMin: 10_000,       // CHF — org-specific sweet spot
    targetMax: 50_000,       // CHF
    perfectBonus: 15,        // grant range overlaps our target
    closeBonus: 10,          // grantMax >= targetMin/2
    smallBonus: 3,           // some amount known but small
  },

  // Priority → P-label thresholds (recalibrated after fit→fitScore scale fix)
  // Post-fix: avg ~27, median ~23. Natural breaks at ~55 and ~35.
  //   ~8% P1, ~16% P2, ~53% P3, ~24% P4
  display: [
    { level: 1 as const, label: 'P1', minScore: 60, description: 'Erstpriorität — Gesuch aktiv vorbereiten' },
    { level: 2 as const, label: 'P2', minScore: 35, description: 'Hohe Priorität — gezielt bewerben' },
    { level: 3 as const, label: 'P3', minScore: 12, description: 'Beobachten — bei passendem Timing bewerben' },
  ],
  defaultLevel: 4 as const,
  defaultLabel: 'P4',
  defaultDescription: 'Niedrige Priorität — Beziehung pflegen',
} as const;
