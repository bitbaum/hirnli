/**
 * A newly provisioned tenant's row must be valid on the first page load.
 *
 * `provisionOrganization` writes `STARTER_STORIES` into `org_content` inside
 * the same transaction that creates the account. If that row does not satisfy
 * `storiesBlockSchema`, the reader throws — and the customer sees a 500
 * immediately after being told their organisation was created, with nothing to
 * suggest why.
 *
 * The two objects also drift in opposite directions: the schema grows when the
 * composer needs another structure, the starter grows when someone remembers.
 * This is what keeps them in step.
 */

import { describe, it, expect } from 'vitest';
import { STARTER_STORIES } from '../starter-content';
import { storiesBlockSchema } from '../stories-source';

describe('starter content', () => {
  it('satisfies the schema a stored block is read through', () => {
    const parsed = storiesBlockSchema.safeParse(STARTER_STORIES);
    expect(
      parsed.success ? [] : parsed.error.issues.map((i) => i.path.join('.')),
      'a new tenant would 500 on its first page',
    ).toEqual([]);
  });

  it('has exactly the keys the schema requires', () => {
    // Not a subset and not a superset: the composer reads by key, so a missing
    // one is a hole in a Gesuch and an extra one is dead weight nobody fills.
    //
    // Measured against the SCHEMA rather than against another block. It used to
    // compare with the reference organisation's code copy, which made one
    // customer's content the definition of complete; that copy is gone, and the
    // schema is what every tenant's block is actually held to.
    expect(Object.keys(STARTER_STORIES).sort()).toEqual(
      Object.keys(storiesBlockSchema.shape).sort(),
    );
  });

  // A test comparing the starter's prose against the reference organisation's
  // block used to live here. Its subject was `src/lib/config/stories.ts` — the
  // code copy of one customer's story — and that module has been deleted now
  // that the customer's row is the only version. There is no longer a block in
  // source to copy from, so the guard has nothing left to guard; the trace
  // ratchet still catches a customer's name appearing in source at all.

  it('is visibly unfinished, so it cannot be sent by accident', () => {
    const text = JSON.stringify(STARTER_STORIES);
    expect(text).toContain('[Bitte ergänzen]');
  });
});
