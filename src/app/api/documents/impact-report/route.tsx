/**
 * Impact Report PDF Generation API
 *
 * GET /api/documents/impact-report — Generate and download the annual Wirkungsbericht
 *
 * No auth required for GET (public document).
 * ORG-SPECIFIC: Content written for Revamp-IT.
 */

import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ImpactReportPDF } from '@/lib/pdf/impact-report';
import { getTenant } from '@/lib/tenant/resolve';
import { toSlug } from '@/lib/utils/slug';
import { API_ERR_PDF } from '@/lib/utils/errors';
import { streamToBuffer } from '@/lib/pdf/utils';
import { apiError } from '@/lib/api/route-helpers';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { isActionablePriority } from '@/lib/domain/foundation-helpers';

export async function GET() {
  try {
    const tenant = await getTenant();
    const foundations = await getAllFoundations();
    const totalCount = foundations.length;
    const p1p3Count = foundations.filter(isActionablePriority).length;
    // react-hooks/error-boundaries assumes react-dom's async client rendering (errors
    // surface outside this try/catch); @react-pdf/renderer's renderToStream is different —
    // it rejects its returned promise on render failure, so the catch below does work.
    const stream = await renderToStream(
      // eslint-disable-next-line react-hooks/error-boundaries
      <ImpactReportPDF tenant={tenant} totalCount={totalCount} p1p3Count={p1p3Count} />,
    );

    const buffer = await streamToBuffer(stream);

    const year = new Date().getFullYear();
    // Named for whoever asked for it, not for whoever the build was made
    // for. `toSlug` rather than a fourth hand-rolled expression: it is the
    // repo's hyphenated slug rule already, and it agrees with what this line
    // produced for the existing tenant.
    const filename = `wirkungsbericht-${year}-${toSlug(tenant.name)}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return apiError('Impact report generation', error, API_ERR_PDF);
  }
}
