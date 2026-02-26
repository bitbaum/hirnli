/**
 * Projections — Display-ready values derived from SSOT files
 *
 * This is a thin convenience layer. ALL values are DERIVED from:
 * - numbers.ts (HUB_SPACE_TOTAL, YEARS_EXPERIENCE, DEVICES_PER_MONTH_CURRENT, etc.)
 * - fundraising/data.ts (REVENUE_CURRENT_TOTAL, REVENUE_YEAR3_TOTAL, REVENUE_HISTORY, etc.)
 * - hub-space-plan.ts (HUB_SPACE_AREAS, SPACE_SUMMARY)
 *
 * Pages import from here instead of hardcoding display values.
 * If a number changes in the SSOT, it propagates everywhere automatically.
 */

import { NUMBERS_REGISTRY, getNumericValue } from '@/lib/config/numbers';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import {
  REVENUE_HISTORY,
  PROJECT_DURATION,
} from '@/app/fundraising/data';
import { HUB_SPACE_AREAS } from '@/lib/config/hub-space-plan';
import { formatCHF } from '@/lib/utils/format';

// -- Helpers (internal) --------------------------------------------------------

/** Format amount as shorthand: 60000 → 'CHF 60k', 195000 → 'CHF 195k' */
function formatCHFk(amount: number): string {
  if (amount >= 1000) {
    const k = Math.round(amount / 1000);
    return `CHF ${k}k`;
  }
  return formatCHF(amount);
}

// -- Hub -----------------------------------------------------------------------

export const HUB_SPACE_SQM = getNumericValue('HUB_SPACE_TOTAL');
export const HUB_SPACE_DISPLAY = `~${HUB_SPACE_SQM} m²`;
export const HUB_SETUP_PHASE = PROJECT_DURATION; // '3 Jahre (2026–2028)'

// -- Revenue -------------------------------------------------------------------
// REVENUE_CURRENT uses the Erfolgsrechnung total (60k), not the 8-stream model sum (50.8k).
// The Erfolgsrechnung is the authoritative financial source (Kivitendo).

export const REVENUE_CURRENT = getNumericValue('CURRENT_BUDGET'); // 60_000
export const REVENUE_YEAR3 = getNumericValue('YEAR3_REVENUE_TOTAL'); // 195_000

export const REVENUE_CURRENT_DISPLAY = formatCHFk(REVENUE_CURRENT); // 'CHF 60k'
export const REVENUE_YEAR3_DISPLAY = formatCHFk(REVENUE_YEAR3); // 'CHF 195k'

export const REVENUE_GROWTH_DISPLAY =
  `Von ${REVENUE_CURRENT_DISPLAY} (aktuell, 2025) → ${REVENUE_YEAR3_DISPLAY} Revenue (Ziel Jahr 3, 2028)`;

// Peak revenue year — derived from REVENUE_HISTORY
export const REVENUE_PEAK_YEAR = REVENUE_HISTORY.reduce(
  (peak, entry) => (entry.total > peak.amount ? { year: entry.year, amount: entry.total } : peak),
  { year: 0, amount: 0 },
);
export const REVENUE_PEAK_DISPLAY = formatCHFk(REVENUE_PEAK_YEAR.amount); // 'CHF 140k'

/** Revenue decline narrative: "CHF 140k (2021) auf CHF 60k (2025)" */
export const REVENUE_DECLINE_DISPLAY =
  `${REVENUE_PEAK_DISPLAY} (${REVENUE_PEAK_YEAR.year}) auf ${REVENUE_CURRENT_DISPLAY} (2025)`;

// -- Devices -------------------------------------------------------------------

export const DEVICES_PER_MONTH_CURRENT_DISPLAY =
  String(NUMBERS_REGISTRY.DEVICES_PER_MONTH_CURRENT.value); // '~12-15'

export const DEVICES_PER_MONTH_TARGET = getNumericValue('DEVICES_PER_MONTH_TARGET');
export const DEVICES_PER_YEAR_TARGET = DEVICES_PER_MONTH_TARGET * 12; // 480
export const DEVICES_PER_YEAR_TARGET_DISPLAY = `~${DEVICES_PER_YEAR_TARGET}`; // '~480'

// -- People --------------------------------------------------------------------

export const PEOPLE_REACHED_PER_YEAR =
  String(NUMBERS_REGISTRY.PEOPLE_REACHED_PER_YEAR_WITH_2BPL.value); // '40-60'
export const PEOPLE_REACHED_DISPLAY = `${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr`;

// -- Experience ----------------------------------------------------------------

// -- BPL Reach (ranges from numbers.ts) ----------------------------------------

export const BPL_HARDWARE_PER_YEAR_DISPLAY =
  String(NUMBERS_REGISTRY.BPL_HARDWARE_TECHNICIANS_PER_YEAR.value); // '8-12'
export const BPL_SOFTWARE_PER_YEAR_DISPLAY =
  String(NUMBERS_REGISTRY.BPL_SOFTWARE_DEVELOPERS_PER_YEAR.value); // '6-10'
export const PEOPLE_REACHED_CURRENT_DISPLAY =
  String(NUMBERS_REGISTRY.PEOPLE_REACHED_CURRENT.value); // '~5'
export const REPAIR_TABLES_CURRENT =
  getNumericValue('REPAIR_TABLES_CURRENT'); // 4

// -- Experience ----------------------------------------------------------------

export const YEARS_EXPERIENCE = getNumericValue('YEARS_EXPERIENCE'); // 23
export const YEARS_EXPERIENCE_DISPLAY = `${YEARS_EXPERIENCE} Jahre Erfahrung (seit ${ORG_PROFILE.founded})`;

// -- Space Costs (derived from hub-space-plan.ts) ------------------------------

/**
 * Look up the equipment/setup cost for a space by name.
 * Returns the numeric cost, or null if not found or not numeric.
 */
export function getSpaceCost(spaceName: string): number | null {
  const area = HUB_SPACE_AREAS.find((a) => a.name === spaceName);
  if (!area) return null;
  return typeof area.cost_estimate_chf === 'number' ? area.cost_estimate_chf : null;
}

/**
 * Format the equipment cost for a space as a CHF display string.
 * Returns the formatted cost, or a fallback if the space has a non-numeric cost.
 */
export function getSpaceCostDisplay(spaceName: string): string {
  const cost = getSpaceCost(spaceName);
  if (cost === null) {
    // AI Lab has a string cost (variable) — return it as-is
    const area = HUB_SPACE_AREAS.find((a) => a.name === spaceName);
    return area ? String(area.cost_estimate_chf) : 'Nicht definiert';
  }
  return formatCHF(cost);
}

/**
 * Sum the equipment costs for multiple spaces.
 * Skips spaces with non-numeric costs (e.g., AI Lab).
 */
export function getCombinedSpaceCost(spaceNames: string[]): number {
  return spaceNames.reduce((sum, name) => {
    const cost = getSpaceCost(name);
    return sum + (cost ?? 0);
  }, 0);
}
