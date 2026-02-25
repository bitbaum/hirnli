/**
 * Gesuch Dokument PDF — Main Document Component
 *
 * Composes all 4 section pages into a complete @react-pdf/renderer Document.
 * Each section renders on its own page(s) with shared footer.
 *
 * Data source: ComposedGesuchDokument (same SSOT as the HTML dokument page).
 */

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { styles } from './styles';
import AnschreibenPDF from './AnschreibenPDF';
import ProjektbeschriebPDF from './ProjektbeschriebPDF';
import BudgetPDF from './BudgetPDF';
import KurzportraitPDF from './KurzportraitPDF';

interface GesuchDokumentPDFProps {
  dok: ComposedGesuchDokument;
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>{ORG_PROFILE.name} | {ORG_PROFILE.address} | {ORG_PROFILE.email}</Text>
      <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export default function GesuchDokumentPDF({ dok }: GesuchDokumentPDFProps) {
  return (
    <Document
      title={`Fördergesuch — ${ORG_PROFILE.name} an ${dok.foundation.name}`}
      author={ORG_PROFILE.name}
      subject={dok.anschreiben.subject}
    >
      {/* Page 1: Anschreiben */}
      <Page size="A4" style={styles.page}>
        <AnschreibenPDF dok={dok} />
        <Footer />
      </Page>

      {/* Pages 2+: Projektbeschrieb (wraps across pages) */}
      <Page size="A4" style={styles.page} wrap>
        <ProjektbeschriebPDF dok={dok} />
        <Footer />
      </Page>

      {/* Budget (wraps across pages) */}
      <Page size="A4" style={styles.page} wrap>
        <BudgetPDF dok={dok} />
        <Footer />
      </Page>

      {/* Kurzportrait */}
      <Page size="A4" style={styles.page}>
        <KurzportraitPDF dok={dok} />
        <Footer />
      </Page>
    </Document>
  );
}
