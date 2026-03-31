/**
 * Gesuch Overrides API
 *
 * GET    /api/gesuch-overrides/[slug]   — Get overrides for a foundation
 * PUT    /api/gesuch-overrides/[slug]   — Create or replace overrides (upsert)
 * PATCH  /api/gesuch-overrides/[slug]   — Merge partial overrides
 * DELETE /api/gesuch-overrides/[slug]   — Remove all overrides (reset to generated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { gesuchOverrides, activityLog } from '@/lib/db/schema';
import { gesuchOverridesSchema, type GesuchOverridesData } from '@/lib/schemas/gesuch-overrides';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { ORG_PROFILE } from '@/lib/config/org-profile';

const ORG_ID = ORG_PROFILE.orgId;

/** Fire-and-forget activity log entry for override saves */
async function logOverrideSave(slug: string, overrides: GesuchOverridesData) {
  try {
    await db.insert(activityLog).values({
      id: nanoid(),
      entityType: 'gesuch_override',
      entityId: slug,
      actionType: 'override_saved',
      actionDetails: JSON.stringify({
        overrides,
        timestamp: new Date().toISOString(),
      }),
      performedBy: 'api',
    });
  } catch {
    // Non-critical — don't fail the save if logging fails
  }
}

function deepMerge(base: GesuchOverridesData, patch: GesuchOverridesData): GesuchOverridesData {
  const result: GesuchOverridesData = { ...base };
  if (patch.foundationBridge !== undefined) result.foundationBridge = patch.foundationBridge;
  if (patch.why) result.why = { ...base.why, ...patch.why };
  if (patch.how) {
    result.how = {
      ...base.how,
      trackRecord:
        patch.how.trackRecord !== undefined
          ? { ...(base.how?.trackRecord ?? {}), ...patch.how.trackRecord }
          : base.how?.trackRecord,
    };
  }
  if (patch.anschreiben) result.anschreiben = { ...base.anschreiben, ...patch.anschreiben };
  return result;
}

/**
 * GET /api/gesuch-overrides/[slug]
 * Returns { success, data: { overrides } } or { success, data: null } if none
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const rows = await db
      .select()
      .from(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_ID)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: { overrides: rows[0].overrides } });
  } catch (err) {
    console.error('GET gesuch-overrides error:', err);
    return NextResponse.json({ success: false, error: 'Datenbankfehler' }, { status: 500 });
  }
}

/**
 * PUT /api/gesuch-overrides/[slug]
 * Replace all overrides. Body: GesuchOverridesData
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const parsed = gesuchOverridesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const existing = await db
      .select({ id: gesuchOverrides.id })
      .from(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_ID)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(gesuchOverrides)
        .set({ overrides: parsed.data, updatedAt: new Date() })
        .where(eq(gesuchOverrides.id, existing[0].id));
    } else {
      await db.insert(gesuchOverrides).values({
        id: nanoid(),
        foundationId: slug,
        orgId: ORG_ID,
        overrides: parsed.data,
      });
    }

    // Log save activity (fire-and-forget)
    logOverrideSave(slug, parsed.data);

    return NextResponse.json({ success: true, data: { overrides: parsed.data } });
  } catch (err) {
    console.error('PUT gesuch-overrides error:', err);
    return NextResponse.json({ success: false, error: 'Datenbankfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/gesuch-overrides/[slug]
 * Deep-merge partial overrides into existing. Body: Partial<GesuchOverridesData>
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const parsed = gesuchOverridesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const existing = await db
      .select()
      .from(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_ID)))
      .limit(1);

    const existingParsed = gesuchOverridesSchema.safeParse(existing[0]?.overrides ?? {});
    const currentOverrides: GesuchOverridesData = existingParsed.success ? existingParsed.data : {};
    const merged = deepMerge(currentOverrides, parsed.data);

    if (existing.length > 0) {
      await db
        .update(gesuchOverrides)
        .set({ overrides: merged, updatedAt: new Date() })
        .where(eq(gesuchOverrides.id, existing[0].id));
    } else {
      await db.insert(gesuchOverrides).values({
        id: nanoid(),
        foundationId: slug,
        orgId: ORG_ID,
        overrides: merged,
      });
    }

    // Log save activity (fire-and-forget)
    logOverrideSave(slug, merged);

    return NextResponse.json({ success: true, data: { overrides: merged } });
  } catch (err) {
    console.error('PATCH gesuch-overrides error:', err);
    return NextResponse.json({ success: false, error: 'Datenbankfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/gesuch-overrides/[slug]
 * Remove all overrides (resets gesuch to generated content)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await db
      .delete(gesuchOverrides)
      .where(and(eq(gesuchOverrides.foundationId, slug), eq(gesuchOverrides.orgId, ORG_ID)));

    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    console.error('DELETE gesuch-overrides error:', err);
    return NextResponse.json({ success: false, error: 'Datenbankfehler' }, { status: 500 });
  }
}
