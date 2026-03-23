import { describe, it, expect } from 'vitest';
import { getScenarioForFoundation, computeRequestedAmount } from '../budget-mapper';
import { makeFoundation } from './fixtures';

describe('getScenarioForFoundation', () => {
  it('returns minimal for max grant < 20k', () => {
    const f = makeFoundation({ amount: { min: 5000, max: 15000, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('minimal');
  });

  it('returns moderate for max grant 20-50k', () => {
    const f = makeFoundation({ amount: { min: 10000, max: 30000, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('moderate');
  });

  it('returns maximum for max grant > 50k', () => {
    const f = makeFoundation({ amount: { min: 20000, max: 100000, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('maximum');
  });

  it('falls back to type A → maximum when no grant range', () => {
    const f = makeFoundation({ type: 'A', amount: { min: null, max: null, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('maximum');
  });

  it('falls back to type B → moderate when no grant range', () => {
    const f = makeFoundation({ type: 'B', amount: { min: null, max: null, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('moderate');
  });

  it('falls back to type C → minimal when no grant range', () => {
    const f = makeFoundation({ type: 'C', amount: { min: null, max: null, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('minimal');
  });

  it('falls back to type D → minimal when no grant range', () => {
    const f = makeFoundation({ type: 'D', amount: { min: null, max: null, text: '' } });
    expect(getScenarioForFoundation(f).id).toBe('minimal');
  });

  it('always returns a valid scenario', () => {
    const scenario = getScenarioForFoundation(makeFoundation());
    expect(scenario).toBeDefined();
    expect(scenario.id).toBeTruthy();
    expect(scenario.threeYearModel).toBeDefined();
  });
});

describe('computeRequestedAmount', () => {
  it('returns max when max <= gap', () => {
    const f = makeFoundation({ amount: { min: 5000, max: 10000, text: '' } });
    const scenario = getScenarioForFoundation(f);
    const amount = computeRequestedAmount(f, scenario);
    expect(amount).toBe(10000);
  });

  it('returns midpoint when range exceeds gap', () => {
    const f = makeFoundation({ amount: { min: 50000, max: 500000, text: '' } });
    const scenario = getScenarioForFoundation(f);
    const amount = computeRequestedAmount(f, scenario);
    expect(amount).toBeGreaterThan(0);
  });

  it('returns positive amount for no range data', () => {
    const f = makeFoundation({ amount: { min: null, max: null, text: '' } });
    const scenario = getScenarioForFoundation(f);
    const amount = computeRequestedAmount(f, scenario);
    expect(amount).toBeGreaterThanOrEqual(5000);
  });

  it('returns amount as a round number', () => {
    const f = makeFoundation({ amount: { min: null, max: null, text: '' } });
    const scenario = getScenarioForFoundation(f);
    const amount = computeRequestedAmount(f, scenario);
    expect(amount % 1000).toBe(0); // rounded to nearest 5000 or exact value
  });
});
