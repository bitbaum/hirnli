import { describe, it, expect } from 'vitest';
import {
  filterFoundations,
  sortFoundations,
  DEFAULT_FILTERS,
  FILTER_PRESETS,
} from '../foundation-filter';
import type { FoundationFilters } from '../foundation-filter';
import { makeFoundation, makeMinimalFoundation } from './fixtures';

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

  it('filters by trust level', () => {
    // default fixture: source='manual' → verified
    const data = [
      makeFoundation({ slug: 'verified', source: 'manual', researchDepth: 'deep' }),
      makeFoundation({ slug: 'assessed', source: 'website', researchDepth: 'standard' }),
      makeFoundation({ slug: 'unverified', source: 'zefix', researchDepth: 'rapid' }),
    ];
    const result = filterFoundations(data, filters({ trustLevels: ['verified'] }));
    expect(result.map(f => f.slug)).toEqual(['verified']);
  });

  it('trust level filter with multiple levels', () => {
    const data = [
      makeFoundation({ slug: 'verified', source: 'manual', researchDepth: 'deep' }),
      makeFoundation({ slug: 'assessed', source: 'website', researchDepth: 'standard' }),
      makeFoundation({ slug: 'unverified', source: 'zefix', researchDepth: 'rapid' }),
    ];
    const result = filterFoundations(data, filters({ trustLevels: ['verified', 'assessed'] }));
    expect(result.map(f => f.slug)).toEqual(['verified', 'assessed']);
  });

  it('empty trustLevels filter shows all', () => {
    const data = [
      makeFoundation({ slug: 'verified', source: 'manual', researchDepth: 'deep' }),
      makeFoundation({ slug: 'unverified', source: 'zefix', researchDepth: 'rapid' }),
    ];
    const result = filterFoundations(data, filters({ trustLevels: [] }));
    expect(result).toHaveLength(2);
  });

  it('filters by priority level', () => {
    const data = [
      makeFoundation({ slug: 'p1', priority: 1 }),
      makeFoundation({ slug: 'p2', priority: 2 }),
      makeFoundation({ slug: 'p3', priority: 3 }),
      makeFoundation({ slug: 'p4', priority: 4 }),
    ];
    const result = filterFoundations(data, filters({ priorityLevels: [1, 2] }));
    expect(result.map(f => f.slug)).toEqual(['p1', 'p2']);
  });

  it('empty priorityLevels filter shows all', () => {
    const data = [
      makeFoundation({ slug: 'p1', priority: 1 }),
      makeFoundation({ slug: 'p4', priority: 4 }),
    ];
    expect(filterFoundations(data, filters({ priorityLevels: [] }))).toHaveLength(2);
  });

  it('filters by fit display level', () => {
    // fitScore 7-10 → level 3 (★★★), 4-6 → 2, 1-3 → 1, 0 → 0
    const data = [
      makeFoundation({ slug: 'high', fitScore: 8 }),
      makeFoundation({ slug: 'mid', fitScore: 5 }),
      makeFoundation({ slug: 'low', fitScore: 2 }),
    ];
    const result = filterFoundations(data, filters({ fit: [3] }));
    expect(result.map(f => f.slug)).toEqual(['high']);
  });

  it('filters by schwerpunkt (matches any themeId in the schwerpunkt)', () => {
    // 'nachhaltigkeit' schwerpunkt covers themeIds ['klima', 'kreislaufwirtschaft']
    const data = [
      makeFoundation({ slug: 'kreislauf', themes: ['kreislaufwirtschaft'] }),
      makeFoundation({ slug: 'digital', themes: ['digitale-bildung'] }),
    ];
    const result = filterFoundations(data, filters({ schwerpunkt: 'nachhaltigkeit' }));
    expect(result.map(f => f.slug)).toEqual(['kreislauf']);
  });

  it('filters by requireEmail', () => {
    const data = [
      makeFoundation({ slug: 'with-email', contact: { email: 'a@b.ch' } }),
      makeFoundation({ slug: 'no-email', contact: { phone: '+41 44 000' } }),
    ];
    const result = filterFoundations(data, filters({ requireEmail: true }));
    expect(result.map(f => f.slug)).toEqual(['with-email']);
  });

  it('filters by requirePhone', () => {
    const data = [
      makeFoundation({ slug: 'with-phone', contact: { phone: '+41 44 000' } }),
      makeFoundation({ slug: 'no-phone', contact: { email: 'a@b.ch' } }),
    ];
    const result = filterFoundations(data, filters({ requirePhone: true }));
    expect(result.map(f => f.slug)).toEqual(['with-phone']);
  });

  it('filters by requireAddress', () => {
    const data = [
      makeFoundation({ slug: 'with-addr', contact: { address: 'Strasse 1' } }),
      makeFoundation({ slug: 'no-addr', contact: { email: 'a@b.ch' } }),
    ];
    const result = filterFoundations(data, filters({ requireAddress: true }));
    expect(result.map(f => f.slug)).toEqual(['with-addr']);
  });

  it('minTier filters out low-quality foundations', () => {
    const data = [
      makeFoundation({ slug: 'high' }),          // deep research → anwendungsbereit
      makeMinimalFoundation({ slug: 'minimal' }), // rapid, no data → verzeichnet
    ];
    // Explicitly set minTier to 'profiliert' — filters() defaults to 'verzeichnet'
    const result = filterFoundations(data, filters({ minTier: 'profiliert' }));
    expect(result.map(f => f.slug)).toEqual(['high']);
  });

  it('minTier=verzeichnet shows all tiers', () => {
    const data = [
      makeFoundation({ slug: 'high' }),
      makeMinimalFoundation({ slug: 'minimal' }),
    ];
    const result = filterFoundations(data, filters({ minTier: 'verzeichnet' }));
    expect(result).toHaveLength(2);
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

  it('sorts by priority (P1 first)', () => {
    const data = [
      makeFoundation({ slug: 'p3', priority: 3 }),
      makeFoundation({ slug: 'p1', priority: 1 }),
      makeFoundation({ slug: 'p2', priority: 2 }),
    ];
    const result = sortFoundations(data, 'priority', 'asc');
    expect(result.map(f => f.slug)).toEqual(['p1', 'p2', 'p3']);
  });

  it('sorts by deadline ascending (earliest first)', () => {
    const data = [
      makeFoundation({ slug: 'b', deadline: '2026-06-01' }),
      makeFoundation({ slug: 'c', deadline: '2026-03-01' }),
      makeFoundation({ slug: 'a', deadline: null }),
    ];
    const result = sortFoundations(data, 'deadline', 'asc');
    expect(result.map(f => f.slug)).toEqual(['c', 'b', 'a']);
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
  it('has 4 presets', () => {
    expect(FILTER_PRESETS).toHaveLength(4);
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
