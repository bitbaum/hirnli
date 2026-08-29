/**
 * Trust Levels — How confident are we in a foundation's data?
 *
 * Derived from existing fields (source, researchDepth). No new schema.
 * Computed at render time, not stored.
 *
 * The trust gradient:
 *   verified   — human researched, data manually confirmed
 *   assessed   — algorithmic + authoritative source, plausible but not confirmed
 *   unverified — LLM-assigned themes/scores from register text only
 */

import type { Foundation } from '../schemas/foundation';
import type { SourceId } from '../schemas/foundation';

export type TrustLevel = 'verified' | 'assessed' | 'unverified';

/** Sources considered human-verified */
const VERIFIED_SOURCES: SourceId[] = ['manual', 'cantonal'];

/** Sources with authoritative data (directories with editorial oversight) */
const ASSESSED_SOURCES: SourceId[] = ['website', 'esa', 'fundraiso', 'stiftungschweiz'];

/** Derive trust level from existing foundation fields */
export function getTrustLevel(f: Foundation): TrustLevel {
  if (VERIFIED_SOURCES.includes(f.source) || f.researchDepth === 'deep') {
    return 'verified';
  }
  if (ASSESSED_SOURCES.includes(f.source) || f.researchDepth === 'standard') {
    return 'assessed';
  }
  return 'unverified';
}

/** Ordered list of all trust levels — use instead of Object.keys(TRUST_CONFIG) */
export const TRUST_LEVELS: readonly TrustLevel[] = ['verified', 'assessed', 'unverified'];

/** Display configuration per trust level */
export const TRUST_CONFIG: Record<
  TrustLevel,
  {
    label: string;
    description: string;
    dotColor: string;
    badgeClass: string;
  }
> = {
  verified: {
    label: 'Verifiziert',
    description: 'Manuell recherchiert und geprüft',
    dotColor: 'text-success',
    badgeClass: 'bg-success-bg text-success',
  },
  assessed: {
    label: 'Geprüft',
    description: 'Automatisch geprüft, nicht manuell verifiziert',
    dotColor: 'text-warning',
    badgeClass: 'bg-warning-bg text-warning',
  },
  unverified: {
    label: 'Ungeprüft',
    description: 'Nur Registerdaten — Scores nicht verlässlich',
    dotColor: 'text-text-muted',
    badgeClass: 'bg-grey-light text-text-muted',
  },
};
