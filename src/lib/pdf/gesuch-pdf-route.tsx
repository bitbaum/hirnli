/**
 * The shared body of the two gesuch PDF routes.
 *
 * `/api/pdf/gesuch/[slug]` and `/api/pdf/gesuch/[slug]/onepager` ask the same
 * question — compose this tenant's gesuch for this foundation, refuse in the
 * same words when it is not ready — and differ only in which document gets
 * rendered and what the download is called. Two copies of that meant a fix to
 * the refusal path, or to override loading, could land on one PDF and not the
 * other. The one-pager IS the same gesuch, so the two must never disagree.
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import type { ComponentType } from 'react';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { getFoundationBySlug } from '@/lib/db/foundations-repo';
import { composeGesuchDokument, type ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { loadTenantStory } from '@/lib/content/story-engine';
import { loadTenantBudget } from '@/lib/content/budget-engine';
import { isSchwerpunktId } from '@/lib/config/schwerpunkte';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';
import {
  API_ERR_PDF,
  API_ERR_FOUNDATION_NOT_FOUND,
  API_ERR_GESUCH_UNAVAILABLE,
  API_ERR_GESUCH_NOT_READY,
  API_ERR_STORY_MISSING,
} from '@/lib/utils/errors';
import { getTodayISO } from '@/lib/utils/format';
import { streamToBuffer, sanitizeFoundationFilename } from '@/lib/pdf/utils';
import { apiError } from '@/lib/api/route-helpers';
import { getTenant } from '@/lib/tenant/resolve';

type RouteContext = { params: Promise<{ slug: string }> };

interface GesuchPdfRouteSpec {
  /** The react-pdf document rendered from the composed gesuch. */
  Document: ComponentType<{ dok: ComposedGesuchDokument }>;
  /** Leading word of the download, e.g. `gesuch-stiftung-x-2026-01-01.pdf`. */
  filenamePrefix: string;
  /** What the server log calls this route when rendering throws. */
  errorLabel: string;
}

export function createGesuchPdfRoute({ Document, filenamePrefix, errorLabel }: GesuchPdfRouteSpec) {
  return async function GET(request: NextRequest, { params }: RouteContext) {
    try {
      const { slug } = await params;

      const foundation = await getFoundationBySlug(slug);
      if (!foundation) {
        return NextResponse.json(
          { success: false, error: API_ERR_FOUNDATION_NOT_FOUND },
          { status: 404 },
        );
      }

      if (!hasGesuchPage(foundation)) {
        return NextResponse.json(
          { success: false, error: API_ERR_GESUCH_UNAVAILABLE },
          { status: 400 },
        );
      }

      const schwerpunktParam = request.nextUrl.searchParams.get('schwerpunkt');
      const schwerpunktId =
        schwerpunktParam && isSchwerpunktId(schwerpunktParam) ? schwerpunktParam : undefined;

      const tenant = await getTenant();
      const story = await loadTenantStory(tenant);
      const budget = await loadTenantBudget(tenant);
      if (!story) {
        return NextResponse.json({ success: false, error: API_ERR_STORY_MISSING }, { status: 400 });
      }

      const baseDok = composeGesuchDokument(story, budget, foundation, schwerpunktId);
      const overrides = await loadGesuchOverrides(slug, schwerpunktId ?? 'auto');
      const dok = applyGesuchOverrides(baseDok, overrides);

      if (!dok.ready) {
        return NextResponse.json(
          { success: false, error: dok.readyReason || API_ERR_GESUCH_NOT_READY },
          { status: 400 },
        );
      }

      const stream = await renderToStream(<Document dok={dok} />);
      const buffer = await streamToBuffer(stream);
      const filename = `${filenamePrefix}-${sanitizeFoundationFilename(foundation.name)}-${getTodayISO()}.pdf`;

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } catch (error) {
      return apiError(errorLabel, error, API_ERR_PDF);
    }
  };
}
