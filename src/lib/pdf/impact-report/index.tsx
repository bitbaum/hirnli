/**
 * Impact Report PDF — Wirkungsbericht
 *
 * Annual impact report generated from live data.
 * ~2 pages: identity + financials + environmental + social + pipeline.
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { COLORS, pdfFormatCHF } from '@/lib/pdf/gesuch-dokument/styles';
import {
  CO2_PER_LAPTOP,
  CO2_TOTAL_TONNES,
  CO2_NEW_LAPTOP_MANUFACTURE,
  CO2_REFURBISH_COST,
  LAPTOPS_REFURBISHED_COUNT,
} from '@/lib/config/numbers';
import { SHARED_ORG_NUMBERS } from '@/lib/config/shared-org-numbers.generated';
import { COMPLETE_YEARS, CURRENT_YEAR_DATA, PEAK_REVENUE, PEAK_YEAR } from '@/app/(tenant)/finanzen/data';
import { FINANCIAL_YEAR_RANGE, FINANCIAL_YEAR_START } from '@/lib/config/financial-constants';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 52,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
    color: COLORS.text,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
  },
  orgBlock: { flex: 1 },
  orgName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  orgTagline: { fontSize: 8, color: COLORS.textMuted, marginTop: 2 },
  docBlock: { textAlign: 'right' },
  docTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  docYear: { fontSize: 8, color: COLORS.textMuted, marginTop: 2 },

  // Section headings
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 6,
    marginTop: 10,
  },

  // Metric grid (3-column)
  metricGrid: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  metricValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  metricLabel: { fontSize: 7, color: COLORS.textMuted, marginTop: 2 },

  // Metric grid green variant
  metricBoxGreen: {
    flex: 1,
    backgroundColor: COLORS.bgGreen,
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  metricValueGreen: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary },

  // Financial table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
    paddingBottom: 3,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 2,
  },
  tableRowHighlight: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 2,
    backgroundColor: COLORS.bgLight,
  },
  colYear: { width: '15%', fontSize: 8, fontWeight: 'bold' },
  colRevenue: { width: '28%', textAlign: 'right', fontSize: 8 },
  colExpenses: { width: '28%', textAlign: 'right', fontSize: 8 },
  colResult: { width: '29%', textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  colHeader: { fontSize: 7, color: COLORS.textMuted, fontWeight: 'bold' },

  // Two-column layout
  twoCol: { flexDirection: 'row', gap: 10 },
  colLeft: { flex: 1 },
  colRight: { flex: 1 },

  // Info box
  infoBox: {
    backgroundColor: COLORS.bgBlue,
    padding: 7,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoBoxGreen: {
    backgroundColor: COLORS.bgGreen,
    padding: 7,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },

  // Text helpers
  body: { fontSize: 8, lineHeight: 1.5, marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  muted: { fontSize: 7, color: COLORS.textMuted },
  positive: { color: COLORS.secondary },
  negative: { color: COLORS.danger },

  // Bullet list
  bulletRow: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 10, fontSize: 8 },
  bulletText: { flex: 1, fontSize: 8, lineHeight: 1.4 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
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
});

// ---------------------------------------------------------------------------
// Derived impact data
// ---------------------------------------------------------------------------

const CURRENT_YEAR = CURRENT_YEAR_DATA.year;
const CURRENT_REVENUE = CURRENT_YEAR_DATA.revenue;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// Page 1: Identity + Financials + Environmental
// ---------------------------------------------------------------------------

function Page1() {
  const completeYears = COMPLETE_YEARS;

  return (
    <Page size="A4" style={s.page}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.orgBlock}>
          <Text style={s.orgName}>{ORG_PROFILE.name}</Text>
          <Text style={s.orgTagline}>
            {ORG_PROFILE.legalForm} · {ORG_PROFILE.location} · Gegründet {ORG_PROFILE.founded}
          </Text>
        </View>
        <View style={s.docBlock}>
          <Text style={s.docTitle}>Wirkungsbericht</Text>
          <Text style={s.docYear}>{CURRENT_YEAR} · Transparenz-Report</Text>
        </View>
      </View>

      {/* Mission statement */}
      <View style={s.infoBox}>
        <Text style={[s.body, s.bold]}>Mission</Text>
        <Text style={s.body}>
          {ORG_PROFILE.name} verlängert die Lebensdauer von IT-Geräten durch professionelles
          Refurbishing, fördert digitale Souveränität durch Open-Source-Software und schafft
          Arbeitsintegrationsstellen für benachteiligte Menschen — seit {ORG_PROFILE.founded}.
        </Text>
      </View>

      {/* --- Financial Health --- */}
      <SectionTitle>📊 Finanzielle Entwicklung {FINANCIAL_YEAR_RANGE}</SectionTitle>

      {/* Revenue trend table */}
      <View style={s.tableHeader}>
        <Text style={[s.colYear, s.colHeader]}>Jahr</Text>
        <Text style={[s.colRevenue, s.colHeader]}>Einnahmen</Text>
        <Text style={[s.colExpenses, s.colHeader]}>Aufwände</Text>
        <Text style={[s.colResult, s.colHeader]}>Ergebnis</Text>
      </View>

      {completeYears.map((yr) => (
        <View key={yr.year} style={yr.year === PEAK_YEAR ? s.tableRowHighlight : s.tableRow}>
          <Text style={s.colYear}>
            {yr.year}{yr.year === PEAK_YEAR ? ' ★' : ''}
          </Text>
          <Text style={s.colRevenue}>{pdfFormatCHF(yr.revenue)}</Text>
          <Text style={s.colExpenses}>{pdfFormatCHF(yr.expenses)}</Text>
          <Text style={[s.colResult, yr.result >= 0 ? s.positive : s.negative]}>
            {yr.result >= 0 ? '+' : ''}{pdfFormatCHF(yr.result)}
          </Text>
        </View>
      ))}
      <Text style={[s.muted, { marginTop: 3, marginBottom: 6 }]}>
        ★ Rekordjahr. Alle Zahlen aus Kivitendo Erfolgsrechnung. Aufwände 2024–2025 noch nicht vollständig verbucht.
      </Text>

      {/* Revenue summary metrics */}
      <View style={s.metricGrid}>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{pdfFormatCHF(PEAK_REVENUE)}</Text>
          <Text style={s.metricLabel}>Höchster Umsatz ({PEAK_YEAR})</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{pdfFormatCHF(CURRENT_REVENUE)}</Text>
          <Text style={s.metricLabel}>Umsatz {CURRENT_YEAR} (geschätzt)</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{FINANCIAL_YEAR_RANGE}</Text>
          <Text style={s.metricLabel}>Kontinuierlicher Betrieb</Text>
        </View>
      </View>

      {/* --- Environmental Impact --- */}
      <SectionTitle>♻️ Umweltwirkung</SectionTitle>

      <View style={s.metricGrid}>
        <View style={s.metricBoxGreen}>
          <Text style={s.metricValueGreen}>~{LAPTOPS_REFURBISHED_COUNT.toLocaleString('de-CH')}+</Text>
          <Text style={s.metricLabel}>Geräte refurbisht (seit {FINANCIAL_YEAR_START})</Text>
        </View>
        <View style={s.metricBoxGreen}>
          <Text style={s.metricValueGreen}>~{CO2_TOTAL_TONNES} t</Text>
          <Text style={s.metricLabel}>CO₂ gespart (gesamt)</Text>
        </View>
        <View style={s.metricBoxGreen}>
          <Text style={s.metricValueGreen}>{SHARED_ORG_NUMBERS.REUSE_RATE}%</Text>
          <Text style={s.metricLabel}>Reuse-Rate der eingegangenen Geräte</Text>
        </View>
      </View>

      <View style={s.infoBoxGreen}>
        <Text style={[s.body, s.bold]}>Wie wir CO₂ einsparen</Text>
        <Text style={s.body}>
          Jeder neue Laptop verursacht ~{CO2_NEW_LAPTOP_MANUFACTURE} kg CO₂ bei der Herstellung.
          Refurbishing kostet nur ~{CO2_REFURBISH_COST} kg. Netto-Einsparung:{' '}
          <Text style={s.bold}>{CO2_PER_LAPTOP} kg CO₂ pro Gerät</Text> — Quelle: Fraunhofer IZM 2023.
        </Text>
        <Text style={s.body}>
          Aktuelle Kapazität: ~{SHARED_ORG_NUMBERS.DEVICES_YEAR_CURRENT} Geräte/Jahr.
          Datenvernichtung nach NIST 800-88 Standard auf allen verarbeiteten Geräten.
        </Text>
      </View>

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text>{ORG_PROFILE.website}</Text>
        <Text>Wirkungsbericht {CURRENT_YEAR} · {ORG_PROFILE.name}</Text>
        <Text>Seite 1 / 2</Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Page 2: Social + Pipeline + Contact
// ---------------------------------------------------------------------------

function Page2({ totalCount, p1p3Count }: { totalCount: number; p1p3Count: number }) {
  return (
    <Page size="A4" style={s.page}>
      {/* Header (compact repeat) */}
      <View style={[s.headerRow, { marginBottom: 10 }]}>
        <Text style={[s.orgName, { fontSize: 11 }]}>{ORG_PROFILE.name}</Text>
        <Text style={[s.docYear, { fontSize: 9 }]}>Wirkungsbericht {CURRENT_YEAR} — Seite 2</Text>
      </View>

      {/* --- Social Impact --- */}
      <SectionTitle>🤝 Soziale Wirkung</SectionTitle>

      <View style={s.twoCol}>
        <View style={s.colLeft}>
          <View style={s.infoBox}>
            <Text style={[s.body, s.bold]}>Arbeitsintegration</Text>
            <Text style={s.body}>
              Seit {ORG_PROFILE.milestones.integrationProgram} bieten wir strukturierte
              Praktikumsplätze für Menschen mit erschwertem Arbeitsmarktzugang:
            </Text>
            <Bullet>Geflüchtete, Langzeitarbeitslose, IV-Bezüger:innen</Bullet>
            <Bullet>8–10 Praktikumsplätze gleichzeitig</Bullet>
            <Bullet>Zusammenarbeit mit AOZ, Caritas, RAV</Bullet>
            <Bullet>{`100+ Menschen begleitet seit ${ORG_PROFILE.milestones.integrationProgram}`}</Bullet>
          </View>
        </View>
        <View style={s.colRight}>
          <View style={s.infoBox}>
            <Text style={[s.body, s.bold]}>Bildung & Befähigung</Text>
            <Text style={s.body}>
              Wir vermitteln technische Kompetenzen, die in einer digitalisierten
              Arbeitswelt entscheidend sind:
            </Text>
            <Bullet>Linux-Einführungskurse (Deutsch & Englisch)</Bullet>
            <Bullet>Repair-Workshops: Selbst reparieren lernen</Bullet>
            <Bullet>Technischer Support per E-Mail, Telefon, vor Ort</Bullet>
            <Bullet>Dokumentationen & How-Tos für Community</Bullet>
          </View>
        </View>
      </View>

      {/* Social metrics */}
      <View style={s.metricGrid}>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{String(ORG_PROFILE.yearsActive)}+</Text>
          <Text style={s.metricLabel}>Jahre Erfahrung in Arbeitsintegration</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>8–10</Text>
          <Text style={s.metricLabel}>Praktikumsplätze gleichzeitig</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>3</Text>
          <Text style={s.metricLabel}>Sozialpartner (AOZ, Caritas, RAV)</Text>
        </View>
      </View>

      {/* --- Foundation Pipeline --- */}
      <SectionTitle>🔍 Stiftungsrecherche & Fundraising</SectionTitle>

      <Text style={[s.body, { marginBottom: 6 }]}>
        Wir haben {totalCount} Schweizer Stiftungen systematisch recherchiert
        und bewertet — mit Fit-Score, Förderbereichen und Bewerbungsstatus.
      </Text>

      <View style={s.metricGrid}>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{totalCount}</Text>
          <Text style={s.metricLabel}>Recherchierte Stiftungen</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{p1p3Count}</Text>
          <Text style={s.metricLabel}>Priorität P1–P3 (aktiv verfolgbar)</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>10/10</Text>
          <Text style={s.metricLabel}>Maximaler Fit-Score (beste Matches)</Text>
        </View>
      </View>

      <View style={s.infoBox}>
        <Text style={[s.body, s.bold]}>Warum Stiftungsförderung?</Text>
        <Text style={s.body}>
          Unser Geschäftsmodell ist gemeinnützig — alle Einnahmen fliessen in die Mission.
          Stiftungsförderung erlaubt uns, Infrastruktur aufzubauen, die langfristige Wirkung
          sichert: ein Community Tech Hub mit professioneller Refurbishment-Kapazität,
          Bildungsräumen und Integrationsarbeitsplätzen.
        </Text>
      </View>

      {/* --- Vision --- */}
      <SectionTitle>🎯 Vision 2028: Community Tech Hub</SectionTitle>

      <View style={s.twoCol}>
        <View style={s.colLeft}>
          <Text style={[s.body, s.bold, { marginBottom: 3 }]}>Hub-Ziele</Text>
          <Bullet>~480 Geräte/Jahr (3× aktuelle Kapazität)</Bullet>
          <Bullet>Professionelle Bildungsräume & Werkstatt</Bullet>
          <Bullet>20–30 Integrationsplätze/Jahr</Bullet>
          <Bullet>Finanzielle Unabhängigkeit durch diversifizierte Einnahmen</Bullet>
        </View>
        <View style={s.colRight}>
          <Text style={[s.body, s.bold, { marginBottom: 3 }]}>Finanzierungsmix (Ziel)</Text>
          <Bullet>40% Gerätverkauf & Dienstleistungen</Bullet>
          <Bullet>25% Arbeitsintegration (öffentliche Hand)</Bullet>
          <Bullet>20% Stiftungsförderung</Bullet>
          <Bullet>15% Workshops, Events, Vermietung</Bullet>
        </View>
      </View>

      {/* --- Contact --- */}
      <SectionTitle>📬 Kontakt</SectionTitle>

      <View style={s.twoCol}>
        <View style={s.colLeft}>
          <Text style={[s.body, s.bold]}>{ORG_PROFILE.name}</Text>
          <Text style={s.body}>{ORG_PROFILE.address}</Text>
          <Text style={s.body}>
            {ORG_PROFILE.phone}{'  '}·{'  '}{ORG_PROFILE.email}
          </Text>
          <Text style={s.body}>{ORG_PROFILE.website}</Text>
        </View>
        <View style={s.colRight}>
          <Text style={[s.body, s.bold]}>Ansprechperson Fundraising</Text>
          <Text style={s.body}>{ORG_PROFILE.contactName}</Text>
          <Text style={[s.muted, { marginTop: 4 }]}>
            Alle Zahlen mit Quellenangaben abrufbar unter:{'\n'}
            {ORG_PROFILE.website}/methodik
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text>{ORG_PROFILE.website}</Text>
        <Text>Wirkungsbericht {CURRENT_YEAR} · {ORG_PROFILE.name}</Text>
        <Text>Seite 2 / 2</Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ImpactReportPDF({ totalCount, p1p3Count }: { totalCount: number; p1p3Count: number }) {
  return (
    <Document
      title={`Wirkungsbericht ${CURRENT_YEAR} — ${ORG_PROFILE.name}`}
      author={ORG_PROFILE.name}
      subject="Jahresbericht: Umwelt-, Sozial- und Bildungswirkung"
      keywords="Wirkungsbericht, Impact Report, Refurbishing, Arbeitsintegration, Open Source"
      creator={`${ORG_PROFILE.name} — revamp-info`}
    >
      <Page1 />
      <Page2 totalCount={totalCount} p1p3Count={p1p3Count} />
    </Document>
  );
}
