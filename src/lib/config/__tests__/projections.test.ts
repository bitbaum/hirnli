import { describe, it, expect } from 'vitest';
import { getSpaceCostDisplay, getCombinedSpaceCost } from '../projections';
import { HUB_SPACE_AREAS } from '../hub-space-plan';

// ---------------------------------------------------------------------------
// getSpaceCostDisplay
// ---------------------------------------------------------------------------

describe('getSpaceCostDisplay', () => {
  it('returns a CHF string for a known space', () => {
    const display = getSpaceCostDisplay('Shop & Customer Area');
    expect(display).toMatch(/^CHF/);
  });

  it('returns "Nicht definiert" for an unknown space name', () => {
    expect(getSpaceCostDisplay('nonexistent space')).toBe('Nicht definiert');
  });

  it('returns "Nicht definiert" for empty string', () => {
    expect(getSpaceCostDisplay('')).toBe('Nicht definiert');
  });

  it('returns a non-empty string for every actual space', () => {
    for (const area of HUB_SPACE_AREAS) {
      const result = getSpaceCostDisplay(area.name);
      expect(result.length, `empty for: ${area.name}`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getCombinedSpaceCost
// ---------------------------------------------------------------------------

describe('getCombinedSpaceCost', () => {
  it('returns 0 for empty array', () => {
    expect(getCombinedSpaceCost([])).toBe(0);
  });

  it('returns 0 for array of unknown names', () => {
    expect(getCombinedSpaceCost(['foo', 'bar'])).toBe(0);
  });

  it('returns the cost of a single known space', () => {
    const area = HUB_SPACE_AREAS[0];
    const result = getCombinedSpaceCost([area.name]);
    expect(result).toBe(area.cost_estimate_chf);
  });

  it('sums costs of two known spaces', () => {
    const [a, b] = HUB_SPACE_AREAS;
    const expected = a.cost_estimate_chf + b.cost_estimate_chf;
    expect(getCombinedSpaceCost([a.name, b.name])).toBe(expected);
  });

  it('skips unknown names silently', () => {
    const area = HUB_SPACE_AREAS[0];
    const withUnknown = getCombinedSpaceCost([area.name, 'nonexistent']);
    const withoutUnknown = getCombinedSpaceCost([area.name]);
    expect(withUnknown).toBe(withoutUnknown);
  });

  it('returns a positive number when all spaces are known', () => {
    const allNames = HUB_SPACE_AREAS.map((a) => a.name);
    expect(getCombinedSpaceCost(allNames)).toBeGreaterThan(0);
  });

  it('matches sum of individual costs', () => {
    const names = HUB_SPACE_AREAS.slice(0, 3).map((a) => a.name);
    const manual = HUB_SPACE_AREAS.slice(0, 3).reduce((s, a) => s + a.cost_estimate_chf, 0);
    expect(getCombinedSpaceCost(names)).toBe(manual);
  });
});
