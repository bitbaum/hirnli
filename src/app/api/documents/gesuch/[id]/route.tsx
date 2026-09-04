/**
 * Gesuch PDF Generation API
 *
 * POST /api/documents/gesuch/[id] — Generate and download PDF for application
 *
 * WHOSE WORDS THESE ARE
 *
 * The organisation's identity — name, founding year, contact — now comes from
 * the request's tenant, so a Gesuch is no longer signed with another customer's
 * name. The narrative prose below is still Revamp-IT's: refurbished laptops,
 * CO2 per device, solidarity pricing. It is hardcoded German text about one
 * organisation's actual programme, and no substitution makes it true of anybody
 * else, so a second tenant generating a Gesuch gets its own name attached to
 * claims about a business it is not in.
 *
 * That prose belongs in `org_content` beside stories and Schwerpunkte, which is
 * the next step in docs/TENANT-MIGRATION-MAP.md. Until it moves, this endpoint
 * is only usable by the reference tenant, and it is left visibly wrong rather
 * than quietly generalised — a Gesuch that reads plausibly and states things
 * the sender never did is the worst possible thing to hand a fundraiser.
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { db } from '@/lib/db/client';
import { applications, foundations } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { GesuchPDF } from '@/lib/pdf/GesuchTemplate';
import { generatePersonalizedGesuch } from '@/lib/domain/personalization-engine';
import { CO2_PER_LAPTOP, CO2_TOTAL_TONNES, NUMBERS_REGISTRY } from '@/lib/config/numbers';
import { getCurrentOrgId, getTenant } from '@/lib/tenant/resolve';
import { getTodayISO } from '@/lib/utils/format';
import {
  API_ERR_NOT_FOUND,
  API_ERR_PROCESS,
  API_ERR_FOUNDATION_NOT_FOUND,
} from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { streamToBuffer, sanitizeFoundationFilename } from '@/lib/pdf/utils';

/**
 * POST /api/documents/gesuch/[id]
 * Generate personalized PDF for application
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orgId = await getCurrentOrgId();

    // Scoped to the caller's own organisation.
    //
    // The lookup was by application id alone, so any tenant could render any
    // other tenant's Gesuch — requested amount, project focus, the foundation
    // being approached — as a PDF, simply by knowing an id. A 404 for an
    // application belonging to somebody else is the same answer as for one that
    // does not exist, which is the answer it should have been all along.
    const result = await db
      .select({
        application: applications,
        foundation: foundations,
      })
      .from(applications)
      .leftJoin(foundations, eq(applications.foundationId, foundations.id))
      .where(and(eq(applications.id, id), eq(applications.orgId, orgId)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: API_ERR_NOT_FOUND }, { status: 404 });
    }

    const { application, foundation } = result[0];

    if (!foundation) {
      return NextResponse.json(
        { success: false, error: API_ERR_FOUNDATION_NOT_FOUND },
        { status: 404 },
      );
    }

    // Generate personalized content
    const personalized = await generatePersonalizedGesuch(foundation.id);

    const tenant = await getTenant();

    // Build PDF content
    const content = {
      foundationName: foundation.name,
      requestedAmount: application.requestedAmount || 50000,
      projectFocus: application.projectFocus || 'Werkstatt Ausbau',

      // Content derived from NUMBERS_REGISTRY SSOT
      introduction: `${tenant.name} refurbiert gespendete Laptops und bietet sie zu Solidaritätspreisen an. Parallel schaffen wir Ausbildungsplätze für Menschen mit erschwertem Arbeitsmarktzugang.`,

      whyUs: `Wir kombinieren Kreislaufwirtschaft (${CO2_PER_LAPTOP}kg CO2 gespart pro Laptop) mit sozialer Integration (${NUMBERS_REGISTRY.PEOPLE_HELPED.value} Menschen begleitet seit ${tenant.founded}) und digitaler Inklusion (${NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value} Laptops refurbished seit ${tenant.founded}).`,

      approach:
        'Unser Geschäftsmodell kombiniert Eigenfinanzierung (Laptop-Verkäufe & Services) mit Stiftungsfinanzierung für Kapazitätsausbau und soziale Programme.',

      impact: `Seit ${tenant.founded}: ${NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value} Laptops refurbished, ~${CO2_TOTAL_TONNES} Tonnen CO2 eingespart, ${NUMBERS_REGISTRY.PEOPLE_HELPED.value} Menschen begleitet.`,

      budget: (() => {
        const total = application.requestedAmount || 50000;
        const modules = personalized.customizations.visibleBudgetModules;
        const amountPerModule = Math.round(total / Math.max(modules.length, 1));
        return {
          modules: modules.map((moduleName) => ({
            id: moduleName,
            name: moduleName,
            amount: amountPerModule,
            description: `Budget für ${moduleName}`,
          })),
          total,
        };
      })(),

      timeline: 'Q1 2026: Planung und Vorbereitung. Q2-Q3 2026: Umsetzung. Q4 2026: Evaluierung.',

      contact: {
        // A tenant need not have named an individual contact. The organisation
        // itself is then who the foundation writes to — a real answer, unlike
        // an empty line under "Kontakt" in a document going out by post.
        name: tenant.contactName ?? tenant.name,
        email: tenant.email,
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
    return apiError('GET /api/documents/gesuch/[id]', error, API_ERR_PROCESS);
  }
}
