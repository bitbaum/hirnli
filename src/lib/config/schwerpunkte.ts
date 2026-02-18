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

export interface Schwerpunkt {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
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
    color: '#10b981',
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
    color: '#8b5cf6',
    description: 'Arbeitsintegration, Second Chance, Reintegration, Inklusion',
    storyThemes: ['sozial'] as ThemeKey[],
    themeIds: ['soziale-integration', 'arbeitsintegration', 'jugend'] as ThemeId[],
    pillar: 'Soziale Integration',
  },
  'digitale-bildung': {
    id: 'digitale-bildung',
    label: 'Digitale Bildung & Teilhabe',
    shortLabel: 'Digitale Bildung',
    icon: '\u{1F4BB}',
    color: '#3b82f6',
    description: 'Digital Literacy, IT-Kompetenzen, Medienkompetenz, AI-Literacy',
    storyThemes: ['bildung'] as ThemeKey[],
    themeIds: ['digitale-bildung'] as ThemeId[],
    pillar: 'Bildung & Aufklärung',
  },
  'digitale-souveraenitaet': {
    id: 'digitale-souveraenitaet',
    label: 'Digitale Souveränität',
    shortLabel: 'Digitale Souveränität',
    icon: '\u{1F510}',
    color: '#6366f1',
    description: 'Open Source, Linux, Datenhoheit, souveräne IT-Infrastruktur',
    storyThemes: ['digital'] as ThemeKey[],
    themeIds: ['digitale-souveraenitaet'] as ThemeId[],
    pillar: 'Digitale Souveränität',
  },
} as const satisfies Record<string, Schwerpunkt>;

export type SchwerpunktId = keyof typeof SCHWERPUNKTE;
export const SCHWERPUNKT_IDS = Object.keys(SCHWERPUNKTE) as SchwerpunktId[];
