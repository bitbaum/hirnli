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
import { STORIES_CONTENT } from '@/lib/config/stories';

describe('starter content', () => {
  it('satisfies the schema a stored block is read through', () => {
    const parsed = storiesBlockSchema.safeParse(STARTER_STORIES);
    expect(
      parsed.success ? [] : parsed.error.issues.map((i) => i.path.join('.')),
      'a new tenant would 500 on its first page',
    ).toEqual([]);
  });

  it('has exactly the keys the real block has', () => {
    // Not a subset and not a superset: the composer reads by key, so a missing
    // one is a hole in a Gesuch and an extra one is dead weight nobody fills.
    expect(Object.keys(STARTER_STORIES).sort()).toEqual(Object.keys(STORIES_CONTENT).sort());
  });

  it("shares no prose with the reference organisation's block", () => {
    // Keyed on the CONTENT rather than a list of forbidden words. A denylist
    // would need every product, place and system name the first customer uses
    // — and would itself put those names back into the source, which the trace
    // ratchet caught when this test was first written.
    //
    // The failure it guards: seeding a new customer from the first customer's
    // row makes onboarding feel instant and produces grant applications
    // describing the wrong organisation.
    const strings = (v: unknown, out: string[] = []): string[] => {
      if (typeof v === 'string') out.push(v);
      else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
      else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
      return out;
    };

    const reference = new Set(
      strings(STORIES_CONTENT)
        .map((t) => t.trim())
        .filter((t) => t.length > 40),
    );
    const copied = strings(STARTER_STORIES)
      .map((t) => t.trim())
      .filter((t) => reference.has(t));

    expect(copied, `copied verbatim from the reference block: ${copied.join(' | ')}`).toEqual([]);
  });

  it('is visibly unfinished, so it cannot be sent by accident', () => {
    const text = JSON.stringify(STARTER_STORIES);
    expect(text).toContain('[Bitte ergänzen]');
  });
});
