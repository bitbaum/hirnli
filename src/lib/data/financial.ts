/**
 * Financial Data Module (TypeScript port of data-loader.js)
 *
 * Provides the FinanceDataSet class and data loading from fallback data.
 *
 * Data flow:
 *   Kivitendo -> revamp-Einnahmen-2025.xlsx -> import_financial_data.py -> JSON -> Dashboard
 */

import type {
  FinancialRow,
  MonthlyAggregate,
  SourceInfo,
  SumWithSource,
  YearData,
} from '../schemas/financial';

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
export interface MonthlyRow extends MonthlyAggregate {
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

export class FinanceDataSet {
  private readonly data: MonthlyRow[];
  private readonly _year: number | null;
  private readonly _metadata: DataMetadata;

  constructor(
    data: MonthlyRow[],
    year: number | null,
    metadata: DataMetadata,
  ) {
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
    return this.data.map(
      (row) => (row as unknown as Record<string, unknown>)[actualColumn],
    );
  }

  getNumericColumn(column: string): number[] {
    return this.getColumn(column).filter(
      (v): v is number => typeof v === 'number',
    );
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
      this.data.filter(
        (row) => row.total !== 0 && row.total !== null && row.total !== undefined,
      ),
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

  return Object.values(byMonth).sort((a, b) =>
    a.period.localeCompare(b.period),
  );
}

// ---------------------------------------------------------------------------
// Fallback data — real Kivitendo data embedded for offline / file:// use
// Last updated: 2026-01-11 from revamp-Einnahmen-2025.xlsx
// ---------------------------------------------------------------------------

const FALLBACK_DATA: Record<number, YearData> = {
  2025: {
    year: 2025,
    source: 'revamp-Einnahmen-2025.xlsx',
    imported_at: '2026-01-11T21:38:12.885176',
    data: [
      // Totals per month
      { year: 2025, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3976.22 },
      { year: 2025, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4363.13 },
      { year: 2025, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3125.55 },
      { year: 2025, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3206.30 },
      { year: 2025, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4423.60 },
      { year: 2025, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3403.00 },
      { year: 2025, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3775.00 },
      { year: 2025, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3970.09 },
      { year: 2025, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2265.85 },
      { year: 2025, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3881.80 },
      { year: 2025, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 1687.50 },
      // Warenverkauf (products)
      { year: 2025, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1935.02 },
      { year: 2025, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1764.00 },
      { year: 2025, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2134.80 },
      { year: 2025, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1433.00 },
      { year: 2025, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2710.40 },
      { year: 2025, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2128.00 },
      { year: 2025, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 825.00 },
      { year: 2025, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2730.05 },
      { year: 2025, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1513.00 },
      { year: 2025, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2321.00 },
      { year: 2025, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1050.00 },
      // Dienstleistungen (services)
      { year: 2025, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2131.20 },
      { year: 2025, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2589.13 },
      { year: 2025, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 990.75 },
      { year: 2025, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1773.30 },
      { year: 2025, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1167.70 },
      { year: 2025, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1270.00 },
      { year: 2025, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2920.00 },
      { year: 2025, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1180.04 },
      { year: 2025, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 727.85 },
      { year: 2025, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1481.80 },
      { year: 2025, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 637.50 },
      // Spenden (donations)
      { year: 2025, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -90.00 },
      { year: 2025, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2025, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2025, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2025, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 535.50 },
      { year: 2025, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
      { year: 2025, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 30.00 },
      { year: 2025, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
      { year: 2025, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 25.00 },
      { year: 2025, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 54.00 },
      { year: 2025, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      // Aufstockung (price_adjustment)
      { year: 2025, month: 1, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 2, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 10.00 },
      { year: 2025, month: 3, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 4, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 5, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 10.00 },
      { year: 2025, month: 6, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 7, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 8, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 40.00 },
      { year: 2025, month: 9, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
      { year: 2025, month: 10, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 25.00 },
      { year: 2025, month: 11, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
    ],
  },

  2024: {
    year: 2024,
    source: 'revamp-Einnahmen-2025.xlsx',
    imported_at: '2026-01-11T21:38:12.890851',
    data: [
      // Totals per month
      { year: 2024, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5769.20 },
      { year: 2024, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 1867.74 },
      { year: 2024, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10989.27 },
      { year: 2024, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5288.12 },
      { year: 2024, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12336.90 },
      { year: 2024, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 46082.36 },
      { year: 2024, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4983.03 },
      { year: 2024, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2064.60 },
      { year: 2024, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3490.72 },
      { year: 2024, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2849.40 },
      { year: 2024, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5874.00 },
      { year: 2024, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 11705.87 },
      // Warenverkauf (products)
      { year: 2024, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 985.13 },
      { year: 2024, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 648.00 },
      { year: 2024, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2363.67 },
      { year: 2024, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2505.42 },
      { year: 2024, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3190.50 },
      { year: 2024, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3260.03 },
      { year: 2024, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1512.04 },
      { year: 2024, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 969.00 },
      { year: 2024, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1260.01 },
      { year: 2024, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1966.58 },
      { year: 2024, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3172.00 },
      { year: 2024, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1287.98 },
      // Dienstleistungen (services)
      { year: 2024, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 4746.07 },
      { year: 2024, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1219.74 },
      { year: 2024, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5605.60 },
      { year: 2024, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2927.70 },
      { year: 2024, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 7636.40 },
      { year: 2024, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 42774.03 },
      { year: 2024, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3605.99 },
      { year: 2024, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1095.60 },
      { year: 2024, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2198.71 },
      { year: 2024, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 992.82 },
      { year: 2024, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2702.00 },
      { year: 2024, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 10385.39 },
      // Integration
      { year: 2024, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
      { year: 2024, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 1500.00 },
      { year: 2024, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2024, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      // Spenden (donations)
      { year: 2024, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 38.00 },
      { year: 2024, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2024, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
      { year: 2024, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -145.00 },
      { year: 2024, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
      { year: 2024, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 48.30 },
      { year: 2024, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -135.00 },
      { year: 2024, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2024, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 32.00 },
      { year: 2024, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -110.00 },
      { year: 2024, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
      { year: 2024, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 32.50 },
    ],
  },

  2023: {
    year: 2023,
    source: 'revamp-Einnahmen-2025.xlsx',
    imported_at: '2026-01-11T21:38:12.895010',
    data: [
      // Totals per month
      { year: 2023, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6407.35 },
      { year: 2023, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12850.17 },
      { year: 2023, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 8856.05 },
      { year: 2023, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6253.55 },
      { year: 2023, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10689.78 },
      { year: 2023, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12806.84 },
      { year: 2023, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 8232.30 },
      { year: 2023, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12965.80 },
      { year: 2023, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 15522.18 },
      { year: 2023, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9481.60 },
      { year: 2023, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9845.23 },
      { year: 2023, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 19280.09 },
      // Warenverkauf (products)
      { year: 2023, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 4145.00 },
      { year: 2023, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 4320.86 },
      { year: 2023, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2325.45 },
      { year: 2023, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2470.00 },
      { year: 2023, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 5259.87 },
      { year: 2023, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1380.96 },
      { year: 2023, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2297.50 },
      { year: 2023, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2454.50 },
      { year: 2023, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1795.03 },
      { year: 2023, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3589.57 },
      { year: 2023, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3387.44 },
      { year: 2023, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3571.01 },
      // Dienstleistungen (services)
      { year: 2023, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2184.35 },
      { year: 2023, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 8528.11 },
      { year: 2023, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3807.60 },
      { year: 2023, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3676.05 },
      { year: 2023, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3399.36 },
      { year: 2023, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 8675.88 },
      { year: 2023, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5924.80 },
      { year: 2023, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 554.00 },
      { year: 2023, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 10662.15 },
      { year: 2023, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5847.78 },
      { year: 2023, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6392.79 },
      { year: 2023, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 15688.83 },
      // Integration
      { year: 2023, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2500.00 },
      { year: 2023, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2000.00 },
      { year: 2023, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
      { year: 2023, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
      { year: 2023, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2023, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      // Spenden (donations)
      { year: 2023, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 78.00 },
      { year: 2023, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 1.20 },
      { year: 2023, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 223.00 },
      { year: 2023, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -52.50 },
      { year: 2023, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 30.55 },
      { year: 2023, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -250.00 },
      { year: 2023, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
      { year: 2023, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 9957.30 },
      { year: 2023, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 65.00 },
      { year: 2023, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 44.25 },
      { year: 2023, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 65.00 },
      { year: 2023, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.25 },
    ],
  },

  2022: {
    year: 2022,
    source: 'revamp-Einnahmen-2025.xlsx',
    imported_at: '2026-01-11T21:38:12.906612',
    data: [
      // Totals per month
      { year: 2022, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4557.38 },
      { year: 2022, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6388.02 },
      { year: 2022, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3802.20 },
      { year: 2022, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10083.05 },
      { year: 2022, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4103.10 },
      { year: 2022, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10997.00 },
      { year: 2022, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2482.29 },
      { year: 2022, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 14124.15 },
      { year: 2022, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9346.61 },
      { year: 2022, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10907.10 },
      { year: 2022, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4235.18 },
      { year: 2022, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 48862.20 },
      // Warenverkauf (products)
      { year: 2022, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1753.59 },
      { year: 2022, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2232.00 },
      { year: 2022, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2994.00 },
      { year: 2022, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1827.00 },
      { year: 2022, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 890.00 },
      { year: 2022, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 5132.00 },
      { year: 2022, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 980.74 },
      { year: 2022, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2489.00 },
      { year: 2022, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2957.48 },
      { year: 2022, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1722.10 },
      { year: 2022, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3092.94 },
      { year: 2022, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 9370.18 },
      // Dienstleistungen (services)
      { year: 2022, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1225.09 },
      { year: 2022, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3762.57 },
      { year: 2022, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 798.20 },
      { year: 2022, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6251.05 },
      { year: 2022, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3203.10 },
      { year: 2022, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5845.00 },
      { year: 2022, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1496.55 },
      { year: 2022, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 11535.15 },
      { year: 2022, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6279.13 },
      { year: 2022, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 9180.00 },
      { year: 2022, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1587.24 },
      { year: 2022, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 28917.02 },
      // Integration
      { year: 2022, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 1500.00 },
      { year: 2022, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2000.00 },
      { year: 2022, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      { year: 2022, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
      // Spenden (donations)
      { year: 2022, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 78.70 },
      { year: 2022, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 393.45 },
      { year: 2022, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
      { year: 2022, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
      { year: 2022, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
      { year: 2022, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
      { year: 2022, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
      { year: 2022, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 100.00 },
      { year: 2022, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 110.00 },
      { year: 2022, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
      { year: 2022, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -445.00 },
      { year: 2022, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10575.00 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Years for which fallback data is available. */
export const AVAILABLE_YEARS = [2022, 2023, 2024, 2025] as const;

/**
 * Loads financial data for a given year from the embedded fallback dataset.
 * Returns a FinanceDataSet ready for queries.
 */
export function loadFinancialData(year: number = 2025): FinanceDataSet {
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
