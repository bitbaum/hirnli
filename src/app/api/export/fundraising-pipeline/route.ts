import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { arrayToCSV } from '@/lib/utils/csv';
import { MS_PER_DAY } from '@/lib/utils/time';
import { API_ERR_EXPORT } from '@/lib/utils/errors';

const filePrefix = ORG_PROFILE.name.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * GET /api/export/fundraising-pipeline
 *
 * CSV export for cross-project reporting (revamp-info ↔ kivitendo/revampit):
 * - Pipeline health (status, priority, deadlines)
 * - Requested vs awarded amounts
 * - Team ownership (assignedTo)
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        applicationId: applications.id,
        foundationId: applications.foundationId,
        foundationName: foundations.name,
        status: applications.status,
        priorityLevel: applications.priorityLevel,
        assignedTo: applications.assignedTo,
        requestedAmount: applications.requestedAmount,
        awardedAmount: applications.awardedAmount,
        submissionDate: applications.submissionDate,
        decisionExpected: applications.decisionExpected,
        decisionDate: applications.decisionDate,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id));

    const now = new Date();
    const dataRows: (string | number | null | undefined)[][] = rows.map((r) => {
      const daysToDecision = r.decisionExpected
        ? Math.ceil((new Date(r.decisionExpected).getTime() - now.getTime()) / MS_PER_DAY)
        : null;

      const requested = r.requestedAmount || 0;
      const awarded = r.awardedAmount || 0;
      const coveragePct = requested > 0 ? Math.round((awarded / requested) * 100) : null;

      return [
        r.applicationId,
        r.foundationId,
        r.foundationName || 'Unknown',
        r.status,
        r.priorityLevel,
        r.assignedTo,
        requested,
        awarded,
        coveragePct,
        r.submissionDate,
        r.decisionExpected,
        daysToDecision,
        r.decisionDate,
        r.createdAt?.toISOString() ?? null,
        r.updatedAt?.toISOString() ?? null,
      ];
    });

    const csv = arrayToCSV(
      [
        'application_id',
        'foundation_id',
        'foundation_name',
        'status',
        'priority_level',
        'assigned_to',
        'requested_amount_chf',
        'awarded_amount_chf',
        'award_coverage_percent',
        'submission_date',
        'decision_expected',
        'days_to_decision',
        'decision_date',
        'created_at',
        'updated_at',
      ],
      dataRows,
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filePrefix}-fundraising-pipeline.csv"`,
      },
    });
  } catch (error) {
    console.error('Fundraising pipeline export error:', error);
    return NextResponse.json({ success: false, error: API_ERR_EXPORT }, { status: 500 });
  }
}
