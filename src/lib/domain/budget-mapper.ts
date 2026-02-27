/**
 * Budget Mapper — Maps foundation profile to budget scenario + amount
 *
 * Uses grant range first (data-driven), type as fallback.
 * Prevents asking CHF 50k from a foundation that gives max CHF 15k.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import { getScenario } from '@/lib/config/budget-scenarios';
import type { BudgetScenario } from '@/lib/schemas/budget';

/**
 * Map foundation to budget scenario.
 *
 * Grant range logic: <20k → minimal, 20-50k → moderate, >50k → maximum
 * Fallback (no range): Type A → maximum, Type B → moderate, C/D → minimal
 */
export function getScenarioForFoundation(foundation: Foundation): BudgetScenario {
  let scenarioId: string;

  const maxGrant = foundation.amount.max;
  if (maxGrant !== null) {
    if (maxGrant < 20_000) {
      scenarioId = 'minimal';
    } else if (maxGrant <= 50_000) {
      scenarioId = 'moderate';
    } else {
      scenarioId = 'maximum';
    }
  } else if (foundation.type === 'A') {
    scenarioId = 'maximum';
  } else if (foundation.type === 'B') {
    scenarioId = 'moderate';
  } else {
    scenarioId = 'minimal';
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return getScenario('moderate')!;
  }

  return scenario;
}

/** Compute requested amount based on foundation's typical range vs year-1 funding gap */
export function computeRequestedAmount(foundation: Foundation, scenario: BudgetScenario): number {
  const year1Budget = scenario.threeYearModel.year1.einmalig + scenario.threeYearModel.year1.jaehrlich;
  const gap = year1Budget - scenario.threeYearModel.year1.eigenleistung;
  const max = foundation.amount.max;
  const min = foundation.amount.min;

  if (max && max <= gap) return max;
  if (max && min) return Math.min(Math.round((min + max) / 2), gap);
  if (min) return Math.min(min * 2, gap);
  return Math.round(gap * 0.2 / 5000) * 5000;
}
