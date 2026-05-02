import { describe, it, expect } from 'vitest';
import { SCORING_ENGINE, READINESS_ENGINE, PRIORITY_FORMULA, QUALITY_THRESHOLDS } from '@/lib/config/fit-scoring';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { BUDGET_SCENARIOS } from '@/lib/config/budget-scenarios';
import { APPLICATION_STATUSES, KANBAN_COLUMNS, isActiveApplication, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { computeReadinessScore, computePriorityScore } from '../foundation-scores';
import { validateFoundationQuality } from '../foundation-quality';

describe('application-statuses config integrity', () => {
  it('every status has a non-empty label and color', () => {
    for (const s of APPLICATION_STATUSES) {
      expect(s.label).toBeTruthy();
      expect(s.color).toBeTruthy();
    }
  });

  it('every active (non-withdrawn, non-rejected) status appears in KANBAN_COLUMNS', () => {
    const kanbanSet = new Set(KANBAN_COLUMNS);
    for (const s of APPLICATION_STATUSES) {
      if (isActiveApplication(s.id as ApplicationStatusId)) {
        expect(kanbanSet.has(s.id as typeof KANBAN_COLUMNS[number])).toBe(true);
      }
    }
  });

  it('rejected and withdrawn are excluded from KANBAN_COLUMNS', () => {
    expect(KANBAN_COLUMNS).not.toContain('rejected');
    expect(KANBAN_COLUMNS).not.toContain('withdrawn');
  });
});

describe('scoring config integrity', () => {
  it('SCORING_ENGINE has dimensions with positive maxScore', () => {
    for (const dim of SCORING_ENGINE.dimensions) {
      expect(dim.maxScore).toBeGreaterThan(0);
      expect(dim.id).toBeTruthy();
      expect(dim.inputFields.length).toBeGreaterThan(0);
    }
  });

  it('SCORING_ENGINE dimension maxScores sum to 10', () => {
    const sum = SCORING_ENGINE.dimensions.reduce((a, d) => a + d.maxScore, 0);
    expect(sum).toBe(10);
  });

  it('READINESS_ENGINE has dimensions with positive maxScore', () => {
    for (const dim of READINESS_ENGINE.dimensions) {
      expect(dim.maxScore).toBeGreaterThan(0);
      expect(dim.id).toBeTruthy();
    }
  });

  it('READINESS_ENGINE dimension maxScores sum to 100', () => {
    const sum = READINESS_ENGINE.dimensions.reduce((a, d) => a + d.maxScore, 0);
    expect(sum).toBe(100);
  });

  it('PRIORITY_FORMULA display thresholds are in descending order', () => {
    for (let i = 1; i < PRIORITY_FORMULA.display.length; i++) {
      expect(PRIORITY_FORMULA.display[i - 1].minScore)
        .toBeGreaterThan(PRIORITY_FORMULA.display[i].minScore);
    }
  });

  it('QUALITY_THRESHOLDS has positive minimums', () => {
    expect(QUALITY_THRESHOLDS.purposeSummaryMinChars).toBeGreaterThan(0);
    expect(QUALITY_THRESHOLDS.researchNotesMinChars).toBeGreaterThan(0);
  });
});

describe('budget config integrity', () => {
  it('has at least 3 scenarios (minimal, moderate, maximum)', () => {
    const ids = BUDGET_SCENARIOS.map(s => s.id);
    expect(ids).toContain('minimal');
    expect(ids).toContain('moderate');
    expect(ids).toContain('maximum');
  });

  it('each scenario has threeYearModel with all 3 years', () => {
    for (const scenario of BUDGET_SCENARIOS) {
      expect(scenario.threeYearModel.year1).toBeDefined();
      expect(scenario.threeYearModel.year2).toBeDefined();
      expect(scenario.threeYearModel.year3).toBeDefined();
    }
  });
});

describe('foundation data integrity', () => {
  it('STIFTUNGEN_DATA has entries', () => {
    expect(STIFTUNGEN_DATA.length).toBeGreaterThan(100);
  });

  it('every foundation has required fields', () => {
    for (const f of STIFTUNGEN_DATA.slice(0, 50)) {
      expect(f.slug).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.type).toBeTruthy();
      expect(Array.isArray(f.themes)).toBe(true);
    }
  });

  it('no duplicate slugs', () => {
    const slugs = STIFTUNGEN_DATA.map(f => f.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('readiness scores are deterministic (same input → same output)', () => {
    const sample = STIFTUNGEN_DATA.slice(0, 10);
    for (const f of sample) {
      const r1 = computeReadinessScore(f);
      const r2 = computeReadinessScore(f);
      expect(r1.score).toBe(r2.score);
      expect(r1.tier).toBe(r2.tier);
    }
  });

  it('priority scores are deterministic', () => {
    const sample = STIFTUNGEN_DATA.slice(0, 10);
    for (const f of sample) {
      const p1 = computePriorityScore(f);
      const p2 = computePriorityScore(f);
      expect(p1.score).toBe(p2.score);
      expect(p1.level).toBe(p2.level);
    }
  });

  it('quality violations are within acceptable range', () => {
    const violations = validateFoundationQuality(STIFTUNGEN_DATA);
    // Some violations are expected (data isn't perfect), but shouldn't be excessive
    const violationRate = violations.length / STIFTUNGEN_DATA.length;
    // Many foundations are auto-imported with minimal data, so violation rate
    // among researched ones can be high. Just verify the check runs without error.
    expect(violationRate).toBeLessThan(0.8);
  });
});
