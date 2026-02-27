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

export function getLineItem(id: string): BudgetLineItem | undefined {
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
 * Calculate total einmalig and jaehrlich costs for a scenario
 */
export function calculateScenarioTotals(scenarioId: string) {
  const items = getLineItemsForScenario(scenarioId);

  const einmalig = items
    .filter((item) => item.type === 'einmalig')
    .reduce((sum, item) => sum + item.amount, 0);

  const jaehrlich = items
    .filter((item) => item.type === 'jaehrlich')
    .reduce((sum, item) => sum + item.amount, 0);

  const year1Total = einmalig + jaehrlich;

  return { einmalig, jaehrlich, year1Total };
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

/**
 * Compare multiple scenarios side-by-side
 */
export function compareScenarios(scenarioIds: string[]) {
  return scenarioIds
    .map((id) => {
      const scenario = getScenario(id);
      if (!scenario) return null;

      const totals = calculate3YearTotals(scenario);
      const lineItemTotals = calculateScenarioTotals(id);

      return {
        scenario,
        totals,
        lineItemTotals,
      };
    })
    .filter((result): result is NonNullable<typeof result> => result !== null);
}

/**
 * Calculate category totals for a scenario
 */
export function calculateCategoryTotals(scenarioId: string): Map<BudgetCategory, number> {
  const items = getLineItemsForScenario(scenarioId);
  const grouped = groupLineItemsByCategory(items);
  const totals = new Map<BudgetCategory, number>();

  for (const [category, categoryItems] of grouped.entries()) {
    const total = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    totals.set(category, total);
  }

  return totals;
}

/**
 * Get percentage breakdown by category
 */
export function getCategoryPercentages(scenarioId: string): Map<BudgetCategory, number> {
  const categoryTotals = calculateCategoryTotals(scenarioId);
  const grandTotal = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);
  const percentages = new Map<BudgetCategory, number>();

  for (const [category, total] of categoryTotals.entries()) {
    percentages.set(category, grandTotal > 0 ? (total / grandTotal) * 100 : 0);
  }

  return percentages;
}

/**
 * Validate scenario totals match line item sums
 * Returns array of validation errors (empty if valid)
 */
export function validateScenarioTotals(scenarioId: string): string[] {
  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return [`Scenario ${scenarioId} not found`];
  }

  const errors: string[] = [];
  const lineItemTotals = calculateScenarioTotals(scenarioId);
  const y1FromModel = scenario.threeYearModel.year1.einmalig + scenario.threeYearModel.year1.jaehrlich;

  // Check if totals match (allow 1 CHF rounding difference)
  if (Math.abs(lineItemTotals.year1Total - y1FromModel) > 1) {
    errors.push(
      `Year 1 total mismatch: Line items sum to CHF ${lineItemTotals.year1Total}, but model shows CHF ${y1FromModel}`
    );
  }

  // Check einmalig matches
  if (Math.abs(lineItemTotals.einmalig - scenario.threeYearModel.year1.einmalig) > 1) {
    errors.push(
      `Einmalig total mismatch: Line items sum to CHF ${lineItemTotals.einmalig}, but model shows CHF ${scenario.threeYearModel.year1.einmalig}`
    );
  }

  // Check jaehrlich matches
  if (Math.abs(lineItemTotals.jaehrlich - scenario.threeYearModel.year1.jaehrlich) > 1) {
    errors.push(
      `Jaehrlich total mismatch: Line items sum to CHF ${lineItemTotals.jaehrlich}, but model shows CHF ${scenario.threeYearModel.year1.jaehrlich}`
    );
  }

  return errors;
}
