/**
 * Anschreiben (Cover Letter) PDF Section
 *
 * Mirrors components/gesuch/AnschreibenSection.tsx for @react-pdf/renderer.
 * Sender/recipient, date, subject, body, beilagen list.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { styles, COLORS, pdfFormatCHF } from './styles';

interface AnschreibenPDFProps {
  dok: ComposedGesuchDokument;
}

export default function AnschreibenPDF({ dok }: AnschreibenPDFProps) {
  const beilagen = [
    'Projektbeschrieb (3 Seiten)',
    'Budget und Finanzierungsplan',
    `Kurzportrait ${ORG_PROFILE.name}`,
    'Statuten (auf Anfrage)',
    'Jahresrechnung (auf Anfrage)',
  ];

  return (
    <View>
      {/* Sender */}
      <View style={{ marginBottom: 20 }}>
        <Text style={[styles.paragraph, { fontWeight: 'bold' }]}>
          {dok.organization.organization.name}
        </Text>
        <Text style={styles.paragraph}>
          {dok.organization.organization.address}
        </Text>
        <Text style={styles.paragraph}>
          {dok.organization.organization.website}
        </Text>
      </View>

      {/* Recipient */}
      <View style={{ marginBottom: 12 }}>
        {dok.anschreiben.foundationAddress && dok.anschreiben.foundationAddress.length > 10 ? (
          <Text style={styles.paragraph}>{dok.anschreiben.foundationAddress}</Text>
        ) : (
          <Text style={[styles.paragraph, { color: COLORS.textMuted, fontStyle: 'italic' }]}>
            [Adresse der Stiftung vor Versand ergänzen]
          </Text>
        )}
      </View>

      {/* Date */}
      <Text style={[styles.paragraph, { color: COLORS.textMuted, marginBottom: 20 }]}>
        {dok.anschreiben.date}
      </Text>

      {/* Subject */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 }}>
        {dok.anschreiben.subject}
      </Text>

      {/* Salutation + Body */}
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.paragraph}>Sehr geehrte Damen und Herren</Text>
        <Text style={[styles.paragraph, { marginTop: 8 }]}>{dok.anschreiben.opening}</Text>
        <Text style={styles.paragraph}>{dok.anschreiben.themeAlignment}</Text>
        <Text style={styles.paragraph}>
          Im beiliegenden Projektbeschrieb stellen wir Ihnen unser Vorhaben im Detail vor.
          Wir beantragen einen Förderbeitrag von {pdfFormatCHF(dok.budget.requestedAmount)} für
          eine Projektlaufzeit von {dok.budget.projectDuration}.
        </Text>
        <Text style={styles.paragraph}>
          Für eine interaktive Übersicht unserer Arbeit und der Passung zu Ihrem Stiftungszweck
          besuchen Sie gerne: {dok.landingPageUrl}
        </Text>
        <Text style={styles.paragraph}>{dok.anschreiben.closing}</Text>
      </View>

      {/* Closing */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.paragraph}>Mit freundlichen Grüssen</Text>
        <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 10 }]}>
          {dok.organization.organization.name}
        </Text>
      </View>

      {/* Beilagen */}
      <View style={{
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 8,
      }}>
        <Text style={[styles.small, { fontWeight: 'bold', color: COLORS.textMuted }]}>
          Beilagen:
        </Text>
        {beilagen.map((b) => (
          <Text key={b} style={[styles.small, { color: COLORS.textMuted, marginLeft: 8 }]}>
            {'  \u2022  '}{b}
          </Text>
        ))}
      </View>
    </View>
  );
}
