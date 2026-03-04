import type { Foundation, ThemeId, FoundationType, FoundationStatus, QualityTier } from '../schemas/foundation';
import type { SchwerpunktId } from '../config/schwerpunkte';
import { SCHWERPUNKTE } from '../config/schwerpunkte';
import { getQualityTier, tierAtLeast } from './foundation-helpers';
import { computePriorityScore } from './foundation-scores';

export type ThemeLogic = 'or' | 'and';

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
  minTier: 'profiliert',
};

// ============================================================================
// Quick-view presets — preset filter combos for common sidebar actions
// ============================================================================

export type FilterPresetId = 'bewerbungsbereit' | 'hoher-fit' | 'alle';

export interface FilterPreset {
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
    id: 'alle',
    label: 'Alle anzeigen',
    description: 'Keine Einschränkungen',
    filters: { minTier: 'verzeichnet' },
  },
];

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

    // Fit filter — multi-select: foundation must match one of the selected fit values
    if (filters.fit.length > 0) {
      if (!filters.fit.includes(f.fit)) return false;
    }

    // Priority level filter — computed priority P1-P4
    if (filters.priorityLevels.length > 0) {
      const p = computePriorityScore(f);
      if (!filters.priorityLevels.includes(p.level)) return false;
    }

    // Hide operative foundations
    if (filters.hideOperative && f.isOperative) return false;

    // Hide networks
    if (filters.hideNetworks && f.isNetwork) return false;

    // Hide foundations without application method
    if (filters.hideNoApplication && (f.applicationMethod === 'unknown' || f.applicationMethod === 'none')) return false;

    // Minimum quality tier filter
    if (!tierAtLeast(getQualityTier(f), filters.minTier)) return false;

    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = `${f.name} ${f.tagline} ${f.region} ${f.purposeSummary || ''}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

export type SortField = 'priority' | 'fit' | 'name' | 'deadline';
export type SortDirection = 'asc' | 'desc';

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
        // Higher computed priority score = higher priority → sort descending by score
        cmp = computePriorityScore(b).score - computePriorityScore(a).score;
        break;
      case 'fit':
        // Higher fit first, but fit=0 (unassessed) sorts last
        // Remap: 0 → -1 so it sorts below fit=1
        cmp = (b.fit || -1) - (a.fit || -1);
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
