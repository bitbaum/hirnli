/**
 * The shape a foundation fills in about itself.
 *
 * `.strict()` matters here for the same reason it does on the seeker profile:
 * a field nobody reads is a field somebody will later assume is being used.
 */

import { describe, it, expect } from 'vitest';
import { storedFunderProfileSchema, parseFunderProfile } from '../profile';

const MINIMAL = { foundationId: 'test-stiftung', name: 'Test-Stiftung' };

describe('storedFunderProfileSchema', () => {
  it('accepts a foundation that has only said who it is', () => {
    // A foundation that logs in and confirms nothing else has still told us
    // something real. Requiring a purpose would make the honest minimum
    // impossible.
    expect(storedFunderProfileSchema.safeParse(MINIMAL).success).toBe(true);
  });

  it("REJECTS an applicant's opinion of the foundation", () => {
    // fitScore, priority and researchDepth belong to a seeker's assessment.
    // A foundation setting its own fit score would be marking its own
    // homework, and .strict() is what makes that impossible rather than
    // merely discouraged.
    for (const field of ['fitScore', 'priority', 'researchDepth', 'researchNotes']) {
      expect(
        storedFunderProfileSchema.safeParse({ ...MINIMAL, [field]: 10 }).success,
        `${field} must not be settable by the foundation`,
      ).toBe(false);
    }
  });

  it('rejects a grant range that runs backwards', () => {
    expect(
      storedFunderProfileSchema.safeParse({ ...MINIMAL, grantMin: 50000, grantMax: 1000 }).success,
    ).toBe(false);
    expect(
      storedFunderProfileSchema.safeParse({ ...MINIMAL, grantMin: 1000, grantMax: 50000 }).success,
    ).toBe(true);
  });

  it('accepts a one-sided range, because foundations state them that way', () => {
    expect(storedFunderProfileSchema.safeParse({ ...MINIMAL, grantMax: 20000 }).success).toBe(true);
  });

  it('rejects a malformed website or email', () => {
    expect(storedFunderProfileSchema.safeParse({ ...MINIMAL, website: 'nope' }).success).toBe(
      false,
    );
    expect(
      storedFunderProfileSchema.safeParse({ ...MINIMAL, contact: { email: 'nope' } }).success,
    ).toBe(false);
  });
});

describe('parseFunderProfile', () => {
  it('carries provenance, because everything downstream depends on it', () => {
    const at = new Date('2026-09-05');
    expect(parseFunderProfile(MINIMAL, null, at).confirmed).toBe(false);
    expect(parseFunderProfile(MINIMAL, at, at).confirmed).toBe(true);
  });

  it('throws on a shape that does not fit rather than guessing', () => {
    expect(() => parseFunderProfile({ name: 'no id' }, null, new Date())).toThrow();
  });
});
