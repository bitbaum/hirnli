/**
 * Schwerpunkte Configuration — SSOT for thematic focus areas
 *
 * Maps Revamp-IT's strategic pillars to story themes and foundation theme IDs.
 * Used by Schwerpunkt-based Gesuch templates to generate theme-focused content.
 *
 * Each Schwerpunkt combines:
 * - Story themes (ThemeKey from stories.ts) → controls WHY/HOW/WHAT content
 * - Foundation theme IDs (ThemeId from foundation schema) → controls template foundation themes
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */

import type { ThemeKey } from '@/lib/config/stories';
import type { ThemeId } from '@/lib/schemas/foundation';
import { THEME_COLORS } from '@/lib/config/chart-colors';

export interface Schwerpunkt {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  /** Tailwind border class for pillar cards (full literal for JIT scanner) */
  borderClass: string;
  description: string;
  storyThemes: ThemeKey[];
  themeIds: ThemeId[];
  pillar: string;
}

export const SCHWERPUNKTE = {
  nachhaltigkeit: {
    id: 'nachhaltigkeit',
    label: 'Nachhaltigkeit & Kreislaufwirtschaft',
    shortLabel: 'Nachhaltigkeit',
    icon: '\u267B\uFE0F',
    color: THEME_COLORS.klima,
    borderClass: 'border-l-theme-klima',
    description: 'Klimaschutz, CO\u2082-Reduktion, Kreislaufwirtschaft, E-Waste-Vermeidung',
    storyThemes: ['klima', 'kreislaufwirtschaft'] as ThemeKey[],
    themeIds: ['klima', 'kreislaufwirtschaft'] as ThemeId[],
    pillar: 'Umweltschutz',
  },
  'soziale-integration': {
    id: 'soziale-integration',
    label: 'Soziale Integration & Arbeitsmarkt',
    shortLabel: 'Soziale Integration',
    icon: '\u{1F91D}',
    color: THEME_COLORS.soziale_integration,
    borderClass: 'border-l-theme-sozial',
    description: 'Arbeitsintegration, Second Chance, Reintegration, Inklusion',
    storyThemes: ['sozial'] as ThemeKey[],
    themeIds: ['soziale-integration', 'arbeitsintegration'] as ThemeId[],
    pillar: 'Soziale Integration',
  },
  'digitale-bildung': {
    id: 'digitale-bildung',
    label: 'Digitale Bildung & Teilhabe',
    shortLabel: 'Digitale Bildung',
    icon: '\u{1F4BB}',
    color: THEME_COLORS.digitale_bildung,
    borderClass: 'border-l-theme-bildung',
    description: 'Digital Literacy, IT-Kompetenzen, Medienkompetenz, AI-Literacy, Wissensplattform',
    storyThemes: ['bildung'] as ThemeKey[],
    themeIds: ['digitale-bildung'] as ThemeId[],
    pillar: 'Bildung & Aufklärung',
  },
  'digitale-souveraenitaet': {
    id: 'digitale-souveraenitaet',
    label: 'Digitale Souveränität',
    shortLabel: 'Digitale Souveränität',
    icon: '\u{1F510}',
    color: THEME_COLORS.digitale_souveraenitaet,
    borderClass: 'border-l-theme-digital',
    description: 'Open Source, Linux, Datenhoheit, souveräne IT-Infrastruktur, eigene Community-Plattform',
    storyThemes: ['digital'] as ThemeKey[],
    themeIds: ['digitale-souveraenitaet'] as ThemeId[],
    pillar: 'Digitale Souveränität',
  },
} as const satisfies Record<string, Schwerpunkt>;

export type SchwerpunktId = keyof typeof SCHWERPUNKTE;
export const SCHWERPUNKT_IDS = Object.keys(SCHWERPUNKTE) as SchwerpunktId[];
export function isSchwerpunktId(id: string): id is SchwerpunktId {
  return id in SCHWERPUNKTE;
}

/**
 * Theme Hierarchy — SSOT for core vs secondary theme classification
 *
 * Core = direct org capabilities (each maps 1:1 to a Schwerpunkt's primary theme)
 * Secondary = broader contexts + geographic signal (umbrella themes, not distinct capabilities)
 *
 * Consumed by fit-scoring.ts to weight theme matches.
 * If you add/remove a Schwerpunkt, update this accordingly.
 */
export const THEME_HIERARCHY = {
  core: [
    'arbeitsintegration',
    'kreislaufwirtschaft',
    'digitale-bildung',
    'digitale-souveraenitaet',
  ],
  secondary: [
    'soziale-integration',
    'klima',
    'zuerich',
  ],
} as const satisfies Record<string, readonly ThemeId[]>;
