import { describe, it, expect } from 'vitest';
import {
  estimateDeviceCount,
  estimateCO2Avoided,
  estimateEWastePrevented,
} from '../calculations';
import { AVG_DEVICE_PRICE, CO2_PER_LAPTOP } from '@/lib/config/numbers';

describe('estimateDeviceCount', () => {
  it('returns 0 for zero revenue', () => {
    expect(estimateDeviceCount(0)).toBe(0);
  });

  it('returns 0 for negative revenue', () => {
    expect(estimateDeviceCount(-500)).toBe(0);
  });

  it('divides by default AVG_DEVICE_PRICE and rounds', () => {
    // AVG_DEVICE_PRICE = 150 CHF
    expect(estimateDeviceCount(1500)).toBe(Math.round(1500 / AVG_DEVICE_PRICE));
  });

  it('rounds half-values to nearest integer', () => {
    // 1500 + 75 = 1575: 1575 / 150 = 10.5 → rounds to 11
    expect(estimateDeviceCount(AVG_DEVICE_PRICE * 10 + AVG_DEVICE_PRICE / 2)).toBe(11);
  });

  it('accepts a custom avgPrice override', () => {
    expect(estimateDeviceCount(1000, 100)).toBe(10);
  });

  it('handles large revenue values', () => {
    // 150_000 / 150 = 1000
    expect(estimateDeviceCount(150_000)).toBe(Math.round(150_000 / AVG_DEVICE_PRICE));
  });
});

describe('estimateCO2Avoided', () => {
  it('returns 0 for 0 devices', () => {
    expect(estimateCO2Avoided(0)).toBe(0);
  });

  it('converts grams to tonnes and rounds to 1 decimal place', () => {
    // 10 devices * CO2_PER_LAPTOP(g) / 1000 = tonnes, rounded to 1dp
    const expected = Math.round((10 * CO2_PER_LAPTOP) / 1000 * 10) / 10;
    expect(estimateCO2Avoided(10)).toBe(expected);
  });

  it('result is in tonnes (not grams or kg)', () => {
    // 1 device = CO2_PER_LAPTOP g = CO2_PER_LAPTOP/1000 tonnes
    // CO2_PER_LAPTOP = 285 g → 0.285 tonnes per device
    // So for 100 devices: 28.5 tonnes
    const result = estimateCO2Avoided(100);
    // Should be roughly CO2_PER_LAPTOP * 100 / 1000 tonnes
    expect(result).toBeCloseTo((CO2_PER_LAPTOP * 100) / 1000, 1);
  });

  it('result increases linearly with device count', () => {
    const r1 = estimateCO2Avoided(10);
    const r2 = estimateCO2Avoided(20);
    expect(r2).toBeGreaterThan(r1);
  });
});

describe('estimateEWastePrevented', () => {
  it('returns 0 for 0 devices', () => {
    expect(estimateEWastePrevented(0)).toBe(0);
  });

  it('uses default weight of 5 kg per device', () => {
    expect(estimateEWastePrevented(10)).toBe(50);
    expect(estimateEWastePrevented(100)).toBe(500);
  });

  it('accepts a custom avgWeightKg override', () => {
    expect(estimateEWastePrevented(10, 7)).toBe(70);
  });

  it('result is in kg', () => {
    // 1000 devices * 5 kg = 5000 kg
    expect(estimateEWastePrevented(1000)).toBe(5000);
  });
});
