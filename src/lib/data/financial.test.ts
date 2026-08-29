import { describe, it, expect } from 'vitest';
import { AVAILABLE_YEARS, CURRENT_FINANCIAL_YEAR, loadFinancialData } from './financial';

// ---------------------------------------------------------------------------
// AVAILABLE_YEARS / CURRENT_FINANCIAL_YEAR
// ---------------------------------------------------------------------------

describe('AVAILABLE_YEARS', () => {
  it('is a non-empty tuple', () => {
    expect(AVAILABLE_YEARS.length).toBeGreaterThan(0);
  });

  it('is sorted ascending', () => {
    for (let i = 1; i < AVAILABLE_YEARS.length; i++) {
      expect(AVAILABLE_YEARS[i]).toBeGreaterThan(AVAILABLE_YEARS[i - 1]);
    }
  });
});

describe('CURRENT_FINANCIAL_YEAR', () => {
  it('equals the last entry in AVAILABLE_YEARS', () => {
    expect(CURRENT_FINANCIAL_YEAR).toBe(AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]);
  });

  it('is a number (not a union literal narrowed to string)', () => {
    expect(typeof CURRENT_FINANCIAL_YEAR).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// loadFinancialData
// ---------------------------------------------------------------------------

describe('loadFinancialData', () => {
  it('returns an empty dataset for an unknown year', () => {
    const ds = loadFinancialData(1900);
    expect(ds.isEmpty()).toBe(true);
    expect(ds.count()).toBe(0);
  });

  it('defaults to CURRENT_FINANCIAL_YEAR', () => {
    const explicit = loadFinancialData(CURRENT_FINANCIAL_YEAR);
    const implicit = loadFinancialData();
    expect(implicit.count()).toBe(explicit.count());
    expect(implicit.getMonths()).toEqual(explicit.getMonths());
  });

  it.each(AVAILABLE_YEARS.map((y) => [y]))('returns data for %i', (year) => {
    const ds = loadFinancialData(year);
    expect(ds.isEmpty()).toBe(false);
    expect(ds.count()).toBeGreaterThan(0);
  });

  it('returns rows sorted by period', () => {
    const ds = loadFinancialData(2025);
    const months = ds.getMonths();
    for (let i = 1; i < months.length; i++) {
      expect(months[i] > months[i - 1]).toBe(true);
    }
  });

  it('returns a 12-month dataset for a complete year', () => {
    const ds = loadFinancialData(2022);
    expect(ds.count()).toBe(12);
  });

  it('2025 Jan total matches embedded data (3976.22)', () => {
    const ds = loadFinancialData(2025);
    const jan = ds.getByMonth('2025-01');
    expect(jan).toBeDefined();
    expect(jan!.total).toBeCloseTo(3976.22, 2);
  });

  it('2025 Jan warenverkauf matches embedded data (1935.02)', () => {
    const ds = loadFinancialData(2025);
    const jan = ds.getByMonth('2025-01');
    expect(jan!.warenverkauf).toBeCloseTo(1935.02, 2);
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — basic accessors
// ---------------------------------------------------------------------------

describe('FinanceDataSet basic accessors', () => {
  it('isEmpty returns true on empty dataset', () => {
    const ds = loadFinancialData(1900);
    expect(ds.isEmpty()).toBe(true);
  });

  it('isEmpty returns false on populated dataset', () => {
    const ds = loadFinancialData(2025);
    expect(ds.isEmpty()).toBe(false);
  });

  it('count returns the number of monthly rows', () => {
    const ds = loadFinancialData(2022);
    expect(ds.count()).toBe(12);
  });

  it('getAll returns all rows', () => {
    const ds = loadFinancialData(2022);
    expect(ds.getAll().length).toBe(12);
  });

  it('getRow returns correct row by index', () => {
    const ds = loadFinancialData(2025);
    const first = ds.getRow(0);
    expect(first?.period).toBe('2025-01');
  });

  it('getRow returns undefined for out-of-bounds index', () => {
    const ds = loadFinancialData(2025);
    expect(ds.getRow(999)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — period access
// ---------------------------------------------------------------------------

describe('FinanceDataSet period access', () => {
  it('getByMonth returns the correct row', () => {
    const ds = loadFinancialData(2025);
    const row = ds.getByMonth('2025-03');
    expect(row).toBeDefined();
    expect(row!.month).toBe(3);
    expect(row!.year).toBe(2025);
  });

  it('getByMonth returns undefined for a missing period', () => {
    const ds = loadFinancialData(2025);
    expect(ds.getByMonth('2025-12')).toBeUndefined();
  });

  it('getMonths returns all period strings', () => {
    const ds = loadFinancialData(2022);
    const months = ds.getMonths();
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2022-01');
    expect(months[11]).toBe('2022-12');
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — aggregation
// ---------------------------------------------------------------------------

describe('FinanceDataSet.sum', () => {
  it('returns 0 for empty dataset', () => {
    const ds = loadFinancialData(1900);
    expect(ds.sum('total')).toBe(0);
  });

  it('returns a positive number for total in a populated year', () => {
    const ds = loadFinancialData(2022);
    expect(ds.sum('total')).toBeGreaterThan(0);
  });

  it('total ≈ sum of components (warenverkauf + dienstleistungen + integration + spenden + aufstockung)', () => {
    // For complete years the stored total should roughly equal the sum of breakdowns.
    // Due to rounding they may differ slightly — we use toBeCloseTo.
    const ds = loadFinancialData(2022);
    const components =
      ds.sum('warenverkauf') +
      ds.sum('dienstleistungen') +
      ds.sum('integration') +
      ds.sum('spenden') +
      ds.sum('aufstockung');
    const total = ds.sum('total');
    // Allow 1 CHF tolerance over 12 months of floating-point accumulation
    expect(Math.abs(total - components)).toBeLessThan(1);
  });
});

describe('FinanceDataSet.average', () => {
  it('returns 0 on empty dataset', () => {
    const ds = loadFinancialData(1900);
    expect(ds.average('total')).toBe(0);
  });

  it('average × count ≈ sum', () => {
    const ds = loadFinancialData(2022);
    expect(ds.average('total') * ds.count()).toBeCloseTo(ds.sum('total'), 5);
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — getNumericColumn / getColumn (legacy mapping)
// ---------------------------------------------------------------------------

describe('FinanceDataSet.getNumericColumn', () => {
  it('returns an array of numbers for a valid column', () => {
    const ds = loadFinancialData(2022);
    const values = ds.getNumericColumn('total');
    expect(values.length).toBe(12);
    values.forEach((v) => expect(typeof v).toBe('number'));
  });

  it('returns empty array for unknown column', () => {
    const ds = loadFinancialData(2022);
    const values = ds.getNumericColumn('nonexistent_column');
    expect(values).toHaveLength(0);
  });
});

describe('FinanceDataSet.getColumn (legacy mapping)', () => {
  it('maps Geraeteverkauefe → warenverkauf', () => {
    const ds = loadFinancialData(2022);
    const mapped = ds.getNumericColumn('Geraeteverkauefe');
    const direct = ds.getNumericColumn('warenverkauf');
    expect(mapped).toEqual(direct);
  });

  it('maps Total_Revenue → total', () => {
    const ds = loadFinancialData(2022);
    const mapped = ds.getNumericColumn('Total_Revenue');
    const direct = ds.getNumericColumn('total');
    expect(mapped).toEqual(direct);
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — getLatest / getValidRows
// ---------------------------------------------------------------------------

describe('FinanceDataSet.getLatest', () => {
  it('returns null on empty dataset', () => {
    const ds = loadFinancialData(1900);
    expect(ds.getLatest()).toBeNull();
  });

  it('returns the last non-zero month', () => {
    const ds = loadFinancialData(2025);
    const latest = ds.getLatest();
    expect(latest).not.toBeNull();
    expect(latest!.total).not.toBe(0);
  });

  it('returned row has a total > 0 when data exists', () => {
    const ds = loadFinancialData(2022);
    const latest = ds.getLatest();
    expect(latest!.total).toBeGreaterThan(0);
  });
});

describe('FinanceDataSet.getValidRows', () => {
  it('returns only months with non-zero total', () => {
    const ds = loadFinancialData(2025);
    const valid = ds.getValidRows();
    valid.getAll().forEach((row) => {
      expect(row.total).not.toBe(0);
    });
  });

  it('valid count ≤ full count', () => {
    const ds = loadFinancialData(2025);
    expect(ds.getValidRows().count()).toBeLessThanOrEqual(ds.count());
  });

  it('returns empty dataset unchanged', () => {
    const ds = loadFinancialData(1900);
    expect(ds.getValidRows().isEmpty()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — getByYear
// ---------------------------------------------------------------------------

describe('FinanceDataSet.getByYear', () => {
  it('returns only rows for the requested year', () => {
    const ds2022 = loadFinancialData(2022);
    const filtered = ds2022.getByYear(2022);
    filtered.getAll().forEach((row) => expect(row.year).toBe(2022));
  });

  it('returns empty dataset when year has no rows', () => {
    const ds = loadFinancialData(2022);
    expect(ds.getByYear(1900).isEmpty()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FinanceDataSet — sumWithSource / getSource
// ---------------------------------------------------------------------------

describe('FinanceDataSet.sumWithSource', () => {
  it('returns correct structure', () => {
    const ds = loadFinancialData(2022);
    const result = ds.sumWithSource('total');
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('calculation');
    expect(result.source).toHaveProperty('file');
    expect(result.source).toHaveProperty('system');
    expect(result.calculation.operation).toBe('SUM');
    expect(result.calculation.column).toBe('total');
  });

  it('value matches sum()', () => {
    const ds = loadFinancialData(2022);
    expect(ds.sumWithSource('total').value).toBeCloseTo(ds.sum('total'), 5);
  });
});

describe('FinanceDataSet.getSource', () => {
  it('returns source info with required fields', () => {
    const ds = loadFinancialData(2025);
    const source = ds.getSource();
    expect(source).toHaveProperty('file');
    expect(source).toHaveProperty('system');
    expect(source).toHaveProperty('importedAt');
    expect(source).toHaveProperty('methodology');
    expect(source).toHaveProperty('confidence');
    expect(source).toHaveProperty('note');
  });

  it('confidence is high', () => {
    const ds = loadFinancialData(2025);
    expect(ds.getSource().confidence).toBe('high');
  });
});
