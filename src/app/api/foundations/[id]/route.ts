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
import { foundationAssessments, foundations, activityLog } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { foundationSchema } from '@/lib/schemas/foundation';
import { updateFoundationSchema } from '@/lib/schemas/foundation-api';
import {
  API_ERR_LOAD,
  API_ERR_VALIDATION,
  API_ERR_SAVE,
  API_ERR_NOT_FOUND,
} from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import {
  splitFoundationPatch,
  upsertAssessment,
  type AnalysisPatch,
} from '@/lib/db/assessment-write';
import { UNASSESSED_ANALYSIS } from '@/lib/db/foundation-compose';

/**
 * GET /api/foundations/[id]
 * Retrieve a single foundation by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
  const { id } = await params;
  try {
    // The registry row alone is only half the answer: fit, priority, themes and
    // research notes are this organisation's, and live in its assessment. A
    // response without them would report every foundation as unassessed.
    const result = await db
      .select({ foundation: foundations, assessment: foundationAssessments })
      .from(foundations)
      .leftJoin(
        foundationAssessments,
        and(
          eq(foundationAssessments.foundationId, foundations.id),
          eq(foundationAssessments.orgId, ORG_ID),
        ),
      )
      .where(eq(foundations.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const { foundation, assessment } = result[0];
    return NextResponse.json({
      success: true,
      data: {
        ...foundation,
        fitScore: assessment?.fitScore ?? null,
        priority: assessment?.priority ?? null,
        researchDepth: assessment?.researchDepth ?? null,
        researchDate: assessment?.researchDate ?? null,
      },
    });
  } catch (error) {
    return apiError('GET /api/foundations/${id}', error, API_ERR_LOAD);
  }
}

/**
 * PUT /api/foundations/[id]
 * Replace full config_data with a validated Foundation object.
 * Also syncs relevant flat columns for backward compatibility.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
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
        { status: 400 },
      );
    }

    // Check if foundation exists
    const existing = await db
      .select({ id: foundations.id })
      .from(foundations)
      .where(eq(foundations.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const data = validation.data;

    // A PUT sends one Foundation object, which spans both tables: the registry
    // facts belong to everybody, the analysis fields belong to this
    // organisation. Writing the whole object into config_data would leave the
    // analysis half where nothing reads it — a silent no-op, since the read
    // path takes those fields from the assessment row.
    const { registry, analysis } = splitFoundationPatch(data as unknown as Record<string, unknown>);

    await db
      .update(foundations)
      .set({
        configData: registry,
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(foundations.id, id));

    await upsertAssessment(ORG_ID, id, analysis);

    // Log activity
    await db.insert(activityLog).values({
      orgId: ORG_ID,
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
    const updated = await db.select().from(foundations).where(eq(foundations.id, id)).limit(1);

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    return apiError('PUT /api/foundations/${id}', error, API_ERR_SAVE);
  }
}

/**
 * PATCH /api/foundations/[id]
 * Update a foundation (partial updates)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
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
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Check if foundation exists
    const existing = await db.select().from(foundations).where(eq(foundations.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const data = validation.data;

    // The edit panel sends registry facts and analysis fields together — a
    // contact address and a research note in one action. That is one edit to
    // the person making it and two tables underneath, so it is split here
    // rather than asking the client to know the difference.
    //
    // This is the path that made the split urgent: `patchFoundationResearch`
    // sends `researchNotes` inside `configData`, and once the read takes that
    // field from the assessment row, merging it into the blob saves nothing
    // anybody will see. The request still succeeds — there is no error to
    // notice, only an edit that quietly fails to appear.
    const { registry: registryPatch, analysis: analysisPatch } = splitFoundationPatch(
      (data.configData ?? {}) as Record<string, unknown>,
    );

    const existingConfig = (existing[0].configData ?? {}) as Record<string, unknown>;
    const mergedConfig = { ...existingConfig, ...registryPatch };

    // fitScore / priority / researchDepth may also arrive as top-level fields
    // rather than inside configData. They are assessment values either way.
    //
    // The API schema lets all three be null, but fit_score and priority are NOT
    // NULL columns. Null there means "this organisation has no opinion", which
    // the read path already has a name for — so clearing a score returns the
    // foundation to exactly the unassessed state a tenant that never touched it
    // sees, rather than to a fallback invented at this call site.
    const topLevelAnalysis: AnalysisPatch = {
      ...(data.fitScore !== undefined && {
        fitScore: data.fitScore ?? UNASSESSED_ANALYSIS.fitScore,
      }),
      ...(data.priority !== undefined && {
        priority: data.priority ?? UNASSESSED_ANALYSIS.priority,
      }),
      ...(data.researchDepth !== undefined && { researchDepth: data.researchDepth }),
    };

    const analysis: AnalysisPatch = { ...analysisPatch, ...topLevelAnalysis };

    const updates: Record<string, unknown> = {
      configData: mergedConfig,
      ...(data.name !== undefined && { name: data.name }),
      updatedAt: new Date(),
    };

    // Update foundation
    await db.update(foundations).set(updates).where(eq(foundations.id, id));

    await upsertAssessment(ORG_ID, id, analysis);

    // Log activity
    await db.insert(activityLog).values({
      orgId: ORG_ID,
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
    const updated = await db.select().from(foundations).where(eq(foundations.id, id)).limit(1);

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    return apiError('PATCH /api/foundations/${id}', error, API_ERR_SAVE);
  }
}

/**
 * DELETE /api/foundations/[id]
 * Archive a foundation (soft delete)
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
    // Check if foundation exists
    const existing = await db.select().from(foundations).where(eq(foundations.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
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
      orgId: ORG_ID,
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
    return apiError('DELETE /api/foundations/${id}', error, API_ERR_SAVE);
  }
}
