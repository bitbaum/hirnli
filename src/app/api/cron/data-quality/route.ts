/**
 * Data Quality Monitoring Cron Job
 *
 * GET /api/cron/data-quality — Audit database and send quality report
 *
 * Triggers: Weekly (Mondays at 8 AM CET)
 * Checks: Missing fields, outdated research, stuck applications
 * Sends: Email report via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations, applications } from '@/lib/db/schema';
import { and, eq, isNull, lt, gte, sql } from 'drizzle-orm';
import { Resend } from 'resend';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { formatDateCH, toISODateStr } from '@/lib/utils/format';
import { API_ERR_UNAUTHORIZED, API_ERR_CRON } from '@/lib/utils/errors';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface DataQualityIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
  message: string;
  items?: Array<{ id: string; name: string; detail?: string }>;
}

/**
 * GET /api/cron/data-quality
 * Run weekly to audit database quality
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
  if (authHeader.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
    return NextResponse.json({ success: false, error: API_ERR_UNAUTHORIZED }, { status: 401 });
  }

  try {
    const issues: DataQualityIssue[] = [];

    // Check 1: High-fit foundations missing contact email (query config_data JSONB)
    const missingEmail = await db
      .select()
      .from(foundations)
      .where(
        and(
          sql`(config_data->'contact'->>'email' IS NULL OR config_data->'contact'->>'email' = '')`,
          gte(foundations.fitScore, 7),
          eq(foundations.archived, false)
        )
      );

    if (missingEmail.length > 0) {
      issues.push({
        type: 'missing_contact_email',
        severity: 'high',
        count: missingEmail.length,
        message: `${missingEmail.length} high-fit foundations missing contact email`,
        items: missingEmail.slice(0, 10).map(f => ({
          id: f.id,
          name: f.name,
          detail: `Fit: ${f.fitScore}/10`,
        })),
      });
    }

    // Check 2: Foundations missing website (query config_data JSONB)
    const missingWebsite = await db
      .select()
      .from(foundations)
      .where(
        and(
          sql`(config_data->>'websiteUrl' IS NULL OR config_data->>'websiteUrl' = '')`,
          gte(foundations.fitScore, 5),
          eq(foundations.archived, false)
        )
      );

    if (missingWebsite.length > 0) {
      issues.push({
        type: 'missing_website',
        severity: 'medium',
        count: missingWebsite.length,
        message: `${missingWebsite.length} foundations missing website URL`,
        items: missingWebsite.slice(0, 10).map(f => ({
          id: f.id,
          name: f.name,
        })),
      });
    }

    // Check 3: Outdated research (>6 months for high-fit foundations)
    // researchDate is text (ISO date string) — text comparison works for ISO dates
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = toISODateStr(sixMonthsAgo);

    const outdatedResearch = await db
      .select()
      .from(foundations)
      .where(
        and(
          lt(foundations.researchDate, sixMonthsAgoStr),
          gte(foundations.fitScore, 7),
          eq(foundations.archived, false)
        )
      );

    if (outdatedResearch.length > 0) {
      issues.push({
        type: 'outdated_research',
        severity: 'medium',
        count: outdatedResearch.length,
        message: `${outdatedResearch.length} high-fit foundations with research >6 months old`,
        items: outdatedResearch.slice(0, 10).map(f => ({
          id: f.id,
          name: f.name,
          detail: `Last research: ${f.researchDate}`,
        })),
      });
    }

    // Check 4: Stuck applications (no status change in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stuckApplications = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(
        and(
          lt(applications.updatedAt, thirtyDaysAgo),
          eq(applications.status, 'draft')
        )
      );

    if (stuckApplications.length > 0) {
      issues.push({
        type: 'stuck_applications',
        severity: 'high',
        count: stuckApplications.length,
        message: `${stuckApplications.length} applications stuck in draft for >30 days`,
        items: stuckApplications.slice(0, 10).map(({ application, foundation }) => ({
          id: application.id,
          name: foundation?.name || 'Unknown',
          detail: `Last update: ${application.updatedAt ? formatDateCH(application.updatedAt.toISOString()) : 'Never'}`,
        })),
      });
    }

    // Check 5: Missing fit scores
    const missingFitScore = await db
      .select()
      .from(foundations)
      .where(
        and(isNull(foundations.fitScore), eq(foundations.archived, false))
      );

    if (missingFitScore.length > 0) {
      issues.push({
        type: 'missing_fit_score',
        severity: 'low',
        count: missingFitScore.length,
        message: `${missingFitScore.length} foundations missing fit score`,
        items: missingFitScore.slice(0, 10).map(f => ({
          id: f.id,
          name: f.name,
        })),
      });
    }

    // Check 6: Applications missing decision dates
    const missingDecisionDate = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(
        and(
          eq(applications.status, 'pending'),
          isNull(applications.decisionExpected)
        )
      );

    if (missingDecisionDate.length > 0) {
      issues.push({
        type: 'missing_decision_date',
        severity: 'medium',
        count: missingDecisionDate.length,
        message: `${missingDecisionDate.length} pending applications missing decision date`,
        items: missingDecisionDate.slice(0, 10).map(({ application, foundation }) => ({
          id: application.id,
          name: foundation?.name || 'Unknown',
        })),
      });
    }

    // Send email report if issues found
    if (issues.length > 0 && resend) {
      const emailBody = formatQualityReport(issues);

      await resend.emails.send({
        from: `${ORG_PROFILE.name} Fundraising <noreply@${ORG_PROFILE.website.replace('https://', '')}>`,
        to: [ORG_PROFILE.fundraisingEmail],
        subject: `📊 Datenqualität Report: ${issues.length} Probleme gefunden`,
        html: emailBody,
      });
    }

    return NextResponse.json({
      success: true,
      issues_found: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Data quality cron error:', error);
    return NextResponse.json(
      { success: false, error: API_ERR_CRON },
      { status: 500 }
    );
  }
}

/**
 * Format quality report email
 */
function formatQualityReport(issues: DataQualityIssue[]): string {
  const severityColors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#10B981',
  };

  const severityLabels = {
    high: '🔴 Dringend',
    medium: '🟠 Mittel',
    low: '🟡 Niedrig',
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Datenqualität Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1F2937; border-bottom: 3px solid #F59E0B; padding-bottom: 10px;">
    📊 Datenqualität Report
  </h1>
  <p style="font-size: 16px; color: #4B5563;">
    ${issues.length} Qualitätsprobleme gefunden:
  </p>
`;

  for (const issue of issues) {
    const color = severityColors[issue.severity];
    const label = severityLabels[issue.severity];

    html += `
  <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${color}; background-color: #F9FAFB;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h2 style="margin: 0; color: ${color}; font-size: 18px;">
        ${label}
      </h2>
      <span style="background-color: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
        ${issue.count}
      </span>
    </div>
    <p style="margin: 10px 0; font-size: 14px; color: #1F2937;">
      <strong>${issue.message}</strong>
    </p>
`;

    if (issue.items && issue.items.length > 0) {
      html += `<ul style="margin: 10px 0; padding-left: 20px; font-size: 13px; color: #6B7280;">`;
      for (const item of issue.items) {
        html += `<li style="margin: 5px 0;">${item.name}${item.detail ? ` — ${item.detail}` : ''}</li>`;
      }
      html += `</ul>`;

      if (issue.count > 10) {
        html += `<p style="font-size: 12px; color: #9CA3AF; font-style: italic;">... und ${issue.count - 10} weitere</p>`;
      }
    }

    html += `</div>`;
  }

  html += `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
    <p style="font-size: 14px; color: #6B7280;">
      <a href="${ORG_PROFILE.platform.url}/fundraising/dashboard" style="color: #3B82F6; text-decoration: none;">
        Dashboard öffnen →
      </a>
    </p>
    <p style="font-size: 12px; color: #9CA3AF;">
      Diese Nachricht wurde automatisch vom ${ORG_PROFILE.name} Fundraising System generiert.
    </p>
  </div>
</body>
</html>
`;

  return html;
}
