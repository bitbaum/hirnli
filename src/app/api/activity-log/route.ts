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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const entityId = searchParams.get('entityId');
  const entityType = searchParams.get('entityType');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  if (!entityId || !entityType) {
    return NextResponse.json(
      { success: false, error: API_ERR_VALIDATION },
      { status: 400 },
    );
  }

  try {
    const entries = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.entityId, entityId),
          eq(activityLog.entityType, entityType),
        ),
      )
      .orderBy(desc(activityLog.timestamp))
      .limit(limit);

    return NextResponse.json({ success: true, data: entries });
  } catch (err) {
    console.error('GET activity-log error:', err);
    return NextResponse.json({ success: false, error: API_ERR_DB }, { status: 500 });
  }
}
