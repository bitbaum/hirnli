import { describe, it, expect } from 'vitest';
import {
  NUMBERS_REGISTRY,
  getNumericValue,
  CO2_PER_LAPTOP,
  AVG_DEVICE_PRICE,
  CO2_TOTAL_TONNES,
  LAPTOPS_REFURBISHED_COUNT,
} from '../numbers';

// ---------------------------------------------------------------------------
// NUMBERS_REGISTRY shape
// ---------------------------------------------------------------------------

describe('NUMBERS_REGISTRY', () => {
  it('has entries', () => {
    expect(Object.keys(NUMBERS_REGISTRY).length).toBeGreaterThan(0);
  });

  it('every entry has value, label, source, category', () => {
    for (const [key, entry] of Object.entries(NUMBERS_REGISTRY)) {
      expect(entry.value, `${key} missing value`).toBeDefined();
      expect(entry.label, `${key} missing label`).toBeTruthy();
      expect(entry.source, `${key} missing source`).toBeDefined();
      expect(entry.category, `${key} missing category`).toBeTruthy();
    }
  });

  it('contains CO2_SAVED_PER_LAPTOP as a numeric entry', () => {
    expect(typeof NUMBERS_REGISTRY.CO2_SAVED_PER_LAPTOP.value).toBe('number');
  });

  it('contains LAPTOPS_REFURBISHED_TOTAL as a string entry (display value)', () => {
    expect(typeof NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// getNumericValue
// ---------------------------------------------------------------------------

describe('getNumericValue', () => {
  it('returns the numeric value for a numeric key', () => {
    const val = getNumericValue('CO2_SAVED_PER_LAPTOP');
    expect(typeof val).toBe('number');
    expect(val).toBeGreaterThan(0);
  });

  it('returns the numeric value for AVG_DEVICE_PRICE', () => {
    const val = getNumericValue('AVG_DEVICE_PRICE');
    expect(typeof val).toBe('number');
    expect(val).toBeGreaterThan(0);
  });

  it('throws for a string-valued key (LAPTOPS_REFURBISHED_TOTAL)', () => {
    expect(() => getNumericValue('LAPTOPS_REFURBISHED_TOTAL')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Convenience exports — prove they loaded without throwing
// ---------------------------------------------------------------------------

describe('Convenience exports', () => {
  it('CO2_PER_LAPTOP is a positive number', () => {
    expect(typeof CO2_PER_LAPTOP).toBe('number');
    expect(CO2_PER_LAPTOP).toBeGreaterThan(0);
  });

  it('AVG_DEVICE_PRICE is a positive number', () => {
    expect(typeof AVG_DEVICE_PRICE).toBe('number');
    expect(AVG_DEVICE_PRICE).toBeGreaterThan(0);
  });

  it('LAPTOPS_REFURBISHED_COUNT is a positive integer', () => {
    expect(Number.isInteger(LAPTOPS_REFURBISHED_COUNT)).toBe(true);
    expect(LAPTOPS_REFURBISHED_COUNT).toBeGreaterThan(0);
  });

  it('CO2_TOTAL_TONNES is derived correctly from LAPTOPS_REFURBISHED_COUNT × CO2_PER_LAPTOP / 1000', () => {
    expect(CO2_TOTAL_TONNES).toBe(
      Math.round((LAPTOPS_REFURBISHED_COUNT * CO2_PER_LAPTOP) / 1000)
    );
  });

  it('CO2_TOTAL_TONNES is a positive integer', () => {
    expect(Number.isInteger(CO2_TOTAL_TONNES)).toBe(true);
    expect(CO2_TOTAL_TONNES).toBeGreaterThan(0);
  });
});
