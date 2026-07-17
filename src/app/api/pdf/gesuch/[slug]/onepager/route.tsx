/**
 * One-Pager PDF API Route
 *
 * GET /api/pdf/gesuch/[slug]/onepager
 *
 * Generates a 1-page concept note PDF for the given foundation.
 * Reuses the same data pipeline as the full gesuch PDF.
 *
 * Optional query param: ?schwerpunkt=<SchwerpunktId>
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { getFoundationBySlug } from '@/lib/db/foundations-repo';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { isSchwerpunktId } from '@/lib/config/schwerpunkte';
import GesuchOnePagerPDF from '@/lib/pdf/gesuch-onepager';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';
import { API_ERR_PDF, API_ERR_FOUNDATION_NOT_FOUND, API_ERR_GESUCH_UNAVAILABLE, API_ERR_GESUCH_NOT_READY } from '@/lib/utils/errors';
import { getTodayISO } from '@/lib/utils/format';
import { streamToBuffer, sanitizeFoundationFilename } from '@/lib/pdf/utils';
import { apiError } from '@/lib/api/route-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const foundation = await getFoundationBySlug(slug);
    if (!foundation) {
      return NextResponse.json(
        { success: false, error: API_ERR_FOUNDATION_NOT_FOUND },
        { status: 404 }
      );
    }

    if (!hasGesuchPage(foundation)) {
      return NextResponse.json(
        { success: false, error: API_ERR_GESUCH_UNAVAILABLE },
        { status: 400 }
      );
    }

    const schwerpunktParam = request.nextUrl.searchParams.get('schwerpunkt');
    const schwerpunktId = schwerpunktParam && isSchwerpunktId(schwerpunktParam)
      ? schwerpunktParam
      : undefined;

    const baseDok = composeGesuchDokument(foundation, schwerpunktId);
    const overrides = await loadGesuchOverrides(slug, schwerpunktId ?? 'auto');
    const dok = applyGesuchOverrides(baseDok, overrides);

    if (!dok.ready) {
      return NextResponse.json(
        { success: false, error: dok.readyReason || API_ERR_GESUCH_NOT_READY },
        { status: 400 }
      );
    }

    const stream = await renderToStream(<GesuchOnePagerPDF dok={dok} />);
    const buffer = await streamToBuffer(stream);
    const filename = `kurzuebersicht-${sanitizeFoundationFilename(foundation.name)}-${getTodayISO()}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    return apiError('One-pager PDF generation', error, API_ERR_PDF);
  }
}
