import { describe, it, expect } from 'vitest';
import { computeSimilarity, findSimilarFoundations } from '../foundation-recommendations';
import type { Foundation } from '@/lib/schemas/foundation';

// Minimal Foundation fixture — only fields used by the similarity algorithm
function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    slug: 'test-stiftung',
    name: 'Test Stiftung',
    type: 'A',
    fitScore: 5,
    priority: 2,
    themes: [],
    sdgs: [],
    region: 'zürich',
    researchDepth: 'standard',
    dataConfidence: 'assessed',
    // Required schema fields with safe defaults
    purposeSummary: '',
    source: 'manual',
    ...overrides,
  } as Foundation;
}

// ---------------------------------------------------------------------------
// computeSimilarity
// ---------------------------------------------------------------------------

describe('computeSimilarity', () => {
  // Isolation helpers: when testing one factor, zero out all others by using
  // differing type ('X' vs 'Y'), differing regions, fitScore=0, no themes/sdgs.
  // Note: undefined === undefined for region, so use explicit different strings.

  describe('themeOverlap (weight 0.45)', () => {
    it('returns 0 for no shared themes', () => {
      const a = makeFoundation({ themes: ['kreislaufwirtschaft'] });
      const b = makeFoundation({ themes: ['arbeitsintegration'] });
      const score = computeSimilarity(a, b);
      // themeOverlap=0, typeMatch=1 (both A), fitProximity=1 (5===5), regionOverlap=1, sdgOverlap=0
      // = 0 + 0.20 + 0.15 + 0.10 = 0.45
      expect(score).toBeCloseTo(0.45, 5);
    });

    it('returns full theme weight for identical themes (all other signals zero)', () => {
      const themes = ['kreislaufwirtschaft', 'digitale-bildung'] as Foundation['themes'];
      const a = makeFoundation({ themes, type: 'B', fitScore: 0, region: 'zürich', sdgs: [] });
      const b = makeFoundation({ themes, type: 'C', fitScore: 0, region: 'bern', sdgs: [] });
      // themeOverlap=1, typeMatch=0, fitProximity=0, regionOverlap=0, sdgOverlap=0
      // = 1*0.45 = 0.45
      const score = computeSimilarity(a, b);
      expect(score).toBeCloseTo(0.45, 5);
    });

    it('uses Jaccard index for partial overlap', () => {
      // A={x,y}, B={y,z} → intersection=1, union=3 → jaccard=1/3
      const a = makeFoundation({ themes: ['kreislaufwirtschaft', 'arbeitsintegration'] as Foundation['themes'], type: 'B', fitScore: 0, region: 'zürich', sdgs: [] });
      const b = makeFoundation({ themes: ['arbeitsintegration', 'digitale-bildung'] as Foundation['themes'], type: 'B', fitScore: 0, region: 'bern', sdgs: [] });
      const score = computeSimilarity(a, b);
      // themeOverlap=1/3, typeMatch=1, fitProximity=0, regionOverlap=0, sdgOverlap=0
      // = (1/3)*0.45 + 0.20 = 0.35
      expect(score).toBeCloseTo(0.35, 5);
    });
  });

  describe('typeMatch (weight 0.20)', () => {
    it('adds 0.20 for same type (all other signals zero)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, region: 'zürich', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 0, region: 'bern', sdgs: [] });
      // typeMatch=1, all others=0
      expect(computeSimilarity(a, b)).toBeCloseTo(0.20, 5);
    });

    it('adds 0 for different type (all signals zero)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, region: 'zürich', type: 'A', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 0, region: 'bern', type: 'B', sdgs: [] });
      expect(computeSimilarity(a, b)).toBeCloseTo(0.0, 5);
    });
  });

  describe('fitProximity (weight 0.15)', () => {
    it('returns full weight for identical fit scores (type isolated)', () => {
      const a = makeFoundation({ themes: [], fitScore: 7, region: 'zürich', type: 'B', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 7, region: 'bern', type: 'B', sdgs: [] });
      // typeMatch=1, fitProximity=1 → 0.20 + 0.15 = 0.35
      expect(computeSimilarity(a, b)).toBeCloseTo(0.35, 5);
    });

    it('returns 0 fitProximity when either fitScore=0 (unassessed)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, region: 'zürich', type: 'B', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 5, region: 'bern', type: 'B', sdgs: [] });
      // fitProximity=0, typeMatch=1 → 0.20
      expect(computeSimilarity(a, b)).toBeCloseTo(0.20, 5);
    });

    it('scales linearly with score difference', () => {
      const a = makeFoundation({ themes: [], fitScore: 10, region: 'zürich', type: 'B', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 5, region: 'bern', type: 'B', sdgs: [] });
      // fitProximity = 1 - 5/10 = 0.5 → typeMatch(0.20) + 0.5*0.15 = 0.275
      expect(computeSimilarity(a, b)).toBeCloseTo(0.275, 5);
    });
  });

  describe('regionOverlap (weight 0.10)', () => {
    it('adds 0.10 for same region (all other signals zero)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, type: 'B', region: 'zürich', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 0, type: 'C', region: 'zürich', sdgs: [] });
      // typeMatch=0, regionOverlap=1 → 0.10
      expect(computeSimilarity(a, b)).toBeCloseTo(0.10, 5);
    });

    it('adds 0 for different regions (all signals zero)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, type: 'B', region: 'zürich', sdgs: [] });
      const b = makeFoundation({ themes: [], fitScore: 0, type: 'C', region: 'bern', sdgs: [] });
      expect(computeSimilarity(a, b)).toBeCloseTo(0.0, 5);
    });
  });

  describe('sdgOverlap (weight 0.10)', () => {
    it('adds 0 when either foundation has no SDGs', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, type: 'B', region: 'zürich', sdgs: [1, 2] });
      const b = makeFoundation({ themes: [], fitScore: 0, type: 'C', region: 'bern', sdgs: [] });
      // All other signals 0, sdgOverlap=0
      expect(computeSimilarity(a, b)).toBeCloseTo(0.0, 5);
    });

    it('uses Jaccard for SDG overlap (all other signals zero)', () => {
      const a = makeFoundation({ themes: [], fitScore: 0, type: 'B', region: 'zürich', sdgs: [1, 2] });
      const b = makeFoundation({ themes: [], fitScore: 0, type: 'C', region: 'bern', sdgs: [2, 3] });
      // jaccard([1,2],[2,3])=1/3 → 0.10*(1/3) ≈ 0.0333
      expect(computeSimilarity(a, b)).toBeCloseTo(1 / 3 * 0.10, 5);
    });
  });

  describe('combined score', () => {
    it('perfect match returns 1.0', () => {
      const themes = ['kreislaufwirtschaft', 'arbeitsintegration'] as Foundation['themes'];
      const sdgs = [1, 13];
      const a = makeFoundation({ themes, sdgs, fitScore: 8, type: 'A', region: 'zürich' });
      const b = makeFoundation({ themes, sdgs, fitScore: 8, type: 'A', region: 'zürich' });
      expect(computeSimilarity(a, b)).toBeCloseTo(1.0, 5);
    });

    it('total weights sum to 1.0', () => {
      // Verify by checking a known fully-matching case
      const a = makeFoundation({ themes: ['kreislaufwirtschaft'] as Foundation['themes'], sdgs: [13], fitScore: 6, type: 'B', region: 'bern' });
      const score = computeSimilarity(a, { ...a });
      expect(score).toBeCloseTo(1.0, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// findSimilarFoundations
// ---------------------------------------------------------------------------

describe('findSimilarFoundations', () => {
  const target = makeFoundation({ slug: 'target', themes: ['kreislaufwirtschaft', 'arbeitsintegration'] as Foundation['themes'] });
  const highMatch = makeFoundation({ slug: 'high', themes: ['kreislaufwirtschaft', 'arbeitsintegration'] as Foundation['themes'] });
  const midMatch = makeFoundation({ slug: 'mid', themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
  const lowMatch = makeFoundation({ slug: 'low', themes: ['digitale-bildung'] as Foundation['themes'] });

  it('excludes the target foundation itself', () => {
    const results = findSimilarFoundations(target, [target, highMatch]);
    expect(results.map((r) => r.foundation.slug)).not.toContain('target');
  });

  it('returns results sorted by similarity descending', () => {
    const results = findSimilarFoundations(target, [lowMatch, midMatch, highMatch]);
    expect(results[0].foundation.slug).toBe('high');
    expect(results[1].foundation.slug).toBe('mid');
    expect(results[2].foundation.slug).toBe('low');
  });

  it('respects the limit parameter', () => {
    const pool = [highMatch, midMatch, lowMatch];
    expect(findSimilarFoundations(target, pool, 2)).toHaveLength(2);
  });

  it('defaults to limit of 5', () => {
    const pool = Array.from({ length: 10 }, (_, i) =>
      makeFoundation({ slug: `f${i}` }),
    );
    expect(findSimilarFoundations(target, pool)).toHaveLength(5);
  });

  it('returns fewer results when pool is smaller than limit', () => {
    const results = findSimilarFoundations(target, [highMatch]);
    expect(results).toHaveLength(1);
  });

  it('returns similarity score between 0 and 1', () => {
    const results = findSimilarFoundations(target, [highMatch, lowMatch]);
    for (const r of results) {
      expect(r.similarity).toBeGreaterThanOrEqual(0);
      expect(r.similarity).toBeLessThanOrEqual(1);
    }
  });

  it('includes human-readable reasons in Swiss German', () => {
    const results = findSimilarFoundations(target, [highMatch]);
    expect(results[0].reasons.length).toBeGreaterThan(0);
    expect(results[0].reasons.some((r) => r.includes('Thema') || r.includes('Themen'))).toBe(true);
  });

  it('handles empty pool', () => {
    expect(findSimilarFoundations(target, [])).toHaveLength(0);
  });
});
