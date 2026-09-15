/**
 * One-Pager PDF API Route
 *
 * GET /api/pdf/gesuch/[slug]/onepager
 *
 * Generates a 1-page concept note PDF for the given foundation.
 * Same data pipeline as the full gesuch PDF — literally the same handler,
 * with a different document and filename.
 *
 * Optional query param: ?schwerpunkt=<SchwerpunktId>
 */

import GesuchOnePagerPDF from '@/lib/pdf/gesuch-onepager';
import { createGesuchPdfRoute } from '@/lib/pdf/gesuch-pdf-route';

export const GET = createGesuchPdfRoute({
  Document: GesuchOnePagerPDF,
  filenamePrefix: 'kurzuebersicht',
  errorLabel: 'One-pager PDF generation',
});
