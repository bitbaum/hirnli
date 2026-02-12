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
 * - limit: number       — Results per page (default: 50)
 * - offset: number      — Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations } from '@/lib/db/schema';
import { and, desc, eq, gte, like, or, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(like(foundations.name, `%${search}%`));
    }

    if (fitMin) {
      const minScore = parseInt(fitMin);
      conditions.push(gte(foundations.fitScore, minScore));
    }

    if (priority) {
      conditions.push(eq(foundations.priority, parseInt(priority)));
    }

    if (!includeArchived) {
      conditions.push(eq(foundations.archived, false));
    }

    // Execute query
    const results = await db
      .select()
      .from(foundations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(foundations.fitScore), foundations.name)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResults = await db
      .select()
      .from(foundations)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: totalResults.length,
        limit,
        offset,
        hasMore: offset + limit < totalResults.length,
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

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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

    // Create foundation
    const newFoundation = {
      id: slug,
      ...data,
      focusAreas: data.focusAreas ? JSON.stringify(data.focusAreas) : null,
      researchDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
