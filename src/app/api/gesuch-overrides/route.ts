/**
 * Gesuch Overrides List API
 *
 * GET /api/gesuch-overrides (no slug = list all overrides for this org)
 *
 * Returns overrides joined with applications and foundation names.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { gesuchOverrides, applications, foundations } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { API_ERR_DB } from '@/lib/utils/errors';

const ORG_ID = ORG_PROFILE.orgId;

export async function GET() {
  try {
    // 1. Fetch all overrides for this org (1 query)
    const overrideRows = await db
      .select({
        foundationId: gesuchOverrides.foundationId,
        overrides: gesuchOverrides.overrides,
        updatedAt: gesuchOverrides.updatedAt,
      })
      .from(gesuchOverrides)
      .where(eq(gesuchOverrides.orgId, ORG_ID));

    if (overrideRows.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const foundationIds = overrideRows.map((r) => r.foundationId);

    // 2. Fetch all relevant foundation names in one query
    const foundationRows = await db
      .select({ id: foundations.id, name: foundations.name })
      .from(foundations)
      .where(inArray(foundations.id, foundationIds));

    // 3. Fetch most-recent application per foundation in one query
    const appRows = await db
      .select({
        foundationId: applications.foundationId,
        id: applications.id,
        status: applications.status,
      })
      .from(applications)
      .where(inArray(applications.foundationId, foundationIds));

    // Build lookup maps for O(1) access
    const foundationNameById = new Map(foundationRows.map((f) => [f.id, f.name]));
    // Keep only the first application per foundation (preserves original .limit(1) behaviour)
    const appByFoundationId = new Map<string, { id: string; status: ApplicationStatusId }>();
    for (const app of appRows) {
      if (!appByFoundationId.has(app.foundationId)) {
        appByFoundationId.set(app.foundationId, { id: app.id, status: app.status });
      }
    }

    // 4. Assemble results in memory
    const results = overrideRows.map((row) => {
      const overridesObj = (row.overrides ?? {}) as Record<string, unknown>;
      const fieldCount = Object.keys(overridesObj).filter((k) => {
        const val = overridesObj[k];
        if (typeof val === 'string') return val.length > 0;
        if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
        return false;
      }).length;

      const app = appByFoundationId.get(row.foundationId);
      return {
        foundationId: row.foundationId,
        foundationName: foundationNameById.get(row.foundationId) ?? row.foundationId,
        overrideUpdatedAt: row.updatedAt,
        overrideFieldCount: fieldCount,
        applicationId: app?.id ?? null,
        applicationStatus: app?.status ?? null,
      };
    });

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error('GET gesuch-overrides (list) error:', err);
    return NextResponse.json({ success: false, error: API_ERR_DB }, { status: 500 });
  }
}
