/**
 * Fit Scoring — Generic config-driven scoring engine
 *
 * Reads dimension definitions from lib/config/fit-scoring.ts and evaluates
 * them generically. Adding a new dimension of an existing compute type
 * requires zero changes here — config only.
 *
 * COMPUTE TYPE REGISTRY:
 *   weightedCategoryMatch — count tags in buckets, weight + cap each
 *   tieredLookup          — ordered tiers, first match wins
 *   directMap             — key→value map with fallbacks
 *
 * To add a genuinely new compute type: add one function here + register it.
 */

import {
  SCORING_ENGINE,
  type MatchCondition,
  type MatchExpression,
  type WeightedCategoryMatchConfig,
  type TieredLookupConfig,
  type DirectMapConfig,
  type ScoringDimensionConfig,
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
  /** Composite score (sum of all dimensions) */
  fitScore: number;
  /** Per-dimension scores keyed by dimension id */
  dimensions: Record<string, number>;
}

// Input as a generic record for the engine to read fields dynamically
type InputRecord = Record<string, unknown>;

// ============================================================================
// Match evaluator (used by tieredLookup)
// ============================================================================

function evaluateCondition(input: InputRecord, cond: MatchCondition): boolean {
  const value = input[cond.field];

  switch (cond.op) {
    case 'eq':
      return value === cond.value;

    case 'in':
      return typeof value === 'string' && (cond.values as readonly string[]).includes(value);

    case 'containsAny': {
      if (typeof value !== 'string') return false;
      const lower = value.toLowerCase();
      return cond.values.some(v => lower.includes(v));
    }

    case 'truthy':
      return Boolean(value);
  }
}

function evaluateMatch(input: InputRecord, match: MatchExpression): boolean {
  if ('type' in match && match.type === 'or') {
    return match.conditions.some(c => evaluateCondition(input, c));
  }
  return evaluateCondition(input, match as MatchCondition);
}

// ============================================================================
// Compute type registry — one pure function per type
// ============================================================================

function evaluateWeightedCategoryMatch(input: InputRecord, config: WeightedCategoryMatchConfig): number {
  // Collect all input arrays from the input fields (the dimension declares which)
  // For weightedCategoryMatch the first inputField is typically an array field like 'themes'
  const tags = Object.values(input).find(v => Array.isArray(v)) as string[] | undefined;
  if (!tags || tags.length === 0) return 0;

  let total = 0;
  for (const cat of config.categories) {
    const hits = tags.filter(t => (cat.members as readonly string[]).includes(t)).length;
    total += Math.min(hits * cat.weight, cat.cap);
  }

  const score = config.round ? Math.round(total) : total;
  return Math.min(score, config.totalCap);
}

function evaluateTieredLookup(input: InputRecord, config: TieredLookupConfig): number {
  for (const tier of config.tiers) {
    if (evaluateMatch(input, tier.match)) {
      return tier.score;
    }
  }
  return config.defaultScore;
}

function evaluateDirectMap(input: InputRecord, config: DirectMapConfig): number {
  const fieldValue = input[config.field];

  if (typeof fieldValue === 'string' && fieldValue in config.map) {
    return config.map[fieldValue];
  }

  for (const fb of config.fallbacks) {
    if (evaluateCondition(input, fb.condition)) {
      return fb.score;
    }
  }

  return config.defaultScore;
}

const COMPUTE_REGISTRY: Record<string, (input: InputRecord, config: never) => number> = {
  weightedCategoryMatch: evaluateWeightedCategoryMatch as (input: InputRecord, config: never) => number,
  tieredLookup: evaluateTieredLookup as (input: InputRecord, config: never) => number,
  directMap: evaluateDirectMap as (input: InputRecord, config: never) => number,
};

// ============================================================================
// Generic engine
// ============================================================================

/**
 * Pick only the fields a dimension declares it needs from the full input.
 */
function pickInputFields(fullInput: InputRecord, dim: ScoringDimensionConfig): InputRecord {
  const subset: InputRecord = {};
  for (const field of dim.inputFields) {
    subset[field] = fullInput[field];
  }
  return subset;
}

function evaluateDimension(dim: ScoringDimensionConfig, fullInput: InputRecord): number {
  const compute = COMPUTE_REGISTRY[dim.computeType];
  if (!compute) {
    throw new Error(`Unknown compute type: ${dim.computeType}`);
  }
  const input = pickInputFields(fullInput, dim);
  const score = compute(input, dim.config as never);
  return Math.min(score, dim.maxScore);
}

// ============================================================================
// Public API — identical signatures to before
// ============================================================================

/**
 * Compute composite fit score with per-dimension breakdown.
 * Reads all dimensions from SCORING_ENGINE config.
 */
export function computeFitScore(input: FitScoreInput): FitResult {
  const inputRecord = input as unknown as InputRecord;
  const dimensions: Record<string, number> = {};

  for (const dim of SCORING_ENGINE.dimensions) {
    dimensions[dim.id] = evaluateDimension(dim, inputRecord);
  }

  // Composite — currently only 'sum'
  const fitScore = Object.values(dimensions).reduce((a, b) => a + b, 0);

  return { fitScore, dimensions };
}

/**
 * Map fitScore + researchDepth → display fit level.
 * Reads thresholds and confidence gate from SCORING_ENGINE.display config.
 */
export function fitScoreToDisplay(fitScore: number, researchDepth: string | undefined): 0 | 1 | 2 | 3 {
  const { display } = SCORING_ENGINE;

  // Confidence gate: unassessed depths get gated level
  if (researchDepth && display.confidenceGate.excludeValues.includes(researchDepth)) {
    return display.confidenceGate.gateLevel as 0 | 1 | 2 | 3;
  }

  // Thresholds are in descending order — first match wins
  for (const t of display.thresholds) {
    if (fitScore >= t.minScore) {
      return t.level as 0 | 1 | 2 | 3;
    }
  }

  return display.defaultLevel as 0 | 1 | 2 | 3;
}
