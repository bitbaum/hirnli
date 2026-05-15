/**
 * Financial year constants — shared across lib/config, components, and app/ pages
 *
 * These constants describe the year range of financial data available.
 * They are derived from ANNUAL_PL in app/finanzen/data.ts but extracted here
 * so that lib/ and component files don't import from app/ (layer violation).
 *
 * When adding a new year of financial data to ANNUAL_PL, update these values.
 */

export const FINANCIAL_YEAR_START = 2018;
export const FINANCIAL_YEAR_END = 2025;
const FINANCIAL_YEAR_COUNT = FINANCIAL_YEAR_END - FINANCIAL_YEAR_START + 1; // 8
export const FINANCIAL_YEAR_RANGE = `${FINANCIAL_YEAR_START}-${FINANCIAL_YEAR_END}`; // '2018-2025'
export const FINANCIAL_YEAR_LABEL = `${FINANCIAL_YEAR_COUNT} Jahre`; // '8 Jahre'
