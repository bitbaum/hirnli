/**
 * The mechanism that turns one organisation's budget into a Gesuch's figures.
 *
 * Holds no amounts. Everything it works on arrives as an argument, for the
 * reason `story-engine.ts` gives at greater length: functions that close over
 * content can only ever serve the one organisation whose content is in scope,
 * and they read as general while being specific.
 *
 * The stakes are higher here than for prose. A borrowed sentence is
 * embarrassing; a borrowed figure is a false statement about what a project
 * costs, in a document an applicant signs and sends to a funder.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type {
  BudgetBlock,
  BudgetCategory,
  BudgetLineItem,
  BudgetScenario,
} from '@/lib/schemas/budget';
import type { Tenant } from '@/lib/tenant/profile';
import type { ThemeKey } from './story-themes';
import { getBudgetBlock } from './budget-source';

const GRANT_TIER_SMALL = 20_000; // Below this → the smallest scenario
const GRANT_TIER_MEDIUM = 50_000; // Below this → the middle one; above → the largest
const MIN_REQUEST_AMOUNT = 5_000; // Floor for computed request amounts

/** One row of the three-year table a funder reads. */
export interface ThreeYearRow {
  year: string;
  einmalig: number;
  stiftungen: number;
  eigen: number;
  total: number;
  label: string;
}

export interface ThreeYearTable {
  rows: ThreeYearRow[];
  stiftungen3yTotal: number;
  eigen3yTotal: number;
  project3yTotal: number;
}

export interface TenantBudget {
  readonly tenant: Tenant;
  readonly raw: BudgetBlock;
  scenarios(): BudgetScenario[];
  scenario(id: string): BudgetScenario | undefined;
  /** The scenario shown when nothing selects one. */
  defaultScenario(): BudgetScenario;
  lineItemsFor(scenarioId: string): BudgetLineItem[];
  /** Same cost, framed for the theme the Gesuch is written from. */
  themedLabel(item: BudgetLineItem, themeKey?: ThemeKey): { label: string; description: string };
  groupByCategory(items: BudgetLineItem[]): Map<BudgetCategory, BudgetLineItem[]>;
  /** The three-year table for a given scenario. */
  threeYearTable(scenario: BudgetScenario): ThreeYearTable;
  projectDuration(): string;
  /** Which of this tenant's scenarios suits a foundation's grant range. */
  scenarioForFoundation(foundation: Foundation): BudgetScenario;
  requestedAmount(foundation: Foundation, scenario: BudgetScenario): number;
}

export function tenantBudget(tenant: Tenant, block: BudgetBlock): TenantBudget {
  const scenario = (id: string) => block.SCENARIOS.find((s) => s.id === id);
  const lineItem = (id: string) => block.LINE_ITEMS.find((i) => i.id === id);

  const defaultScenario = (): BudgetScenario => {
    const found = scenario(block.PROJECT.defaultScenarioId);
    // A block whose default names no scenario is malformed content rather than
    // a runtime condition to paper over: falling back to "the first one" would
    // put an arbitrary organisation's arbitrary scenario in a grant document.
    if (!found) {
      throw new Error(
        `budget: defaultScenarioId "${block.PROJECT.defaultScenarioId}" matches no scenario`,
      );
    }
    return found;
  };

  const lineItemsFor = (scenarioId: string): BudgetLineItem[] => {
    const s = scenario(scenarioId);
    if (!s) return [];
    return s.lineItemIds
      .map((id) => lineItem(id))
      .filter((item): item is BudgetLineItem => item !== undefined);
  };

  return {
    tenant,
    raw: block,
    scenarios: () => block.SCENARIOS,
    scenario,
    defaultScenario,
    lineItemsFor,

    themedLabel: (item, themeKey) =>
      themeKey && item.themeLabels?.[themeKey]
        ? item.themeLabels[themeKey]
        : { label: item.label, description: item.description },

    groupByCategory: (items) => {
      const grouped = new Map<BudgetCategory, BudgetLineItem[]>();
      for (const item of items) {
        if (!grouped.has(item.category)) grouped.set(item.category, []);
        grouped.get(item.category)!.push(item);
      }
      return grouped;
    },

    /**
     * Build the three-year table from ONE scenario.
     *
     * Year one is derived from the scenario's own line items; years two and
     * three step down by the tenant's declared degressive model. That
     * derivation is carried over verbatim from `fundraising/data.ts`, including
     * a disagreement worth stating plainly rather than quietly fixing: the
     * percentages here produce different year-2 and year-3 figures than the
     * `threeYearModel` the same scenario declares, and the two treat
     * Eigenleistung differently — as an addition to the funders' share here,
     * and as a deduction from it in `requestedAmount()` below.
     *
     * Reconciling them changes the numbers a live customer sends to funders,
     * which is their decision and not a refactor's. The scenario is a parameter
     * so that decision is a one-line change at the call site.
     */
    threeYearTable: (s) => {
      const items = lineItemsFor(s.id);
      const y1Einmalig = items
        .filter((i) => i.type === 'einmalig')
        .reduce((sum, i) => sum + i.amount, 0);
      const y1Stiftungen = items
        .filter((i) => i.type === 'jaehrlich')
        .reduce((sum, i) => sum + i.amount, 0);
      const y1Eigen = s.threeYearModel.year1.eigenleistung;
      const [l1, l2, l3] = block.PROJECT.yearLabels;

      const y2Stiftungen = Math.round(y1Stiftungen * block.DEGRESSIVE.year2.stiftungenPct);
      const y3Stiftungen = Math.round(y1Stiftungen * block.DEGRESSIVE.year3.stiftungenPct);
      const y2Eigen = y1Eigen + block.DEGRESSIVE.year2.eigenGrowth;
      const y3Eigen = y1Eigen + block.DEGRESSIVE.year3.eigenGrowth;

      const rows: ThreeYearRow[] = [
        {
          year: 'Jahr 1',
          einmalig: y1Einmalig,
          stiftungen: y1Stiftungen,
          eigen: y1Eigen,
          total: y1Einmalig + y1Stiftungen + y1Eigen,
          label: l1,
        },
        {
          year: 'Jahr 2',
          einmalig: 0,
          stiftungen: y2Stiftungen,
          eigen: y2Eigen,
          total: y2Stiftungen + y2Eigen,
          label: l2,
        },
        {
          year: 'Jahr 3',
          einmalig: 0,
          stiftungen: y3Stiftungen,
          eigen: y3Eigen,
          total: y3Stiftungen + y3Eigen,
          label: l3,
        },
      ];

      return {
        rows,
        stiftungen3yTotal: rows.reduce((sum, y) => sum + y.stiftungen + y.einmalig, 0),
        eigen3yTotal: rows.reduce((sum, y) => sum + y.eigen, 0),
        project3yTotal: rows.reduce((sum, y) => sum + y.total, 0),
      };
    },

    projectDuration: () =>
      `3 Jahre (${block.PROJECT.startYear}–${block.PROJECT.endYear}): ${block.PROJECT.durationLabel}`,

    /**
     * Grant range first, foundation type as fallback.
     *
     * The TIERS are the platform's — how much money makes a request large is a
     * fact about Swiss foundations, not about the applicant — but the scenarios
     * chosen between are the tenant's. An organisation with one scenario gets
     * that one for every foundation, which is correct rather than degraded.
     */
    scenarioForFoundation: (foundation) => {
      const ordered = [...block.SCENARIOS];
      const smallest = ordered[0];
      const largest = ordered[ordered.length - 1];
      const middle = ordered[Math.floor((ordered.length - 1) / 2)];

      const maxGrant = foundation.amount.max;
      if (maxGrant !== null) {
        if (maxGrant < GRANT_TIER_SMALL) return smallest;
        if (maxGrant <= GRANT_TIER_MEDIUM) return middle;
        return largest;
      }
      if (foundation.type === 'A') return largest;
      if (foundation.type === 'B') return middle;
      return smallest;
    },

    requestedAmount: (foundation, s) => {
      const year1Budget = s.threeYearModel.year1.einmalig + s.threeYearModel.year1.jaehrlich;
      const gap = year1Budget - s.threeYearModel.year1.eigenleistung;
      const max = foundation.amount.max;
      const min = foundation.amount.min;

      if (max && max <= gap) return max;
      if (max && min) return Math.min(Math.round((min + max) / 2), gap);
      if (min) return Math.min(min * 2, gap);
      return Math.max(
        MIN_REQUEST_AMOUNT,
        Math.round((gap * 0.2) / MIN_REQUEST_AMOUNT) * MIN_REQUEST_AMOUNT,
      );
    },
  };
}

/**
 * This tenant's budget, or null if it has not stated one.
 *
 * Null means the Gesuch is composed without a budget section. A grant
 * application with no figures is incomplete and looks it; one with somebody
 * else's figures looks finished and is false.
 */
export async function loadTenantBudget(tenant: Tenant): Promise<TenantBudget | null> {
  const block = await getBudgetBlock(tenant);
  return block ? tenantBudget(tenant, block) : null;
}
