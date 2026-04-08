/**
 * AI Context Builder — SSOT for what the AI knows about a foundation
 *
 * Used by:
 * - useGesuchOverrides (AI rewrite calls)
 * - Future batch scripts
 *
 * Pure function: no I/O, no side effects.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';

export interface FoundationAIContext {
  name: string;
  purpose?: string;
  type?: string;
  themes: string[];
  fitScore?: number;
  priority?: number;
  tagline?: string;
  researchNotes?: string;
  pastGrantees?: string[];
  grantRange?: { min?: number; max?: number };
  applicationProcess?: string;
  deadline?: string;
  deadlineText?: string;
  criteria?: { nature?: string; education?: string };
  partners?: string[];
  sdgs?: number[];
}

export function buildAIContext(foundation: Foundation): FoundationAIContext {
  const themes: string[] = foundation.themes.map((t) => t);

  const grantRange =
    foundation.amount.min != null || foundation.amount.max != null
      ? {
          min: foundation.amount.min ?? undefined,
          max: foundation.amount.max ?? undefined,
        }
      : undefined;

  return {
    name: foundation.name,
    purpose: foundation.purposeSummary
      ? extractPurposeCore(foundation.purposeSummary)
      : undefined,
    type: foundation.type,
    themes,
    fitScore: foundation.fitScore,
    priority: foundation.priority,
    tagline: foundation.tagline,
    researchNotes: foundation.researchNotes,
    pastGrantees: foundation.pastGrantees,
    grantRange,
    applicationProcess: foundation.applicationProcess?.join(' → '),
    deadline: foundation.deadline ?? undefined,
    deadlineText: foundation.deadlineText,
    criteria: foundation.criteria,
    partners: foundation.partners,
    sdgs: foundation.sdgs,
  };
}
