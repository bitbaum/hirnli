import { describe, it, expect } from 'vitest';
import {
  formatCHF,
  formatNumber,
  formatPercent,
  formatMonthShort,
  calcGrowth,
  formatDateDE,
  formatDateCH,
  formatDateTimeCH,
} from './format';

describe('formatCHF', () => {
  it('returns CHF -- for null', () => {
    expect(formatCHF(null)).toBe('CHF --');
  });

  it('returns CHF -- for undefined', () => {
    expect(formatCHF(undefined)).toBe('CHF --');
  });

  it('returns CHF -- for NaN', () => {
    expect(formatCHF(NaN)).toBe('CHF --');
  });

  it('formats zero', () => {
    expect(formatCHF(0)).toBe('CHF 0');
  });

  it('includes CHF prefix', () => {
    expect(formatCHF(100)).toContain('CHF');
  });

  it('formats positive integer without cents by default', () => {
    const result = formatCHF(500);
    expect(result).toMatch(/^CHF \d+$/);
    expect(result).not.toContain('.');
  });

  it('formats with cents when showCents=true', () => {
    const result = formatCHF(500, true);
    expect(result).toContain('.');
  });

  it('handles negative values with minus sign', () => {
    const result = formatCHF(-500);
    expect(result).toMatch(/^-CHF/);
  });

  it('negative value shows absolute amount after CHF', () => {
    const pos = formatCHF(500);
    const neg = formatCHF(-500);
    expect(neg).toBe('-' + pos);
  });
});

describe('formatNumber', () => {
  it('returns -- for null', () => {
    expect(formatNumber(null)).toBe('--');
  });

  it('returns -- for undefined', () => {
    expect(formatNumber(undefined)).toBe('--');
  });

  it('returns -- for NaN', () => {
    expect(formatNumber(NaN)).toBe('--');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats integer without decimal places by default', () => {
    const result = formatNumber(42);
    expect(result).toBe('42');
  });

  it('rounds to specified decimal places', () => {
    const result = formatNumber(3.14159, 2);
    expect(result).toMatch(/3[.,]14/);
  });
});

describe('formatPercent', () => {
  it('returns --% for null', () => {
    expect(formatPercent(null)).toBe('--%');
  });

  it('returns --% for undefined', () => {
    expect(formatPercent(undefined)).toBe('--%');
  });

  it('returns --% for NaN', () => {
    expect(formatPercent(NaN)).toBe('--%');
  });

  it('converts ratio to percent (0.96 → 96.0%)', () => {
    expect(formatPercent(0.96)).toBe('96.0%');
  });

  it('converts 1.0 to 100.0%', () => {
    expect(formatPercent(1.0)).toBe('100.0%');
  });

  it('converts 0 to 0.0%', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('respects decimals parameter', () => {
    expect(formatPercent(0.9567, 2)).toBe('95.67%');
    expect(formatPercent(0.9567, 0)).toBe('96%');
  });
});

describe('formatMonthShort', () => {
  it('returns -- for null', () => {
    expect(formatMonthShort(null)).toBe('--');
  });

  it('returns -- for undefined', () => {
    expect(formatMonthShort(undefined)).toBe('--');
  });

  it('returns -- for empty string', () => {
    expect(formatMonthShort('')).toBe('--');
  });

  it('formats January', () => {
    expect(formatMonthShort('2026-01')).toBe('Jan 26');
  });

  it('formats December', () => {
    expect(formatMonthShort('2025-12')).toBe('Dez 25');
  });

  it('formats März (March)', () => {
    expect(formatMonthShort('2026-03')).toBe('Mär 26');
  });

  it('uses 2-digit year', () => {
    expect(formatMonthShort('2026-06')).toMatch(/\d\d$/);
    expect(formatMonthShort('2026-06')).toBe('Jun 26');
  });

  it('returns input as-is for invalid month index', () => {
    expect(formatMonthShort('2026-00')).toBe('2026-00');
    expect(formatMonthShort('2026-13')).toBe('2026-13');
  });
});

describe('calcGrowth', () => {
  it('returns 0 when oldVal is 0 and newVal is 0', () => {
    expect(calcGrowth(0, 0)).toBe(0);
  });

  it('returns 1 when oldVal is 0 and newVal is positive', () => {
    expect(calcGrowth(0, 100)).toBe(1);
  });

  it('calculates positive growth', () => {
    expect(calcGrowth(100, 150)).toBeCloseTo(0.5);
  });

  it('calculates negative growth (decline)', () => {
    expect(calcGrowth(100, 50)).toBeCloseTo(-0.5);
  });

  it('calculates growth from negative base', () => {
    expect(calcGrowth(-100, -50)).toBeCloseTo(0.5);
  });

  it('handles doubling', () => {
    expect(calcGrowth(50, 100)).toBeCloseTo(1.0);
  });
});

describe('formatDateDE', () => {
  it('formats date without location', () => {
    const d = new Date(2026, 1, 26); // Feb 26, 2026 (month is 0-indexed)
    expect(formatDateDE(d)).toBe('26. Februar 2026');
  });

  it('formats date with location', () => {
    const d = new Date(2026, 1, 26);
    expect(formatDateDE(d, 'Zürich')).toBe('Zürich, 26. Februar 2026');
  });

  it('formats January correctly', () => {
    const d = new Date(2026, 0, 1);
    expect(formatDateDE(d)).toBe('1. Januar 2026');
  });

  it('formats December correctly', () => {
    const d = new Date(2025, 11, 31);
    expect(formatDateDE(d)).toBe('31. Dezember 2025');
  });

  it('uses correct German month names', () => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ];
    months.forEach((name, i) => {
      const d = new Date(2026, i, 15);
      expect(formatDateDE(d)).toContain(name);
    });
  });
});

describe('formatDateCH', () => {
  it('formats an ISO date string as dd.mm.yyyy', () => {
    expect(formatDateCH('2026-02-26')).toBe('26.02.2026');
  });

  it('formats January 1st correctly', () => {
    expect(formatDateCH('2026-01-01')).toBe('01.01.2026');
  });

  it('formats December 31st correctly', () => {
    expect(formatDateCH('2025-12-31')).toBe('31.12.2025');
  });

  it('produces a string matching dd.mm.yyyy pattern', () => {
    expect(formatDateCH('2026-06-15')).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });
});

describe('formatDateTimeCH', () => {
  it('produces a string matching dd.mm.yyyy, hh:mm pattern', () => {
    const result = formatDateTimeCH('2026-02-26T12:00:00Z');
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}$/);
  });

  it('contains the correct date portion', () => {
    const result = formatDateTimeCH('2026-02-26T12:00:00Z');
    expect(result).toContain('26.02.2026');
  });

  it('includes a time part separated by comma', () => {
    const result = formatDateTimeCH('2026-02-26T12:00:00Z');
    expect(result).toContain(',');
    const parts = result.split(',');
    expect(parts).toHaveLength(2);
    expect(parts[1].trim()).toMatch(/^\d{2}:\d{2}$/);
  });
});
