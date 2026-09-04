/**
 * Application Detail API
 *
 * GET    /api/applications/[id]          — Get single application by ID
 * PATCH  /api/applications/[id]          — Update application
 * DELETE /api/applications/[id]          — Delete application
 * PATCH  /api/applications/[id]/status   — Update status (separate endpoint for drag-drop)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundationAssessments, foundations, activityLog } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { STATUS_IDS, getStatusConfig } from '@/lib/config/application-statuses';
import {
  API_ERR_NOT_FOUND,
  API_ERR_LOAD,
  API_ERR_VALIDATION,
  API_ERR_SAVE,
  API_ERR_DELETE,
} from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import { composeFoundation, type AssessmentValues } from '@/lib/db/foundation-compose';
import type { FoundationAssessmentRow } from '@/lib/db/schema';

/**
 * The rich Foundation shape for the joined row, as this organisation sees it.
 *
 * This used to be `foundationSchema.safeParse(row.configData)`. That stopped
 * working the moment the write paths began keeping analysis out of the blob:
 * the schema requires priority, themes, tagline and researchDate, which now
 * live in the assessment row, so the parse failed and returned null for any
 * foundation anybody had edited. The application detail page then rendered an
 * empty foundation panel — no error, just missing content.
 *
 * Composing from both halves is what every other reader does, and is the only
 * version that stays correct as fields move.
 */
function toFoundationDetail(
  row: { configData: unknown } | null,
  assessment: FoundationAssessmentRow | null,
) {
  if (!row) return null;
  return composeFoundation(row.configData, assessment as AssessmentValues | null) ?? null;
}

// Validation schema for updates
const updateApplicationSchema = z.object({
  status: z.enum(STATUS_IDS).optional(),

  requestedAmount: z.number().positive().optional().nullable(),
  projectFocus: z.string().optional().nullable(),
  customizationNotes: z.string().optional().nullable(),

  contactDate: z.string().optional().nullable(),
  submissionDate: z.string().optional().nullable(),
  decisionExpected: z.string().optional().nullable(),
  decisionDate: z.string().optional().nullable(),

  awardedAmount: z.number().positive().optional().nullable(),
  fundingPeriod: z.string().optional().nullable(),
  successFactors: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),

  gesuchVersion: z.string().optional().nullable(),
  documentsSent: z.array(z.string()).optional(),

  assignedTo: z.string().optional().nullable(),
  priorityLevel: z.number().min(1).max(4).optional().nullable(),
});

/**
 * GET /api/applications/[id]
 * Retrieve a single application by ID (with foundation details)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
  const { id } = await params;
  try {
    const result = await db
      .select({
        application: applications,
        foundation: foundations,
        assessment: foundationAssessments,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .leftJoin(
        foundationAssessments,
        and(
          eq(foundationAssessments.foundationId, foundations.id),
          eq(foundationAssessments.orgId, ORG_ID),
        ),
      )
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const { application, foundation, assessment } = result[0];
    return NextResponse.json({
      success: true,
      data: {
        application,
        // Fit and priority describe this organisation's view of the
        // foundation, so they are folded onto the row the client already
        // expects to carry them.
        foundation: foundation && {
          ...foundation,
          fitScore: assessment?.fitScore ?? null,
          priority: assessment?.priority ?? null,
        },
        foundationDetail: toFoundationDetail(foundation, assessment),
      },
    });
  } catch (error) {
    return apiError(`GET /api/applications/${id}`, error, API_ERR_LOAD);
  }
}

/**
 * PATCH /api/applications/[id]
 * Update an application (partial updates)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
  const { id } = await params;
  try {
    const body = await request.json();

    // Validate input
    const validation = updateApplicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: API_ERR_VALIDATION,
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Check the application exists AND belongs to the caller.
    //
    // An id-only lookup made every application in the database editable by
    // every tenant: the id is the only thing the URL carries, and nothing
    // downstream re-checked ownership. A row belonging to somebody else must
    // answer 404, the same as one that does not exist — anything more specific
    // confirms its existence to a stranger.
    const existing = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const data = validation.data;

    // Check required fields for status transitions
    if (data.status) {
      const targetStatus = getStatusConfig(data.status);
      if (targetStatus && targetStatus.requiredFields.length > 0) {
        const missingFields = targetStatus.requiredFields.filter((rf) => {
          const val = data[rf.field as keyof typeof data];
          return val === undefined || val === null || val === '';
        });
        if (missingFields.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: API_ERR_VALIDATION,
              missingFields: missingFields.map((f) => ({
                field: f.field,
                label: f.label,
                type: f.type,
              })),
            },
            { status: 422 },
          );
        }
      }
    }

    // Prepare update data
    const updates: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    // Handle documentsSent array → JSON string
    if (data.documentsSent) {
      updates.documentsSent = JSON.stringify(data.documentsSent);
    }

    // Update application
    // Scoped as well as the check above: the check and the write must agree
    // about which rows they may touch, or a change between them decides it.
    await db
      .update(applications)
      .set(updates)
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)));

    // Log activity (especially status changes)
    const actionType = data.status ? 'status_changed' : 'updated';
    await db.insert(activityLog).values({
      orgId: ORG_ID,
      id: nanoid(),
      entityType: 'application',
      entityId: id,
      actionType,
      actionDetails: JSON.stringify({
        changes: data,
        oldStatus: existing[0].status,
        newStatus: data.status || existing[0].status,
        timestamp: new Date().toISOString(),
      }),
      performedBy: data.assignedTo || 'api',
    });

    // Fetch updated application
    const updated = await db
      .select({
        application: applications,
        foundation: foundations,
        assessment: foundationAssessments,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .leftJoin(
        foundationAssessments,
        and(
          eq(foundationAssessments.foundationId, foundations.id),
          eq(foundationAssessments.orgId, ORG_ID),
        ),
      )
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)))
      .limit(1);

    const { application: updatedApp, foundation, assessment } = updated[0];
    return NextResponse.json({
      success: true,
      data: {
        application: updatedApp,
        foundation: foundation && {
          ...foundation,
          fitScore: assessment?.fitScore ?? null,
          priority: assessment?.priority ?? null,
        },
        foundationDetail: toFoundationDetail(foundation, assessment),
      },
    });
  } catch (error) {
    return apiError(`PATCH /api/applications/${id}`, error, API_ERR_SAVE);
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (hard delete - use with caution)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
  const { id } = await params;
  try {
    // Scoped, so a tenant can only delete its own. This is a hard delete with
    // no recovery path, and it was reachable for any application in the
    // database by anyone who knew an id.
    const existing = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    // Log deletion before removing
    await db.insert(activityLog).values({
      orgId: ORG_ID,
      id: nanoid(),
      entityType: 'application',
      entityId: id,
      actionType: 'deleted',
      actionDetails: JSON.stringify({
        foundationId: existing[0].foundationId,
        status: existing[0].status,
        timestamp: new Date().toISOString(),
      }),
      performedBy: 'api',
    });

    // Hard delete
    await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.orgId, ORG_ID)));

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    return apiError(`DELETE /api/applications/${id}`, error, API_ERR_DELETE);
  }
}
