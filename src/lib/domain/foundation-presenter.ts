/**
 * Foundation Presenter — computes all display values from a Foundation in one call.
 * Centralizes the 3 domain calls (readiness, trust, fit) that every foundation
 * component needs, so changing the display model requires editing one place.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { QualityTier } from '@/lib/schemas/foundation';
import { computeReadinessScore } from './foundation-scores';
import { getFitLevel } from './foundation-helpers';
import { getTrustLevel, TRUST_CONFIG } from '@/lib/config/trust-levels';
import { TIER_LABELS, TIER_COLORS } from './foundation-helpers';
import type { TrustLevel } from '@/lib/config/trust-levels';

export interface FoundationPresentation {
  tier: QualityTier;
  tierLabel: string;
  tierColor: string;
  readinessScore: number;
  fitLevel: 0 | 1 | 2 | 3;
  trust: TrustLevel;
  trustDisplay: typeof TRUST_CONFIG[TrustLevel];
}

export function getFoundationPresentation(f: Foundation): FoundationPresentation {
  const readiness = computeReadinessScore(f);
  const tier = readiness.tier;
  const fitLevel = getFitLevel(f);
  const trust = getTrustLevel(f);
  return {
    tier,
    tierLabel: TIER_LABELS[tier],
    tierColor: TIER_COLORS[tier],
    readinessScore: readiness.score,
    fitLevel,
    trust,
    trustDisplay: TRUST_CONFIG[trust],
  };
}
