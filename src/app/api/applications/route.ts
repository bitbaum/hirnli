/**
 * Applications API - CRUD Operations
 *
 * GET    /api/applications       — List with filters (status, foundationId, assigned)
 * POST   /api/applications       — Create new application
 *
 * Query Parameters:
 * - status: string         — Filter by status
 * - foundationId: string   — Filter by foundation
 * - assignedTo: string     — Filter by assigned person
 * - priority: number       — Filter by priority (1-4)
 * - limit: number          — Results per page (default: 50)
 * - offset: number         — Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { applications, foundations, activityLog } from '@/lib/db/schema';
import { and, count, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { STATUS_IDS } from '@/lib/config/application-statuses';
import { API_ERR_LOAD, API_ERR_VALIDATION, API_ERR_SAVE, API_ERR_NOT_FOUND } from '@/lib/utils/errors';

// Validation schema for creating applications
const createApplicationSchema = z.object({
  foundationId: z.string().min(1),
  status: z.enum(STATUS_IDS).default('prospect'),

  requestedAmount: z.number().positive().optional().nullable(),
  projectFocus: z.string().optional().nullable(),
  customizationNotes: z.string().optional().nullable(),

  contactDate: z.string().optional().nullable(),
  submissionDate: z.string().optional().nullable(),
  decisionExpected: z.string().optional().nullable(),

  assignedTo: z.string().optional().nullable(),
  priorityLevel: z.number().min(1).max(4).optional().nullable(),
});

/**
 * GET /api/applications
 * List applications with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status');
    const foundationId = searchParams.get('foundationId');
    const assignedTo = searchParams.get('assignedTo');
    const priority = searchParams.get('priority');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10) || 0;

    // Build filter conditions
    const conditions = [];

    const statusFilter = z.enum(STATUS_IDS).safeParse(status);
    if (statusFilter.success) {
      conditions.push(eq(applications.status, statusFilter.data));
    }

    if (foundationId) {
      conditions.push(eq(applications.foundationId, foundationId));
    }

    if (assignedTo) {
      conditions.push(eq(applications.assignedTo, assignedTo));
    }

    if (priority) {
      const p = parseInt(priority, 10);
      if (!isNaN(p)) conditions.push(eq(applications.priorityLevel, p));
    }

    // Execute query with foundation join
    const results = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(applications.priorityLevel), desc(applications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination (COUNT query, not full row fetch)
    const [{ total }] = await db
      .select({ total: count() })
      .from(applications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json(
      { success: false, error: API_ERR_LOAD },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Create a new application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createApplicationSchema.safeParse(body);
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

    const data = validation.data;

    // Verify foundation exists
    const foundation = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, data.foundationId))
      .limit(1);

    if (foundation.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_NOT_FOUND },
        { status: 404 }
      );
    }

    // Create application — omit createdAt/updatedAt (DB defaultNow())
    const newApplication = {
      id: nanoid(),
      ...data,
    };

    await db.insert(applications).values(newApplication);

    // Log activity
    await db.insert(activityLog).values({
      id: nanoid(),
      entityType: 'application',
      entityId: newApplication.id,
      actionType: 'created',
      actionDetails: JSON.stringify({
        foundationName: foundation[0].name,
        status: data.status,
        timestamp: new Date().toISOString(),
      }),
      performedBy: data.assignedTo || 'system',
    });

    return NextResponse.json(
      { success: true, data: newApplication },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json(
      { success: false, error: API_ERR_SAVE },
      { status: 500 }
    );
  }
}
