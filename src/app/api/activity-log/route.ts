/**
 * Activity Log API
 *
 * GET /api/activity-log?entityId=X&entityType=Y&limit=20
 *
 * Returns activity log entries for a given entity, ordered by timestamp desc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { activityLog } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { API_ERR_VALIDATION, API_ERR_DB } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { getCurrentOrgId } from '@/lib/tenant/resolve';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const entityId = searchParams.get('entityId');
  const entityType = searchParams.get('entityType');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  if (!entityId || !entityType) {
    return NextResponse.json({ success: false, error: API_ERR_VALIDATION }, { status: 400 });
  }

  try {
    // Entity ids are opaque but guessable, and the log records who changed
    // what and when. Without the org predicate this endpoint answers that
    // question about any tenant's application to any caller.
    const entries = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.orgId, await getCurrentOrgId()),
          eq(activityLog.entityId, entityId),
          eq(activityLog.entityType, entityType),
        ),
      )
      .orderBy(desc(activityLog.timestamp))
      .limit(limit);

    return NextResponse.json({ success: true, data: entries });
  } catch (err) {
    return apiError('GET activity-log', err, API_ERR_DB);
  }
}
