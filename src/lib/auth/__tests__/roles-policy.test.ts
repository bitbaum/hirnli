/**
 * The two rules that decide who can lock whom out.
 *
 * Both live in `roles.ts` rather than beside the database calls that enforce
 * them, for the reason that module's header already gives: a question as
 * load-bearing as "does this role grant that?" should be answerable without a
 * DATABASE_URL. These are the cases worth being sure about.
 */

import { describe, it, expect } from 'vitest';
import { isLastOwner, mayGrantRole, ORG_ROLES, type OrgRole } from '../roles';

describe('mayGrantRole', () => {
  it('lets an owner grant anything', () => {
    for (const target of ORG_ROLES) expect(mayGrantRole('owner', target)).toBe(true);
  });

  it('stops an admin creating an owner', () => {
    // Otherwise admin and owner are the same role with two names: an admin
    // invites a confederate as owner, or themselves from a second address.
    expect(mayGrantRole('admin', 'owner')).toBe(false);
    expect(mayGrantRole('admin', 'admin')).toBe(true);
    expect(mayGrantRole('admin', 'member')).toBe(true);
  });

  it('stops a member granting anything at all', () => {
    for (const target of ORG_ROLES) expect(mayGrantRole('member', target)).toBe(false);
  });
});

describe('isLastOwner', () => {
  const roles = (...r: OrgRole[]) => r;

  it('refuses to remove the only owner', () => {
    expect(isLastOwner(roles('owner'), 'owner')).toBe(true);
    expect(isLastOwner(roles('owner', 'admin', 'member'), 'owner')).toBe(true);
  });

  it('allows removing an owner when another remains', () => {
    expect(isLastOwner(roles('owner', 'owner'), 'owner')).toBe(false);
  });

  it('does not block removing anyone else', () => {
    expect(isLastOwner(roles('owner', 'admin'), 'admin')).toBe(false);
    expect(isLastOwner(roles('owner', 'member'), 'member')).toBe(false);
  });

  it('treats an ownerless organisation as already lost, not as removable', () => {
    // Nothing to protect; the guard must not throw or claim otherwise.
    expect(isLastOwner(roles('admin', 'member'), 'admin')).toBe(false);
  });
});
