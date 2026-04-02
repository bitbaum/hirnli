/**
 * Foundations API - CRUD Operations
 *
 * GET    /api/foundations       — List with filters (search, fitMin, priority, archived)
 * POST   /api/foundations       — Create new foundation
 *
 * Query Parameters:
 * - q: string           — Search by name
 * - fitMin: number      — Filter by minimum fit score
 * - priority: number    — Filter by priority (1-4)
 * - archived: boolean   — Include archived foundations
 * - includeAll: boolean — Include unverified bulk imports (default: false)
 * - limit: number       — Results per page (default: 50)
 * - offset: number      — Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations } from '@/lib/db/schema';
import { and, count, desc, eq, gte, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { toSlug } from '@/lib/utils/slug';

// Validation schema for creating foundations
const createFoundationSchema = z.object({
  name: z.string().min(1),
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
  source: z.string().optional().nullable(),
});

/**
 * GET /api/foundations
 * List foundations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('q');
    const fitMin = searchParams.get('fitMin');
    const priority = searchParams.get('priority');
    const includeArchived = searchParams.get('archived') === 'true';
    const includeAll = searchParams.get('includeAll') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10) || 0;

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(ilike(foundations.name, `%${search}%`));
    }

    if (fitMin) {
      const minScore = parseInt(fitMin, 10);
      if (!isNaN(minScore)) conditions.push(gte(foundations.fitScore, minScore));
    }

    if (priority) {
      const p = parseInt(priority, 10);
      if (!isNaN(p)) conditions.push(eq(foundations.priority, p));
    }

    if (!includeArchived) {
      conditions.push(eq(foundations.archived, false));
    }

    if (!includeAll) {
      conditions.push(sql`(data_confidence IS NULL OR data_confidence != 'unverified')`);
    }

    // Execute query
    const results = await db
      .select()
      .from(foundations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(foundations.fitScore), foundations.name)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination (COUNT query, not full row fetch)
    const [{ total }] = await db
      .select({ total: count() })
      .from(foundations)
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
    console.error('GET /api/foundations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch foundations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/foundations
 * Create a new foundation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createFoundationSchema.safeParse(body);
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

    const data = validation.data;

    const slug = toSlug(data.name);

    // Check if slug already exists
    const existing = await db
      .select()
      .from(foundations)
      .where(eq(foundations.id, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Foundation with this name already exists' },
        { status: 409 }
      );
    }

    // Create foundation — omit createdAt/updatedAt (DB defaultNow())
    // focusAreas is now jsonb string[] — pass array directly
    const newFoundation = {
      id: slug,
      ...data,
      researchDate: new Date().toISOString().split('T')[0],
      archived: false,
    };

    await db.insert(foundations).values(newFoundation);

    return NextResponse.json(
      { success: true, data: newFoundation },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/foundations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create foundation' },
      { status: 500 }
    );
  }
}
