/**
 * Gesuch Dokument PDF API Route
 *
 * GET /api/pdf/gesuch/[slug] — Generate PDF from config data (no DB needed).
 *
 * Uses the same SSOT as the HTML dokument page:
 *   composeGesuchDokument(foundation) → GesuchDokumentPDF
 *
 * Optional query param: ?schwerpunkt=<SchwerpunktId>
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { getFoundationBySlug } from '@/lib/domain/foundation-helpers';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import GesuchDokumentPDF from '@/lib/pdf/gesuch-dokument';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate foundation exists
    const foundation = getFoundationBySlug(slug);
    if (!foundation) {
      return NextResponse.json(
        { success: false, error: 'Stiftung nicht gefunden' },
        { status: 404 }
      );
    }

    // Validate gesuch page is available
    if (!hasGesuchPage(foundation)) {
      return NextResponse.json(
        { success: false, error: 'Gesuch nicht verfügbar für diese Stiftung' },
        { status: 400 }
      );
    }

    // Optional schwerpunkt filter
    const schwerpunktParam = request.nextUrl.searchParams.get('schwerpunkt');
    const schwerpunktId = schwerpunktParam && schwerpunktParam in SCHWERPUNKTE
      ? (schwerpunktParam as SchwerpunktId)
      : undefined;

    // Compose document data (same SSOT as HTML page)
    const baseDok = composeGesuchDokument(foundation, schwerpunktId);
    const overrides = await loadGesuchOverrides(slug);
    const dok = applyGesuchOverrides(baseDok, overrides);

    if (!dok.ready) {
      return NextResponse.json(
        { success: false, error: dok.readyReason || 'Gesuch nicht bereit' },
        { status: 400 }
      );
    }

    // Render PDF
    const stream = await renderToStream(<GesuchDokumentPDF dok={dok} />);

    // Collect stream into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Sanitize filename
    const safeName = foundation.name
      .replace(/[^a-zäöü0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const filename = `gesuch-${safeName}-${date}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF-Generierung fehlgeschlagen',
      },
      { status: 500 }
    );
  }
}
