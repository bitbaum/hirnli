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
import { parseBranding, parseTenant, type Tenant, type TenantBranding } from './profile';

/** Load one tenant by org id. Cached per request; throws if absent or invalid. */
export const getTenantById = cache(async (orgId: string): Promise<Tenant> => {
  const rows = await db
    .select({ profile: orgProfiles.profile, branding: orgProfiles.branding })
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
 * Which organisation is this request acting as? Just the id.
 *
 * Separate from `getTenant()` on purpose. Scoping a query needs the id and
 * nothing else, and reading a whole profile from the database to build a
 * `WHERE` clause would be a needless round-trip on the hot path. It also keeps
 * one answer to "how does a request find its org", so that answer can change
 * without touching the places that merely scope by it.
 *
 * `x-org-id` is published by middleware from the Host. The default covers code
 * running outside a request scope (build-time metadata, scripts).
 */
export const getCurrentOrgId = cache(async (): Promise<string> => {
  const h = await headers();
  return h.get('x-org-id') ?? DEFAULT_TENANT_ID;
});

/** The tenant this request is acting as, with identity loaded. */
export const getTenant = cache(async (): Promise<Tenant> => {
  return getTenantById(await getCurrentOrgId());
});

/**
 * How this request's tenant looks. Separate from getTenant() because chrome
 * needs it on every page while most code never does, and because a tenant
 * without branding must render unbranded — never under another tenant's mark.
 */
export const getTenantBranding = cache(async (): Promise<TenantBranding> => {
  const orgId = await getCurrentOrgId();
  const rows = await db
    .select({ branding: orgProfiles.branding })
    .from(orgProfiles)
    .where(eq(orgProfiles.orgId, orgId))
    .limit(1);
  return parseBranding(rows[0]?.branding);
});
