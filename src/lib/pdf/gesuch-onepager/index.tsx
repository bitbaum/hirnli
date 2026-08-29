/**
 * Gesuch One-Pager PDF — 1-page concept note for foundation outreach
 *
 * Commonly requested before a full 4-page gesuch.
 * Reuses same data source as the full gesuch PDF (ComposedGesuchDokument).
 *
 * Layout: header | bridge | what we do | project | budget | impact | contact
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { COLORS, pdfFormatCHF, pdfTodayCH } from '@/lib/pdf/gesuch-dokument/styles';

const s = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 48,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
    color: COLORS.text,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
  },
  orgName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  docType: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
  },
  foundationName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dateText: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Section
  sectionLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
    marginTop: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 5,
    marginTop: 2,
  },

  // Bridge highlight box
  bridgeBox: {
    backgroundColor: COLORS.bgBlue,
    padding: 8,
    borderRadius: 2,
    marginTop: 6,
  },
  bridgeText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.text,
  },

  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  col: {
    flex: 1,
  },

  // Bullet list
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: COLORS.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.textLight,
    lineHeight: 1.4,
  },

  // Budget row
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
  },
  budgetCell: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  budgetCellLast: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Evidence metrics row
  evidenceRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  evidenceItem: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    padding: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  evidenceClaim: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  evidenceTitle: {
    fontSize: 7,
    color: COLORS.textMuted,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.textMuted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 5,
  },

  // Project
  projectTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  projectSummary: {
    fontSize: 9,
    color: COLORS.textLight,
    lineHeight: 1.4,
  },
});

interface OnePagerPDFProps {
  dok: ComposedGesuchDokument;
  shareUrl?: string;
}

export default function GesuchOnePagerPDF({ dok, shareUrl }: OnePagerPDFProps) {
  const today = pdfTodayCH();

  // Use first 3 competencies for bullet points
  const competencyBullets = dok.story.how.competencies
    .slice(0, 3)
    .flatMap((c) => c.capabilities.slice(0, 2));

  const firstProject = dok.story.projects[0];
  const topEvidence = dok.story.evidence.slice(0, 3);

  // Total project budget (scenario total across 3 years)
  const scenario = dok.budget.scenario;
  const y1 = scenario.threeYearModel.year1;
  const y2 = scenario.threeYearModel.year2;
  const y3 = scenario.threeYearModel.year3;
  const totalProjectBudget = y1.einmalig + y1.jaehrlich + y2.jaehrlich + y3.jaehrlich;

  const contactLine = [ORG_PROFILE.email, ORG_PROFILE.phone, ORG_PROFILE.website]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Document
      title={`Kurzübersicht Fördergesuch — ${ORG_PROFILE.name} an ${dok.foundation.name}`}
      author={ORG_PROFILE.name}
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.orgName}>{ORG_PROFILE.name}</Text>
            <Text style={s.docType}>Kurzübersicht Fördergesuch</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.foundationName}>{dok.foundation.name}</Text>
            <Text style={s.dateText}>{today}</Text>
          </View>
        </View>

        {/* ── Warum diese Partnerschaft ── */}
        <Text style={s.sectionLabel}>Warum diese Partnerschaft</Text>
        <View style={s.divider} />
        <View style={s.bridgeBox}>
          <Text style={s.bridgeText}>{dok.foundationBridge}</Text>
        </View>

        <View style={s.twoCol}>
          {/* ── Was wir tun ── */}
          <View style={s.col}>
            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Was wir tun</Text>
            <View style={s.divider} />
            {competencyBullets.slice(0, 5).map((cap, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>•</Text>
                <Text style={s.bulletText}>{cap}</Text>
              </View>
            ))}
          </View>

          {/* ── Konkretes Projekt ── */}
          <View style={s.col}>
            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Konkretes Projekt</Text>
            <View style={s.divider} />
            {firstProject ? (
              <>
                <Text style={s.projectTitle}>{firstProject.title}</Text>
                <Text style={s.projectSummary}>{firstProject.summary.split(/\.\s+/)[0] + '.'}</Text>
                {firstProject.goals.slice(0, 2).map((g, i) => (
                  <View key={i} style={[s.bulletRow, { marginTop: 3 }]}>
                    <Text style={s.bullet}>→</Text>
                    <Text style={s.bulletText}>{g}</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={s.projectSummary}>{dok.anschreiben.subject}</Text>
            )}
          </View>
        </View>

        {/* ── Budget ── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Budget & Förderantrag</Text>
        <View style={s.divider} />
        <View style={s.budgetRow}>
          <View style={s.budgetCell}>
            <Text style={s.budgetLabel}>Projektvolumen (3 Jahre)</Text>
            <Text style={s.budgetValue}>{pdfFormatCHF(totalProjectBudget)}</Text>
          </View>
          <View style={s.budgetCell}>
            <Text style={s.budgetLabel}>Förderantrag</Text>
            <Text style={[s.budgetValue, { color: COLORS.primary }]}>
              {pdfFormatCHF(dok.budget.requestedAmount)}
            </Text>
          </View>
          <View style={s.budgetCellLast}>
            <Text style={s.budgetLabel}>Zeitraum</Text>
            <Text style={s.budgetValue}>{dok.budget.projectDuration}</Text>
          </View>
        </View>

        {/* ── Wirkung ── */}
        {topEvidence.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Nachgewiesene Wirkung</Text>
            <View style={s.divider} />
            <View style={s.evidenceRow}>
              {topEvidence.map((ev) => (
                <View key={ev.title} style={s.evidenceItem}>
                  <Text style={s.evidenceClaim}>{ev.claim}</Text>
                  <Text style={s.evidenceTitle}>
                    {ev.title} ({ev.year})
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Kontakt ── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Kontakt</Text>
        <View style={s.divider} />
        <Text style={{ fontSize: 9, color: COLORS.textLight }}>{contactLine}</Text>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>
            {dok.foundation.type && `${ORG_PROFILE.name} — Fördergesuch an ${dok.foundation.name}`}
          </Text>
          <Text>{shareUrl ?? `${ORG_PROFILE.website}`}</Text>
        </View>
      </Page>
    </Document>
  );
}
