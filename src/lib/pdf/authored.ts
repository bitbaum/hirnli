/**
 * A funder document may only be built from content its tenant actually wrote.
 *
 * The pitch deck and impact report are assembled almost entirely from
 * TypeScript modules describing ONE organisation — its P&L, its impact
 * figures, its partners, its certifications. The generators interpolate the
 * requesting tenant's name over all of it.
 *
 * Verified against production on 2026-09-05, the second tenant's pitch deck
 * contained, as rendered PDF text:
 *
 *   - a slide titled with the reference tenant's name
 *   - "Datenvernichtung nach NIST 800-88 Standard"
 *   - "SWICO-zertifizierter Partner"
 *   - "Bestehende Partnerschaften (AOZ, Caritas, RAV, SWICO)"
 *
 * The first is one organisation's name in another's deck. The rest are worse:
 * they are CREDENTIAL CLAIMS — a data-destruction standard, a Swiss
 * recycling certification, named social-partner relationships — asserted on
 * behalf of an organisation that holds none of them, in a document written to
 * be sent to funders.
 *
 * A leak on a web page shows the wrong content. A leak here makes a false
 * statement of credentials in someone's funding application. So the fix is not
 * to substitute the name harder; it is to refuse. A tenant that has not
 * authored this content does not get a document made of somebody else's.
 */

import { ownsCodeContent } from '@/lib/content/page-content';

/** Funder-facing documents assembled from code-held, single-tenant content. */
export type AuthoredDocument = 'pitch-deck' | 'impact-report';

/**
 * May this tenant's request produce this document?
 *
 * False until the tenant's own content exists. Callers return 404 rather than
 * an empty document: a blank pitch deck and a borrowed one are both wrong, and
 * the honest answer is that this tenant has not written one.
 */
export async function canBuildDocument(_doc: AuthoredDocument): Promise<boolean> {
  // Both documents draw on the same body of content — impact figures, the
  // financial history, the mission narrative — so they share one gate rather
  // than each inventing a rule that could drift from the other.
  return ownsCodeContent('fundraising');
}

/** The 404 body, saying which tenant it is about and why there is nothing. */
export function notAuthoredMessage(doc: AuthoredDocument, tenantName: string): string {
  const label = doc === 'pitch-deck' ? 'Pitch Deck' : 'Wirkungsbericht';
  return (
    `${label} nicht verfügbar: ${tenantName} hat dafür noch keine Inhalte hinterlegt. ` +
    'Dieses Dokument wird aus den Wirkungszahlen, der Finanzhistorie und dem ' +
    'Projektnarrativ der Organisation erzeugt.'
  );
}
