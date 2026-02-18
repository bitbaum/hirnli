import type { Foundation, ThemeId, FoundationType, FoundationStatus } from '../schemas/foundation';
import type { SchwerpunktId } from '../config/schwerpunkte';
import { SCHWERPUNKTE } from '../config/schwerpunkte';

export type ThemeLogic = 'or' | 'and';

export interface FoundationFilters {
  themes: ThemeId[];
  themeLogic: ThemeLogic;
  types: FoundationType[];
  statuses: FoundationStatus[];
  fit: number[];
  search: string;
  schwerpunkt: SchwerpunktId | null;
  hideOperative: boolean;
  hideNetworks: boolean;
  hideNoApplication: boolean;
  onlyResearched: boolean;
}

export const DEFAULT_FILTERS: FoundationFilters = {
  themes: [],
  themeLogic: 'or',
  types: [],
  statuses: [],
  fit: [],
  search: '',
  schwerpunkt: null,
  hideOperative: false,
  hideNetworks: false,
  hideNoApplication: false,
  onlyResearched: false,
};

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

    // Hide operative foundations
    if (filters.hideOperative && f.isOperative) return false;

    // Hide networks
    if (filters.hideNetworks && f.isNetwork) return false;

    // Hide foundations without application method
    if (filters.hideNoApplication && (f.applicationMethod === 'unknown' || f.applicationMethod === 'none')) return false;

    // Only show deep-researched foundations (have purposeSummary and needsResearch !== true)
    if (filters.onlyResearched && (!f.purposeSummary || f.needsResearch === true)) return false;

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
        cmp = a.priority - b.priority;
        break;
      case 'fit':
        cmp = b.fit - a.fit; // Higher fit first
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
