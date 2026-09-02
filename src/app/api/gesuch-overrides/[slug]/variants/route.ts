/**
 * GET /api/gesuch-overrides/[slug]/variants
 *
 * Returns which variant keys have overrides for this foundation.
 * Powers tab badges in the Gesuch UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { gesuchOverrides } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { API_ERR_DB } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

const ORG_ID = ORG_PROFILE.orgId;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const rows = await db
      .select({ variantKey: gesuchOverrides.variantKey })
      .from(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_ID)));

    const variants = rows.map((r) => r.variantKey);
    return NextResponse.json({ success: true, data: variants });
  } catch (err) {
    return apiError('GET gesuch-overrides variants', err, API_ERR_DB);
  }
}
