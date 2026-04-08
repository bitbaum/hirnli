import { CHART_COLORS } from '@/lib/config/chart-colors';

/**
 * Financial page data — SSOT for all numbers on /finanzen
 *
 * Sources:
 *   - Annual P&L: Kivitendo Erfolgsrechnung (verified 2026-02-11)
 *   - Monthly revenue: lib/data/financial.ts (Kivitendo export, 2022-2025)
 *   - Expense categories: Aggregated from individual Kontenplan accounts
 *
 * NOTE on data completeness:
 *   2018-2023: Full P&L (revenue + expenses) — reliable
 *   2024-2025: Revenue only — expenses NOT booked in Kivitendo
 */

// ---------------------------------------------------------------------------
// Revenue categories (monthly breakdown, used by Monatsdetails tab)
// ---------------------------------------------------------------------------

export const REVENUE_CATEGORIES = [
  { key: 'warenverkauf' as const, label: 'Warenverkauf', code: '3100' },
  { key: 'dienstleistungen' as const, label: 'Dienstleistungen', code: '3400' },
  { key: 'integration' as const, label: 'Integration', code: '3450' },
  { key: 'spenden' as const, label: 'Spenden', code: '3500' },
  { key: 'aufstockung' as const, label: 'Aufstockung', code: '3510' },
] as const;

// ---------------------------------------------------------------------------
// Expense categories (annual P&L breakdown)
// ---------------------------------------------------------------------------

export const EXPENSE_CATEGORIES = [
  { key: 'miete' as const, label: 'Miete & Nebenkosten', codes: '6000, 6400, 6460', color: CHART_COLORS.red },
  { key: 'personal' as const, label: 'Personal', codes: '5000–5830', color: CHART_COLORS.blue },
  { key: 'material' as const, label: 'Material & Beschaffung', codes: '4000, 4400, 4710', color: '#F39C12' },
  { key: 'it' as const, label: 'IT & Kommunikation', codes: '6510, 6511', color: CHART_COLORS.purple },
  { key: 'abschreibungen' as const, label: 'Abschreibungen', codes: '6800', color: '#95A5A6' },
  { key: 'uebrig' as const, label: 'Übriger Betrieb', codes: '6100–6900, 8xxx', color: '#BDC3C7' },
] as const;

export type ExpenseCategoryKey = typeof EXPENSE_CATEGORIES[number]['key'];

// ---------------------------------------------------------------------------
// Annual P&L data (Erfolgsrechnung 2018-2025)
// ---------------------------------------------------------------------------

export interface AnnualPLEntry {
  year: number;
  revenue: number;
  expenses: number;
  result: number;
  isComplete: boolean;
  note?: string;
  revenueDetail: {
    warenverkauf: number;
    dienstleistungen: number;
    integration: number;
    spenden: number;
  };
  expenseDetail?: Record<ExpenseCategoryKey, number>;
}

// All figures from Kivitendo Erfolgsrechnung, rounded to nearest CHF
// Expense categories aggregated from individual Kontenplan accounts
export const ANNUAL_PL: AnnualPLEntry[] = [
  {
    year: 2018, revenue: 107135, expenses: 83066, result: 24069, isComplete: true,
    revenueDetail: { warenverkauf: 23689, dienstleistungen: 57472, integration: 5500, spenden: 20494 },
    expenseDetail: { miete: 30000, personal: 39999, material: 5275, it: 4173, abschreibungen: 0, uebrig: 3620 },
  },
  {
    year: 2019, revenue: 79842, expenses: 75039, result: 4802, isComplete: true,
    note: 'Buchungsanomalien: Löhne=0, Miete=2.5k, 6700=55.6k (Umstrukturierung)',
    revenueDetail: { warenverkauf: 30925, dienstleistungen: 67137, integration: 9500, spenden: 4675 },
    expenseDetail: { miete: 2500, personal: 3000, material: 117, it: 78, abschreibungen: 500, uebrig: 68845 },
  },
  {
    year: 2020, revenue: 93715, expenses: 95785, result: -2070, isComplete: true,
    revenueDetail: { warenverkauf: 17815, dienstleistungen: 67592, integration: 6000, spenden: 2324 },
    expenseDetail: { miete: 34970, personal: 30344, material: 2805, it: 7767, abschreibungen: 1245, uebrig: 18654 },
  },
  {
    year: 2021, revenue: 140191, expenses: 142870, result: -2679, isComplete: true,
    revenueDetail: { warenverkauf: 48221, dienstleistungen: 69020, integration: 9000, spenden: 15832 },
    expenseDetail: { miete: 79465, personal: 29328, material: 10667, it: 5770, abschreibungen: 0, uebrig: 17640 },
  },
  {
    year: 2022, revenue: 129920, expenses: 130413, result: -493, isComplete: true,
    revenueDetail: { warenverkauf: 35441, dienstleistungen: 80080, integration: 3500, spenden: 10867 },
    expenseDetail: { miete: 79990, personal: 32109, material: 8958, it: 5994, abschreibungen: 0, uebrig: 3363 },
  },
  {
    year: 2023, revenue: 134450, expenses: 159667, result: -25217, isComplete: true,
    revenueDetail: { warenverkauf: 36997, dienstleistungen: 75342, integration: 10500, spenden: 10192 },
    expenseDetail: { miete: 80280, personal: 48075, material: 8857, it: 8583, abschreibungen: 10000, uebrig: 3872 },
  },
  {
    year: 2024, revenue: 119274, expenses: 131, result: 119143, isComplete: false,
    note: 'Aufwände nicht verbucht — nur Einnahmen zuverlässig',
    revenueDetail: { warenverkauf: 23135, dienstleistungen: 84974, integration: 4500, spenden: -209 },
  },
  {
    year: 2025, revenue: 60402, expenses: 1397, result: 59005, isComplete: false,
    note: 'Aufwände nicht verbucht — nur Einnahmen zuverlässig',
    revenueDetail: { warenverkauf: 22086, dienstleistungen: 27573, integration: 0, spenden: 762 },
  },
];

// ---------------------------------------------------------------------------
// Derived constants
// ---------------------------------------------------------------------------

export const COMPLETE_YEARS = ANNUAL_PL.filter(y => y.isComplete);
export const PEAK_REVENUE = Math.max(...ANNUAL_PL.map(y => y.revenue));
export const PEAK_YEAR = ANNUAL_PL.find(y => y.revenue === PEAK_REVENUE)!.year;
export const LATEST_COMPLETE = COMPLETE_YEARS[COMPLETE_YEARS.length - 1];
export const CUMULATIVE_RESULT = COMPLETE_YEARS.reduce((sum, y) => sum + y.result, 0);

// Financial year range constants — canonical source is lib/config/financial-constants.ts
// Re-exported here for backward compatibility with app/ consumers.
export {
  FINANCIAL_YEAR_START,
  FINANCIAL_YEAR_END,
  FINANCIAL_YEAR_COUNT,
  FINANCIAL_YEAR_RANGE,
  FINANCIAL_YEAR_LABEL,
} from '@/lib/config/financial-constants';
export const AVG_REVENUE = Math.round(
  COMPLETE_YEARS.reduce((sum, y) => sum + y.revenue, 0) / COMPLETE_YEARS.length,
);

// ---------------------------------------------------------------------------
// Data quality metadata
// ---------------------------------------------------------------------------

export const DATA_QUALITY = {
  source: 'Kivitendo Erfolgsrechnung, verifiziert 11.02.2026',
  sourceSystem: 'Kivitendo Buchhaltung v3.9.2',
  completeRange: '2018–2023',
  incompleteRange: '2024–2025',
  lastCompleteYear: 2023,
  caveat: 'Seit 2024 wurden keine Aufwände verbucht. Das Geschäftsergebnis 2024–2025 ist nicht berechenbar. Nur Einnahmen sind zuverlässig.',
  anomalousYear: 2019,
  anomalyNote: '2019: Grosse Umbuchungen (6700=55.6k, 3805=-34.2k). Aufwandstruktur nicht aussagekräftig.',
} as const;
