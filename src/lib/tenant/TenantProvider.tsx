'use client';

/**
 * The current tenant, for client components.
 *
 * Server code calls `getTenant()`. Client components cannot: resolving a tenant
 * means reading a request header and querying the database, neither of which
 * exists in the browser. So the server resolves once per request in the tenant
 * layout and passes the result down through this context.
 *
 * Why a context rather than props: the identity is read at every depth — nav,
 * footer, gesuch panels, the number inspector — and threading it through every
 * intermediate component would put a `tenant` prop on components that have no
 * business knowing about tenancy.
 *
 * There is deliberately NO default value. A missing provider throws rather than
 * quietly yielding a fallback tenant, because the fallback would be whichever
 * organisation happened to be first — the failure this whole layer exists to
 * make impossible.
 */

import { createContext, useContext } from 'react';
import type { Tenant } from './profile';
import type { TenantBranding } from './profile';

type TenantContextValue = { tenant: Tenant; branding: TenantBranding };

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenant,
  branding,
  children,
}: TenantContextValue & { children: React.ReactNode }) {
  // The value is stable for the lifetime of a request-rendered tree, so it is
  // constructed inline rather than memoised: a new object per render of a
  // server-rendered layout is not a re-render hazard here.
  return <TenantContext.Provider value={{ tenant, branding }}>{children}</TenantContext.Provider>;
}

/** The tenant this page belongs to. Throws outside a TenantProvider. */
export function useTenant(): Tenant {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error(
      'useTenant() outside a TenantProvider. A client component cannot resolve ' +
        'a tenant on its own, and falling back to a default would render one ' +
        "organisation's identity inside another's page.",
    );
  }
  return ctx.tenant;
}

/** The tenant's visual identity. Empty is valid — it means "unbranded". */
export function useTenantBranding(): TenantBranding {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenantBranding() outside a TenantProvider.');
  }
  return ctx.branding;
}
