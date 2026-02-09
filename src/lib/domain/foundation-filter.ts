import type { Foundation, ThemeId, FoundationType, FoundationStatus } from '../schemas/foundation';

export interface FoundationFilters {
  themes: ThemeId[];
  types: FoundationType[];
  statuses: FoundationStatus[];
  fit: number | null;
  search: string;
  hideOperative: boolean;
  hideNetworks: boolean;
  hideNoApplication: boolean;
  onlyResearched: boolean;
}

export const DEFAULT_FILTERS: FoundationFilters = {
  themes: [],
  types: [],
  statuses: [],
  fit: null,
  search: '',
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
    // Theme filter (OR logic — matches if foundation has ANY selected theme)
    if (filters.themes.length > 0) {
      if (!filters.themes.some((t) => f.themes.includes(t))) return false;
    }

    // Type filter
    if (filters.types.length > 0) {
      if (!filters.types.includes(f.type)) return false;
    }

    // Status filter
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(f.status)) return false;
    }

    // Fit filter
    if (filters.fit !== null) {
      if (f.fit < filters.fit) return false;
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
