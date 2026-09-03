/**
 * The one place that reads a tenant. Every other module asks this.
 *
 * DRY is the point: 83 files currently import a compile-time `ORG_PROFILE`
 * constant, which is why the app can serve exactly one organisation. Replacing
 * that with 83 direct queries would trade one problem for a worse one, so this
 * is the single reader — request-cached, validated once, typed from the schema.
 *
 * Which tenant? The middleware resolves the Host and publishes `x-org-id`.
 * Reading it here rather than at each call site keeps "how a request finds its
 * tenant" in one file, so the answer can change (path segment, custom domain,
 * membership) without touching consumers.
 */

import { cache } from 'react';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orgProfiles } from '@/lib/db/schema';
import { DEFAULT_TENANT_ID } from './registry';
import { parseTenant, type Tenant } from './profile';

/** Load one tenant by org id. Cached per request; throws if absent or invalid. */
export const getTenantById = cache(async (orgId: string): Promise<Tenant> => {
  const rows = await db
    .select({ profile: orgProfiles.profile })
    .from(orgProfiles)
    .where(eq(orgProfiles.orgId, orgId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    // Loud on purpose. A missing tenant silently falling back to another
    // organisation's identity would put one customer's name on another's
    // Gesuch — the failure this whole layer exists to make impossible.
    throw new Error(`No org_profiles row for "${orgId}".`);
  }

  try {
    return parseTenant(row.profile);
  } catch (err) {
    throw new Error(
      `org_profiles["${orgId}"].profile does not match the tenant schema: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
});

/**
 * The tenant this request is acting as.
 *
 * `x-org-id` is set by middleware from the Host. The default covers routes that
 * run outside a request scope (build-time metadata, scripts).
 */
export const getTenant = cache(async (): Promise<Tenant> => {
  const h = await headers();
  return getTenantById(h.get('x-org-id') ?? DEFAULT_TENANT_ID);
});
