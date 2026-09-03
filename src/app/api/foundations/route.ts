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
import { toSlug } from '@/lib/utils/slug';
import { createFoundationSchema } from '@/lib/schemas/foundation-api';
import { getTodayISO } from '@/lib/utils/format';
import {
  API_ERR_LOAD,
  API_ERR_VALIDATION,
  API_ERR_SAVE,
  API_ERR_CONFLICT,
} from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { getCurrentOrgId } from '@/lib/tenant/resolve';

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
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(ilike(foundations.name, `%${search}%`));
    }

    if (fitMin) {
      const minScore = parseInt(fitMin, 10);
      // Clamp to the valid fitScore range so a value like -999 or 9999 can't
      // produce a query that's meaningless or that bypasses pagination logic.
      if (!isNaN(minScore))
        conditions.push(gte(foundations.fitScore, Math.min(10, Math.max(0, minScore))));
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
    return apiError('GET /api/foundations', error, API_ERR_LOAD);
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
          error: API_ERR_VALIDATION,
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const slug = toSlug(data.name);

    // Check if slug already exists
    const existing = await db.select().from(foundations).where(eq(foundations.id, slug)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: API_ERR_CONFLICT }, { status: 409 });
    }

    // Create foundation — only indexed flat columns + configData JSONB
    //
    // orgId comes from the request, never from a default. The column used to
    // carry `default('revamp-it')`, which meant this handler could omit it and
    // still produce an attributed row; migration 0011 dropped that default, so
    // omitting it now writes a row belonging to nobody — invisible to every
    // tenant and unable to hold an assessment, since
    // fundraising_foundation_assessments requires a real org.
    const newFoundation = {
      id: slug,
      name: data.name,
      orgId: await getCurrentOrgId(),
      fitScore: data.fitScore ?? null,
      priority: data.priority ?? null,
      researchDepth: data.researchDepth ?? 'rapid',
      researchDate: getTodayISO(),
      source: data.source ?? null,
      configData: data.configData ?? { slug, name: data.name },
      archived: false,
    };

    await db.insert(foundations).values(newFoundation);

    return NextResponse.json({ success: true, data: newFoundation }, { status: 201 });
  } catch (error) {
    return apiError('POST /api/foundations', error, API_ERR_SAVE);
  }
}
