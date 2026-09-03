/**
 * Gesuch Overrides API
 *
 * GET    /api/gesuch-overrides/[slug]   — Get overrides for a foundation
 * PUT    /api/gesuch-overrides/[slug]   — Create or replace overrides (atomic upsert)
 * DELETE /api/gesuch-overrides/[slug]   — Remove all overrides (reset to generated)
 *
 * Note on merging: the client (useGesuchOverrides.updateField) deep-merges
 * patches locally and then calls PUT with the full payload, so no server-side
 * merge endpoint is needed — and avoiding one keeps the API race-free.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { gesuchOverrides, activityLog } from '@/lib/db/schema';
import { gesuchOverridesSchema, type GesuchOverridesData } from '@/lib/schemas/gesuch-overrides';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentOrgId } from '@/lib/tenant/resolve';
import { API_ERR_DB, API_ERR_VALIDATION, API_ERR_BAD_REQUEST } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

/** Extract variant key from query string (default: 'auto') */
function getVariant(request: NextRequest): string {
  return request.nextUrl.searchParams.get('variant') ?? 'auto';
}

/** Fire-and-forget activity log entry for override saves */
async function logOverrideSave(
  orgId: string,
  slug: string,
  variant: string,
  overrides: GesuchOverridesData,
) {
  try {
    await db.insert(activityLog).values({
      orgId,
      id: nanoid(),
      entityType: 'gesuch_override',
      entityId: `${slug}::${variant}`,
      actionType: 'override_saved',
      actionDetails: JSON.stringify({
        overrides,
        variant,
        timestamp: new Date().toISOString(),
      }),
      performedBy: 'api',
    });
  } catch {
    // Non-critical — don't fail the save if logging fails
  }
}

/**
 * GET /api/gesuch-overrides/[slug]
 * Returns { success, data: { overrides } } or { success, data: null } if none
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Scoped per request, never at module scope: a baked-in org id makes every
  // tenant read and write the FIRST tenant's rows. These are saved edits to
  // grant applications, so that is one customer editing another's Gesuch.
  const ORG_ID = await getCurrentOrgId();
  const { slug } = await params;
  const variant = getVariant(request);
  try {
    const rows = await db
      .select()
      .from(gesuchOverrides)
      .where(
        and(
          eq(gesuchOverrides.foundationId, slug),
          eq(gesuchOverrides.orgId, ORG_ID),
          eq(gesuchOverrides.variantKey, variant),
        ),
      )
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: { overrides: rows[0].overrides } });
  } catch (err) {
    return apiError('GET gesuch-overrides', err, API_ERR_DB);
  }
}

/**
 * PUT /api/gesuch-overrides/[slug]
 * Replace all overrides. Body: GesuchOverridesData
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Scoped per request, never at module scope: a baked-in org id makes every
  // tenant read and write the FIRST tenant's rows. These are saved edits to
  // grant applications, so that is one customer editing another's Gesuch.
  const ORG_ID = await getCurrentOrgId();
  const { slug } = await params;
  const variant = getVariant(request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: API_ERR_BAD_REQUEST }, { status: 400 });
  }

  const parsed = gesuchOverridesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: API_ERR_VALIDATION, details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    // Atomic upsert — eliminates the SELECT-then-INSERT-or-UPDATE race that two
    // concurrent saves could exploit to create duplicate rows. Targets the unique
    // constraint added in migration 0004.
    await db
      .insert(gesuchOverrides)
      .values({
        id: nanoid(),
        foundationId: slug,
        orgId: ORG_ID,
        variantKey: variant,
        overrides: parsed.data,
      })
      .onConflictDoUpdate({
        target: [gesuchOverrides.foundationId, gesuchOverrides.orgId, gesuchOverrides.variantKey],
        set: { overrides: parsed.data, updatedAt: new Date() },
      });

    logOverrideSave(ORG_ID, slug, variant, parsed.data);

    return NextResponse.json({ success: true, data: { overrides: parsed.data } });
  } catch (err) {
    return apiError('PUT gesuch-overrides', err, API_ERR_DB);
  }
}

/**
 * DELETE /api/gesuch-overrides/[slug]
 * Remove all overrides (resets gesuch to generated content)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Scoped per request, never at module scope: a baked-in org id makes every
  // tenant read and write the FIRST tenant's rows. These are saved edits to
  // grant applications, so that is one customer editing another's Gesuch.
  const ORG_ID = await getCurrentOrgId();
  const { slug } = await params;
  const variant = getVariant(request);
  try {
    await db
      .delete(gesuchOverrides)
      .where(
        and(
          eq(gesuchOverrides.foundationId, slug),
          eq(gesuchOverrides.orgId, ORG_ID),
          eq(gesuchOverrides.variantKey, variant),
        ),
      );

    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    return apiError('DELETE gesuch-overrides', err, API_ERR_DB);
  }
}
