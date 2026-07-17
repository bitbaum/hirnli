/**
 * Tenant registry — the architectural anchor for multi-tenancy (Phase B/C
 * of docs/HIRNLI-REPLATFORM-PLAN.md).
 *
 * Today: exactly one tenant, resolved statically. Phase C replaces the
 * static ORG_PROFILE import chain with request-scoped resolution
 * (middleware reads Host → x-org-id → getTenant()) and this registry
 * becomes DB-backed (org_profiles table). Until then, this file declares
 * the contract so new code binds to tenants, not to Revamp-IT.
 */

import { ORG_PROFILE, type OrgProfile } from '@/lib/config/org-profile';

export type Tenant = OrgProfile;

export const TENANTS: Record<string, Tenant> = {
  [ORG_PROFILE.orgId]: ORG_PROFILE,
};

/** Host → tenant mapping. Extended per tenant; DB-backed in Phase C. */
export const HOST_TENANTS: Record<string, string> = {
  'revamp-info.orangecat.ch': ORG_PROFILE.orgId,
};

export const DEFAULT_TENANT_ID = ORG_PROFILE.orgId;

export function getTenantByHost(host: string | null): Tenant {
  const orgId = (host && HOST_TENANTS[host]) || DEFAULT_TENANT_ID;
  return TENANTS[orgId];
}
