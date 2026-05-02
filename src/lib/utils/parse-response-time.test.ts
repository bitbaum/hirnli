import { describe, it, expect } from 'vitest';
import {
  parseResponseTimeWeeks,
  computeFollowUpDate,
} from './parse-response-time';

describe('parseResponseTimeWeeks', () => {
  it('returns 8 (default) for null', () => {
    expect(parseResponseTimeWeeks(null)).toBe(8);
  });

  it('returns 8 (default) for undefined', () => {
    expect(parseResponseTimeWeeks(undefined)).toBe(8);
  });

  it('returns 8 (default) for an unparseable string', () => {
    expect(parseResponseTimeWeeks('keine Angabe')).toBe(8);
  });

  it('parses "6 Wochen" → 6', () => {
    expect(parseResponseTimeWeeks('6 Wochen')).toBe(6);
  });

  it('parses "6-8 Wochen" → upper bound 8', () => {
    expect(parseResponseTimeWeeks('6-8 Wochen')).toBe(8);
  });

  it('parses "3 Monate" → 12 weeks', () => {
    expect(parseResponseTimeWeeks('3 Monate')).toBe(12);
  });

  it('parses "2-4 Monate" → upper bound 4 months = 16 weeks', () => {
    expect(parseResponseTimeWeeks('2-4 Monate')).toBe(16);
  });

  it('parses "1 Monat" (singular) → 4 weeks', () => {
    expect(parseResponseTimeWeeks('1 Monat')).toBe(4);
  });

  it('parses "3 months" (English) → 12 weeks', () => {
    expect(parseResponseTimeWeeks('3 months')).toBe(12);
  });

  it('parses "1-2 months" (English) → upper bound 2 months = 8 weeks', () => {
    expect(parseResponseTimeWeeks('1-2 months')).toBe(8);
  });

  it('is case-insensitive', () => {
    expect(parseResponseTimeWeeks('4 WOCHEN')).toBe(4);
    expect(parseResponseTimeWeeks('2 MONATE')).toBe(8);
  });
});

describe('computeFollowUpDate', () => {
  it('adds the parsed weeks to the submission date', () => {
    // 8 weeks after 2026-01-01 = 2026-02-26
    expect(computeFollowUpDate('2026-01-01', null)).toBe('2026-02-26');
  });

  it('uses the upper bound of a range', () => {
    // "4-6 Wochen" → 6 weeks after 2026-01-01 = 2026-02-12
    expect(computeFollowUpDate('2026-01-01', '4-6 Wochen')).toBe('2026-02-12');
  });

  it('handles month-based response times', () => {
    // "2 Monate" → 8 weeks after 2026-03-01 = 2026-04-26
    expect(computeFollowUpDate('2026-03-01', '2 Monate')).toBe('2026-04-26');
  });

  it('returns an ISO date string (YYYY-MM-DD)', () => {
    const result = computeFollowUpDate('2026-05-01', '4 Wochen');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
