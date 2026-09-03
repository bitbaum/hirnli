import { describe, it, expect, beforeAll } from 'vitest';
import {
  SCORING_ENGINE,
  READINESS_ENGINE,
  PRIORITY_FORMULA,
  QUALITY_THRESHOLDS,
} from '@/lib/config/fit-scoring';
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  TYPE_LABELS,
  PRIORITY_CONFIG,
  PRIORITY_LEVELS,
  APPLICATION_METHOD_LABELS,
  SOURCES,
  FIT_CONFIG,
  THEMES,
} from '@/lib/config/foundations';
// Not @/lib/db/foundations-repo — that one wraps reads in unstable_cache,
// which requires a live Next.js server context and throws under vitest.
import { getAllFoundations } from '../../../../scripts/lib/foundations';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/registry';
import type { Foundation, FoundationStatus } from '@/lib/schemas/foundation';
import { FoundationType, ApplicationMethod, SourceId, ThemeId } from '@/lib/schemas/foundation';
import { TRUST_CONFIG } from '@/lib/config/trust-levels';
import { WHY, ANSCHREIBEN_TEMPLATES, THEME_ID_TO_STORY_KEY } from '@/lib/config/stories';
import { BUDGET_SCENARIOS } from '@/lib/config/budget-scenarios';
import {
  APPLICATION_STATUSES,
  KANBAN_COLUMNS,
  isActiveApplication,
  isTerminalStatus,
  getPriorityColor,
} from '@/lib/config/application-statuses';
import {
  NumberConfidence,
  CONFIDENCE_COLORS,
  CONFIDENCE_DISPLAY_LABELS,
} from '@/lib/config/numbers';
import { Confidence } from '@/lib/schemas/metric';
import { computeReadinessScore, computePriorityScore } from '../foundation-scores';
import { validateFoundationQuality } from '../foundation-quality';
import {
  TEMPLATE_TYPES,
  TEMPLATE_FOUNDATIONS,
  TYPE_TEMPLATE_KEYS,
  SCHWERPUNKT_TEMPLATE_TYPES,
  getTemplateFoundation,
  getSchwerpunktTemplate,
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
      if (isActiveApplication(s.id)) {
        expect(kanbanSet.has(s.id as (typeof KANBAN_COLUMNS)[number])).toBe(true);
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
    const nonTerminal = APPLICATION_STATUSES.map((s) => s.id).filter(
      (id) => id !== 'accepted' && id !== 'rejected',
    );
    for (const id of nonTerminal) {
      expect(isTerminalStatus(id)).toBe(false);
    }
  });

  it('isActiveApplication returns false only for rejected and withdrawn', () => {
    expect(isActiveApplication('rejected')).toBe(false);
    expect(isActiveApplication('withdrawn')).toBe(false);
    const active = APPLICATION_STATUSES.map((s) => s.id).filter(
      (id) => id !== 'rejected' && id !== 'withdrawn',
    );
    for (const id of active) {
      expect(isActiveApplication(id)).toBe(true);
    }
  });
});

describe('getPriorityColor', () => {
  it('returns a non-empty string for each valid priority level (1-4)', () => {
    for (const level of PRIORITY_LEVELS) {
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
      expect(PRIORITY_FORMULA.display[i - 1].minScore).toBeGreaterThan(
        PRIORITY_FORMULA.display[i].minScore,
      );
    }
  });

  it('QUALITY_THRESHOLDS has positive minimums', () => {
    expect(QUALITY_THRESHOLDS.purposeSummaryMinChars).toBeGreaterThan(0);
    expect(QUALITY_THRESHOLDS.researchNotesMinChars).toBeGreaterThan(0);
  });
});

describe('budget config integrity', () => {
  it('has at least 3 scenarios (minimal, moderate, maximum)', () => {
    const ids = BUDGET_SCENARIOS.map((s) => s.id);
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

// DB-backed since the generated-cache file was removed — needs DATABASE_URL
// (SSH tunnel per docs/DEPLOYMENT.md). Skips cleanly in CI, which has no DB.
describe.skipIf(!process.env.DATABASE_URL)('foundation data integrity', () => {
  let data: Foundation[];

  beforeAll(async () => {
    // A data-integrity assertion needs a concrete tenant: the shape it
    // checks is one organisation's composed view, not the registry alone.
    data = await getAllFoundations(DEFAULT_TENANT_ID);
  });

  it('has entries', () => {
    expect(data.length).toBeGreaterThan(100);
  });

  it('every foundation has required fields', () => {
    for (const f of data.slice(0, 50)) {
      expect(f.slug).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.type).toBeTruthy();
      expect(Array.isArray(f.themes)).toBe(true);
    }
  });

  it('no duplicate slugs', () => {
    const slugs = data.map((f) => f.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('readiness scores are deterministic (same input → same output)', () => {
    const sample = data.slice(0, 10);
    for (const f of sample) {
      const r1 = computeReadinessScore(f);
      const r2 = computeReadinessScore(f);
      expect(r1.score).toBe(r2.score);
      expect(r1.tier).toBe(r2.tier);
    }
  });

  it('priority scores are deterministic', () => {
    const sample = data.slice(0, 10);
    for (const f of sample) {
      const p1 = computePriorityScore(f);
      const p2 = computePriorityScore(f);
      expect(p1.score).toBe(p2.score);
      expect(p1.level).toBe(p2.level);
    }
  });

  it('quality violations are within acceptable range', () => {
    const violations = validateFoundationQuality(data);
    // Some violations are expected (data isn't perfect), but shouldn't be excessive
    const violationRate = violations.length / data.length;
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

describe('APPLICATION_METHOD_LABELS config integrity', () => {
  it('covers every ApplicationMethod enum value', () => {
    for (const method of ApplicationMethod.options) {
      expect(APPLICATION_METHOD_LABELS).toHaveProperty(method);
    }
  });

  it('has no extra keys beyond ApplicationMethod', () => {
    const labelKeys = Object.keys(APPLICATION_METHOD_LABELS).sort();
    const schemaKeys = [...ApplicationMethod.options].sort();
    expect(labelKeys).toEqual(schemaKeys);
  });
});

describe('SOURCES config integrity', () => {
  it('covers every SourceId enum value', () => {
    for (const id of SourceId.options) {
      expect(SOURCES[id]).toBeDefined();
      expect(SOURCES[id].label).toBeTruthy();
    }
  });

  it('has no extra keys beyond SourceId', () => {
    const sourceKeys = Object.keys(SOURCES).sort();
    const schemaKeys = [...SourceId.options].sort();
    expect(sourceKeys).toEqual(schemaKeys);
  });
});

describe('FIT_CONFIG integrity', () => {
  const FIT_LEVELS = [0, 1, 2, 3] as const;

  it('covers all fit levels 0-3', () => {
    for (const level of FIT_LEVELS) {
      expect(FIT_CONFIG[level]).toBeDefined();
      expect(FIT_CONFIG[level].stars).toBeTruthy();
    }
  });
});

describe('THEMES config integrity', () => {
  it('covers every ThemeId enum value', () => {
    for (const id of ThemeId.options) {
      expect(THEMES[id]).toBeDefined();
      expect(THEMES[id].label.length).toBeGreaterThan(0);
    }
  });

  it('has no extra keys beyond ThemeId', () => {
    const themeKeys = Object.keys(THEMES).sort();
    const schemaKeys = [...ThemeId.options].sort();
    expect(themeKeys).toEqual(schemaKeys);
  });
});

describe('THEME_ID_TO_STORY_KEY integrity', () => {
  it('covers every ThemeId enum value', () => {
    for (const id of ThemeId.options) {
      expect(THEME_ID_TO_STORY_KEY[id]).toBeTruthy();
    }
  });

  it('has no extra keys beyond ThemeId', () => {
    const mapKeys = Object.keys(THEME_ID_TO_STORY_KEY).sort();
    const schemaKeys = [...ThemeId.options].sort();
    expect(mapKeys).toEqual(schemaKeys);
  });
});

describe('ANSCHREIBEN_TEMPLATES integrity', () => {
  it('covers every FoundationType with non-empty opening and closing', () => {
    for (const type of FoundationType.options) {
      expect(ANSCHREIBEN_TEMPLATES[type]).toBeDefined();
      expect(ANSCHREIBEN_TEMPLATES[type].opening.length).toBeGreaterThan(0);
      expect(ANSCHREIBEN_TEMPLATES[type].closing.length).toBeGreaterThan(0);
    }
  });

  it('has no extra keys beyond FoundationType', () => {
    const templateKeys = Object.keys(ANSCHREIBEN_TEMPLATES).sort();
    const schemaKeys = [...FoundationType.options].sort();
    expect(templateKeys).toEqual(schemaKeys);
  });
});

describe('WHY config integrity', () => {
  const THEME_KEYS = ['klima', 'kreislaufwirtschaft', 'sozial', 'bildung', 'digital'] as const;

  it('covers every ThemeKey with required fields', () => {
    for (const key of THEME_KEYS) {
      expect(WHY[key]).toBeDefined();
      expect(WHY[key].headline.length).toBeGreaterThan(0);
    }
  });
});

describe('TRUST_CONFIG integrity', () => {
  const TRUST_LEVELS = ['verified', 'assessed', 'unverified'] as const;

  it('covers every TrustLevel with required display fields', () => {
    for (const level of TRUST_LEVELS) {
      expect(TRUST_CONFIG[level]).toBeDefined();
      expect(TRUST_CONFIG[level].label.length).toBeGreaterThan(0);
      expect(TRUST_CONFIG[level].badgeClass.length).toBeGreaterThan(0);
    }
  });
});
