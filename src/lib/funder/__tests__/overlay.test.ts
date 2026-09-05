/**
 * A foundation speaks for itself — but only about what it is the authority on,
 * and only once it has confirmed.
 */

import { describe, it, expect } from 'vitest';
import { applyFunderProfile, FUNDER_AUTHORED_FIELDS } from '../overlay';
import type { FunderProfile } from '../profile';
import { makeFoundation } from '@/lib/domain/__tests__/fixtures';

const profile = (over: Partial<FunderProfile> = {}): FunderProfile => ({
  foundationId: 'test-stiftung',
  name: 'Test-Stiftung',
  confirmed: true,
  updatedAt: new Date('2026-09-05'),
  ...over,
});

describe('an unconfirmed profile changes nothing', () => {
  it('leaves the register entry alone', () => {
    // Before confirmation the row is the platform's best understanding, not
    // the foundation's statement. Showing it as the foundation's word would
    // attribute sentences to an organisation that never agreed to them.
    const base = makeFoundation();
    const result = applyFunderProfile(base, profile({ confirmed: false, purpose: 'Neu' }));

    expect(result.purposeSummary).toBe(base.purposeSummary);
    expect(result.funderConfirmed).toBe(false);
  });

  it('and neither does no profile at all', () => {
    const base = makeFoundation();
    expect(applyFunderProfile(base, null).funderConfirmed).toBe(false);
  });
});

describe('a confirmed profile wins on what the foundation knows', () => {
  it("replaces the researched purpose with the foundation's own", () => {
    const base = makeFoundation();
    const result = applyFunderProfile(base, profile({ purpose: 'Wir foerdern Bildung.' }));

    expect(result.purposeSummary).toBe('Wir foerdern Bildung.');
    expect(result.funderConfirmed).toBe(true);
  });

  it('does not blank a field the foundation left empty', () => {
    // A foundation that fills in three fields must not erase the twelve the
    // register knows — that would make speaking up worse than staying silent.
    const base = makeFoundation();
    const result = applyFunderProfile(base, profile());

    expect(result.purposeSummary).toBe(base.purposeSummary);
    expect(result.websiteUrl).toBe(base.websiteUrl);
    expect(result.themes).toEqual(base.themes);
  });

  it('merges a partial grant range instead of replacing it', () => {
    const base = makeFoundation();
    const result = applyFunderProfile(base, profile({ grantMin: 5000 }));

    expect(result.amount.min).toBe(5000);
    expect(result.amount.max).toBe(base.amount.max);
  });
});

describe('a foundation is not the authority on what applicants think of it', () => {
  it('cannot change its own fit score, priority or research depth', () => {
    const base = makeFoundation();
    const result = applyFunderProfile(
      base,
      // Even if a row somehow carried these, the overlay must not read them:
      // they are one applicant's private assessment, not the foundation's.
      profile({ purpose: 'x' }) as FunderProfile & Record<string, unknown>,
    );

    expect(result.fitScore).toBe(base.fitScore);
    expect(result.priority).toBe(base.priority);
    expect(result.type).toBe(base.type);
  });

  it('the authored-field list matches what the overlay actually writes', () => {
    // Keeps the documentation honest: if a field is added to the overlay
    // without being declared, or declared without being written, this fails.
    const base = makeFoundation();
    const rich = applyFunderProfile(
      base,
      profile({
        name: 'Andere',
        purpose: 'p',
        website: 'https://example.ch',
        applicationMethod: 'online',
        themes: ['klima'],
        grantMin: 1,
        grantMax: 2,
        contact: { email: 'a@b.ch' },
        rounds: [{ describedAs: 'laufend' }],
      }),
    );

    const changed = (Object.keys(base) as (keyof typeof base)[]).filter(
      (k) => JSON.stringify(rich[k]) !== JSON.stringify(base[k]),
    );

    expect(changed.sort()).toEqual([...FUNDER_AUTHORED_FIELDS].sort());
  });
});
