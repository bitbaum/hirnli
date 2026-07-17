/**
 * Pitch Deck PDF Generation API
 *
 * GET /api/documents/pitch-deck — Generate and download the pitch deck PDF
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 */

import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { PitchDeckPDF } from '@/lib/pdf/pitch-deck';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { API_ERR_PDF } from '@/lib/utils/errors';
import { streamToBuffer } from '@/lib/pdf/utils';
import { apiError } from '@/lib/api/route-helpers';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { isActionablePriority } from '@/lib/domain/foundation-helpers';

export async function GET() {
  try {
    const foundations = await getAllFoundations();
    const p1p3Count = foundations.filter(isActionablePriority).length;
    // react-hooks/error-boundaries assumes react-dom's async client rendering (errors
    // surface outside this try/catch); @react-pdf/renderer's renderToStream is different —
    // it rejects its returned promise on render failure, so the catch below does work.
    // eslint-disable-next-line react-hooks/error-boundaries
    const stream = await renderToStream(<PitchDeckPDF p1p3Count={p1p3Count} />);

    const buffer = await streamToBuffer(stream);

    const year = new Date().getFullYear();
    const filename = `pitch-deck-${year}-${ORG_PROFILE.name
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return apiError('Pitch deck generation', error, API_ERR_PDF);
  }
}
