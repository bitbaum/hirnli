/**
 * The theme vocabulary every tenant's story is written in.
 *
 * Separate from `story-engine.ts` for a boundary reason, not a tidiness one:
 * the engine reads `org_content`, so importing it pulls the database client,
 * and one of the Gesuch components is a client component. Importing a VALUE
 * from the engine there fails the build with "Can't resolve 'dns'" — a
 * confusing error a long way from its cause.
 *
 * This module holds only platform taxonomy: which story theme a foundation's
 * theme id maps to, which theme wins when several match, and which competency
 * slot each draws on. None of it is any tenant's content, so it is safe
 * everywhere, and content-free is exactly what makes it safe.
 */

import type { ThemeId } from '@/lib/schemas/foundation';

export type ThemeKey = 'klima' | 'kreislaufwirtschaft' | 'sozial' | 'bildung' | 'digital';

/** Which story theme a foundation's theme id maps to. */
export const THEME_ID_TO_STORY_KEY: Record<ThemeId, ThemeKey> = {
  klima: 'klima',
  kreislaufwirtschaft: 'kreislaufwirtschaft',
  'soziale-integration': 'sozial',
  'digitale-bildung': 'bildung',
  'digitale-souveraenitaet': 'digital',
  zuerich: 'klima', // Geographic — use foundation's other themes first
  arbeitsintegration: 'sozial',
};

/** Priority order for selecting primary theme (last = richest story content) */
export const THEME_PRIORITY: ThemeKey[] = [
  'digital',
  'bildung',
  'kreislaufwirtschaft',
  'sozial',
  'klima',
];

/**
 * Which competency slot a theme draws on.
 *
 * Taxonomy rather than content: the five themes are the vocabulary every
 * tenant's story is written in, which is exactly why this mapping can live in
 * code while the sections it points at cannot.
 */
export const THEME_COMPETENCY = {
  klima: 'environmental',
  kreislaufwirtschaft: 'technical',
  sozial: 'social',
  bildung: 'bildung',
  digital: 'digital',
} as const satisfies Record<ThemeKey, string>;
