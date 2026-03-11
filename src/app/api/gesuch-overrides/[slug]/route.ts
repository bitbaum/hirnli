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
import { gesuchOverrides, type GesuchOverridesData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { ORG_PROFILE } from '@/lib/config/org-profile';

const ORG_ID = ORG_PROFILE.orgId;

const overridesSchema = z.object({
  foundationBridge: z.string().optional(),
  why: z
    .object({
      headline: z.string().optional(),
      hook: z.string().optional(),
      problem: z.string().optional(),
      solution: z.string().optional(),
    })
    .optional(),
  how: z
    .object({
      trackRecord: z
        .object({
          headline: z.string().optional(),
          text: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  anschreiben: z
    .object({
      subject: z.string().optional(),
      opening: z.string().optional(),
      themeAlignment: z.string().optional(),
      closing: z.string().optional(),
    })
    .optional(),
});

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

  const parsed = overridesSchema.safeParse(body);
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

  const parsed = overridesSchema.safeParse(body);
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

    const currentOverrides = (existing[0]?.overrides ?? {}) as GesuchOverridesData;
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
