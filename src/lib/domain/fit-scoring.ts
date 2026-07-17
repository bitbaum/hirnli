/**
 * Scoring Engine — Generic config-driven evaluator for all scoring layers
 * See CLAUDE.md § Scoring Model for the 3-layer architecture.
 * Config lives in lib/config/fit-scoring.ts. This file is pure computation.
 *
 * COMPUTE TYPE REGISTRY:
 *   weightedCategoryMatch — count tags in buckets, weight + cap each
 *   tieredLookup          — ordered tiers, first match wins
 *   directMap             — key→value map with fallbacks
 *   additiveChecks        — independent boolean checks, sum points
 *
 * To add a genuinely new compute type: add one function here + register it.
 */

import {
  SCORING_ENGINE,
  FIT_DISPLAY,
  type MatchCondition,
  type MatchExpression,
  type WeightedCategoryMatchConfig,
  type TieredLookupConfig,
  type DirectMapConfig,
  type AdditiveChecksConfig,
  type ScoringDimensionConfig,
  type ScoringEngineConfig,
} from '../config/fit-scoring';

// ============================================================================
// Types
// ============================================================================

interface FitScoreInput {
  themes: string[];
  canton: string;
  city: string;
  applicationMethod: string;
  isFunder: boolean;
}

interface FitResult {
  /** Composite score (sum of all dimensions) */
  fitScore: number;
  /** Per-dimension scores keyed by dimension id */
  dimensions: Record<string, number>;
}

/** Per-check detail returned by additiveChecks evaluation */
export interface CheckDetail {
  label: string;
  passed: boolean;
  points: number;
}

/** Result from evaluating any engine (fit, readiness, etc.) */
interface EngineResult {
  score: number;
  dimensions: Record<string, number>;
  /** Per-check details (only populated for additiveChecks dimensions) */
  checks: (CheckDetail & { dimension: string })[];
  /** Display level from thresholds */
  displayLevel: number;
}

// Input as a generic record for the engine to read fields dynamically
type InputRecord = Record<string, unknown>;

// ============================================================================
// Match evaluator
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

/** Evaluate independent boolean checks, sum points for each true condition */
function evaluateAdditiveChecks(input: InputRecord, config: AdditiveChecksConfig): number {
  let total = 0;
  for (const check of config.checks) {
    if (evaluateMatch(input, check.match)) total += check.score;
  }
  return total;
}

/** Get per-check details for additiveChecks (for UI inspection) */
function getAdditiveCheckDetails(input: InputRecord, config: AdditiveChecksConfig): CheckDetail[] {
  return config.checks.map(check => ({
    label: check.label,
    passed: evaluateMatch(input, check.match),
    points: check.score,
  }));
}

const COMPUTE_REGISTRY: Record<string, (input: InputRecord, config: never) => number> = {
  weightedCategoryMatch: evaluateWeightedCategoryMatch as (input: InputRecord, config: never) => number,
  tieredLookup: evaluateTieredLookup as (input: InputRecord, config: never) => number,
  directMap: evaluateDirectMap as (input: InputRecord, config: never) => number,
  additiveChecks: evaluateAdditiveChecks as (input: InputRecord, config: never) => number,
};

// ============================================================================
// Generic engine
// ============================================================================

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

/**
 * Evaluate any ScoringEngineConfig against an input record.
 * Returns composite score, per-dimension breakdown, per-check details,
 * and the display level from thresholds.
 */
export function evaluateEngine(engine: ScoringEngineConfig, input: InputRecord): EngineResult {
  const dimensions: Record<string, number> = {};
  const checks: (CheckDetail & { dimension: string })[] = [];

  for (const dim of engine.dimensions) {
    const dimInput = pickInputFields(input, dim);
    dimensions[dim.id] = evaluateDimension(dim, input);

    // Collect per-check details for additiveChecks dimensions
    if (dim.computeType === 'additiveChecks') {
      const details = getAdditiveCheckDetails(dimInput, dim.config as AdditiveChecksConfig);
      for (const detail of details) {
        checks.push({ ...detail, dimension: dim.id });
      }
    }
  }

  // Composite score (sum)
  let score = Object.values(dimensions).reduce((a, b) => a + b, 0);

  // Apply dimension floors (dealbreakers)
  const floors = engine.composite.dimensionFloors;
  if (floors) {
    for (const floor of floors) {
      const dimScore = dimensions[floor.dimensionId];
      if (dimScore !== undefined && dimScore < floor.ifBelow) {
        score = Math.min(score, floor.capTotal);
      }
    }
  }

  // Display level from thresholds (descending — first match wins)
  let displayLevel = engine.display.defaultLevel;
  for (const t of engine.display.thresholds) {
    if (score >= t.minScore) {
      displayLevel = t.level;
      break;
    }
  }

  return { score, dimensions, checks, displayLevel };
}

// ============================================================================
// Public API — Fit scoring (backward compatible)
// ============================================================================

/**
 * Compute composite fit score with per-dimension breakdown.
 * Reads all dimensions from SCORING_ENGINE config.
 */
export function computeFitScore(input: FitScoreInput): FitResult {
  const result = evaluateEngine(SCORING_ENGINE, input as unknown as InputRecord);
  return { fitScore: result.score, dimensions: result.dimensions };
}

/**
 * Explain a stored fit score as a per-dimension breakdown — SSOT for the
 * "why 9/10?" question on foundation detail pages.
 *
 * Thematic and access dimensions are recomputed EXACTLY from foundation data
 * (themes, applicationMethod). The geographic dimension was scored from
 * registry data (canton/city) at ingest time and is not stored on the app-side
 * Foundation object — it is derived arithmetically (stored − thematic −
 * access) and validated against the dimension's max. If the arithmetic does
 * not reconcile (composite caps, data drift), `consistent` is false and the
 * UI must fall back to showing only the stored composite — never invented
 * numbers.
 */
export interface FitDimensionExplanation {
  id: string;
  label: string;
  description: string;
  max: number;
  /** null when the value cannot be honestly determined */
  score: number | null;
  method: 'exact' | 'derived';
}

export interface FitScoreExplanation {
  dimensions: FitDimensionExplanation[];
  consistent: boolean;
}

export function explainFitScore(f: {
  themes: string[];
  applicationMethod: string;
  isFunder: boolean;
  fitScore: number;
}): FitScoreExplanation {
  // Geographic inputs empty → that dimension scores 0 here; thematic + access are exact.
  const result = evaluateEngine(SCORING_ENGINE, {
    themes: f.themes,
    canton: '',
    city: '',
    applicationMethod: f.applicationMethod,
    isFunder: f.isFunder,
  } as unknown as InputRecord);

  const dimensions: FitDimensionExplanation[] = [];
  let exactSum = 0;
  let derivedDim: FitDimensionExplanation | null = null;

  for (const dim of SCORING_ENGINE.dimensions) {
    const base = { id: dim.id, label: dim.label, description: dim.description, max: dim.maxScore };
    if (dim.id === 'geographic') {
      derivedDim = { ...base, score: null, method: 'derived' };
      dimensions.push(derivedDim);
    } else {
      const score = result.dimensions[dim.id] ?? 0;
      exactSum += score;
      dimensions.push({ ...base, score, method: 'exact' });
    }
  }

  let consistent = false;
  if (derivedDim) {
    const residual = f.fitScore - exactSum;
    if (residual >= 0 && residual <= derivedDim.max) {
      derivedDim.score = residual;
      consistent = true;
    }
  }

  return { dimensions, consistent };
}

/**
 * Map fitScore → display fit level (0-3 stars).
 * When isGated=true (tier < profiliert), returns the configured gateLevel (0 = unassessed).
 * Reads thresholds from SCORING_ENGINE.display config.
 */
export function fitScoreToDisplay(fitScore: number, isGated: boolean): 0 | 1 | 2 | 3 {
  const { display } = SCORING_ENGINE;

  // Confidence gate: insufficient data → gated level
  if (isGated && display.confidenceGate) {
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

/** Full label for a fit level: stars + name + score range, e.g. "★★★ Exzellent (8-10)" */
export function fitDisplayLabel(level: 0 | 1 | 2 | 3): string {
  const fd = FIT_DISPLAY[level];
  const threshold = SCORING_ENGINE.display.thresholds.find(t => t.level === level);
  const nextThreshold = SCORING_ENGINE.display.thresholds.find(t => t.level === level + 1);
  if (threshold) {
    const max = nextThreshold ? nextThreshold.minScore - 1 : 10;
    return `${fd.stars} ${fd.label} (${threshold.minScore}-${max})`;
  }
  return `${fd.stars} ${fd.label}`;
}
