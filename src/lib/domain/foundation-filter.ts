// Foundation Filtering — Sort and filter using stored and computed scores
// Fit display: getFitLevel(f) from foundation-helpers.ts
// Priority: f.priority (stored SSOT — sync script recomputes before generating TS file)

import type {
  Foundation,
  ThemeId,
  FoundationType,
  FoundationStatus,
  QualityTier,
} from '../schemas/foundation';
import type { SchwerpunktId } from '../config/schwerpunkte';
import { SCHWERPUNKTE } from '../config/schwerpunkte';
import {
  getQualityTier,
  tierAtLeast,
  getFitLevel,
  hasGesuchPage,
  hasGesuchDataGaps,
} from './foundation-helpers';
import { getTrustLevel, type TrustLevel } from '../config/trust-levels';

type ThemeLogic = 'or' | 'and';

export interface FoundationFilters {
  themes: ThemeId[];
  themeLogic: ThemeLogic;
  types: FoundationType[];
  statuses: FoundationStatus[];
  fit: number[];
  priorityLevels: number[];
  search: string;
  schwerpunkt: SchwerpunktId | null;
  hideOperative: boolean;
  hideNetworks: boolean;
  hideNoApplication: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  requireAddress: boolean;
  requireDataGaps: boolean;
  /** Only foundations with a generated Gesuch page (the "Mit Gesuch" tile) */
  requireGesuch: boolean;
  trustLevels: TrustLevel[];
  minTier: QualityTier;
}

export const DEFAULT_FILTERS: FoundationFilters = {
  themes: [],
  themeLogic: 'or',
  types: [],
  statuses: [],
  fit: [],
  priorityLevels: [],
  search: '',
  schwerpunkt: null,
  hideOperative: false,
  hideNetworks: false,
  hideNoApplication: false,
  requireEmail: false,
  requirePhone: false,
  requireAddress: false,
  requireDataGaps: false,
  requireGesuch: false,
  trustLevels: [],
  minTier: 'profiliert',
};

// ============================================================================
// Quick-view presets — preset filter combos for common sidebar actions
// ============================================================================

export type FilterPresetId =
  'bewerbungsbereit' | 'hoher-fit' | 'mit-email' | 'mit-luecken' | 'alle';

interface FilterPreset {
  id: FilterPresetId;
  label: string;
  description: string;
  /** Partial filter state to apply (unset fields use DEFAULT_FILTERS) */
  filters: Partial<FoundationFilters>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'bewerbungsbereit',
    label: 'Bewerbungsbereit',
    description: 'Höchste Datenvollständigkeit',
    filters: { minTier: 'anwendungsbereit' },
  },
  {
    id: 'hoher-fit',
    label: 'Hoher Fit',
    description: 'Fit ★★★ oder ★★☆',
    filters: { fit: [3, 2] },
  },
  {
    id: 'mit-email',
    label: 'Mit E-Mail',
    description: 'Nur Stiftungen mit E-Mail-Adresse',
    filters: { requireEmail: true },
  },
  {
    id: 'mit-luecken',
    label: 'Lücken füllen',
    description: 'Gesuch-Seiten mit dünnen Quelldaten',
    filters: { requireDataGaps: true },
  },
  {
    id: 'alle',
    label: 'Alle anzeigen',
    description: 'Keine Einschränkungen',
    filters: { minTier: 'verzeichnet' },
  },
];

/**
 * Find which preset (if any) the current filter state matches.
 * Returns undefined when the user has manually customised filters beyond any preset.
 */
export function findActivePreset(filters: FoundationFilters): FilterPreset | undefined {
  return FILTER_PRESETS.find((preset) => {
    const pf = preset.filters;
    const matchesTier = pf.minTier
      ? filters.minTier === pf.minTier
      : filters.minTier === DEFAULT_FILTERS.minTier;
    const matchesFit = pf.fit
      ? JSON.stringify(filters.fit) === JSON.stringify(pf.fit)
      : filters.fit.length === 0;
    const matchesPriority = pf.priorityLevels
      ? JSON.stringify(filters.priorityLevels) === JSON.stringify(pf.priorityLevels)
      : filters.priorityLevels.length === 0;
    const matchesEmail = pf.requireEmail
      ? filters.requireEmail === pf.requireEmail
      : !filters.requireEmail;
    const matchesPhone = pf.requirePhone
      ? filters.requirePhone === pf.requirePhone
      : !filters.requirePhone;
    const matchesAddress = pf.requireAddress
      ? filters.requireAddress === pf.requireAddress
      : !filters.requireAddress;
    const matchesDataGaps = pf.requireDataGaps
      ? filters.requireDataGaps === pf.requireDataGaps
      : !filters.requireDataGaps;
    const noOtherFilters =
      !filters.requireGesuch &&
      filters.themes.length === 0 &&
      filters.types.length === 0 &&
      filters.statuses.length === 0 &&
      !filters.schwerpunkt &&
      !filters.hideOperative &&
      !filters.hideNetworks &&
      !filters.hideNoApplication &&
      !filters.search;
    return (
      matchesTier &&
      matchesFit &&
      matchesPriority &&
      matchesEmail &&
      matchesPhone &&
      matchesAddress &&
      matchesDataGaps &&
      noOtherFilters
    );
  });
}

/** Filter foundations by criteria */
export function filterFoundations(
  foundations: Foundation[],
  filters: FoundationFilters,
): Foundation[] {
  return foundations.filter((f) => {
    // Theme filter — OR: foundation has ANY selected theme; AND: foundation has ALL
    if (filters.themes.length > 0) {
      if (filters.themeLogic === 'and') {
        if (!filters.themes.every((t) => f.themes.includes(t))) return false;
      } else {
        if (!filters.themes.some((t) => f.themes.includes(t))) return false;
      }
    }

    // Schwerpunkt filter — foundation must have at least one of the schwerpunkt's themeIds
    if (filters.schwerpunkt) {
      const sp = SCHWERPUNKTE[filters.schwerpunkt];
      if (!sp.themeIds.some((t) => f.themes.includes(t))) return false;
    }

    // Type filter
    if (filters.types.length > 0) {
      if (!filters.types.includes(f.type)) return false;
    }

    // Status filter
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(f.status)) return false;
    }

    // Fit filter — multi-select: foundation must match one of the selected fit display levels (0-3)
    if (filters.fit.length > 0) {
      if (!filters.fit.includes(getFitLevel(f))) return false;
    }

    // Priority level filter — use stored priority (SSOT: DB → sync → generated file)
    if (filters.priorityLevels.length > 0) {
      if (!filters.priorityLevels.includes(f.priority)) return false;
    }

    // Hide operative foundations
    if (filters.hideOperative && f.isOperative) return false;

    // Hide networks
    if (filters.hideNetworks && f.isNetwork) return false;

    // Hide foundations without application method
    if (
      filters.hideNoApplication &&
      (f.applicationMethod === 'unknown' || f.applicationMethod === 'none')
    )
      return false;

    // Contact availability filters
    if (filters.requireEmail && !f.contact?.email) return false;
    if (filters.requirePhone && !f.contact?.phone) return false;
    if (filters.requireAddress && !f.contact?.address) return false;

    // Data gap filter — show only Gesuch-eligible foundations with incomplete source data
    if (filters.requireDataGaps && !(hasGesuchPage(f) && hasGesuchDataGaps(f))) return false;
    if (filters.requireGesuch && !hasGesuchPage(f)) return false;

    // Trust level filter
    if (filters.trustLevels.length > 0) {
      if (!filters.trustLevels.includes(getTrustLevel(f))) return false;
    }

    // Minimum quality tier filter
    if (!tierAtLeast(getQualityTier(f), filters.minTier)) return false;

    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable =
        `${f.name} ${f.tagline} ${f.region} ${f.purposeSummary || ''}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

export type SortField = 'priority' | 'fit' | 'name' | 'deadline';
type SortDirection = 'asc' | 'desc';

/** Sort foundations */
export function sortFoundations(
  foundations: Foundation[],
  field: SortField = 'priority',
  direction: SortDirection = 'asc',
): Foundation[] {
  const sorted = [...foundations];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'priority':
        // Lower stored priority level = higher priority (P1 < P2 < P3 < P4)
        cmp = a.priority - b.priority;
        break;
      case 'fit':
        // Higher fitScore first, but fitScore=0 (unassessed) sorts last
        cmp = (b.fitScore || -1) - (a.fitScore || -1);
        break;
      case 'name':
        cmp = a.name.localeCompare(b.name, 'de');
        break;
      case 'deadline':
        if (!a.deadline && !b.deadline) cmp = 0;
        else if (!a.deadline) cmp = 1;
        else if (!b.deadline) cmp = -1;
        else cmp = a.deadline.localeCompare(b.deadline);
        break;
    }
    return direction === 'desc' ? -cmp : cmp;
  });
  return sorted;
}
