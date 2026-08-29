import { describe, it, expect } from 'vitest';
import {
  getCustomizationSummary,
  type PersonalizedGesuch,
  type CustomizationAction,
} from '../personalization-engine';
import type { FoundationRow } from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeFoundationRow(overrides: Partial<FoundationRow> = {}): FoundationRow {
  return {
    id: 'test-foundation',
    name: 'Test Stiftung',
    fitScore: 5,
    priority: 2,
    researchDepth: 'standard',
    researchDate: null,
    dataConfidence: 'assessed',
    configData: {},
    orgId: null,
    source: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
    ...overrides,
  } as unknown as FoundationRow;
}

function makeAction(overrides: Partial<CustomizationAction> = {}): CustomizationAction {
  return {
    ruleId: 'rule-1',
    type: 'emphasize_narrative',
    value: 'Kreislaufwirtschaft',
    rationale: 'Test rationale',
    priority: 50,
    ...overrides,
  };
}

function makeGesuch(overrides: Partial<PersonalizedGesuch> = {}): PersonalizedGesuch {
  return {
    foundation: makeFoundationRow(),
    appliedRules: [],
    customizations: {
      emphasizedNarratives: [],
      visibleBudgetModules: [],
      hiddenBudgetModules: [],
      toneAdjustments: [],
      additionalSections: [],
      sectionOrder: [],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getCustomizationSummary — rule count header
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — rule count header', () => {
  it('opens with rule count when no rules applied', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).toContain('0 Anpassungsregeln angewendet:');
  });

  it('reflects the correct count of applied rules', () => {
    const gesuch = makeGesuch({ appliedRules: [makeAction(), makeAction({ ruleId: 'rule-2' })] });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('2 Anpassungsregeln angewendet:');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — emphasizedNarratives section
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — emphasizedNarratives', () => {
  it('omits section when no narratives', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).not.toContain('Hervorgehobene Narrative');
  });

  it('includes header when narratives present', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: ['Kreislaufwirtschaft'],
        visibleBudgetModules: [],
        hiddenBudgetModules: [],
        toneAdjustments: [],
        additionalSections: [],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('**Hervorgehobene Narrative:**');
    expect(summary).toContain('- Kreislaufwirtschaft');
  });

  it('lists all narratives as bullet points', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: ['Nachhaltigkeit', 'Arbeitsintegration'],
        visibleBudgetModules: [],
        hiddenBudgetModules: [],
        toneAdjustments: [],
        additionalSections: [],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('- Nachhaltigkeit');
    expect(summary).toContain('- Arbeitsintegration');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — visibleBudgetModules section
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — visibleBudgetModules', () => {
  it('omits section when no visible modules', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).not.toContain('Angezeigte Budget-Module');
  });

  it('lists visible modules with header', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: [],
        visibleBudgetModules: ['personnel', 'equipment'],
        hiddenBudgetModules: [],
        toneAdjustments: [],
        additionalSections: [],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('**Angezeigte Budget-Module:**');
    expect(summary).toContain('- personnel');
    expect(summary).toContain('- equipment');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — hiddenBudgetModules section
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — hiddenBudgetModules', () => {
  it('omits section when no hidden modules', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).not.toContain('Ausgeblendete Budget-Module');
  });

  it('lists hidden modules with header', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: [],
        visibleBudgetModules: [],
        hiddenBudgetModules: ['travel'],
        toneAdjustments: [],
        additionalSections: [],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('**Ausgeblendete Budget-Module:**');
    expect(summary).toContain('- travel');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — toneAdjustments section
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — toneAdjustments', () => {
  it('omits section when no tone adjustments', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).not.toContain('Tonanpassungen');
  });

  it('lists tone adjustments with header', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: [],
        visibleBudgetModules: [],
        hiddenBudgetModules: [],
        toneAdjustments: ['formal', 'data-driven'],
        additionalSections: [],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('**Tonanpassungen:**');
    expect(summary).toContain('- formal');
    expect(summary).toContain('- data-driven');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — additionalSections section
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — additionalSections', () => {
  it('omits section when no additional sections', () => {
    const summary = getCustomizationSummary(makeGesuch());
    expect(summary).not.toContain('Zusätzliche Abschnitte');
  });

  it('lists additional section names with header', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: [],
        visibleBudgetModules: [],
        hiddenBudgetModules: [],
        toneAdjustments: [],
        additionalSections: [{ section: 'Partnerschaftsnachweis', content: 'Inhalt...' }],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('**Zusätzliche Abschnitte:**');
    expect(summary).toContain('- Partnerschaftsnachweis');
  });
});

// ---------------------------------------------------------------------------
// getCustomizationSummary — combined output
// ---------------------------------------------------------------------------

describe('getCustomizationSummary — combined output', () => {
  it('returns a string (not undefined or null)', () => {
    expect(typeof getCustomizationSummary(makeGesuch())).toBe('string');
  });

  it('includes all populated sections in a single output string', () => {
    const gesuch = makeGesuch({
      appliedRules: [makeAction()],
      customizations: {
        emphasizedNarratives: ['Ökologie'],
        visibleBudgetModules: ['Technik'],
        hiddenBudgetModules: [],
        toneAdjustments: ['präzise'],
        additionalSections: [{ section: 'Anhang', content: '...' }],
        sectionOrder: [],
      },
    });
    const summary = getCustomizationSummary(gesuch);
    expect(summary).toContain('1 Anpassungsregeln angewendet:');
    expect(summary).toContain('**Hervorgehobene Narrative:**');
    expect(summary).toContain('**Angezeigte Budget-Module:**');
    expect(summary).toContain('**Tonanpassungen:**');
    expect(summary).toContain('**Zusätzliche Abschnitte:**');
  });

  it('sectionOrder does not appear in summary (internal use only)', () => {
    const gesuch = makeGesuch({
      customizations: {
        emphasizedNarratives: [],
        visibleBudgetModules: [],
        hiddenBudgetModules: [],
        toneAdjustments: [],
        additionalSections: [],
        sectionOrder: ['intro', 'budget', 'conclusion'],
      },
    });
    // sectionOrder has no dedicated section in the summary output
    const summary = getCustomizationSummary(gesuch);
    expect(summary).not.toContain('sectionOrder');
    expect(summary).not.toContain('intro');
  });
});
