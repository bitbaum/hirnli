/**
 * Readiness + Priority computation
 * See CLAUDE.md § Scoring Model for the 3-layer architecture.
 * Config: lib/config/fit-scoring.ts | Helpers: lib/domain/foundation-helpers.ts
 *
 * Readiness (0-100) — "Can we produce a great, tailored document?"
 * Priority (0-100)  — "Should we invest effort right now?" (Fit × Readiness)
 *
 * This file is pure computation — all weights, thresholds, and penalties
 * live in config. No magic numbers.
 */

import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import { READINESS_ENGINE, PRIORITY_FORMULA } from '@/lib/config/fit-scoring';
import { evaluateEngine, type CheckDetail } from './fit-scoring';

// ============================================================================
// Readiness
// ============================================================================

/** URLs pointing to registry sites, not the foundation's own website */
const REGISTRY_DOMAINS = ['zefix.ch', 'uid.admin.ch'];

function isRegistryUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return REGISTRY_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/**
 * Flatten nested Foundation fields into a boolean record for the generic engine.
 * Each key maps to a check in READINESS_ENGINE config.
 */
function foundationToReadinessInput(f: Foundation): Record<string, unknown> {
  return {
    // Tailoring Intelligence
    hasPurposeSummary: !!f.purposeSummary && f.purposeSummary.length > 20,
    hasResearchNotes: !!f.researchNotes && f.researchNotes.length > 20,
    hasThemes: f.themes.length > 0,
    hasPastGrantees: !!(f.pastGrantees && f.pastGrantees.length > 0),
    hasApplicationProcess: !!(f.applicationProcess && f.applicationProcess.length > 0),

    // Actionability
    hasDirectContact: !!(f.contact?.email || f.contact?.phone),
    hasApplicationUrl: !!f.applicationUrl,
    hasKnownMethod: f.applicationMethod !== 'unknown' && f.applicationMethod !== 'none',
    acceptsApplications: f.acceptsApplications ?? 'unknown',
    hasDeadlineInfo: !!f.deadlineText && f.deadlineText !== 'Unbekannt',

    // Financial Calibration
    hasAmountRange: f.amount?.min != null || f.amount?.max != null,
    hasBudgetOrExpenditure: !!f.annualBudget || !!f.grantExpenditure,
    hasCapital: !!f.capital,
    hasSmallProjects: !!f.smallProjects,

    // Foundation Profile
    hasOwnWebsite: !!f.websiteUrl && !isRegistryUrl(f.websiteUrl),
    hasFounded: f.founded != null,
    hasBoardMembers: !!(f.boardMembers && f.boardMembers.length > 0),
    hasAddress: !!f.contact?.address,
    hasSourceLinks: !!(f.sourceLinks && f.sourceLinks.length > 0),
  };
}

interface ReadinessResult {
  /** Composite score 0-100 */
  score: number;
  /** Per-dimension scores */
  dimensions: Record<string, { score: number; max: number }>;
  /** Quality tier derived from score */
  tier: QualityTier;
  /** Per-check details for UI inspection */
  checks: (CheckDetail & { dimension: string })[];
  /** Top improvements: unpassed checks sorted by points descending */
  topImprovements: { label: string; points: number; dimension: string }[];
}

export const TIER_FROM_LEVEL: Record<number, QualityTier> = {
  5: 'anwendungsbereit',
  4: 'recherchiert',
  3: 'profiliert',
  2: 'erfasst',
  1: 'verzeichnet',
};

/** Compute readiness score from foundation data */
export function computeReadinessScore(f: Foundation): ReadinessResult {
  const input = foundationToReadinessInput(f);
  const result = evaluateEngine(READINESS_ENGINE, input);

  // Build dimension map with max scores
  const dimensions: Record<string, { score: number; max: number }> = {};
  for (const dim of READINESS_ENGINE.dimensions) {
    dimensions[dim.id] = {
      score: result.dimensions[dim.id] ?? 0,
      max: dim.maxScore,
    };
  }

  // Top improvements: unpassed checks, highest points first
  const topImprovements = result.checks
    .filter(c => !c.passed)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(c => ({ label: c.label, points: c.points, dimension: c.dimension }));

  return {
    score: result.score,
    dimensions,
    tier: TIER_FROM_LEVEL[result.displayLevel] ?? 'verzeichnet',
    checks: result.checks,
    topImprovements,
  };
}

/** Convert a readiness score to a quality tier label */
export function readinessToTier(score: number): QualityTier {
  for (const t of READINESS_ENGINE.display.thresholds) {
    if (score >= t.minScore) {
      return TIER_FROM_LEVEL[t.level] ?? 'verzeichnet';
    }
  }
  return 'verzeichnet';
}

// ============================================================================
// Priority
// ============================================================================

interface PriorityResult {
  /** Composite score 0-100 */
  score: number;
  /** Component breakdown for inspection */
  components: {
    fitNorm: number;     // 0-1 (fitScore/10)
    readiness: number;   // 0-100
    base: number;        // before penalties
    multiplier: number;  // worst applicable penalty
    grantBonus: number;  // 0-15
    penaltyReason: string | null;
  };
  /** Priority level 1-4 */
  level: 1 | 2 | 3 | 4;
  /** Display label (P1-P4) */
  label: string;
  /** Description */
  description: string;
  /** Whether this is a manual override */
  isOverride: boolean;
}

/** Compute priority score from fit + readiness + accessibility signals */
export function computePriorityScore(f: Foundation, readinessScore?: number): PriorityResult {
  const cfg = PRIORITY_FORMULA;

  // Check for manual override first
  if (f.priorityOverride && f.priority >= 1 && f.priority <= 4) {
    const level = f.priority as 1 | 2 | 3 | 4;
    const display = cfg.display.find(d => d.level === level);
    return {
      score: level === 1 ? 85 : level === 2 ? 57 : level === 3 ? 30 : 10,
      components: {
        fitNorm: f.fitScore / 10,
        readiness: readinessScore ?? 0,
        base: 0,
        multiplier: 1,
        grantBonus: 0,
        penaltyReason: null,
      },
      level,
      label: display?.label ?? `P${level}`,
      description: display?.description ?? cfg.defaultDescription,
      isOverride: true,
    };
  }

  // Computed priority — fitScore (0-10) is the canonical fit field
  const fitNorm = Math.min(f.fitScore / 10, 1);
  const readiness = readinessScore ?? computeReadinessScore(f).score;

  // Base: fit gates, readiness scales within the gate
  const base = fitNorm * (cfg.baseFitFloor + cfg.readinessScale * readiness / 100);

  // Penalties: use the harshest applicable one (min), not multiply
  let multiplier = 1;
  let penaltyReason: string | null = null;

  const penalties: { condition: boolean; value: number; reason: string }[] = [
    { condition: !!f.isOperative, value: cfg.penalties.operative, reason: 'Operative Stiftung' },
    { condition: f.acceptsApplications === 'no', value: cfg.penalties.noApplications, reason: 'Keine Gesuche' },
    { condition: f.status === 'closed', value: cfg.penalties.closed, reason: 'Geschlossen' },
    { condition: f.acceptsApplications === 'invitation_only', value: cfg.penalties.invitationOnly, reason: 'Nur auf Einladung' },
  ];

  for (const p of penalties) {
    if (p.condition && p.value < multiplier) {
      multiplier = p.value;
      penaltyReason = p.reason;
    }
  }

  // Grant size bonus
  const grantBonus = computeGrantBonus(f);

  const score = Math.min(100, Math.max(0, base * multiplier + grantBonus));

  // Map to P-level
  let level: 1 | 2 | 3 | 4 = cfg.defaultLevel;
  let label: string = cfg.defaultLabel;
  let description: string = cfg.defaultDescription;
  for (const d of cfg.display) {
    if (score >= d.minScore) {
      level = d.level;
      label = d.label;
      description = d.description;
      break;
    }
  }

  return {
    score: Math.round(score),
    components: { fitNorm, readiness, base, multiplier, grantBonus, penaltyReason },
    level,
    label,
    description,
    isOverride: false,
  };
}

// ============================================================================
// Grant bonus
// ============================================================================

function computeGrantBonus(f: Foundation): number {
  const cfg = PRIORITY_FORMULA.grantMatch;
  const grantMin = f.amount?.min;
  const grantMax = f.amount?.max;

  // No amount data → no bonus
  if (grantMin == null && grantMax == null) return 0;

  const max = grantMax ?? grantMin ?? 0;
  const min = grantMin ?? 0;

  // Perfect: their range overlaps our target range
  if (max >= cfg.targetMin && min <= cfg.targetMax) return cfg.perfectBonus;

  // Close: their max is at least half our minimum
  if (max >= cfg.targetMin / 2) return cfg.closeBonus;

  // Some amount known but small
  if (max > 0) return cfg.smallBonus;

  return 0;
}
