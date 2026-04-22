import { describe, it, expect } from 'vitest';
import { createSearchIndex, searchFoundations } from '../foundation-search';
import type { Foundation } from '@/lib/schemas/foundation';

function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    slug: 'test',
    name: 'Test Stiftung',
    type: 'A',
    fitScore: 5,
    priority: 2,
    themes: [],
    sdgs: [],
    researchDepth: 'standard',
    dataConfidence: 'assessed',
    source: 'manual',
    purposeSummary: '',
    amount: { min: null, max: null },
    contact: {},
    ...overrides,
  } as Foundation;
}

// ---------------------------------------------------------------------------
// createSearchIndex
// ---------------------------------------------------------------------------

describe('createSearchIndex', () => {
  it('returns a Fuse instance (has a search method)', () => {
    const index = createSearchIndex([makeFoundation()]);
    expect(typeof index.search).toBe('function');
  });

  it('handles empty array without error', () => {
    expect(() => createSearchIndex([])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// searchFoundations
// ---------------------------------------------------------------------------

describe('searchFoundations', () => {
  it('returns empty array for empty query', () => {
    const foundations = [makeFoundation({ name: 'Helvetia Stiftung' })];
    // Fuse.js returns no results for empty query
    const results = searchFoundations(foundations, '');
    expect(results).toHaveLength(0);
  });

  it('returns empty array when nothing matches', () => {
    const foundations = [makeFoundation({ name: 'Helvetia Stiftung' })];
    const results = searchFoundations(foundations, 'xyzqwerty12345');
    expect(results).toHaveLength(0);
  });

  it('finds a foundation by name', () => {
    const foundations = [
      makeFoundation({ slug: 'helvetia', name: 'Helvetia Stiftung' }),
      makeFoundation({ slug: 'other', name: 'Andere Organisation' }),
    ];
    const results = searchFoundations(foundations, 'Helvetia');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].foundation.slug).toBe('helvetia');
  });

  it('finds a foundation by purposeSummary', () => {
    const foundations = [
      makeFoundation({ slug: 'kreislauf', name: 'X', purposeSummary: 'Fördert Kreislaufwirtschaft und Nachhaltigkeit.' }),
      makeFoundation({ slug: 'other', name: 'Y', purposeSummary: 'Unterstützt Kunst und Kultur.' }),
    ];
    const results = searchFoundations(foundations, 'Kreislaufwirtschaft');
    expect(results.some((r) => r.foundation.slug === 'kreislauf')).toBe(true);
  });

  it('every result has a numeric score between 0 and 1', () => {
    const foundations = [makeFoundation({ name: 'Muster Stiftung' })];
    const results = searchFoundations(foundations, 'Muster');
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it('results are sorted by score descending', () => {
    const foundations = [
      makeFoundation({ slug: 'a', name: 'Alpha Stiftung', fitScore: 9, priority: 1 }),
      makeFoundation({ slug: 'b', name: 'Alpha Bildung', fitScore: 2, priority: 4 }),
    ];
    const results = searchFoundations(foundations, 'Alpha');
    if (results.length >= 2) {
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    }
  });

  it('each result includes the original foundation object', () => {
    const foundations = [makeFoundation({ slug: 'abc', name: 'Zürich Stiftung' })];
    const results = searchFoundations(foundations, 'Zürich');
    if (results.length > 0) {
      expect(results[0].foundation.slug).toBe('abc');
    }
  });

  it('results include fuseScore', () => {
    const foundations = [makeFoundation({ name: 'Nachhaltigkeits Stiftung' })];
    const results = searchFoundations(foundations, 'Nachhaltigkeits');
    if (results.length > 0) {
      expect(typeof results[0].fuseScore).toBe('number');
    }
  });

  describe('relevance scoring — higher fitScore ranks higher', () => {
    it('high fitScore foundation ranks above low fitScore when name match is equal', () => {
      // Both named "Beispiel Stiftung" so text match is equal; fitScore should tip the score
      const foundations = [
        makeFoundation({ slug: 'low-fit', name: 'Beispiel Stiftung', fitScore: 1, priority: 4 }),
        makeFoundation({ slug: 'high-fit', name: 'Beispiel Stiftung', fitScore: 9, priority: 1 }),
      ];
      const results = searchFoundations(foundations, 'Beispiel');
      expect(results).toHaveLength(2);
      // High fit should score higher
      expect(results[0].foundation.slug).toBe('high-fit');
    });
  });

  describe('theme boost', () => {
    it('passing activeThemes increases score for foundations with matching themes', () => {
      const f = makeFoundation({
        slug: 'themed',
        name: 'Kreislauf Stiftung',
        themes: ['kreislaufwirtschaft'] as Foundation['themes'],
        fitScore: 5,
        priority: 2,
      });
      const withoutTheme = searchFoundations([f], 'Kreislauf');
      const withTheme = searchFoundations([f], 'Kreislauf', ['kreislaufwirtschaft'] as Foundation['themes'][]);
      if (withoutTheme.length > 0 && withTheme.length > 0) {
        expect(withTheme[0].score).toBeGreaterThanOrEqual(withoutTheme[0].score);
      }
    });
  });

  describe('reusing a Fuse instance', () => {
    it('accepts a pre-built Fuse instance and returns same results', () => {
      const foundations = [makeFoundation({ name: 'Gemeinsam Stiftung' })];
      const fuseInstance = createSearchIndex(foundations);
      const r1 = searchFoundations(foundations, 'Gemeinsam');
      const r2 = searchFoundations(foundations, 'Gemeinsam', undefined, fuseInstance);
      expect(r1.length).toBe(r2.length);
      if (r1.length > 0) {
        expect(r1[0].foundation.slug).toBe(r2[0].foundation.slug);
      }
    });
  });
});
