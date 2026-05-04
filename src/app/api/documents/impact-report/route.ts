/**
 * Impact Report PDF Generation API
 *
 * GET /api/documents/impact-report — Generate and download the annual Wirkungsbericht
 *
 * No auth required for GET (public document).
 * ORG-SPECIFIC: Content written for Revamp-IT.
 */

import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { ImpactReportPDF } from '@/lib/pdf/impact-report';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { API_ERR_PDF } from '@/lib/utils/errors';

export async function GET() {
  try {
    const stream = await renderToStream(React.createElement(ImpactReportPDF));

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const year = new Date().getFullYear();
    const filename = `wirkungsbericht-${year}-${ORG_PROFILE.name
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
    console.error('Impact report generation error:', error);
    return NextResponse.json(
      { success: false, error: API_ERR_PDF },
      { status: 500 }
    );
  }
}
