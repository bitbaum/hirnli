/**
 * Exporting the foundation register.
 *
 * Its own module, apart from `data-exporters.ts`, for a reason that is not
 * tidiness: that module also imports one organisation's accounting and revenue
 * history, so anything importing it could REACH that data. The route serving
 * the shared register was therefore indistinguishable, to any rule that reads
 * imports, from a route serving somebody's books.
 *
 * The register is shared research, scoped per tenant by the caller. Keeping it
 * in a module with no owned data makes that true of its imports as well as of
 * its behaviour.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import { arrayToCSV } from '@/lib/utils/csv';

// ---------------------------------------------------------------------------
// Foundation List Export
// ---------------------------------------------------------------------------

export function exportFoundationList(foundations: Foundation[]): string {
  const headers = [
    'Name',
    'Typ',
    'Themen',
    'Status',
    'Deadline',
    'Betrag (CHF)',
    'Fit-Score',
    'Region',
    'URL',
  ];

  const rows = foundations.map((foundation) => [
    foundation.name,
    foundation.type,
    foundation.themes.join('; '),
    foundation.status,
    foundation.deadlineText || 'Rolling',
    foundation.amount.text || 'Variabel',
    `${foundation.fitScore}/10`,
    foundation.region || 'CH',
    foundation.websiteUrl || '',
  ]);

  return arrayToCSV(headers, rows);
}
