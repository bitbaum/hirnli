/**
 * These guard the confidentiality boundary between customers, so they test the
 * decisions rather than the plumbing: role comparison must not accidentally
 * grant, and an unrecognised role must fall to the bottom rather than the top.
 *
 * These import `roles.ts`, not `access.ts`: the policy is pure, and pulling in
 * the DB client just to ask whether an admin outranks a member was the tangle
 * that made this untestable in the first place.
 *
 * The URL-vs-session rule itself is pinned in access-contract.test.ts, which
 * reads the source — because the failure it prevents (using
 * `session.activeOrganizationId` to authorise) is a shape of code, not a
 * return value.
 */

import { describe, it, expect } from 'vitest';
import { roleAtLeast, normalizeRole, ORG_ROLES, type OrgRole } from '../roles';

describe('ORG_ROLES', () => {
  it('is ordered least → most privileged', () => {
    expect(ORG_ROLES).toEqual(['member', 'admin', 'owner']);
  });
});

describe('roleAtLeast', () => {
  it('grants when the role is exactly the requirement', () => {
    for (const r of ORG_ROLES) {
      expect(roleAtLeast(r, r)).toBe(true);
    }
  });

  it('grants upward', () => {
    expect(roleAtLeast('owner', 'member')).toBe(true);
    expect(roleAtLeast('owner', 'admin')).toBe(true);
    expect(roleAtLeast('admin', 'member')).toBe(true);
  });

  it('refuses downward — a member is never an admin', () => {
    expect(roleAtLeast('member', 'admin')).toBe(false);
    expect(roleAtLeast('member', 'owner')).toBe(false);
    expect(roleAtLeast('admin', 'owner')).toBe(false);
  });

  it('is a total order — no pair is mutually satisfying unless equal', () => {
    for (const a of ORG_ROLES) {
      for (const b of ORG_ROLES) {
        if (a !== b) {
          expect(roleAtLeast(a, b) && roleAtLeast(b, a)).toBe(false);
        }
      }
    }
  });

  it('treats an unknown role as least privileged, not most', () => {
    // A role string arriving from the DB that we do not recognise (a future
    // Better Auth role, a typo in a seed) must not silently become an owner.
    const rogue = 'superuser' as OrgRole;
    expect(roleAtLeast(rogue, 'owner')).toBe(false);
    expect(roleAtLeast(rogue, 'admin')).toBe(false);
  });
});

describe('normalizeRole', () => {
  it('passes through every known role unchanged', () => {
    for (const r of ORG_ROLES) expect(normalizeRole(r)).toBe(r);
  });

  it('fails closed on anything else', () => {
    for (const junk of ['superuser', 'OWNER', '', 'admin ', 'root']) {
      expect(normalizeRole(junk)).toBe('member');
    }
  });
});
