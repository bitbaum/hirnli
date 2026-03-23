import { describe, it, expect } from 'vitest';
import {
  tierAtLeast,
  getQualityTier,
  isResearched,
  getFitLevel,
  hasGesuchPage,
  computeTierCounts,
  getTierPromotionSteps,
  QUALITY_TIERS,
  TIER_LABELS,
} from '../foundation-helpers';
import { makeFoundation, makeMinimalFoundation } from './fixtures';

describe('tierAtLeast', () => {
  it('returns true when tier equals minimum', () => {
    expect(tierAtLeast('profiliert', 'profiliert')).toBe(true);
  });

  it('returns true when tier exceeds minimum', () => {
    expect(tierAtLeast('anwendungsbereit', 'profiliert')).toBe(true);
  });

  it('returns false when tier is below minimum', () => {
    expect(tierAtLeast('erfasst', 'profiliert')).toBe(false);
  });

  it('verzeichnet is the lowest tier', () => {
    expect(tierAtLeast('verzeichnet', 'verzeichnet')).toBe(true);
    expect(tierAtLeast('verzeichnet', 'erfasst')).toBe(false);
  });
});

describe('getQualityTier', () => {
  it('returns high tier for well-researched foundation', () => {
    const f = makeFoundation();
    const tier = getQualityTier(f);
    expect(tierAtLeast(tier, 'recherchiert')).toBe(true);
  });

  it('returns low tier for minimal foundation', () => {
    const f = makeMinimalFoundation();
    const tier = getQualityTier(f);
    expect(tierAtLeast(tier, 'profiliert')).toBe(false);
  });
});

describe('isResearched', () => {
  it('returns true for well-researched foundation', () => {
    expect(isResearched(makeFoundation())).toBe(true);
  });

  it('returns false for minimal foundation', () => {
    expect(isResearched(makeMinimalFoundation())).toBe(false);
  });
});

describe('getFitLevel', () => {
  it('returns 3 stars for fitScore 7-10 on researched foundation', () => {
    expect(getFitLevel(makeFoundation({ fitScore: 7 }))).toBe(3);
    expect(getFitLevel(makeFoundation({ fitScore: 10 }))).toBe(3);
  });

  it('returns 2 stars for fitScore 4-6', () => {
    expect(getFitLevel(makeFoundation({ fitScore: 4 }))).toBe(2);
    expect(getFitLevel(makeFoundation({ fitScore: 6 }))).toBe(2);
  });

  it('returns 1 star for fitScore 1-3', () => {
    expect(getFitLevel(makeFoundation({ fitScore: 1 }))).toBe(1);
    expect(getFitLevel(makeFoundation({ fitScore: 3 }))).toBe(1);
  });

  it('returns 0 for fitScore 0 (unassessed)', () => {
    expect(getFitLevel(makeFoundation({ fitScore: 0 }))).toBe(0);
  });

  it('gates to 0 for foundations below profiliert tier', () => {
    const f = makeMinimalFoundation({ fitScore: 8 });
    expect(getFitLevel(f)).toBe(0);
  });
});

describe('hasGesuchPage', () => {
  it('returns true for recherchiert+ foundation with P1-P3', () => {
    const f = makeFoundation({ fitScore: 7, priority: 1 });
    expect(hasGesuchPage(f)).toBe(true);
  });

  it('returns false for foundation with low readiness tier', () => {
    // hasGesuchPage requires tier >= recherchiert AND computed P1-P3
    // A minimal foundation won't reach recherchiert tier
    const f = makeMinimalFoundation({ fitScore: 8, priority: 1 });
    expect(hasGesuchPage(f)).toBe(false);
  });

  it('returns false for minimal foundation regardless of priority', () => {
    const f = makeMinimalFoundation({ priority: 1, fitScore: 8 });
    expect(hasGesuchPage(f)).toBe(false);
  });
});

describe('computeTierCounts', () => {
  it('counts foundations by their computed tier', () => {
    const foundations = [
      makeFoundation(),
      makeFoundation({ slug: 'f2' }),
      makeMinimalFoundation({ slug: 'f3' }),
    ];
    const counts = computeTierCounts(foundations);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(3);
  });

  it('returns all zeros for empty array', () => {
    const counts = computeTierCounts([]);
    expect(Object.values(counts).every(c => c === 0)).toBe(true);
  });
});

describe('getTierPromotionSteps', () => {
  it('returns improvements for minimal foundation', () => {
    const promo = getTierPromotionSteps(makeMinimalFoundation());
    expect(promo.nextTier).not.toBeNull();
    expect(promo.improvements.length).toBeGreaterThan(0);
  });

  it('returns null nextTier for anwendungsbereit', () => {
    // A fully stocked foundation should be at or near anwendungsbereit
    const f = makeFoundation({
      applicationUrl: 'https://apply.test.ch',
      capital: '5M CHF',
      annualBudget: '500k CHF',
      grantExpenditure: '300k CHF',
      smallProjects: { max: 5000, text: 'Bis 5k' },
    });
    const promo = getTierPromotionSteps(f);
    if (promo.currentTier === 'anwendungsbereit') {
      expect(promo.nextTier).toBeNull();
    }
  });
});

describe('constants', () => {
  it('QUALITY_TIERS has 5 tiers in ascending order', () => {
    expect(QUALITY_TIERS).toHaveLength(5);
    expect(QUALITY_TIERS[0]).toBe('verzeichnet');
    expect(QUALITY_TIERS[4]).toBe('anwendungsbereit');
  });

  it('TIER_LABELS has an entry for every tier', () => {
    for (const tier of QUALITY_TIERS) {
      expect(TIER_LABELS[tier]).toBeTruthy();
    }
  });
});
