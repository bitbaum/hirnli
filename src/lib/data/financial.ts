/**
 * Financial Data Module (TypeScript port of data-loader.js)
 *
 * Provides the FinanceDataSet class and data loading from fallback data.
 *
 * Data flow:
 *   Kivitendo -> revamp-Einnahmen-2025.xlsx -> import_financial_data.py -> JSON -> Dashboard
 *
 * The figures themselves live in `financial-fallback.ts`. This file is the
 * logic: how rows aggregate into months, what a query over them answers.
 */

import type {
  FinancialRow,
  MonthlyAggregate,
  SourceInfo,
  SumWithSource,
} from '../schemas/financial';
import { FALLBACK_DATA } from './financial-fallback';

// ---------------------------------------------------------------------------
// Metadata about the data source
// ---------------------------------------------------------------------------

interface DataMetadata {
  source: string;
  sourceSystem: string;
  lastImport: string;
}

const DEFAULT_METADATA: DataMetadata = {
  source: 'revamp-Einnahmen-2025.xlsx',
  sourceSystem: 'Kivitendo Buchhaltung',
  lastImport: '2026-01-11T21:38:12.885176',
};

// ---------------------------------------------------------------------------
// Source tracking record attached to each monthly aggregate
// ---------------------------------------------------------------------------

interface AccountSource {
  account: string;
  name: string;
  value: number;
}

/** Extends the schema MonthlyAggregate with internal source tracking. */
interface MonthlyRow extends MonthlyAggregate {
  _sources: AccountSource[];
}

// ---------------------------------------------------------------------------
// Column name mapping for legacy compatibility
// ---------------------------------------------------------------------------

const COLUMN_MAP: Record<string, string> = {
  Geraeteverkauefe: 'warenverkauf',
  Dienstleistungen_Reparatur_IT: 'dienstleistungen',
  Dienstleistungen_Web_Development: 'dienstleistungen',
  Datenrettung: 'dienstleistungen',
  Grants_Stiftungen: 'spenden',
  Corporate_Partnerships: 'spenden',
  Privatspenden: 'spenden',
  Oeffentliche_Zuschuesse: 'spenden',
  Total_Revenue: 'total',
  Month: 'period',
};

// ---------------------------------------------------------------------------
// FinanceDataSet
// ---------------------------------------------------------------------------

class FinanceDataSet {
  private readonly data: MonthlyRow[];
  private readonly _year: number | null;
  private readonly _metadata: DataMetadata;

  constructor(data: MonthlyRow[], year: number | null, metadata: DataMetadata) {
    this.data = data;
    this._year = year;
    this._metadata = metadata;
  }

  // -- Basic accessors ------------------------------------------------------

  getAll(): MonthlyRow[] {
    return this.data;
  }

  count(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  getRow(index: number): MonthlyRow | undefined {
    return this.data[index];
  }

  // -- Source traceability ---------------------------------------------------

  getSource(): SourceInfo & { note: string } {
    return {
      file: this._metadata.source,
      system: this._metadata.sourceSystem,
      importedAt: this._metadata.lastImport,
      methodology: 'direct_kivitendo',
      confidence: 'high',
      note: 'Direkt aus Kivitendo-Buchhaltung exportiert',
    };
  }

  // -- Period access --------------------------------------------------------

  getByMonth(period: string): MonthlyRow | undefined {
    return this.data.find((row) => row.period === period);
  }

  getMonths(): string[] {
    return this.data.map((row) => row.period);
  }

  // -- Year filter ----------------------------------------------------------

  getByYear(year: number): FinanceDataSet {
    return new FinanceDataSet(
      this.data.filter((row) => row.year === year),
      year,
      this._metadata,
    );
  }

  // -- Column access (with legacy name mapping) -----------------------------

  getColumn(column: string): unknown[] {
    const actualColumn = COLUMN_MAP[column] ?? column;
    return this.data.map((row) => (row as unknown as Record<string, unknown>)[actualColumn]);
  }

  getNumericColumn(column: string): number[] {
    return this.getColumn(column).filter((v): v is number => typeof v === 'number');
  }

  // -- Aggregation ----------------------------------------------------------

  sum(column: string): number {
    const values = this.getNumericColumn(column);
    return values.reduce((acc, v) => acc + v, 0);
  }

  /** Sum with full traceability information. */
  sumWithSource(column: string): SumWithSource {
    const values = this.getNumericColumn(column);
    const total = values.reduce((acc, v) => acc + v, 0);

    return {
      value: total,
      source: {
        file: this._metadata.source,
        system: this._metadata.sourceSystem,
        importedAt: this._metadata.lastImport,
        methodology: 'direct_kivitendo',
        confidence: 'high',
      },
      calculation: {
        operation: 'SUM',
        column,
        count: values.length,
        values,
      },
    };
  }

  average(column: string): number {
    const values = this.getNumericColumn(column);
    if (values.length === 0) return 0;
    return values.reduce((acc, v) => acc + v, 0) / values.length;
  }

  // -- Convenience ----------------------------------------------------------

  /** Returns the last month that has a non-zero total. */
  getLatest(): MonthlyRow | null {
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (this.data[i].total !== 0) return this.data[i];
    }
    return this.data[this.data.length - 1] ?? null;
  }

  /** Returns a new dataset containing only months with a non-zero total. */
  getValidRows(): FinanceDataSet {
    return new FinanceDataSet(
      this.data.filter((row) => row.total !== 0 && row.total !== null && row.total !== undefined),
      this._year,
      this._metadata,
    );
  }
}

// ---------------------------------------------------------------------------
// Aggregate raw rows into monthly buckets
// ---------------------------------------------------------------------------

function aggregateByMonth(data: FinancialRow[]): MonthlyRow[] {
  const byMonth: Record<string, MonthlyRow> = {};

  for (const row of data) {
    const period = `${row.year}-${String(row.month).padStart(2, '0')}`;

    if (!byMonth[period]) {
      byMonth[period] = {
        period,
        year: row.year,
        month: row.month,
        warenverkauf: 0,
        dienstleistungen: 0,
        integration: 0,
        spenden: 0,
        aufstockung: 0,
        total: 0,
        _sources: [],
      };
    }

    switch (row.subcategory) {
      case 'products':
        byMonth[period].warenverkauf = row.value;
        break;
      case 'services':
        byMonth[period].dienstleistungen = row.value;
        break;
      case 'integration':
        byMonth[period].integration = row.value;
        break;
      case 'donations':
        byMonth[period].spenden = row.value;
        break;
      case 'price_adjustment':
        byMonth[period].aufstockung = row.value;
        break;
      case 'total':
        byMonth[period].total = row.value;
        break;
    }

    byMonth[period]._sources.push({
      account: row.account_code,
      name: row.account_name,
      value: row.value,
    });
  }

  return Object.values(byMonth).sort((a, b) => a.period.localeCompare(b.period));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Years for which fallback data is available. */
export const AVAILABLE_YEARS = [2022, 2023, 2024, 2025] as const;

/** The most recent year with embedded financial data — derived from AVAILABLE_YEARS (SSOT) */
export const CURRENT_FINANCIAL_YEAR = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];

/**
 * Loads financial data for a given year from the embedded fallback dataset.
 * Returns a FinanceDataSet ready for queries.
 */
export function loadFinancialData(year: number = CURRENT_FINANCIAL_YEAR): FinanceDataSet {
  const yearData = FALLBACK_DATA[year];

  if (!yearData) {
    // No data for this year — return empty dataset
    return new FinanceDataSet([], null, DEFAULT_METADATA);
  }

  const metadata: DataMetadata = {
    ...DEFAULT_METADATA,
    lastImport: yearData.imported_at,
  };

  const monthlyData = aggregateByMonth(yearData.data);
  return new FinanceDataSet(monthlyData, year, metadata);
}
