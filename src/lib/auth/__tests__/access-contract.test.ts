/**
 * The rule that keeps one customer's fundraising research away from another's.
 *
 * `getOrgAccess()` must authorise from the URL slug plus a membership row —
 * never from `session.activeOrganizationId`. Better Auth's organisation plugin
 * offers that field and reaching for it is the natural shortcut, which is
 * exactly why this is pinned in a test rather than left as a comment: a future
 * edit that "simplifies" the guard by trusting the session would compile, pass
 * every other test, and silently make two open tabs write into each other's
 * organisation.
 *
 * Asserting on source is the honest tool here. The property is "this code does
 * not consult that value", and no return value can demonstrate an absence.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rawSource = readFileSync(join(process.cwd(), 'src/lib/auth/access.ts'), 'utf-8');

/**
 * Comments stripped before scanning. The file EXPLAINS at length why
 * `session.activeOrganizationId` must not be trusted, and a naive scan flags
 * that explanation as the very thing it warns against — which is how the first
 * version of this test failed. Prose may name it; code may not use it.
 */
const accessSource = rawSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('org access contract', () => {
  it('never reads activeOrganizationId to make a decision', () => {
    // Mentioned in prose is fine; used as a value is not.
    const uses = /(?:session|s)\s*[?.]*\.\s*activeOrganizationId/.test(accessSource);
    expect(uses).toBe(false);
  });

  it('resolves the organisation by slug', () => {
    expect(accessSource).toMatch(/eq\(organization\.slug,\s*slug\)/);
  });

  it('requires a membership row for the signed-in user', () => {
    expect(accessSource).toMatch(/eq\(member\.userId,\s*s\.user\.id\)/);
    expect(accessSource).toMatch(/innerJoin\(organization/);
  });

  it('conceals existence: no-session and not-a-member both return null', () => {
    // Distinct error messages here would let an outsider enumerate customers.
    expect(accessSource).toMatch(/if \(!s\?\.user\) return null;/);
    expect(accessSource).toMatch(/if \(!row\) return null;/);
  });

  it('normalises the role from the database rather than trusting it', () => {
    // The fail-closed behaviour itself is unit-tested in access.test.ts against
    // roles.ts. What matters HERE is that the DB's raw string never reaches
    // OrgAccess unchecked — `role: row.role` would type-check and be wrong.
    expect(accessSource).toMatch(/role:\s*normalizeRole\(row\.role\)/);
    expect(accessSource).not.toMatch(/role:\s*row\.role\b/);
  });
});
