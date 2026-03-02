/**
 * Deadline Reminder Cron Job
 *
 * GET /api/cron/deadline-reminder — Check for upcoming deadlines and send notifications
 *
 * Triggers: Daily at 9 AM CET
 * Checks: Applications with decision expected in 14d, 7d, or 1d
 * Sends: Email notifications via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import type { Application, FoundationRow } from '@/lib/db/schema';

// Initialize Resend (requires RESEND_API_KEY in env)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * GET /api/cron/deadline-reminder
 * Run daily to check for upcoming deadlines
 */
export async function GET(request: NextRequest) {
  // Security: Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
      const targetDateStr = targetDate.toISOString().split('T')[0];

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
            eq(applications.decisionExpected, targetDateStr),
            eq(applications.status, 'pending')
          )
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

    // Send email notifications if any found
    if (notifications.length > 0 && resend) {
      const emailBody = formatEmailBody(notifications);

      await resend.emails.send({
        from: `${ORG_PROFILE.name} Fundraising <noreply@${ORG_PROFILE.website.replace('https://', '')}>`,
        to: [ORG_PROFILE.fundraisingEmail],
        subject: `⏰ ${notifications.length} Fristen in den nächsten 14 Tagen`,
        html: emailBody,
      });
    }

    return NextResponse.json({
      success: true,
      notifications_sent: notifications.length,
      deadlines: notifications.map(n => ({
        foundation: n.foundation?.name,
        daysUntil: n.daysUntil,
        urgency: n.urgency,
      })),
    });
  } catch (error) {
    console.error('Deadline reminder cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
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
  }>
): string {
  const urgencyColors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#10B981',
  };

  const urgencyLabels = {
    high: '🔴 Sehr dringend',
    medium: '🟠 Dringend',
    low: '🟡 Bevorstehend',
  };

  const groupedByUrgency = {
    high: notifications.filter(n => n.urgency === 'high'),
    medium: notifications.filter(n => n.urgency === 'medium'),
    low: notifications.filter(n => n.urgency === 'low'),
  };

  const formatCHF = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Deadline Erinnerungen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1F2937; border-bottom: 3px solid #3B82F6; padding-bottom: 10px;">
    ⏰ Fundraising Deadline Erinnerungen
  </h1>
  <p style="font-size: 16px; color: #4B5563;">
    ${notifications.length} Gesuche mit anstehenden Fristen:
  </p>
`;

  for (const [urgency, items] of Object.entries(groupedByUrgency)) {
    if (items.length === 0) continue;

    const urgencyKey = urgency as 'high' | 'medium' | 'low';
    const color = urgencyColors[urgencyKey];
    const label = urgencyLabels[urgencyKey];

    html += `
  <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${color}; background-color: #F9FAFB;">
    <h2 style="margin: 0 0 10px 0; color: ${color}; font-size: 18px;">
      ${label} (${items[0].daysUntil} Tag${items[0].daysUntil > 1 ? 'e' : ''})
    </h2>
    <ul style="margin: 0; padding-left: 20px;">
`;

    for (const item of items) {
      html += `
      <li style="margin: 10px 0;">
        <strong>${item.foundation?.name || 'Unknown'}</strong><br>
        <span style="color: #6B7280; font-size: 14px;">
          Betrag: ${formatCHF(item.application.requestedAmount)}<br>
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

  html += `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
    <p style="font-size: 14px; color: #6B7280;">
      <a href="https://revamp-info.vercel.app/fundraising/dashboard" style="color: #3B82F6; text-decoration: none;">
        Dashboard öffnen →
      </a>
    </p>
    <p style="font-size: 12px; color: #9CA3AF;">
      Diese Nachricht wurde automatisch von ${ORG_PROFILE.name} Fundraising System generiert.
    </p>
  </div>
</body>
</html>
`;

  return html;
}
