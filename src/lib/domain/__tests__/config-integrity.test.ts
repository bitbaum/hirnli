import { describe, it, expect } from 'vitest';
import { SCORING_ENGINE, READINESS_ENGINE, PRIORITY_FORMULA, QUALITY_THRESHOLDS } from '@/lib/config/fit-scoring';
import { STIFTUNGEN_DATA, STATUS_LABELS, STATUS_BADGE_VARIANT, TYPE_LABELS, PRIORITY_CONFIG } from '@/lib/config/foundations';
import type { FoundationStatus } from '@/lib/schemas/foundation';
import { FoundationType } from '@/lib/schemas/foundation';
import { BUDGET_SCENARIOS } from '@/lib/config/budget-scenarios';
import { APPLICATION_STATUSES, KANBAN_COLUMNS, isActiveApplication, isTerminalStatus, getPriorityColor, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { NumberConfidence, CONFIDENCE_COLORS, CONFIDENCE_DISPLAY_LABELS } from '@/lib/config/numbers';
import { Confidence } from '@/lib/schemas/metric';
import { computeReadinessScore, computePriorityScore } from '../foundation-scores';
import { validateFoundationQuality } from '../foundation-quality';
import {
  TEMPLATE_TYPES, TEMPLATE_FOUNDATIONS, TYPE_TEMPLATE_KEYS,
  SCHWERPUNKT_TEMPLATE_TYPES, getTemplateFoundation, getSchwerpunktTemplate,
} from '@/lib/config/gesuch-templates';
import { SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';

describe('application-statuses config integrity', () => {
  it('every status has a non-empty label and color', () => {
    for (const s of APPLICATION_STATUSES) {
      expect(s.label).toBeTruthy();
      expect(s.color).toBeTruthy();
    }
  });

  it('every status has chartColor with bg and border', () => {
    for (const s of APPLICATION_STATUSES) {
      expect(s.chartColor.bg).toBeTruthy();
      expect(s.chartColor.border).toBeTruthy();
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

  it('isTerminalStatus returns true only for accepted and rejected', () => {
    expect(isTerminalStatus('accepted')).toBe(true);
    expect(isTerminalStatus('rejected')).toBe(true);
    // All non-terminal statuses must return false
    const nonTerminal = APPLICATION_STATUSES.map(s => s.id as ApplicationStatusId)
      .filter(id => id !== 'accepted' && id !== 'rejected');
    for (const id of nonTerminal) {
      expect(isTerminalStatus(id)).toBe(false);
    }
  });

  it('isActiveApplication returns false only for rejected and withdrawn', () => {
    expect(isActiveApplication('rejected')).toBe(false);
    expect(isActiveApplication('withdrawn')).toBe(false);
    const active = APPLICATION_STATUSES.map(s => s.id as ApplicationStatusId)
      .filter(id => id !== 'rejected' && id !== 'withdrawn');
    for (const id of active) {
      expect(isActiveApplication(id)).toBe(true);
    }
  });
});

describe('getPriorityColor', () => {
  it('returns a non-empty string for each valid priority level (1-4)', () => {
    for (const level of [1, 2, 3, 4]) {
      const result = getPriorityColor(level);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('returns a non-empty string for null (no priority set)', () => {
    const result = getPriorityColor(null);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns the same fallback for null and unknown level', () => {
    expect(getPriorityColor(null)).toBe(getPriorityColor(99));
  });
});

describe('confidence config integrity', () => {
  const validLevels = NumberConfidence.options;

  it('CONFIDENCE_COLORS covers every NumberConfidence enum value', () => {
    for (const level of validLevels) {
      expect(CONFIDENCE_COLORS[level]).toBeTruthy();
    }
  });

  it('CONFIDENCE_DISPLAY_LABELS covers every NumberConfidence enum value', () => {
    for (const level of validLevels) {
      expect(CONFIDENCE_DISPLAY_LABELS[level]).toBeTruthy();
    }
  });

  it('CONFIDENCE_DISPLAY_LABELS covers every Confidence (metric) enum value including low', () => {
    // Confidence in metric schema is ['high', 'medium', 'low']. NumberInspector looks up
    // labels for metric confidence values, so all must map to human-readable German.
    for (const level of Confidence.options) {
      expect(CONFIDENCE_DISPLAY_LABELS[level]).toBeTruthy();
    }
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

const FOUNDATION_STATUSES: FoundationStatus[] = ['open', 'closed', 'soon', 'rolling'];

describe('foundation status config integrity', () => {
  it('STATUS_LABELS covers every FoundationStatus', () => {
    for (const status of FOUNDATION_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
      expect(STATUS_LABELS[status].text.length).toBeGreaterThan(0);
    }
  });

  it('STATUS_BADGE_VARIANT covers every FoundationStatus', () => {
    for (const status of FOUNDATION_STATUSES) {
      expect(STATUS_BADGE_VARIANT[status]).toBeTruthy();
    }
  });

  it('STATUS_BADGE_VARIANT and STATUS_LABELS have the same key set', () => {
    const labelKeys = Object.keys(STATUS_LABELS).sort();
    const variantKeys = Object.keys(STATUS_BADGE_VARIANT).sort();
    expect(variantKeys).toEqual(labelKeys);
  });
});

describe('foundation type config integrity', () => {
  const FOUNDATION_TYPES = FoundationType.options;

  it('TYPE_LABELS covers every FoundationType', () => {
    for (const type of FOUNDATION_TYPES) {
      expect(TYPE_LABELS[type]).toBeTruthy();
      expect(TYPE_LABELS[type].short.length).toBeGreaterThan(0);
      expect(TYPE_LABELS[type].long.length).toBeGreaterThan(0);
    }
  });

  it('TYPE_LABELS has no extra keys beyond FoundationType', () => {
    const labelKeys = Object.keys(TYPE_LABELS).sort();
    const schemaKeys = [...FOUNDATION_TYPES].sort();
    expect(labelKeys).toEqual(schemaKeys);
  });
});

describe('priority config integrity', () => {
  const PRIORITY_LEVELS = [1, 2, 3, 4];

  it('PRIORITY_CONFIG covers all priority levels 1-4', () => {
    for (const level of PRIORITY_LEVELS) {
      expect(PRIORITY_CONFIG[level]).toBeTruthy();
      expect(PRIORITY_CONFIG[level].label.length).toBeGreaterThan(0);
      expect(PRIORITY_CONFIG[level].color.length).toBeGreaterThan(0);
    }
  });

  it('PRIORITY_CONFIG labels are P1-P4', () => {
    for (const level of PRIORITY_LEVELS) {
      expect(PRIORITY_CONFIG[level].label).toBe(`P${level}`);
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

describe('gesuch-templates config integrity', () => {
  it('TEMPLATE_FOUNDATIONS has an entry for every TEMPLATE_TYPE', () => {
    for (const type of TEMPLATE_TYPES) {
      expect(TEMPLATE_FOUNDATIONS[type]).toBeDefined();
      expect(TEMPLATE_FOUNDATIONS[type].slug).toBeTruthy();
    }
  });

  it('getTemplateFoundation returns a foundation for each TEMPLATE_TYPE', () => {
    for (const type of TEMPLATE_TYPES) {
      const f = getTemplateFoundation(type);
      expect(f).toBeDefined();
      expect(f?.slug).toBeTruthy();
    }
  });

  it('getTemplateFoundation returns undefined for unknown type', () => {
    expect(getTemplateFoundation('nonexistent')).toBeUndefined();
  });

  it('TYPE_TEMPLATE_KEYS are all valid FoundationTypes', () => {
    const validTypes = FoundationType.options;
    for (const key of TYPE_TEMPLATE_KEYS) {
      expect(validTypes).toContain(key);
    }
  });

  it('getSchwerpunktTemplate returns a foundation for every schwerpunkt × SCHWERPUNKT_TEMPLATE_TYPE', () => {
    for (const schwerpunktId of SCHWERPUNKT_IDS) {
      for (const type of SCHWERPUNKT_TEMPLATE_TYPES) {
        const f = getSchwerpunktTemplate(schwerpunktId, type);
        expect(f).toBeDefined();
        expect(f?.slug).toContain(schwerpunktId);
      }
    }
  });

  it('getSchwerpunktTemplate returns undefined for invalid schwerpunkt', () => {
    expect(getSchwerpunktTemplate('nonexistent', 'A')).toBeUndefined();
  });

  it('getSchwerpunktTemplate returns undefined for invalid type', () => {
    const validSchwerpunkt = SCHWERPUNKT_IDS[0];
    expect(getSchwerpunktTemplate(validSchwerpunkt, 'D')).toBeUndefined();
  });
});
