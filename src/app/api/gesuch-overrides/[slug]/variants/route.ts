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
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import { API_ERR_DB } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Scoped per request, never at module scope: a baked-in org id makes every
  // tenant read and write the FIRST tenant's rows. These are saved edits to
  // grant applications, so that is one customer editing another's Gesuch.
  const ORG_ID = await getCurrentOrgId();
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
