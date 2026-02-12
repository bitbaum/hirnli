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
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * GET /api/applications/dashboard
 * Calculate KPI statistics for fundraising dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all applications (we need them for various calculations)
    const allApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        requestedAmount: applications.requestedAmount,
        awardedAmount: applications.awardedAmount,
        priorityLevel: applications.priorityLevel,
        decisionExpected: applications.decisionExpected,
        foundationId: applications.foundationId,
      })
      .from(applications);

    // Calculate totals
    const totalRequested = allApplications.reduce(
      (sum, app) => sum + (app.requestedAmount || 0),
      0
    );

    const totalAwarded = allApplications.reduce(
      (sum, app) => sum + (app.awardedAmount || 0),
      0
    );

    // Count by status
    const statusCounts: Record<string, number> = {};
    allApplications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    // Extract specific counts
    const submitted = statusCounts.submitted || 0;
    const accepted = statusCounts.accepted || 0;
    const rejected = statusCounts.rejected || 0;
    const pending = statusCounts.pending || 0;

    // Calculate success rate
    const totalDecided = accepted + rejected;
    const successRate = totalDecided > 0 ? Math.round((accepted / totalDecided) * 100) : 0;

    // Count by priority
    const priorityCounts: Record<number, number> = {};
    allApplications.forEach(app => {
      if (app.priorityLevel) {
        priorityCounts[app.priorityLevel] = (priorityCounts[app.priorityLevel] || 0) + 1;
      }
    });

    // Upcoming deadlines (next 30 days)
    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
          sql`${applications.decisionExpected} <= ${in30Days}`,
          eq(applications.status, 'pending')
        )
      )
      .orderBy(applications.decisionExpected);

    // Build status distribution for chart
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // Build priority distribution
    const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: parseInt(priority),
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          totalRequested,
          totalAwarded,
          submitted,
          accepted,
          rejected,
          pending,
          successRate,
          totalApplications: allApplications.length,
        },
        byStatus,
        byPriority,
        upcomingDeadlines: upcomingDeadlines.map(item => ({
          id: item.application.id,
          foundationName: item.foundation?.name || 'Unknown',
          decisionExpected: item.application.decisionExpected,
          requestedAmount: item.application.requestedAmount,
          daysUntilDeadline: Math.ceil(
            (new Date(item.application.decisionExpected!).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          ),
        })),
      },
    });

  } catch (error) {
    console.error('GET /api/applications/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
