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
import { getTenant } from '@/lib/tenant/resolve';
import { canBuildDocument, notAuthoredMessage } from '@/lib/pdf/authored';
import { toSlug } from '@/lib/utils/slug';
import { API_ERR_PDF } from '@/lib/utils/errors';
import { streamToBuffer } from '@/lib/pdf/utils';
import { apiError } from '@/lib/api/route-helpers';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { isActionablePriority } from '@/lib/domain/foundation-helpers';

export async function GET() {
  try {
    const tenant = await getTenant();

    // Refuse rather than substitute. This document asserts certifications and
    // partnerships; built for a tenant that has not authored its content, it
    // states them on that tenant's behalf, to funders. See lib/pdf/authored.ts.
    if (!(await canBuildDocument('pitch-deck'))) {
      return NextResponse.json(
        { success: false, error: notAuthoredMessage('pitch-deck', tenant.name) },
        { status: 404 },
      );
    }
    const foundations = await getAllFoundations();
    const p1p3Count = foundations.filter(isActionablePriority).length;
    // react-hooks/error-boundaries assumes react-dom's async client rendering (errors
    // surface outside this try/catch); @react-pdf/renderer's renderToStream is different —
    // it rejects its returned promise on render failure, so the catch below does work.
    // eslint-disable-next-line react-hooks/error-boundaries
    const stream = await renderToStream(<PitchDeckPDF tenant={tenant} p1p3Count={p1p3Count} />);

    const buffer = await streamToBuffer(stream);

    const year = new Date().getFullYear();
    // Named for whoever asked for it, not for whoever the build was made
    // for. `toSlug` rather than a fourth hand-rolled expression: it is the
    // repo's hyphenated slug rule already, and it agrees with what this line
    // produced for the existing tenant.
    const filename = `pitch-deck-${year}-${toSlug(tenant.name)}.pdf`;

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
