import { describe, it, expect } from 'vitest';
import {
  ANNUAL_PL,
  COMPLETE_YEARS,
  CURRENT_YEAR_DATA,
  PEAK_REVENUE,
  PEAK_YEAR,
  LATEST_COMPLETE,
  CUMULATIVE_RESULT,
  CUMULATIVE_WARENVERKAUF,
  AVG_REVENUE,
} from '../data';

// ---------------------------------------------------------------------------
// ANNUAL_PL
// ---------------------------------------------------------------------------

describe('ANNUAL_PL', () => {
  it('has at least 5 entries', () => {
    expect(ANNUAL_PL.length).toBeGreaterThanOrEqual(5);
  });

  it('years are in ascending order', () => {
    for (let i = 1; i < ANNUAL_PL.length; i++) {
      expect(ANNUAL_PL[i].year).toBeGreaterThan(ANNUAL_PL[i - 1].year);
    }
  });

  it('every entry has required numeric fields', () => {
    for (const yr of ANNUAL_PL) {
      expect(typeof yr.year).toBe('number');
      expect(typeof yr.revenue).toBe('number');
      expect(typeof yr.expenses).toBe('number');
      expect(typeof yr.result).toBe('number');
      expect(typeof yr.isComplete).toBe('boolean');
    }
  });

  it('result ≈ revenue - expenses (within 1 CHF rounding from source P&L)', () => {
    for (const yr of ANNUAL_PL) {
      expect(Math.abs(yr.result - (yr.revenue - yr.expenses))).toBeLessThanOrEqual(1);
    }
  });

  it('every entry has revenueDetail with 4 streams', () => {
    for (const yr of ANNUAL_PL) {
      const { warenverkauf, dienstleistungen, integration, spenden } = yr.revenueDetail;
      expect(typeof warenverkauf).toBe('number');
      expect(typeof dienstleistungen).toBe('number');
      expect(typeof integration).toBe('number');
      expect(typeof spenden).toBe('number');
    }
  });

  it('all years are distinct', () => {
    const years = ANNUAL_PL.map((y) => y.year);
    expect(new Set(years).size).toBe(years.length);
  });
});

// ---------------------------------------------------------------------------
// COMPLETE_YEARS
// ---------------------------------------------------------------------------

describe('COMPLETE_YEARS', () => {
  it('is a subset of ANNUAL_PL', () => {
    const allYears = new Set(ANNUAL_PL.map((y) => y.year));
    for (const yr of COMPLETE_YEARS) {
      expect(allYears.has(yr.year)).toBe(true);
    }
  });

  it('every entry has isComplete=true', () => {
    for (const yr of COMPLETE_YEARS) {
      expect(yr.isComplete).toBe(true);
    }
  });

  it('has fewer or equal entries than ANNUAL_PL', () => {
    expect(COMPLETE_YEARS.length).toBeLessThanOrEqual(ANNUAL_PL.length);
  });

  it('has at least 1 complete year', () => {
    expect(COMPLETE_YEARS.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// CURRENT_YEAR_DATA
// ---------------------------------------------------------------------------

describe('CURRENT_YEAR_DATA', () => {
  it('is the last entry in ANNUAL_PL', () => {
    expect(CURRENT_YEAR_DATA).toBe(ANNUAL_PL[ANNUAL_PL.length - 1]);
  });

  it('has year equal to the maximum year in ANNUAL_PL', () => {
    const maxYear = Math.max(...ANNUAL_PL.map((y) => y.year));
    expect(CURRENT_YEAR_DATA.year).toBe(maxYear);
  });

  it('has a positive revenue', () => {
    expect(CURRENT_YEAR_DATA.revenue).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// PEAK_REVENUE and PEAK_YEAR
// ---------------------------------------------------------------------------

describe('PEAK_REVENUE and PEAK_YEAR', () => {
  it('PEAK_REVENUE is the maximum revenue across all years', () => {
    const max = Math.max(...ANNUAL_PL.map((y) => y.revenue));
    expect(PEAK_REVENUE).toBe(max);
  });

  it('PEAK_YEAR is the year with PEAK_REVENUE', () => {
    const peakEntry = ANNUAL_PL.find((y) => y.revenue === PEAK_REVENUE);
    expect(peakEntry).toBeDefined();
    expect(PEAK_YEAR).toBe(peakEntry!.year);
  });

  it('PEAK_REVENUE is greater than current revenue (revenues declined)', () => {
    expect(PEAK_REVENUE).toBeGreaterThan(CURRENT_YEAR_DATA.revenue);
  });
});

// ---------------------------------------------------------------------------
// LATEST_COMPLETE
// ---------------------------------------------------------------------------

describe('LATEST_COMPLETE', () => {
  it('is the last entry in COMPLETE_YEARS', () => {
    expect(LATEST_COMPLETE).toBe(COMPLETE_YEARS[COMPLETE_YEARS.length - 1]);
  });

  it('has isComplete=true', () => {
    expect(LATEST_COMPLETE.isComplete).toBe(true);
  });

  it('has a year <= CURRENT_YEAR_DATA.year', () => {
    expect(LATEST_COMPLETE.year).toBeLessThanOrEqual(CURRENT_YEAR_DATA.year);
  });
});

// ---------------------------------------------------------------------------
// CUMULATIVE_RESULT
// ---------------------------------------------------------------------------

describe('CUMULATIVE_RESULT', () => {
  it('equals sum of result across all COMPLETE_YEARS', () => {
    const manual = COMPLETE_YEARS.reduce((sum, y) => sum + y.result, 0);
    expect(CUMULATIVE_RESULT).toBe(manual);
  });

  it('is a finite number', () => {
    expect(Number.isFinite(CUMULATIVE_RESULT)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CUMULATIVE_WARENVERKAUF
// ---------------------------------------------------------------------------

describe('CUMULATIVE_WARENVERKAUF', () => {
  it('equals sum of warenverkauf across all ANNUAL_PL entries', () => {
    const manual = ANNUAL_PL.reduce((sum, y) => sum + y.revenueDetail.warenverkauf, 0);
    expect(CUMULATIVE_WARENVERKAUF).toBe(manual);
  });

  it('is a positive number', () => {
    expect(CUMULATIVE_WARENVERKAUF).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// AVG_REVENUE
// ---------------------------------------------------------------------------

describe('AVG_REVENUE', () => {
  it('is a positive integer', () => {
    expect(Number.isInteger(AVG_REVENUE)).toBe(true);
    expect(AVG_REVENUE).toBeGreaterThan(0);
  });

  it('is within the range of min and max annual revenue', () => {
    const min = Math.min(...ANNUAL_PL.map((y) => y.revenue));
    const max = Math.max(...ANNUAL_PL.map((y) => y.revenue));
    expect(AVG_REVENUE).toBeGreaterThanOrEqual(min);
    expect(AVG_REVENUE).toBeLessThanOrEqual(max);
  });
});
