/**
 * Deadline Reminder Cron Job
 *
 * GET /api/cron/deadline-reminder — Check for upcoming deadlines and send notifications
 *
 * Triggers: Daily at 9 AM CET
 * Checks: Applications with decision expected in 14d, 7d, or 1d
 * Sends: Email notifications via @bitbaum/mail-kit (Resend underneath)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { sendMail, isMailConfigured } from '@bitbaum/mail-kit';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/registry';
import { fundraisingDashboardUrl, resolveTenantMailRoute } from '@/lib/email/tenant-notifications';
import type { Tenant } from '@/lib/tenant/profile';
import { APPLICATION_STATUSES } from '@/lib/config/application-statuses';
import { EMAIL_COLORS } from '@/lib/config/email-colors';
import { formatCHF } from '@/lib/utils/format';
import type { Application, FoundationRow } from '@/lib/db/schema';

const STATUS_LABEL = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.id, s.label]));
import { toISODateStr } from '@/lib/utils/format';
import { API_ERR_UNAUTHORIZED, API_ERR_CRON } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

/**
 * GET /api/cron/deadline-reminder
 * Run daily to check for upcoming deadlines
 */
export async function GET(request: NextRequest) {
  // Security: Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: API_ERR_UNAUTHORIZED }, { status: 401 });
  }
  const authHeader = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${cronSecret}`;
  // Constant-time comparison to prevent timing side-channel attacks
  const crypto = await import('crypto');
  if (
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ success: false, error: API_ERR_UNAUTHORIZED }, { status: 401 });
  }

  try {
    // Whose deadlines these are.
    //
    // The query below had no organisation filter at all, so it collected every
    // tenant's applications — foundation names, amounts, statuses and decision
    // dates — and mailed the lot to one organisation's fundraising inbox. That
    // is harmless only while exactly one tenant has applications, which stopped
    // being a safe assumption the moment this became a platform.
    //
    // Like the data-quality report, this cron has no request to resolve a
    // tenant from, so it runs for the reference tenant. Fanning it out to every
    // tenant is a change of behaviour towards customers who receive nothing
    // today, so it stays one visible line. See docs/TENANT-MIGRATION-MAP.md.
    const reportOrgId = DEFAULT_TENANT_ID;

    const today = new Date();
    const notifications: Array<{
      application: Application;
      foundation: FoundationRow | null;
      daysUntil: number;
      urgency: 'high' | 'medium' | 'low';
    }> = [];

    // Check deadlines at 14d, 7d, and 1d intervals
    const deadlineIntervals = [
      { days: 14, urgency: 'low' as const },
      { days: 7, urgency: 'medium' as const },
      { days: 1, urgency: 'high' as const },
    ];

    for (const interval of deadlineIntervals) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + interval.days);
      const targetDateStr = toISODateStr(targetDate);

      // Find applications with decision expected on target date
      const upcomingDeadlines = await db
        .select({
          application: applications,
          foundation: foundations,
        })
        .from(applications)
        .leftJoin(foundations, eq(applications.foundationId, foundations.id))
        .where(
          and(
            eq(applications.orgId, reportOrgId),
            eq(applications.decisionExpected, targetDateStr),
            // All active post-submission statuses that may have a decision date
            inArray(applications.status, ['submitted', 'pending', 'followup']),
          ),
        );

      for (const { application, foundation } of upcomingDeadlines) {
        notifications.push({
          application,
          foundation,
          daysUntil: interval.days,
          urgency: interval.urgency,
        });
      }
    }

    // Send, or record why not. A reminder nobody received is the one failure
    // this job must not report as success.
    let emailed: string | boolean = false;
    if (notifications.length > 0) {
      if (!isMailConfigured()) {
        emailed = 'skipped: RESEND_API_KEY is not configured';
      } else {
        const route = await resolveTenantMailRoute(reportOrgId);
        if (!route.canSend) {
          emailed = `skipped: ${route.reason}`;
        } else {
          const result = await sendMail(
            {
              from: route.from,
              to: route.to,
              subject: `⏰ ${notifications.length} Fristen in den nächsten 14 Tagen`,
              html: formatEmailBody(notifications, route.tenant),
            },
            // A retried cron run must not remind twice for the same day.
            { idempotencyKey: `deadline-reminder-${reportOrgId}-${toISODateStr(today)}` },
          );
          emailed = result.sent ? true : `failed: ${result.error}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      org_id: reportOrgId,
      notifications_sent: notifications.length,
      emailed,
      deadlines: notifications.map((n) => ({
        foundation: n.foundation?.name,
        daysUntil: n.daysUntil,
        urgency: n.urgency,
      })),
    });
  } catch (error) {
    return apiError('Deadline reminder cron', error, API_ERR_CRON);
  }
}

/**
 * Format email body with deadline notifications
 */
function formatEmailBody(
  notifications: Array<{
    application: Application;
    foundation: FoundationRow | null;
    daysUntil: number;
    urgency: 'high' | 'medium' | 'low';
  }>,
  tenant: Tenant,
): string {
  const urgencyColors = {
    high: EMAIL_COLORS.urgencyHigh,
    medium: EMAIL_COLORS.urgencyMedium,
    low: EMAIL_COLORS.urgencyLow,
  };

  const urgencyLabels = {
    high: '🔴 Sehr dringend',
    medium: '🟠 Dringend',
    low: '🟡 Bevorstehend',
  };

  const groupedByUrgency = {
    high: notifications.filter((n) => n.urgency === 'high'),
    medium: notifications.filter((n) => n.urgency === 'medium'),
    low: notifications.filter((n) => n.urgency === 'low'),
  };

  const formatAmount = (amount: number | null) => (amount ? formatCHF(amount) : '—');

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Deadline Erinnerungen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${EMAIL_COLORS.text}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: ${EMAIL_COLORS.textDark}; border-bottom: 3px solid ${EMAIL_COLORS.primary}; padding-bottom: 10px;">
    ⏰ Fundraising Deadline Erinnerungen
  </h1>
  <p style="font-size: 16px; color: ${EMAIL_COLORS.textLight};">
    ${notifications.length} Gesuche mit anstehenden Fristen:
  </p>
`;

  for (const [urgency, items] of Object.entries(groupedByUrgency)) {
    if (items.length === 0) continue;

    const urgencyKey = urgency as 'high' | 'medium' | 'low';
    const color = urgencyColors[urgencyKey];
    const label = urgencyLabels[urgencyKey];

    html += `
  <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${color}; background-color: ${EMAIL_COLORS.bgLight};">
    <h2 style="margin: 0 0 10px 0; color: ${color}; font-size: 18px;">
      ${label} (${items[0].daysUntil} Tag${items[0].daysUntil > 1 ? 'e' : ''})
    </h2>
    <ul style="margin: 0; padding-left: 20px;">
`;

    for (const item of items) {
      html += `
      <li style="margin: 10px 0;">
        <strong>${item.foundation?.name || 'Unknown'}</strong><br>
        <span style="color: ${EMAIL_COLORS.textMuted}; font-size: 14px;">
          Status: ${STATUS_LABEL[item.application.status] ?? item.application.status}<br>
          Betrag: ${formatAmount(item.application.requestedAmount)}<br>
          Entscheidung: ${item.application.decisionExpected}
        </span>
      </li>
`;
    }

    html += `
    </ul>
  </div>
`;
  }

  // Omitted rather than rendered as `undefined/...` for a tenant with no
  // hosted site of its own.
  const dashboardUrl = fundraisingDashboardUrl(tenant);
  html += `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${EMAIL_COLORS.border};">
    ${
      dashboardUrl
        ? `<p style="font-size: 14px; color: ${EMAIL_COLORS.textMuted};">
      <a href="${dashboardUrl}" style="color: ${EMAIL_COLORS.primary}; text-decoration: none;">
        Dashboard öffnen →
      </a>
    </p>`
        : ''
    }
    <p style="font-size: 12px; color: ${EMAIL_COLORS.textFaint};">
      Diese Nachricht wurde automatisch von ${tenant.name} Fundraising System generiert.
    </p>
  </div>
</body>
</html>
`;

  return html;
}
