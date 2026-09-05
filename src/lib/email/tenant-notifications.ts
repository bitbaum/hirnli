/**
 * Who a tenant's automated notifications come from, and go to.
 *
 * The two fundraising crons — the weekly data-quality report and the deadline
 * reminder — each built the same three strings from the compile-time
 * the compile-time tenant constant: a From address, a To address, and a dashboard link in the
 * footer. Two copies of one rule, about to become three the next time anything
 * notifies anybody, so the rule lives here once and is derived from the tenant
 * the notification is actually about.
 *
 * ── Why this can refuse ──────────────────────────────────────────────────────
 *
 * `fundraisingEmail` and `website` are optional on a tenant, and their absence
 * is not hypothetical: today's second tenant has neither a fundraising address
 * nor anything to send from. The old code read them off a constant that always
 * had both, so the question never arose.
 *
 * There is no safe default. A missing recipient cannot fall back to another
 * tenant's inbox — that mails one customer's pipeline, deadlines and internal
 * data-quality findings to a different customer. A missing sender domain cannot
 * be invented either: mail from a domain the provider has not verified is
 * rejected or, worse, delivered and marked as spoofed.
 *
 * So this returns a refusal with a reason rather than a best guess, and callers
 * report that reason. A cron that skips its email must say it skipped it; the
 * failure mode this whole refactor keeps meeting is the job that reports
 * success while doing nothing.
 */

import { getTenantById } from '@/lib/tenant/resolve';
import type { Tenant } from '@/lib/tenant/profile';

export type TenantMailRoute =
  | { canSend: true; tenant: Tenant; from: string; to: string[] }
  | { canSend: false; tenant: Tenant; reason: string };

/**
 * The From/To for an internal notification to one organisation's fundraising
 * team, or the reason there isn't one.
 *
 * The sending domain is the tenant's own website host — `new URL().hostname`
 * rather than stripping a `https://` prefix, because a stored URL with a
 * trailing slash turned that into `noreply@example.ch/`, an address that is
 * simply invalid and would have failed at send time with nothing to point at.
 */
export async function resolveTenantMailRoute(orgId: string): Promise<TenantMailRoute> {
  const tenant = await getTenantById(orgId);

  const recipient = tenant.fundraisingEmail;
  if (!recipient) {
    return {
      canSend: false,
      tenant,
      reason: `${tenant.name} has no fundraisingEmail — nothing to notify.`,
    };
  }

  if (!tenant.website) {
    return {
      canSend: false,
      tenant,
      reason: `${tenant.name} has no website, so there is no verified domain to send from.`,
    };
  }

  let host: string;
  try {
    host = new URL(tenant.website).hostname;
  } catch {
    // The schema validates `website` as a URL, so this is unreachable through
    // normal writes. Handled anyway rather than letting a malformed row throw
    // out of a cron and turn a skipped email into a failed job.
    return { canSend: false, tenant, reason: `${tenant.name} has an unparseable website URL.` };
  }

  return {
    canSend: true,
    tenant,
    from: `${tenant.name} Fundraising <noreply@${host}>`,
    to: [recipient],
  };
}

/**
 * Where the "open the dashboard" link in a notification points.
 *
 * `siteUrl` is a tenant's own Hirnli-hosted host and is optional, so a footer
 * link is not always available. Returning null lets the caller drop the link
 * rather than render an `undefined/fundraising/dashboard` href.
 */
export function fundraisingDashboardUrl(tenant: Tenant): string | null {
  return tenant.siteUrl ? `${tenant.siteUrl.replace(/\/$/, '')}/fundraising/dashboard` : null;
}
