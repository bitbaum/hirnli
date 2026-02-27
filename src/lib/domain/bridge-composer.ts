/**
 * Bridge Composer — Connects foundation purpose to Revamp-IT relevance
 *
 * Two functions:
 * - buildFoundationBridge(): One-sentence connection between foundation + org
 * - buildSecondaryRelevance(): Per-theme connection sentences for non-primary themes
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { ThemeKey } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { THEME_ID_TO_STORY_KEY, WHY } from '@/lib/config/stories';
import { THEMES } from '@/lib/config/foundations';

const TYPE_VERBS: Record<string, string> = {
  A: 'fördert',
  B: 'unterstützt',
  C: 'engagiert sich für',
  D: 'investiert in',
  network: 'vernetzt Akteure im Bereich',
};

/**
 * Strip ESA register prefix from purposeSummary.
 * ESA format: "Foundation Name (City, Canton): , Description..." or ": Description..."
 * Returns the first sentence of the actual purpose description.
 */
export function extractPurposeCore(purposeSummary: string): string {
  // Strip "FoundationName (Location): " prefix if present
  const colonIdx = purposeSummary.indexOf(': ');
  const stripped = colonIdx > -1 ? purposeSummary.slice(colonIdx + 2).replace(/^,\s*/, '').trim() : purposeSummary;
  // Take first sentence only
  const dotIdx = stripped.indexOf('.');
  return (dotIdx > -1 ? stripped.slice(0, dotIdx) : stripped).trim();
}

/** Build a bridge sentence connecting foundation purpose to Revamp-IT */
export function buildFoundationBridge(foundation: Foundation, primaryThemeLabel: string): string {
  const verb = TYPE_VERBS[foundation.type] || 'fördert';
  const purposeCore = foundation.purposeSummary
    ? extractPurposeCore(foundation.purposeSummary)
    : '';

  if (purposeCore) {
    return `Die ${foundation.name} ${verb} ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} — ${ORG_PROFILE.name} bringt ${ORG_PROFILE.experienceLabel} in ${primaryThemeLabel} ein.`;
  }
  return `Die ${foundation.name} ${verb} Projekte im Bereich ${primaryThemeLabel} — genau dort, wo ${ORG_PROFILE.name} seit über ${ORG_PROFILE.yearsActive} Jahren wirkt.`;
}

/** Build one-sentence connection per non-primary theme */
export function buildSecondaryRelevance(
  secondaryThemes: ThemeKey[],
): { theme: ThemeKey; label: string; connection: string }[] {
  return secondaryThemes
    .map((theme) => {
      const whySection = WHY[theme];
      if (!whySection) return null;

      const solution = whySection.solution;
      const firstSentence = solution.split('.')[0].trim() + '.';

      const themeId = Object.entries(THEME_ID_TO_STORY_KEY).find(
        ([, key]) => key === theme,
      )?.[0];
      const label = themeId ? THEMES[themeId as keyof typeof THEMES]?.label ?? theme : theme;

      return { theme, label, connection: firstSentence };
    })
    .filter((r): r is { theme: ThemeKey; label: string; connection: string } => r !== null);
}
