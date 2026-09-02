/**
 * Role policy — pure, and deliberately free of imports.
 *
 * This lives apart from `access.ts` because that module reaches for the
 * database, and a question as load-bearing as "does this role grant that?"
 * should be answerable without one. Testing the policy previously required a
 * DATABASE_URL, which is a good sign the two were tangled.
 */

/** Least → most privileged. The order IS the policy; `roleAtLeast` reads it. */
export const ORG_ROLES = ['member', 'admin', 'owner'] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

/** Is `role` at least `required`? */
export function roleAtLeast(role: OrgRole, required: OrgRole): boolean {
  return ORG_ROLES.indexOf(role) >= ORG_ROLES.indexOf(required);
}

/**
 * Coerce a role string from the database into a known role.
 *
 * Anything unrecognised — a role a newer Better Auth version introduced, a
 * typo in a seed — becomes the LEAST privileged, never the most. Failing open
 * here would hand an owner's rights to a value nobody meant to write.
 */
export function normalizeRole(raw: string): OrgRole {
  return (ORG_ROLES as readonly string[]).includes(raw) ? (raw as OrgRole) : 'member';
}
