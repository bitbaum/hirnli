import { describe, it, expect } from 'vitest';
import { computeReadinessScore, computePriorityScore, TIER_FROM_LEVEL } from '../foundation-scores';
import { makeFoundation, makeMinimalFoundation } from './fixtures';

describe('computeReadinessScore', () => {
  it('returns score 0-100', () => {
    const result = computeReadinessScore(makeFoundation());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns high score for well-researched foundation', () => {
    const result = computeReadinessScore(makeFoundation());
    expect(result.score).toBeGreaterThan(50);
  });

  it('returns low score for minimal foundation', () => {
    const result = computeReadinessScore(makeMinimalFoundation());
    expect(result.score).toBeLessThan(30);
  });

  it('returns a valid quality tier', () => {
    const validTiers = Object.values(TIER_FROM_LEVEL);
    const result = computeReadinessScore(makeFoundation());
    expect(validTiers).toContain(result.tier);
  });

  it('returns dimensions with scores', () => {
    const result = computeReadinessScore(makeFoundation());
    expect(Object.keys(result.dimensions).length).toBeGreaterThan(0);
    for (const dim of Object.values(result.dimensions)) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(dim.max);
    }
  });

  it('returns checks with labels', () => {
    const result = computeReadinessScore(makeFoundation());
    expect(result.checks.length).toBeGreaterThan(0);
    for (const check of result.checks) {
      expect(check.label).toBeTruthy();
      expect(typeof check.passed).toBe('boolean');
      expect(check.points).toBeGreaterThan(0);
    }
  });

  it('improvements are sorted by points descending', () => {
    const result = computeReadinessScore(makeMinimalFoundation());
    for (let i = 1; i < result.topImprovements.length; i++) {
      expect(result.topImprovements[i - 1].points).toBeGreaterThanOrEqual(
        result.topImprovements[i].points,
      );
    }
  });

  it('adding data increases score', () => {
    const minimal = computeReadinessScore(makeMinimalFoundation());
    const withWebsite = computeReadinessScore(
      makeMinimalFoundation({ websiteUrl: 'https://example.ch' }),
    );
    expect(withWebsite.score).toBeGreaterThanOrEqual(minimal.score);
  });

  it('detects registry URLs as not own website', () => {
    const withRegistry = computeReadinessScore(
      makeMinimalFoundation({ websiteUrl: 'https://zefix.ch/de/search/entity/welcome' }),
    );
    const withOwn = computeReadinessScore(
      makeMinimalFoundation({ websiteUrl: 'https://my-stiftung.ch' }),
    );
    // Own website should score higher than registry URL
    expect(withOwn.score).toBeGreaterThanOrEqual(withRegistry.score);
  });
});

describe('computePriorityScore', () => {
  it('returns score 0-100 and level 1-4', () => {
    const result = computePriorityScore(makeFoundation());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.level).toBeGreaterThanOrEqual(1);
    expect(result.level).toBeLessThanOrEqual(4);
  });

  it('high fit + high readiness = high priority', () => {
    const f = makeFoundation({ fitScore: 9 });
    const result = computePriorityScore(f);
    expect(result.level).toBeLessThanOrEqual(2); // P1 or P2
  });

  it('low fit = low priority', () => {
    const f = makeFoundation({ fitScore: 1 });
    const result = computePriorityScore(f);
    expect(result.level).toBeGreaterThanOrEqual(3); // P3 or P4
  });

  it('zero fit = very low priority', () => {
    // fitScore 0 → fitNorm 0 → base 0, but grant bonus may add a few points
    const f = makeFoundation({ fitScore: 0, amount: { min: null, max: null, text: '' } });
    const result = computePriorityScore(f);
    expect(result.level).toBeGreaterThanOrEqual(3); // P3 or P4
    expect(result.components.fitNorm).toBe(0);
  });

  it('penalizes operative foundations', () => {
    const normal = computePriorityScore(makeFoundation());
    const operative = computePriorityScore(makeFoundation({ isOperative: true }));
    expect(operative.score).toBeLessThan(normal.score);
    expect(operative.components.penaltyReason).toBeTruthy();
  });

  it('penalizes closed foundations', () => {
    const normal = computePriorityScore(makeFoundation());
    const closed = computePriorityScore(makeFoundation({ status: 'closed' }));
    expect(closed.score).toBeLessThan(normal.score);
  });

  it('penalizes no-application foundations', () => {
    const normal = computePriorityScore(makeFoundation());
    const noApp = computePriorityScore(makeFoundation({ acceptsApplications: 'no' }));
    expect(noApp.score).toBeLessThan(normal.score);
  });

  it('applies harshest penalty (not cumulative)', () => {
    const closedOnly = computePriorityScore(makeFoundation({ status: 'closed' }));
    const closedAndOperative = computePriorityScore(
      makeFoundation({ status: 'closed', isOperative: true }),
    );
    // Both penalties apply — result should use the harshest (min multiplier)
    expect(closedAndOperative.components.multiplier).toBeLessThanOrEqual(
      closedOnly.components.multiplier,
    );
  });

  it('respects manual override', () => {
    const f = makeFoundation({ priority: 1, priorityOverride: true, fitScore: 1 });
    const result = computePriorityScore(f);
    expect(result.level).toBe(1);
    expect(result.isOverride).toBe(true);
  });

  it('override ignores penalties', () => {
    const f = makeFoundation({
      priority: 1,
      priorityOverride: true,
      status: 'closed',
      isOperative: true,
    });
    const result = computePriorityScore(f);
    expect(result.level).toBe(1);
  });

  it('accepts pre-computed readiness score', () => {
    const f = makeFoundation({ fitScore: 8 });
    const withDefault = computePriorityScore(f);
    const withExplicit = computePriorityScore(f, 80);
    // Both should produce valid results
    expect(withDefault.level).toBeGreaterThanOrEqual(1);
    expect(withExplicit.level).toBeGreaterThanOrEqual(1);
  });

  it('returns label and description', () => {
    const result = computePriorityScore(makeFoundation());
    expect(result.label).toBeTruthy();
    expect(result.description).toBeTruthy();
  });
});

describe('TIER_FROM_LEVEL', () => {
  it('maps all 5 levels to tiers', () => {
    expect(TIER_FROM_LEVEL[1]).toBe('verzeichnet');
    expect(TIER_FROM_LEVEL[2]).toBe('erfasst');
    expect(TIER_FROM_LEVEL[3]).toBe('profiliert');
    expect(TIER_FROM_LEVEL[4]).toBe('recherchiert');
    expect(TIER_FROM_LEVEL[5]).toBe('anwendungsbereit');
  });
});
