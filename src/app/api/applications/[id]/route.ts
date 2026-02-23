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

// Application status values
const APPLICATION_STATUSES = [
  'prospect',
  'research',
  'draft',
  'review',
  'submitted',
  'pending',
  'followup',
  'accepted',
  'rejected',
  'withdrawn',
  'onhold',
] as const;

// Validation schema for updates
const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),

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
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error) {
    console.error(`GET /api/applications/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    );
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
          error: 'Validation failed',
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
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const data = validation.data;
    const updates: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
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
    console.error(`PATCH /api/applications/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
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
        { success: false, error: 'Application not found' },
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
      timestamp: new Date().toISOString(),
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
    console.error(`DELETE /api/applications/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
