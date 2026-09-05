/**
 * Which tenants receive the scheduled reports.
 *
 * The two cron jobs pinned `DEFAULT_TENANT_ID`, so the data-quality report and
 * the deadline reminders ran for the first customer and — silently, for
 * everybody else — never at all. The tenant was a compile-time constant in a
 * job that has no request to resolve one from.
 *
 * It is now data, and the opt-in is a fact the tenant already states: an
 * organisation with a `fundraisingEmail` has said where fundraising mail
 * should go. One without has not, and `resolveTenantMailRoute()` would refuse
 * to send for it anyway — this makes that refusal explicit and cheap rather
 * than discovered after assembling a report.
 *
 * NOTE, stated rather than hidden: the jobs still process ONE tenant per run
 * (`soleReportingTenant`). Fanning out means looping their bodies, which
 * starts mailing customers who receive nothing today — a product decision, not
 * a refactor. This function is the seam where that happens: return the list
 * instead of the single id, and loop at the call site.
 */

import { and, eq, isNotNull, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orgProfiles } from '@/lib/db/schema';

/** Tenants that have said where fundraising mail should go. */
export async function reportingTenantIds(): Promise<string[]> {
  const rows = await db
    .select({ orgId: orgProfiles.orgId })
    .from(orgProfiles)
    .where(
      and(
        isNotNull(sql`${orgProfiles.profile} -> 'fundraisingEmail'`),
        ne(sql`${orgProfiles.profile} ->> 'fundraisingEmail'`, ''),
      ),
    );
  return rows.map((r) => r.orgId).sort();
}

/**
 * The one tenant a scheduled report runs for, or null if there is none.
 *
 * Returns null rather than guessing when several qualify: a report sent to the
 * wrong organisation is worse than a report not sent, and picking "the first"
 * is how a fallback tenant became the content tenant in the first place.
 */
export async function soleReportingTenant(): Promise<string | null> {
  const ids = await reportingTenantIds();
  return ids.length === 1 ? ids[0] : null;
}

/** Present so a future fan-out has an obvious call site. */
export async function tenantExists(orgId: string): Promise<boolean> {
  const rows = await db
    .select({ orgId: orgProfiles.orgId })
    .from(orgProfiles)
    .where(eq(orgProfiles.orgId, orgId))
    .limit(1);
  return rows.length > 0;
}
