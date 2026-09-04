/**
 * Loading a tenant's identity, for standalone scripts.
 *
 * The scripts' counterpart to `src/lib/tenant/resolve.ts`, and it exists for
 * the same reason as the readers beside it: these are `tsx` one-shots outside
 * any Next request, so there is no `headers()` to resolve an org from and no
 * Drizzle client — just the raw `pg` connection.
 *
 * What is deliberately NOT duplicated is the shape. `parseTenant` comes from
 * `src/lib/tenant/profile.ts`, so the schema, the strictness that rejects a
 * stored derived value, and the `yearsActive` / `experienceLabel` derivation
 * are stated once and used by both sides. A second parser here would be a
 * second definition of what a tenant is, which is the whole failure this
 * migration exists to end.
 */

import { query } from './db';
import { parseTenant, type Tenant } from '../../src/lib/tenant/profile';

/**
 * The tenant a script is acting as. Throws rather than falling back.
 *
 * There is no default for the same reason `requireOrgId()` has none: a script
 * that composes a Gesuch under the wrong organisation's name produces a
 * document that looks finished and is unusable, and nothing downstream would
 * flag it.
 */
export async function readTenant(orgId: string): Promise<Tenant> {
  const rows = await query<{ profile: unknown }>(
    `SELECT profile FROM org_profiles WHERE org_id = $1 LIMIT 1`,
    [orgId],
  );

  if (rows.length === 0) {
    throw new Error(
      `No org_profiles row for "${orgId}".\n` +
        'The org id must match a seeded tenant — check `SELECT org_id FROM org_profiles`.',
    );
  }

  try {
    return parseTenant(rows[0].profile);
  } catch (err) {
    throw new Error(
      `org_profiles["${orgId}"].profile does not match the tenant schema: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
