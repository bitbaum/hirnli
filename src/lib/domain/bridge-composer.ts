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
 * Strip prefix and return the first meaningful sentence from a purposeSummary.
 * Handles:
 *   - ESA format: "Foundation Name (City, Canton): , Description..."
 *   - Statute format: "Zweck der Stiftung ist: - Bullet 1 - Bullet 2"
 *   - Double-prefix: "Name (City): Zweck der Stiftung ist: - Bullet 1 - Bullet 2"
 * Returns the first sentence (by period) or first bullet point (by " - " separator).
 */
export function extractPurposeCore(purposeSummary: string): string {
  // Strip "FoundationName (Location): " prefix if present (ESA format)
  const colonIdx = purposeSummary.indexOf(': ');
  let stripped = colonIdx > -1
    ? purposeSummary.slice(colonIdx + 2).replace(/^,\s*/, '').trim()
    : purposeSummary;

  // Handle double-prefix: "Zweck der Stiftung ist: - Bullet 1..." or similar statute preambles.
  // If no period appears before a ": - " pattern, the whole prefix is a heading — strip it.
  const doublePrefixMatch = stripped.match(/^([^.]+):\s*-\s([\s\S]+)/);
  if (doublePrefixMatch) {
    stripped = '- ' + doublePrefixMatch[2];
  }

  // Strip leading bullet/dash marker (statute-style bullet lists)
  stripped = stripped.replace(/^[-•]\s*/, '').trim();

  // Take first sentence (period) — prefer this over bullet split
  const dotIdx = stripped.indexOf('.');
  // Take first bullet item if no period or period comes after the bullet split
  const bulletIdx = stripped.indexOf(' - ');

  if (dotIdx > -1 && (bulletIdx === -1 || dotIdx < bulletIdx)) {
    return stripped.slice(0, dotIdx).trim();
  }
  if (bulletIdx > -1) {
    return stripped.slice(0, bulletIdx).trim();
  }
  return stripped.trim();
}

/** Build a bridge sentence connecting foundation purpose to Revamp-IT */
export function buildFoundationBridge(foundation: Foundation, primaryThemeLabel: string): string {
  const purposeCore = foundation.purposeSummary
    ? extractPurposeCore(foundation.purposeSummary)
    : '';

  if (purposeCore) {
    // Purpose is already shown as the hero description above — bridge only states the connection
    return `${ORG_PROFILE.name} adressiert genau dieses Anliegen: mit ${ORG_PROFILE.experienceLabel} in ${primaryThemeLabel}.`;
  }
  return `${ORG_PROFILE.name} ist seit über ${ORG_PROFILE.yearsActive} Jahren aktiv in ${primaryThemeLabel} — genau dem Bereich, den ${foundation.name} fördert.`;
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
