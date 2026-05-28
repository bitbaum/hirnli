/**
 * Application Dashboard API
 *
 * GET /api/applications/dashboard  — Get KPI stats for dashboard
 *
 * Returns:
 * - totalRequested: Sum of all requested amounts
 * - totalAwarded: Sum of all awarded amounts
 * - submitted: Count of submitted applications
 * - accepted: Count of accepted applications
 * - rejected: Count of rejected applications
 * - pending: Count of pending applications
 * - successRate: Percentage of accepted vs total decided (accepted + rejected)
 * - byStatus: Count per status
 * - byPriority: Count per priority level
 * - upcomingDeadlines: Applications with decision expected in next 30 days
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq, and, gte, lte, isNotNull, inArray, count, sum } from 'drizzle-orm';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { MS_PER_DAY, DEADLINE_UPCOMING_DAYS } from '@/lib/utils/time';
import { getTodayISO, toISODateStr } from '@/lib/utils/format';
import { API_ERR_LOAD } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

/**
 * GET /api/applications/dashboard
 * Calculate KPI statistics for fundraising dashboard
 */
export async function GET(_request: NextRequest) {
  try {
    // Single GROUP BY query for all aggregate stats — no full-table fetch
    const [aggregates, statusRows, priorityRows] = await Promise.all([
      db
        .select({
          total: count(),
          totalRequested: sum(applications.requestedAmount),
          totalAwarded: sum(applications.awardedAmount),
        })
        .from(applications),

      db
        .select({
          status: applications.status,
          cnt: count(),
        })
        .from(applications)
        .groupBy(applications.status),

      db
        .select({
          priorityLevel: applications.priorityLevel,
          cnt: count(),
        })
        .from(applications)
        .where(isNotNull(applications.priorityLevel))
        .groupBy(applications.priorityLevel),
    ]);

    const { total, totalRequested, totalAwarded } = aggregates[0];

    const statusCounts = Object.fromEntries(
      statusRows.map(r => [r.status, r.cnt])
    ) as Partial<Record<ApplicationStatusId, number>>;

    const submitted = statusCounts.submitted ?? 0;
    const accepted = statusCounts.accepted ?? 0;
    const rejected = statusCounts.rejected ?? 0;
    const pending = statusCounts.pending ?? 0;
    const followup = statusCounts.followup ?? 0;

    const totalDecided = accepted + rejected;
    const successRate = totalDecided > 0 ? Math.round((accepted / totalDecided) * 100) : 0;

    // Upcoming deadlines (next 30 days)
    const today = getTodayISO();
    const in30Days = toISODateStr(new Date(Date.now() + DEADLINE_UPCOMING_DAYS * MS_PER_DAY));

    const upcomingDeadlines = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(
        and(
          gte(applications.decisionExpected, today),
          lte(applications.decisionExpected, in30Days),
          // All active post-submission statuses that may have a decision date
          inArray(applications.status, ['submitted', 'pending', 'followup'])
        )
      )
      .orderBy(applications.decisionExpected);

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          totalRequested: totalRequested ?? 0,
          totalAwarded: totalAwarded ?? 0,
          submitted,
          accepted,
          rejected,
          pending,
          followup,
          successRate,
          totalApplications: total,
        },
        byStatus: statusRows.map(r => ({ status: r.status, count: r.cnt })),
        byPriority: priorityRows.map(r => ({ priority: r.priorityLevel!, count: r.cnt })),
        upcomingDeadlines: upcomingDeadlines.map(item => ({
          id: item.application.id,
          foundationName: item.foundation?.name || 'Unknown',
          decisionExpected: item.application.decisionExpected,
          requestedAmount: item.application.requestedAmount,
          status: item.application.status,
          daysUntilDeadline: Math.ceil(
            (new Date(item.application.decisionExpected!).getTime() - Date.now()) / MS_PER_DAY
          ),
        })),
      },
    });

  } catch (error) {
    return apiError('GET /api/applications/dashboard', error, API_ERR_LOAD);
  }
}
