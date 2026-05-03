/**
 * Foundation Detail API
 *
 * GET    /api/foundations/[id]  — Get single foundation by ID
 * PUT    /api/foundations/[id]  — Replace full config_data (Zod Foundation object)
 * PATCH  /api/foundations/[id]  — Update flat DB columns (partial)
 * DELETE /api/foundations/[id]  — Archive foundation (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { foundationSchema } from '@/lib/schemas/foundation';
import { updateFoundationSchema } from '@/lib/schemas/foundation-api';
import { API_ERR_LOAD, API_ERR_VALIDATION, API_ERR_SAVE, API_ERR_NOT_FOUND } from '@/lib/utils/errors';

/**
 * GET /api/foundations/[id]
 * Retrieve a single foundation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const result = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
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
    console.error(`GET /api/foundations/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: API_ERR_LOAD },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/foundations/[id]
 * Replace full config_data with a validated Foundation object.
 * Also syncs relevant flat columns for backward compatibility.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Validate against full Zod Foundation schema
    const validation = foundationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: API_ERR_VALIDATION,
          details: validation.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    // Check if foundation exists
    const existing = await db
      .select({ id: foundations.id })
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    const data = validation.data;

    // Update config_data (SSOT) + indexed flat columns only
    await db
      .update(foundations)
      .set({
        configData: data,
        name: data.name,
        fitScore: data.fitScore,
        priority: data.priority,
        updatedAt: new Date(),
      })
      .where(eq(foundations.id, id));

    // Log activity
    await db.insert(activityLog).values({
      id: nanoid(),
      entityType: 'foundation',
      entityId: id,
      actionType: 'updated',
      actionDetails: JSON.stringify({
        source: 'api-put',
        fields: Object.keys(data),
      }),
      performedBy: 'api',
    });

    // Fetch updated row
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
    console.error(`PUT /api/foundations/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: API_ERR_SAVE },
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
  const { id } = await params;
  try {
    const body = await request.json();

    // Validate input
    const validation = updateFoundationSchema.safeParse(body);
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

    // Check if foundation exists
    const existing = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    // Merge config_data patch into existing (SSOT for all foundation data)
    const data = validation.data;
    const existingConfig = (existing[0].configData ?? {}) as Record<string, unknown>;
    const mergedConfig = data.configData
      ? { ...existingConfig, ...data.configData }
      : existingConfig;

    // Sync indexed flat columns from merged config if present
    const updates: Record<string, unknown> = {
      configData: mergedConfig,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.fitScore !== undefined && { fitScore: data.fitScore }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.researchDepth !== undefined && { researchDepth: data.researchDepth }),
      updatedAt: new Date(),
    };

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
    console.error(`PATCH /api/foundations/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: API_ERR_SAVE },
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
  const { id } = await params;
  try {

    // Check if foundation exists
    const existing = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    // Soft delete (archive)
    await db
      .update(foundations)
      .set({
        archived: true,
        updatedAt: new Date(),
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
    });

    return NextResponse.json({
      success: true,
      message: 'Foundation archived successfully',
    });

  } catch (error) {
    console.error(`DELETE /api/foundations/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: API_ERR_SAVE },
      { status: 500 }
    );
  }
}
