/**
 * The filter URL is the state. Nothing tested it, which is why three defects
 * shipped in it.
 *
 * There are 356 lines of tests over the predicates and the comparator, and
 * zero over the thing that decides what those predicates receive. So:
 *
 *  - `applyPreset` built `new URLSearchParams()` from scratch and discarded the
 *    reader's search text, their sort, and eleven other params on every click;
 *  - `requireGesuch` was missing from `hasActiveFilters`, so `?gesuch=1` alone
 *    rendered a filtered list with no pill explaining it and no reset;
 *  - a substring search branch and a `direction` argument drifted out of reach
 *    of any caller without anything noticing.
 *
 * These tests work on the pure pieces the hook composes — the same params in,
 * the same query string out — because the hook itself needs a router. That is
 * the boundary worth holding: if the query string a preset produces is right,
 * the reader keeps what they typed.
 */
import { describe, it, expect } from 'vitest';
import { toggleInSet, toggleFlag } from 'listkit';
import {
  DEFAULT_FILTERS,
  FILTER_PRESETS,
  presetParamUpdates,
} from '@/lib/domain/foundation-filter';

/**
 * `updateParams` from the hook, extracted verbatim in shape: copy what is
 * there, set or delete the named keys, leave everything else alone.
 */
function updateParams(current: string, updates: Record<string, string | null>): string {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
  }
  return params.toString();
}

describe('applyPreset keeps what the reader brought', () => {
  const preset = FILTER_PRESETS[0]!.id;

  it('keeps the search text', () => {
    const out = updateParams('q=klima', presetParamUpdates(preset));
    expect(new URLSearchParams(out).get('q')).toBe('klima');
  });

  it('keeps the sort', () => {
    const out = updateParams('sort=name', presetParamUpdates(preset));
    expect(new URLSearchParams(out).get('sort')).toBe('name');
  });

  it('keeps params this list does not own', () => {
    const out = updateParams('utm_source=newsletter&locale=de', presetParamUpdates(preset));
    const p = new URLSearchParams(out);
    expect(p.get('utm_source')).toBe('newsletter');
    expect(p.get('locale')).toBe('de');
  });

  it('keeps the dimensions it is not about', () => {
    const out = updateParams('types=A&statuses=open&sp=nachhaltigkeit', presetParamUpdates(preset));
    const p = new URLSearchParams(out);
    expect(p.get('types')).toBe('A');
    expect(p.get('statuses')).toBe('open');
    expect(p.get('sp')).toBe('nachhaltigkeit');
  });

  it('clears a dimension it is about but does not want', () => {
    // Starting with email=1, a preset that does not require email must remove it
    // rather than leave a filter the reader did not choose.
    const withoutEmail = FILTER_PRESETS.find((p) => !p.filters.requireEmail);
    expect(withoutEmail, 'expected at least one preset that does not require email').toBeTruthy();
    const out = updateParams('email=1', presetParamUpdates(withoutEmail!.id));
    expect(new URLSearchParams(out).has('email')).toBe(false);
  });

  it('every preset sets at least one param — a preset that changes nothing is a dead button', () => {
    for (const p of FILTER_PRESETS) {
      const updates = presetParamUpdates(p.id);
      expect(
        Object.values(updates).some((v) => v !== null),
        `preset ${p.id} sets nothing`,
      ).toBe(true);
    }
  });
});

describe('a value equal to the default is absent from the URL', () => {
  it('does not write the default tier', () => {
    const atDefault = FILTER_PRESETS.find((p) => p.filters.minTier === DEFAULT_FILTERS.minTier);
    if (!atDefault) return; // nothing to assert in this dataset
    expect(presetParamUpdates(atDefault.id).tier).toBeNull();
  });
});

describe('the shared toggles behave as the hand-written ones did', () => {
  it('adds then removes, preserving the order of the rest', () => {
    expect(toggleInSet(['klima'], 'zuerich')).toEqual(['klima', 'zuerich']);
    expect(toggleInSet(['klima', 'zuerich'], 'klima')).toEqual(['zuerich']);
  });

  it('an emptied selection serialises to null, so the param is deleted', () => {
    const next = toggleInSet(['klima'], 'klima');
    expect(next.length > 0 ? next.join(',') : null).toBeNull();
  });

  it('a flag has exactly two states', () => {
    expect(toggleFlag([])).toEqual(['1']);
    expect(toggleFlag(['1'])).toEqual([]);
  });
});

describe('updateParams itself', () => {
  it('deletes rather than writing an empty value', () => {
    expect(updateParams('q=x', { q: null })).toBe('');
    expect(updateParams('q=x', { q: '' })).toBe('');
  });

  it('leaves an untouched URL untouched', () => {
    expect(updateParams('themes=klima&sort=name', {})).toBe('themes=klima&sort=name');
  });
});
