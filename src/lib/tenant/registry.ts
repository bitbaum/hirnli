/**
 * Tenant registry — the architectural anchor for multi-tenancy (Phase B/C
 * of docs/HIRNLI-REPLATFORM-PLAN.md).
 *
 * Today: tenant *identity* is still resolved statically from ORG_PROFILE, but
 * host → tenant resolution now happens per request (middleware reads Host and
 * sets `x-org-id`). Phase C replaces the static ORG_PROFILE import chain with
 * request-scoped resolution and makes this registry DB-backed (the
 * `org_profiles` table already exists and holds a row per tenant).
 *
 * Two kinds of host, and the difference matters:
 *
 *   PLATFORM host  (hirnli.orangecat.ch)      → the product itself: marketing
 *                                               now, the app later. Belongs to
 *                                               no tenant.
 *   TENANT host    (revamp-info.orangecat.ch) → one org's public showcase.
 *                                               Keeps its URLs so the SEO built
 *                                               up under it is not thrown away.
 *
 * Conflating the two is the single-tenant assumption this file exists to undo:
 * the platform must never inherit a tenant's name, and a tenant must never
 * borrow the platform's.
 */

import { ORG_PROFILE, type OrgProfile } from '@/lib/config/org-profile';

export type Tenant = OrgProfile;

/**
 * Known tenant ids. These MUST match the `org_id` column used across the
 * fundraising tables and the `org_profiles` row for each tenant — that column
 * is what actually scopes the data, so a typo here is a data-leak shape, not a
 * cosmetic bug.
 *
 * `evig` exists as a row in `org_profiles` (seeded empty on 2026-09-02) but has
 * no static profile yet: filling one in here would add a second hardcoded
 * tenant, which is precisely the coupling Phase C removes. It becomes
 * selectable once `getTenant()` reads from the DB.
 */
export const TENANT_IDS = {
  revampIt: 'revamp-it',
  evig: 'evig',
} as const;

export type TenantId = (typeof TENANT_IDS)[keyof typeof TENANT_IDS];

export const TENANTS: Record<string, Tenant> = {
  [ORG_PROFILE.orgId]: ORG_PROFILE,
};

/** The platform's own host — serves the product, not any single tenant. */
export const PLATFORM_HOST = 'hirnli.orangecat.ch';

/** Host → tenant mapping. Extended per tenant; DB-backed in Phase C. */
export const HOST_TENANTS: Record<string, string> = {
  'revamp-info.orangecat.ch': ORG_PROFILE.orgId,
};

export const DEFAULT_TENANT_ID = ORG_PROFILE.orgId;

/** Strip a port so `localhost:3000` and proxied hosts compare cleanly. */
function normalizeHost(host: string | null): string {
  return (host ?? '').split(':')[0].toLowerCase();
}

/** Is this request for the platform surface rather than a tenant showcase? */
export function isPlatformHost(host: string | null): boolean {
  return normalizeHost(host) === PLATFORM_HOST;
}

/** Which tenant does this host serve? Falls back to the default tenant. */
export function getTenantIdByHost(host: string | null): string {
  return HOST_TENANTS[normalizeHost(host)] ?? DEFAULT_TENANT_ID;
}

export function getTenantByHost(host: string | null): Tenant {
  return TENANTS[getTenantIdByHost(host)];
}
