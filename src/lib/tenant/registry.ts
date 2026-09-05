/**
 * What the platform knows about hosts without asking the database.
 *
 * This file used to hold the tenant registry itself: a `TENANT_IDS` enum, a
 * `HOST_TENANTS` map and a `DEFAULT_TENANT_ID`. All three were compile-time
 * statements about which customers exist, so taking one on — or removing one —
 * required editing, reviewing and deploying the application.
 *
 * They are now rows in `org_domains`, resolved by `getCurrentOrgId()`. What
 * remains here is the two things that are genuinely about the PLATFORM and
 * cannot come from a tenant row: which host is the product's own, and the name
 * of the header the middleware uses to hand the Host to the Node runtime.
 *
 * The fallback is gone with the map, and that is the substantive change.
 * `getTenantIdByHost()` answered an unknown Host with the first customer, so a
 * stray domain, a probe or a not-yet-mapped customer rendered that customer's
 * site and scoped queries to its data. Resolution now fails loudly instead —
 * the same rule `getTenantById` already followed for a missing row.
 */

/**
 * The platform's own host. Not a tenant: it serves the product.
 *
 * Overridable so a deployment is not a code change; the default matches the
 * current production host.
 */
export const PLATFORM_HOST = process.env.PLATFORM_HOST ?? 'hirnli.orangecat.ch';

/**
 * Header carrying the normalised request Host from middleware to the app.
 *
 * Middleware runs on the Edge runtime, where Drizzle over node-postgres cannot
 * go, so it cannot resolve the tenant itself. It forwards the host; the Node
 * runtime looks it up. Previously it forwarded an already-resolved `x-org-id`,
 * which required the map to live in Edge-compatible code.
 */
export const TENANT_HOST_HEADER = 'x-tenant-host';

/** Strip a port so `localhost:3000` and proxied hosts compare cleanly. */
export function normalizeHost(host: string | null): string {
  return (host ?? '').split(':')[0].toLowerCase();
}

/** Is this request for the platform surface rather than a tenant showcase? */
export function isPlatformHost(host: string | null): boolean {
  return normalizeHost(host) === PLATFORM_HOST;
}
