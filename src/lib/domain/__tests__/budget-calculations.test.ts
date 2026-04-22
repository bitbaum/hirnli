import { describe, it, expect } from 'vitest';
import {
  getScenario,
  getLineItemsForScenario,
  getThemedLabel,
  calculate3YearTotals,
  groupLineItemsByCategory,
} from '../budget-calculations';
import type { BudgetLineItem, BudgetScenario } from '@/lib/schemas/budget';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeScenario(overrides: Partial<BudgetScenario> = {}): BudgetScenario {
  return {
    id: 'minimal',
    label: 'Test',
    description: 'Test scenario',
    tagline: 'Test tagline',
    lineItemIds: [],
    targetFoundations: ['A'],
    spaceRequirement: { min_sqm: 0, max_sqm: 100 },
    threeYearModel: {
      year1: { einmalig: 10000, jaehrlich: 5000, eigenleistung: 2000 },
      year2: { jaehrlich: 8000, eigenleistung: 1000 },
      year3: { jaehrlich: 7000, eigenleistung: 500 },
    },
    ...overrides,
  };
}

const DEFAULT_SOURCE: BudgetLineItem['source'] = {
  methodology: 'Marktrecherche',
  confidence: 'estimated',
  lastVerified: '2026-01-01',
};

function makeLineItem(overrides: Partial<BudgetLineItem> = {}): BudgetLineItem {
  return {
    id: 'item-1',
    category: 'personnel',
    label: 'Default Label',
    description: 'Default Description',
    type: 'jaehrlich',
    amount: 10000,
    source: DEFAULT_SOURCE,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getScenario
// ---------------------------------------------------------------------------

describe('getScenario', () => {
  it('returns a scenario for a known id', () => {
    const scenario = getScenario('minimal');
    expect(scenario).toBeDefined();
    expect(scenario?.id).toBe('minimal');
  });

  it('returns undefined for an unknown id', () => {
    expect(getScenario('does-not-exist')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getLineItemsForScenario
// ---------------------------------------------------------------------------

describe('getLineItemsForScenario', () => {
  it('returns empty array for unknown scenario', () => {
    expect(getLineItemsForScenario('does-not-exist')).toHaveLength(0);
  });

  it('returns line items for a known scenario', () => {
    const items = getLineItemsForScenario('minimal');
    expect(items.length).toBeGreaterThan(0);
    // Every returned item should have the expected shape
    for (const item of items) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('category');
    }
  });
});

// ---------------------------------------------------------------------------
// getThemedLabel
// ---------------------------------------------------------------------------

describe('getThemedLabel', () => {
  it('returns default label and description when no themeKey given', () => {
    const item = makeLineItem({ label: 'Personalkosten', description: 'Löhne' });
    const result = getThemedLabel(item);
    expect(result.label).toBe('Personalkosten');
    expect(result.description).toBe('Löhne');
  });

  it('returns default label when themeKey not in themeLabels', () => {
    const item = makeLineItem({
      label: 'Personalkosten',
      description: 'Löhne',
      themeLabels: {},
    });
    const result = getThemedLabel(item, 'kreislaufwirtschaft');
    expect(result.label).toBe('Personalkosten');
  });

  it('returns themed label when themeKey matches', () => {
    const item = makeLineItem({
      label: 'Personalkosten',
      description: 'Löhne',
      themeLabels: {
        kreislaufwirtschaft: { label: 'Repair-Coaches', description: 'Fachkräfte für Reparatur' },
      },
    });
    const result = getThemedLabel(item, 'kreislaufwirtschaft');
    expect(result.label).toBe('Repair-Coaches');
    expect(result.description).toBe('Fachkräfte für Reparatur');
  });
});

// ---------------------------------------------------------------------------
// calculate3YearTotals
// ---------------------------------------------------------------------------

describe('calculate3YearTotals', () => {
  it('computes year totals correctly', () => {
    const scenario = makeScenario();
    const totals = calculate3YearTotals(scenario);
    // y1Total = einmalig(10000) + jaehrlich(5000) = 15000
    expect(totals.y1Total).toBe(15000);
    // y2Total = jaehrlich(8000)
    expect(totals.y2Total).toBe(8000);
    // y3Total = jaehrlich(7000)
    expect(totals.y3Total).toBe(7000);
  });

  it('computes stiftungenTotal as sum of yearly totals', () => {
    const scenario = makeScenario();
    const totals = calculate3YearTotals(scenario);
    // stiftungenTotal = 15000 + 8000 + 7000 = 30000
    expect(totals.stiftungenTotal).toBe(30000);
  });

  it('computes eigenTotal as sum of all eigenleistung', () => {
    const scenario = makeScenario();
    const totals = calculate3YearTotals(scenario);
    // eigenTotal = 2000 + 1000 + 500 = 3500
    expect(totals.eigenTotal).toBe(3500);
  });

  it('computes projectTotal as stiftungenTotal + eigenTotal', () => {
    const scenario = makeScenario();
    const totals = calculate3YearTotals(scenario);
    // projectTotal = 30000 + 3500 = 33500
    expect(totals.projectTotal).toBe(33500);
  });

  it('handles zero values without error', () => {
    const scenario = makeScenario({
      threeYearModel: {
        year1: { einmalig: 0, jaehrlich: 0, eigenleistung: 0 },
        year2: { jaehrlich: 0, eigenleistung: 0 },
        year3: { jaehrlich: 0, eigenleistung: 0 },
      },
    });
    const totals = calculate3YearTotals(scenario);
    expect(totals.stiftungenTotal).toBe(0);
    expect(totals.eigenTotal).toBe(0);
    expect(totals.projectTotal).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// groupLineItemsByCategory
// ---------------------------------------------------------------------------

describe('groupLineItemsByCategory', () => {
  it('returns empty map for empty array', () => {
    expect(groupLineItemsByCategory([]).size).toBe(0);
  });

  it('groups items by category', () => {
    const items = [
      makeLineItem({ id: 'a', category: 'personnel' }),
      makeLineItem({ id: 'b', category: 'equipment' }),
      makeLineItem({ id: 'c', category: 'personnel' }),
    ];
    const grouped = groupLineItemsByCategory(items);
    expect(grouped.get('personnel')?.length).toBe(2);
    expect(grouped.get('equipment')?.length).toBe(1);
  });

  it('preserves order within each category', () => {
    const items = [
      makeLineItem({ id: 'first', category: 'personnel' }),
      makeLineItem({ id: 'second', category: 'personnel' }),
    ];
    const grouped = groupLineItemsByCategory(items);
    const personnelItems = grouped.get('personnel')!;
    expect(personnelItems[0].id).toBe('first');
    expect(personnelItems[1].id).toBe('second');
  });

  it('handles single item', () => {
    const items = [makeLineItem({ category: 'operations' })];
    const grouped = groupLineItemsByCategory(items);
    expect(grouped.get('operations')?.length).toBe(1);
  });
});
