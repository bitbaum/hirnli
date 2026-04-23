/**
 * Pitch Deck PDF Generation API
 *
 * GET /api/documents/pitch-deck — Generate and download the pitch deck PDF
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 */

import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { PitchDeckPDF } from '@/lib/pdf/pitch-deck';
import { ORG_PROFILE } from '@/lib/config/org-profile';

export async function GET() {
  try {
    const stream = await renderToStream(React.createElement(PitchDeckPDF));

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

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
    console.error('Pitch deck generation error:', error);
    return NextResponse.json(
      { success: false, error: 'PDF-Generierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
