/**
 * Gesuch PDF Generation API
 *
 * POST /api/documents/gesuch/[id] — Generate and download PDF for application
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { GesuchPDF } from '@/lib/pdf/GesuchTemplate';
import { generatePersonalizedGesuch } from '@/lib/domain/personalization-engine';
import { CO2_PER_LAPTOP, LAPTOPS_REFURBISHED_COUNT, NUMBERS_REGISTRY } from '@/lib/config/numbers';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { getTodayISO } from '@/lib/utils/format';
import { API_ERR_NOT_FOUND, API_ERR_PROCESS } from '@/lib/utils/errors';
import { streamToBuffer, sanitizeFoundationFilename } from '@/lib/pdf/utils';

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
        { success: false, error: API_ERR_NOT_FOUND },
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

      // Content derived from NUMBERS_REGISTRY SSOT
      introduction:
        `${ORG_PROFILE.name} refurbiert gespendete Laptops und bietet sie zu Solidaritätspreisen an. Parallel schaffen wir Ausbildungsplätze für Menschen mit erschwertem Arbeitsmarktzugang.`,

      whyUs:
        `Wir kombinieren Kreislaufwirtschaft (${CO2_PER_LAPTOP}kg CO2 gespart pro Laptop) mit sozialer Integration (${NUMBERS_REGISTRY.PEOPLE_HELPED.value} Menschen begleitet seit ${ORG_PROFILE.founded}) und digitaler Inklusion (${NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value} Laptops refurbished seit ${ORG_PROFILE.founded}).`,

      approach:
        'Unser Geschäftsmodell kombiniert Eigenfinanzierung (Laptop-Verkäufe & Services) mit Stiftungsfinanzierung für Kapazitätsausbau und soziale Programme.',

      impact:
        `Seit ${ORG_PROFILE.founded}: ${NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value} Laptops refurbished, ~${Math.round(LAPTOPS_REFURBISHED_COUNT * CO2_PER_LAPTOP / 1000)} Tonnen CO2 eingespart, ${NUMBERS_REGISTRY.PEOPLE_HELPED.value} Menschen begleitet.`,

      budget: (() => {
        const total = application.requestedAmount || 50000;
        const modules = personalized.customizations.visibleBudgetModules;
        const amountPerModule = Math.round(total / Math.max(modules.length, 1));
        return {
          modules: modules.map(moduleName => ({
            id: moduleName,
            name: moduleName,
            amount: amountPerModule,
            description: `Budget für ${moduleName}`,
          })),
          total,
        };
      })(),

      timeline:
        'Q1 2026: Planung und Vorbereitung. Q2-Q3 2026: Umsetzung. Q4 2026: Evaluierung.',

      contact: {
        name: ORG_PROFILE.contactName,
        email: ORG_PROFILE.email,
      },

      // Personalized sections
      emphasizedNarratives: personalized.customizations.emphasizedNarratives,
      additionalSections: personalized.customizations.additionalSections,
    };

    // Generate PDF
    const pdfComponent = <GesuchPDF content={content} />;
    const stream = await renderToStream(pdfComponent);

    const buffer = await streamToBuffer(stream);
    const filename = `gesuch-${sanitizeFoundationFilename(foundation.name)}-${getTodayISO()}.pdf`;

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: API_ERR_PROCESS,
      },
      { status: 500 }
    );
  }
}
