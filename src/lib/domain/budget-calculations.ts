import type { BudgetLineItem, BudgetScenario, BudgetCategory } from '@/lib/schemas/budget';
import { BUDGET_SCENARIOS, BUDGET_LINE_ITEMS } from '@/lib/config/budget-scenarios';
import type { ThemeKey } from '@/lib/config/stories';

/**
 * Budget Domain Functions (Pure, Testable)
 *
 * No side effects, no I/O, just data transformation and lookup.
 * Reusable in components, server actions, and PDF generation.
 */

// -- Lookup helpers -----------------------------------------------------------

export function getScenario(id: string): BudgetScenario | undefined {
  return BUDGET_SCENARIOS.find((s) => s.id === id);
}

function getLineItem(id: string): BudgetLineItem | undefined {
  return BUDGET_LINE_ITEMS.find((item) => item.id === id);
}

export function getLineItemsForScenario(scenarioId: string): BudgetLineItem[] {
  const scenario = getScenario(scenarioId);
  if (!scenario) return [];
  return scenario.lineItemIds
    .map((id) => getLineItem(id))
    .filter((item): item is BudgetLineItem => item !== undefined);
}

/** Get themed label for a budget line item (Robert Rule III: same cost, different framing) */
export function getThemedLabel(item: BudgetLineItem, themeKey?: ThemeKey): { label: string; description: string } {
  if (themeKey && item.themeLabels?.[themeKey]) {
    return item.themeLabels[themeKey];
  }
  return { label: item.label, description: item.description };
}

/**
 * Calculate 3-year totals including Eigenleistung
 */
export function calculate3YearTotals(scenario: BudgetScenario) {
  const { year1, year2, year3 } = scenario.threeYearModel;

  const y1Total = year1.einmalig + year1.jaehrlich;
  const y2Total = year2.jaehrlich;
  const y3Total = year3.jaehrlich;

  const stiftungenTotal = y1Total + y2Total + y3Total;
  const eigenTotal = year1.eigenleistung + year2.eigenleistung + year3.eigenleistung;
  const projectTotal = stiftungenTotal + eigenTotal;

  return {
    stiftungenTotal,
    eigenTotal,
    projectTotal,
    y1Total,
    y2Total,
    y3Total,
  };
}

/**
 * Group line items by category
 */
export function groupLineItemsByCategory(items: BudgetLineItem[]): Map<BudgetCategory, BudgetLineItem[]> {
  const grouped = new Map<BudgetCategory, BudgetLineItem[]>();

  for (const item of items) {
    if (!grouped.has(item.category)) {
      grouped.set(item.category, []);
    }
    grouped.get(item.category)!.push(item);
  }

  return grouped;
}
