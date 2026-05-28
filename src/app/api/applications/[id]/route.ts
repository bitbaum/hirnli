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
import { applications, foundations, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { STATUS_IDS, getStatusConfig } from '@/lib/config/application-statuses';
import { API_ERR_NOT_FOUND, API_ERR_LOAD, API_ERR_VALIDATION, API_ERR_SAVE, API_ERR_DELETE } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const result = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error) {
    return apiError(`GET /api/applications/${id}`, error, API_ERR_LOAD);
  }
}

/**
 * PATCH /api/applications/[id]
 * Update an application (partial updates)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }

    // Check if application exists
    const existing = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    const data = validation.data;

    // Check required fields for status transitions
    if (data.status) {
      const targetStatus = getStatusConfig(data.status);
      if (targetStatus && targetStatus.requiredFields.length > 0) {
        const missingFields = targetStatus.requiredFields.filter(rf => {
          const val = data[rf.field as keyof typeof data];
          return val === undefined || val === null || val === '';
        });
        if (missingFields.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: API_ERR_VALIDATION,
              missingFields: missingFields.map(f => ({
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
    await db
      .update(applications)
      .set(updates)
      .where(eq(applications.id, id));

    // Log activity (especially status changes)
    const actionType = data.status ? 'status_changed' : 'updated';
    await db.insert(activityLog).values({
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
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(eq(applications.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: updated[0],
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    // Check if application exists
    const existing = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    // Log deletion before removing
    await db.insert(activityLog).values({
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
      .where(eq(applications.id, id));

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });

  } catch (error) {
    return apiError(`DELETE /api/applications/${id}`, error, API_ERR_DELETE);
  }
}
