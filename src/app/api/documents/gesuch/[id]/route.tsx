/**
 * Gesuch PDF Generation API
 *
 * POST /api/documents/gesuch/[id] — Generate and download PDF for application
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { GesuchPDF } from '@/lib/pdf/GesuchTemplate';
import { generatePersonalizedGesuch } from '@/lib/domain/personalization-engine';

/**
 * POST /api/documents/gesuch/[id]
 * Generate personalized PDF for application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch application
    const result = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const { application, foundation } = result[0];

    if (!foundation) {
      return NextResponse.json(
        { success: false, error: 'Foundation not found' },
        { status: 404 }
      );
    }

    // Generate personalized content
    const personalized = await generatePersonalizedGesuch(foundation.id);

    // Build PDF content
    const content = {
      foundationName: foundation.name,
      requestedAmount: application.requestedAmount || 50000,
      projectFocus: application.projectFocus || 'Werkstatt Ausbau',

      // Base content (these would ideally come from a content management system)
      introduction:
        'Revamp-IT refurbiert gespendete Laptops und bietet sie zu Solidaritätspreisen an. Parallel schaffen wir Arbeitsplätze für Menschen mit erschwertem Arbeitsmarktzugang, insbesondere Geflüchtete.',

      whyUs:
        'Wir kombinieren Kreislaufwirtschaft (285kg CO2 gespart pro Laptop) mit sozialer Integration (15 Arbeitsplätze geschaffen) und digitaler Inklusion (1\'200+ Laptops verkauft).',

      approach:
        'Unser Geschäftsmodell ist finanziell nachhaltig: 80% Eigenfinanzierung durch Laptop-Verkäufe, 20% Stiftungsfinanzierung für Kapazitätsausbau.',

      impact:
        '2025: 1\'200 Laptops refurbiert, 285 Tonnen CO2 eingespart, 15 Menschen beschäftigt, 95% Kundenzufriedenheit.',

      budget: {
        modules: personalized.customizations.visibleBudgetModules.map(
          moduleName => ({
            id: moduleName,
            name: moduleName,
            amount: 30000, // Simplified - would come from actual module config
            description: `Budget für ${moduleName}`,
          })
        ),
        total: application.requestedAmount || 50000,
      },

      timeline:
        'Q1 2026: Planung und Vorbereitung. Q2-Q3 2026: Umsetzung. Q4 2026: Evaluierung.',

      contact: {
        name: 'Andreas Hunkeler',
        email: 'andreas@revamp-it.ch',
        phone: '+41 76 123 45 67',
      },

      // Personalized sections
      emphasizedNarratives: personalized.customizations.emphasizedNarratives,
      additionalSections: personalized.customizations.additionalSections,
    };

    // Generate PDF
    const pdfComponent = <GesuchPDF content={content} />;
    const stream = await renderToStream(pdfComponent);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Generate filename
    const filename = `gesuch-${foundation.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Return PDF
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
        error: error instanceof Error ? error.message : 'PDF generation failed',
      },
      { status: 500 }
    );
  }
}
