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
import { eq } from 'drizzle-orm';
import { ORG_PROFILE } from '@/lib/config/org-profile';

const ORG_ID = ORG_PROFILE.orgId;

export async function GET() {
  try {
    // Get all overrides for this org
    const overrideRows = await db
      .select({
        foundationId: gesuchOverrides.foundationId,
        overrides: gesuchOverrides.overrides,
        updatedAt: gesuchOverrides.updatedAt,
      })
      .from(gesuchOverrides)
      .where(eq(gesuchOverrides.orgId, ORG_ID));

    // Enrich with foundation names and application status
    const results = await Promise.all(
      overrideRows.map(async (row) => {
        // Get foundation name
        const foundationRows = await db
          .select({ name: foundations.name })
          .from(foundations)
          .where(eq(foundations.id, row.foundationId))
          .limit(1);

        // Get active application
        const appRows = await db
          .select({
            id: applications.id,
            status: applications.status,
          })
          .from(applications)
          .where(eq(applications.foundationId, row.foundationId))
          .limit(1);

        const overridesObj = (row.overrides ?? {}) as Record<string, unknown>;
        const fieldCount = Object.keys(overridesObj).filter((k) => {
          const val = overridesObj[k];
          if (typeof val === 'string') return val.length > 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
          return false;
        }).length;

        return {
          foundationId: row.foundationId,
          foundationName: foundationRows[0]?.name ?? row.foundationId,
          overrideUpdatedAt: row.updatedAt,
          overrideFieldCount: fieldCount,
          applicationId: appRows[0]?.id ?? null,
          applicationStatus: appRows[0]?.status ?? null,
        };
      }),
    );

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error('GET gesuch-overrides (list) error:', err);
    return NextResponse.json({ success: false, error: 'Datenbankfehler' }, { status: 500 });
  }
}
