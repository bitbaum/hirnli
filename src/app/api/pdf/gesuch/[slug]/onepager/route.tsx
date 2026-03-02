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
import { getFoundationBySlug, hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import GesuchOnePagerPDF from '@/lib/pdf/gesuch-onepager';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const foundation = getFoundationBySlug(slug);
    if (!foundation) {
      return NextResponse.json(
        { success: false, error: 'Stiftung nicht gefunden' },
        { status: 404 }
      );
    }

    if (!hasGesuchPage(foundation)) {
      return NextResponse.json(
        { success: false, error: 'Gesuch nicht verfügbar für diese Stiftung' },
        { status: 400 }
      );
    }

    const schwerpunktParam = request.nextUrl.searchParams.get('schwerpunkt');
    const schwerpunktId = schwerpunktParam && schwerpunktParam in SCHWERPUNKTE
      ? (schwerpunktParam as SchwerpunktId)
      : undefined;

    // Same data pipeline as full PDF
    const baseDok = composeGesuchDokument(foundation, schwerpunktId);
    const overrides = await loadGesuchOverrides(slug);
    const dok = applyGesuchOverrides(baseDok, overrides);

    if (!dok.ready) {
      return NextResponse.json(
        { success: false, error: dok.readyReason || 'Gesuch nicht bereit' },
        { status: 400 }
      );
    }

    const stream = await renderToStream(<GesuchOnePagerPDF dok={dok} />);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const safeName = foundation.name
      .replace(/[^a-zäöü0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const filename = `kurzuebersicht-${safeName}-${date}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('One-pager PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF-Generierung fehlgeschlagen',
      },
      { status: 500 }
    );
  }
}
