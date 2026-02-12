/**
 * Foundation Detail API
 *
 * GET    /api/foundations/[id]  — Get single foundation by ID
 * PATCH  /api/foundations/[id]  — Update foundation
 * DELETE /api/foundations/[id]  — Archive foundation (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Validation schema for updates
const updateFoundationSchema = z.object({
  name: z.string().min(1).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),

  fitScore: z.number().min(0).max(10).optional().nullable(),
  priority: z.number().min(1).max(4).optional().nullable(),
  focusAreas: z.array(z.string()).optional(),
  geographicScope: z.string().optional().nullable(),
  organizationType: z.string().optional().nullable(),

  grantRangeMin: z.number().optional().nullable(),
  grantRangeMax: z.number().optional().nullable(),
  typicalAmount: z.number().optional().nullable(),
  fundingModel: z.string().optional().nullable(),
  applicationMethod: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  decisionTimeline: z.string().optional().nullable(),

  strategicFit: z.string().optional().nullable(),
  applicationNotes: z.string().optional().nullable(),

  researchDepth: z.enum(['rapid', 'standard', 'deep']).optional().nullable(),
  dataQuality: z.number().min(1).max(5).optional().nullable(),
});

/**
 * GET /api/foundations/[id]
 * Retrieve a single foundation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Foundation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error) {
    console.error(`GET /api/foundations/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch foundation' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/foundations/[id]
 * Update a foundation (partial updates)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateFoundationSchema.safeParse(body);
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

    // Check if foundation exists
    const existing = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Foundation not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const data = validation.data;
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Handle focusAreas array → JSON string
    if (data.focusAreas) {
      updates.focusAreas = JSON.stringify(data.focusAreas);
    }

    // Update foundation
    await db
      .update(foundations)
      .set(updates)
      .where(eq(foundations.id, id));

    // Log activity
    await db.insert(activityLog).values({
      id: nanoid(),
      entityType: 'foundation',
      entityId: id,
      actionType: 'updated',
      actionDetails: JSON.stringify({
        fields: Object.keys(data),
        timestamp: new Date().toISOString(),
      }),
      performedBy: 'api',
      timestamp: new Date().toISOString(),
    });

    // Fetch updated foundation
    const updated = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: updated[0],
    });

  } catch (error) {
    console.error(`PATCH /api/foundations/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update foundation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/foundations/[id]
 * Archive a foundation (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if foundation exists
    const existing = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Foundation not found' },
        { status: 404 }
      );
    }

    // Soft delete (archive)
    await db
      .update(foundations)
      .set({
        archived: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(foundations.id, id));

    // Log activity
    await db.insert(activityLog).values({
      id: nanoid(),
      entityType: 'foundation',
      entityId: id,
      actionType: 'archived',
      actionDetails: JSON.stringify({
        timestamp: new Date().toISOString(),
      }),
      performedBy: 'api',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Foundation archived successfully',
    });

  } catch (error) {
    console.error(`DELETE /api/foundations/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive foundation' },
      { status: 500 }
    );
  }
}
