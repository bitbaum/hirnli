/**
 * Gesuch PDF Template
 *
 * Professional PDF template for foundation applications.
 * Uses @react-pdf/renderer for React-based PDF generation.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { COLORS, pdfFormatCHF, pdfTodayCH } from '@/lib/pdf/gesuch-dokument/styles';

const {
  templateBlue: TEMPLATE_BLUE,
  footerGray: FOOTER_GRAY,
  emphasisBg: EMPHASIS_BG,
  emphasisFg: EMPHASIS_FG,
} = COLORS;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottom: `2 solid ${TEMPLATE_BLUE}`,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    borderBottom: `1 solid ${COLORS.border}`,
    paddingBottom: 5,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  highlight: {
    backgroundColor: COLORS.bgBlue,
    padding: 10,
    marginBottom: 10,
    borderLeft: `3 solid ${TEMPLATE_BLUE}`,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1 solid ${COLORS.border}`,
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: FOOTER_GRAY,
    borderTop: `1 solid ${COLORS.border}`,
    paddingTop: 10,
  },
  emphasisBox: {
    backgroundColor: EMPHASIS_BG,
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
  },
  emphasisText: {
    fontSize: 12,
    color: EMPHASIS_FG,
    fontWeight: 'bold',
  },
});

interface GesuchContent {
  foundationName: string;
  requestedAmount: number;
  projectFocus: string;
  introduction: string;
  whyUs: string;
  approach: string;
  impact: string;
  budget: {
    modules: Array<{
      id: string;
      name: string;
      amount: number;
      description: string;
    }>;
    total: number;
  };
  timeline: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  emphasizedNarratives?: string[];
  additionalSections?: Array<{ section: string; content: string }>;
}

interface GesuchPDFProps {
  content: GesuchContent;
}

export function GesuchPDF({ content }: GesuchPDFProps) {
  const today = pdfTodayCH();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gesuch an {content.foundationName}</Text>
          <Text style={styles.subtitle}>
            {ORG_PROFILE.name} Schweiz | {today}
          </Text>
        </View>

        {/* Emphasized Narratives */}
        {content.emphasizedNarratives && content.emphasizedNarratives.length > 0 && (
          <View style={styles.emphasisBox}>
            {content.emphasizedNarratives.map((narrative, index) => (
              <Text key={index} style={styles.emphasisText}>
                ✓ {narrative}
              </Text>
            ))}
          </View>
        )}

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zusammenfassung</Text>
          <Text style={styles.paragraph}>
            Wir beantragen {pdfFormatCHF(content.requestedAmount)} für {content.projectFocus}.
          </Text>
          <Text style={styles.paragraph}>{content.introduction}</Text>
        </View>

        {/* Why Revamp-IT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warum {ORG_PROFILE.name}?</Text>
          <Text style={styles.paragraph}>{content.whyUs}</Text>
        </View>

        {/* Approach */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unser Ansatz</Text>
          <Text style={styles.paragraph}>{content.approach}</Text>
        </View>

        {/* Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wirkung</Text>
          <Text style={styles.paragraph}>{content.impact}</Text>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          {content.budget.modules.map((module) => (
            <View key={module.id} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={{ fontWeight: 'bold' }}>{module.name}</Text>
                <Text style={{ fontSize: 9, color: COLORS.textMuted }}>{module.description}</Text>
              </View>
              <Text style={styles.tableCellRight}>{pdfFormatCHF(module.amount)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, { borderTop: `2 solid ${COLORS.text}` }]}>
            <Text style={{ flex: 2, fontWeight: 'bold' }}>Gesamt</Text>
            <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>
              {pdfFormatCHF(content.budget.total)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zeitplan</Text>
          <Text style={styles.paragraph}>{content.timeline}</Text>
        </View>

        {/* Additional Sections */}
        {content.additionalSections &&
          content.additionalSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <Text style={styles.paragraph}>{section.content}</Text>
            </View>
          ))}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt</Text>
          <Text style={styles.paragraph}>{content.contact.name}</Text>
          <Text style={styles.paragraph}>E-Mail: {content.contact.email}</Text>
          {content.contact.phone && (
            <Text style={styles.paragraph}>Telefon: {content.contact.phone}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {ORG_PROFILE.name} Schweiz | {ORG_PROFILE.address} |{ORG_PROFILE.email}
          </Text>
          <Text style={{ marginTop: 5 }}>
            🌱 Generiert mit {ORG_PROFILE.name} Fundraising System
          </Text>
        </View>
      </Page>
    </Document>
  );
}
