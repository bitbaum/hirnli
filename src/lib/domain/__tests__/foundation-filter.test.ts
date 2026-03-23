import { describe, it, expect } from 'vitest';
import {
  filterFoundations,
  sortFoundations,
  DEFAULT_FILTERS,
  FILTER_PRESETS,
} from '../foundation-filter';
import type { FoundationFilters } from '../foundation-filter';
import { makeFoundation } from './fixtures';

function filters(overrides: Partial<FoundationFilters> = {}): FoundationFilters {
  return { ...DEFAULT_FILTERS, minTier: 'verzeichnet', ...overrides };
}

const foundations = [
  makeFoundation({ slug: 'a', name: 'Alpha', fitScore: 8, themes: ['kreislaufwirtschaft'], status: 'open' }),
  makeFoundation({ slug: 'b', name: 'Beta', fitScore: 5, themes: ['soziale-integration'], status: 'open' }),
  makeFoundation({ slug: 'c', name: 'Gamma', fitScore: 2, themes: ['kreislaufwirtschaft', 'soziale-integration'], status: 'closed' }),
];

describe('filterFoundations', () => {
  it('returns all when no filters applied', () => {
    const result = filterFoundations(foundations, filters());
    expect(result).toHaveLength(3);
  });

  it('filters by theme (OR logic)', () => {
    const result = filterFoundations(foundations, filters({
      themes: ['kreislaufwirtschaft'],
      themeLogic: 'or',
    }));
    expect(result.map(f => f.slug)).toEqual(['a', 'c']);
  });

  it('filters by theme (AND logic)', () => {
    const result = filterFoundations(foundations, filters({
      themes: ['kreislaufwirtschaft', 'soziale-integration'],
      themeLogic: 'and',
    }));
    // Only gamma has both themes
    expect(result.map(f => f.slug)).toEqual(['c']);
  });

  it('filters by status', () => {
    const result = filterFoundations(foundations, filters({
      statuses: ['closed'],
    }));
    expect(result.map(f => f.slug)).toEqual(['c']);
  });

  it('filters by type', () => {
    const mixed = [
      makeFoundation({ slug: 'x', type: 'A' }),
      makeFoundation({ slug: 'y', type: 'B' }),
    ];
    const result = filterFoundations(mixed, filters({ types: ['B'] }));
    expect(result.map(f => f.slug)).toEqual(['y']);
  });

  it('filters by text search (case-insensitive)', () => {
    const result = filterFoundations(foundations, filters({ search: 'alpha' }));
    expect(result.map(f => f.slug)).toEqual(['a']);
  });

  it('searches in name, tagline, region, purposeSummary', () => {
    const f = makeFoundation({ slug: 'x', name: 'Nope', tagline: 'findme', region: 'Basel' });
    const result = filterFoundations([f], filters({ search: 'findme' }));
    expect(result).toHaveLength(1);
  });

  it('hides operative foundations', () => {
    const data = [
      makeFoundation({ slug: 'a', isOperative: false }),
      makeFoundation({ slug: 'b', isOperative: true }),
    ];
    const result = filterFoundations(data, filters({ hideOperative: true }));
    expect(result.map(f => f.slug)).toEqual(['a']);
  });

  it('hides networks', () => {
    const data = [
      makeFoundation({ slug: 'a', isNetwork: false }),
      makeFoundation({ slug: 'b', isNetwork: true }),
    ];
    const result = filterFoundations(data, filters({ hideNetworks: true }));
    expect(result.map(f => f.slug)).toEqual(['a']);
  });

  it('hides foundations without application method', () => {
    const data = [
      makeFoundation({ slug: 'a', applicationMethod: 'email' }),
      makeFoundation({ slug: 'b', applicationMethod: 'unknown' }),
      makeFoundation({ slug: 'c', applicationMethod: 'none' }),
    ];
    const result = filterFoundations(data, filters({ hideNoApplication: true }));
    expect(result.map(f => f.slug)).toEqual(['a']);
  });

  it('handles empty foundations array', () => {
    expect(filterFoundations([], filters())).toHaveLength(0);
  });
});

describe('sortFoundations', () => {
  it('sorts by name ascending', () => {
    const result = sortFoundations(foundations, 'name', 'asc');
    expect(result.map(f => f.slug)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by name descending', () => {
    const result = sortFoundations(foundations, 'name', 'desc');
    expect(result.map(f => f.slug)).toEqual(['c', 'b', 'a']);
  });

  it('sorts by fit (highest first by default)', () => {
    const result = sortFoundations(foundations, 'fit', 'asc');
    expect(result[0].fitScore).toBeGreaterThanOrEqual(result[1].fitScore);
  });

  it('fitScore=0 sorts last', () => {
    const data = [
      makeFoundation({ slug: 'zero', fitScore: 0 }),
      makeFoundation({ slug: 'low', fitScore: 2 }),
    ];
    const result = sortFoundations(data, 'fit', 'asc');
    expect(result[result.length - 1].slug).toBe('zero');
  });

  it('handles null deadlines (sort last)', () => {
    const data = [
      makeFoundation({ slug: 'a', deadline: null }),
      makeFoundation({ slug: 'b', deadline: '2026-06-01' }),
      makeFoundation({ slug: 'c', deadline: '2026-03-01' }),
    ];
    const result = sortFoundations(data, 'deadline', 'asc');
    expect(result[result.length - 1].slug).toBe('a');
  });

  it('does not mutate original array', () => {
    const original = [...foundations];
    sortFoundations(foundations, 'name', 'desc');
    expect(foundations.map(f => f.slug)).toEqual(original.map(f => f.slug));
  });
});

describe('DEFAULT_FILTERS', () => {
  it('defaults to profiliert minimum tier', () => {
    expect(DEFAULT_FILTERS.minTier).toBe('profiliert');
  });

  it('defaults to OR theme logic', () => {
    expect(DEFAULT_FILTERS.themeLogic).toBe('or');
  });
});

describe('FILTER_PRESETS', () => {
  it('has 3 presets', () => {
    expect(FILTER_PRESETS).toHaveLength(3);
  });

  it('each preset has id, label, description, and filters', () => {
    for (const preset of FILTER_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.filters).toBeDefined();
    }
  });
});
