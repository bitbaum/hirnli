/**
 * Gesuch Dokument PDF API Route
 *
 * GET /api/pdf/gesuch/[slug] — Generate PDF from config data (no DB needed).
 *
 * Uses the same SSOT as the HTML dokument page:
 *   composeGesuchDokument(await getTenant(), foundation) → GesuchDokumentPDF
 *
 * Optional query param: ?schwerpunkt=<SchwerpunktId>
 */

import GesuchDokumentPDF from '@/lib/pdf/gesuch-dokument';
import { createGesuchPdfRoute } from '@/lib/pdf/gesuch-pdf-route';

export const GET = createGesuchPdfRoute({
  Document: GesuchDokumentPDF,
  filenamePrefix: 'gesuch',
  errorLabel: 'PDF generation',
});
