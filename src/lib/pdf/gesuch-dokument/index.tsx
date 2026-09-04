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
import { styles } from './styles';
import AnschreibenPDF from './AnschreibenPDF';
import ProjektbeschriebPDF from './ProjektbeschriebPDF';
import BudgetPDF from './BudgetPDF';
import KurzportraitPDF from './KurzportraitPDF';
import type { Tenant } from '@/lib/tenant/profile';

interface GesuchDokumentPDFProps {
  dok: ComposedGesuchDokument;
}

function Footer({ tenant }: { tenant: Tenant }) {
  // Printed on every page of a document going to a foundation. The address is
  // optional, so the separators are built from what exists rather than left as
  // " |  | " around a hole.
  const line = [tenant.name, tenant.address, tenant.email].filter(Boolean).join(' | ');
  return (
    <View style={styles.footer} fixed>
      <Text>{line}</Text>
      <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export default function GesuchDokumentPDF({ dok }: GesuchDokumentPDFProps) {
  return (
    <Document
      title={`Fördergesuch — ${dok.tenant.name} an ${dok.foundation.name}`}
      author={dok.tenant.name}
      subject={dok.anschreiben.subject}
    >
      {/* Page 1: Anschreiben */}
      <Page size="A4" style={styles.page}>
        <AnschreibenPDF dok={dok} />
        <Footer tenant={dok.tenant} />
      </Page>

      {/* Pages 2+: Projektbeschrieb (wraps across pages) */}
      <Page size="A4" style={styles.page} wrap>
        <ProjektbeschriebPDF dok={dok} />
        <Footer tenant={dok.tenant} />
      </Page>

      {/* Budget (wraps across pages) */}
      <Page size="A4" style={styles.page} wrap>
        <BudgetPDF dok={dok} />
        <Footer tenant={dok.tenant} />
      </Page>

      {/* Kurzportrait */}
      <Page size="A4" style={styles.page}>
        <KurzportraitPDF dok={dok} />
        <Footer tenant={dok.tenant} />
      </Page>
    </Document>
  );
}
