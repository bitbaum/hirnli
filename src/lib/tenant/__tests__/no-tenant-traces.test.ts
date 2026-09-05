/**
 * No organisation may appear in this codebase except as tenant DATA.
 *
 * hirnli was written for one customer and became a platform. The identity
 * migration moved that customer's name, address and logo into `org_profiles`;
 * the content migration moved its pages behind an ownership gate. Neither
 * removed the customer from the SOURCE. It is still named 353 times across 119
 * files — as a compile-time constant, a generated numbers file, a route path,
 * a nav label in three locales, a CSS token, a deployment slug, and its
 * accounting system's name in eighty-two places.
 *
 * The target state is simple to state and hard to reach: `revamp-it` exists in
 * hirnli exactly the way any other tenant does — rows in `org_profiles` and
 * `org_content` — and nowhere else. A platform that has to be edited to add or
 * remove a customer is not a platform.
 *
 * This is the ratchet for getting there. The counts may fall and may not rise.
 * When they are all zero, delete this file.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

/**
 * Every way the reference tenant is named in source, with the count still
 * present. Ratchet downward.
 *
 * SQL migrations are excluded from the scan: they are the historical record of
 * how the rows got there, and rewriting history to hide a name would be a lie
 * about what happened.
 */
const BUDGET: Record<string, number> = {
  // Reached zero and removed from this list, so a reappearance is caught by the
  // "no new spelling" case rather than by a budget of 0: ORG_PROFILE,
  // SHARED_ORG_NUMBERS, and the route named after one customer's project.
  'Revamp-IT': 101,
  'revamp-it': 18,
  revampit: 13,
  'revamp-info': 2,
  Kivitendo: 82,
  'revamp-Einnahmen': 11,
};

const SCANNED = "src/ scripts/ messages/ --include='*.ts' --include='*.tsx' --include='*.json'";

function count(pattern: string): number {
  // --exclude-dir on this file's own directory would hide real hits elsewhere
  // in it, so exclude by filename instead: this file necessarily contains every
  // string it forbids. Fifth scanner in this migration to have matched itself.
  const out = execSync(
    `grep -rn "${pattern}" ${SCANNED} 2>/dev/null | grep -v 'no-tenant-traces.test.ts' || true`,
    { encoding: 'utf-8' },
  );
  return out.split('\n').filter(Boolean).length;
}

describe('the reference tenant is data, not code', () => {
  for (const [pattern, budget] of Object.entries(BUDGET)) {
    it(`"${pattern}" appears at most ${budget} times`, () => {
      const actual = count(pattern);
      expect(
        actual,
        actual > budget
          ? `"${pattern}" rose from ${budget} to ${actual}. A tenant's name belongs ` +
              'in org_profiles/org_content, not in source.'
          : `"${pattern}" is down to ${actual} — lower the budget in BUDGET to ${actual}.`,
      ).toBe(budget);
    });
  }

  it('a spelling that reached zero has not come back', () => {
    // Kept out of BUDGET once cleared, so the list stays a work plan rather
    // than a wall of zeroes — but the absence still has to be asserted.
    for (const gone of ['ORG_PROFILE', 'SHARED_ORG_NUMBERS', 'revamp-2030', 'revamp2030']) {
      expect(count(gone), `"${gone}" is back`).toBe(0);
    }
  });

  it('the scanner still finds something it is looking for', () => {
    // Every budget reaching zero would make these assertions vacuous. Until
    // then, prove the grep works by finding a string that is definitely there.
    expect(count('getTenant')).toBeGreaterThan(0);
  });
});
