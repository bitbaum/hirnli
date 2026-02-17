import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
}

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
        ? Math.ceil((new Date(r.decisionExpected).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        r.createdAt,
        r.updatedAt,
      ];
    });

    const csv = toCsv(
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
        'Content-Disposition': 'attachment; filename="revampit-fundraising-pipeline.csv"',
      },
    });
  } catch (error) {
    console.error('Fundraising pipeline export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
