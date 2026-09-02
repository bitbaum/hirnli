import { describe, it, expect } from 'vitest';
import { computeResearchStats } from '../foundation-research-stats';
import type { Foundation } from '@/lib/schemas/foundation';

// Minimal fixture for foundation-research-stats tests.
// Fields that affect computeResearchStats:
//   - isResearched (tier >= profiliert, score >= 25):
//       purposeSummary >20 chars (+12) + themes >0 (+5) + contact.email (+10) = 27 → profiliert
//   - completeness checks (14 COMPLETENESS_CHECKS fields)
//   - stale: researchDate older than staleDays from now
//   - byType: f.type
//   - byTheme: f.themes (multi-valued)
//   - byFit: f.fitScore bucketed

function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    slug: 'test',
    name: 'Test Stiftung',
    type: 'A',
    fitScore: 0,
    priority: 4,
    themes: [],
    sdgs: [],
    region: undefined,
    researchDepth: 'rapid',
    dataConfidence: 'unverified',
    source: 'automated-research',
    purposeSummary: '',
    researchNotes: '',
    researchDate: undefined,
    contact: {},
    amount: { min: null, max: null },
    websiteUrl: undefined,
    applicationMethod: 'unknown' as Foundation['applicationMethod'],
    applicationUrl: undefined,
    annualBudget: undefined,
    founded: undefined,
    boardMembers: [],
    capital: undefined,
    uid: undefined,
    ...overrides,
  } as Foundation;
}

/** Creates a foundation that passes the isResearched threshold (readiness >= 25) */
function researchedFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return makeFoundation({
    purposeSummary: 'Fördert nachhaltige Kreislaufwirtschaft in der Schweiz.', // >20 chars → +12
    themes: ['kreislaufwirtschaft'] as Foundation['themes'], // +5
    contact: { email: 'info@example.ch' }, // +10 → total 27, profiliert
    researchDepth: 'standard',
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Empty pool
// ---------------------------------------------------------------------------

describe('computeResearchStats — empty pool', () => {
  it('returns all zeros for empty array', () => {
    const stats = computeResearchStats([]);
    expect(stats.total).toBe(0);
    expect(stats.researched).toBe(0);
    expect(stats.researchedPercent).toBe(0);
    expect(stats.stale).toBe(0);
    expect(stats.avgCompleteness).toBe(0);
    expect(stats.qualityDistribution).toEqual({ high: 0, medium: 0, low: 0 });
    expect(stats.missingFieldsHeatmap).toEqual({});
    expect(stats.byType).toEqual({});
    expect(stats.byFit).toEqual({});
    expect(stats.byTheme).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Total count
// ---------------------------------------------------------------------------

describe('total count', () => {
  it('counts all foundations', () => {
    const foundations = [
      makeFoundation(),
      makeFoundation({ slug: 'b' }),
      makeFoundation({ slug: 'c' }),
    ];
    expect(computeResearchStats(foundations).total).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Researched count
// ---------------------------------------------------------------------------

describe('researched count', () => {
  it('counts foundations with tier >= profiliert as researched', () => {
    const foundations = [
      researchedFoundation({ slug: 'a' }),
      researchedFoundation({ slug: 'b' }),
      makeFoundation({ slug: 'c' }), // rapid, no data → not researched
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.researched).toBe(2);
    expect(stats.researchedPercent).toBe(66); // Math.floor(2/3*100) — floor so 100% only shows when truly complete
  });

  it('returns 0 researched for minimal/empty foundations', () => {
    const foundations = [makeFoundation(), makeFoundation({ slug: 'b' })];
    expect(computeResearchStats(foundations).researched).toBe(0);
    expect(computeResearchStats(foundations).researchedPercent).toBe(0);
  });

  it('returns 100% when all researched', () => {
    const foundations = [researchedFoundation({ slug: 'a' }), researchedFoundation({ slug: 'b' })];
    const stats = computeResearchStats(foundations);
    expect(stats.researched).toBe(2);
    expect(stats.researchedPercent).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Stale count
// ---------------------------------------------------------------------------

describe('stale count', () => {
  it('counts foundations with no researchDate as stale', () => {
    const foundations = [
      makeFoundation({ researchDate: undefined }),
      makeFoundation({ slug: 'b', researchDate: '' as unknown as undefined }),
    ];
    expect(computeResearchStats(foundations).stale).toBe(2);
  });

  it('counts foundations with very old researchDate as stale', () => {
    const oldDate = new Date('2020-01-01').toISOString();
    const foundations = [makeFoundation({ researchDate: oldDate })];
    // Default staleDays=90 — 2020 is definitely stale
    expect(computeResearchStats(foundations).stale).toBe(1);
  });

  it('does not count recent researchDate as stale', () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
    const foundations = [makeFoundation({ researchDate: recentDate })];
    expect(computeResearchStats(foundations, 90).stale).toBe(0);
  });

  it('respects staleDays parameter', () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
    const foundations = [
      makeFoundation({ slug: 'a', researchDate: daysAgo(40) }),
      makeFoundation({ slug: 'b', researchDate: daysAgo(20) }),
    ];
    // With staleDays=30: 40-day-old is stale, 20-day-old is not
    expect(computeResearchStats(foundations, 30).stale).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Quality distribution
// ---------------------------------------------------------------------------

describe('qualityDistribution', () => {
  it('classifies >75% completeness as high', () => {
    // All 14 fields filled → 100% → high
    const f = makeFoundation({
      name: 'Stiftung X',
      websiteUrl: 'https://example.ch',
      themes: ['kreislaufwirtschaft'] as Foundation['themes'],
      applicationMethod: 'email' as Foundation['applicationMethod'],
      applicationUrl: 'https://example.ch/apply',
      amount: { min: 1000, max: 50000, text: "CHF 1'000–50'000" },
      purposeSummary: 'Fördert Nachhaltigkeit in der Region Zürich seit 2005.',
      annualBudget: "CHF 500'000",
      founded: 2005,
      contact: { email: 'info@example.ch', phone: '+41 44 000 00 00', address: 'Zürich' },
      uid: 'CHE-123.456.789',
      region: 'zürich',
      boardMembers: [{ name: 'Hans Muster', role: 'Präsident' }],
      capital: "CHF 2'000'000",
    });
    const stats = computeResearchStats([f]);
    expect(stats.qualityDistribution.high).toBe(1);
    expect(stats.qualityDistribution.medium).toBe(0);
    expect(stats.qualityDistribution.low).toBe(0);
  });

  it('classifies empty foundation as low quality', () => {
    const stats = computeResearchStats([makeFoundation()]);
    // Only 'Name' is filled (1/14 ≈ 7%) → <40% → low
    expect(stats.qualityDistribution.low).toBe(1);
    expect(stats.qualityDistribution.high).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Missing fields heatmap
// ---------------------------------------------------------------------------

describe('missingFieldsHeatmap', () => {
  it('counts missing fields across all foundations', () => {
    // Both foundations have no website
    const foundations = [makeFoundation({ slug: 'a' }), makeFoundation({ slug: 'b' })];
    const stats = computeResearchStats(foundations);
    expect(stats.missingFieldsHeatmap['Website']).toBe(2);
  });

  it('does not count filled fields as missing', () => {
    const f = makeFoundation({ websiteUrl: 'https://example.ch' });
    const stats = computeResearchStats([f]);
    expect(stats.missingFieldsHeatmap['Website']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// byType breakdown
// ---------------------------------------------------------------------------

describe('byType breakdown', () => {
  it('groups foundations by type', () => {
    const foundations = [
      makeFoundation({ slug: 'a', type: 'A' }),
      makeFoundation({ slug: 'b', type: 'A' }),
      makeFoundation({ slug: 'c', type: 'B' }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byType['A'].total).toBe(2);
    expect(stats.byType['B'].total).toBe(1);
  });

  it('tracks researched count per type', () => {
    const foundations = [
      researchedFoundation({ slug: 'a', type: 'A' }),
      makeFoundation({ slug: 'b', type: 'A' }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byType['A'].researched).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// byTheme breakdown
// ---------------------------------------------------------------------------

describe('byTheme breakdown', () => {
  it('counts a foundation in each of its themes', () => {
    const f = makeFoundation({
      themes: ['kreislaufwirtschaft', 'arbeitsintegration'] as Foundation['themes'],
    });
    const stats = computeResearchStats([f]);
    expect(stats.byTheme['kreislaufwirtschaft'].total).toBe(1);
    expect(stats.byTheme['arbeitsintegration'].total).toBe(1);
  });

  it('does not create theme entries for foundations with no themes', () => {
    const stats = computeResearchStats([makeFoundation()]);
    expect(Object.keys(stats.byTheme)).toHaveLength(0);
  });

  it('aggregates across multiple foundations per theme', () => {
    const foundations = [
      makeFoundation({ slug: 'a', themes: ['kreislaufwirtschaft'] as Foundation['themes'] }),
      makeFoundation({ slug: 'b', themes: ['kreislaufwirtschaft'] as Foundation['themes'] }),
      makeFoundation({ slug: 'c', themes: ['arbeitsintegration'] as Foundation['themes'] }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byTheme['kreislaufwirtschaft'].total).toBe(2);
    expect(stats.byTheme['arbeitsintegration'].total).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// byFit breakdown
// ---------------------------------------------------------------------------

describe('byFit breakdown', () => {
  it('buckets fitScore=0 into bucket 0', () => {
    const stats = computeResearchStats([makeFoundation({ fitScore: 0 })]);
    expect(stats.byFit[0].total).toBe(1);
  });

  it('buckets fitScore 1-3 into bucket 1', () => {
    const foundations = [
      makeFoundation({ slug: 'a', fitScore: 1 }),
      makeFoundation({ slug: 'b', fitScore: 3 }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byFit[1].total).toBe(2);
  });

  it('buckets fitScore 4-6 into bucket 2', () => {
    const foundations = [
      makeFoundation({ slug: 'a', fitScore: 4 }),
      makeFoundation({ slug: 'b', fitScore: 6 }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byFit[2].total).toBe(2);
  });

  it('buckets fitScore 7-10 into bucket 3', () => {
    const foundations = [
      makeFoundation({ slug: 'a', fitScore: 7 }),
      makeFoundation({ slug: 'b', fitScore: 10 }),
    ];
    const stats = computeResearchStats(foundations);
    expect(stats.byFit[3].total).toBe(2);
  });
});
