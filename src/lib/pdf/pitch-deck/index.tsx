/**
 * Pitch Deck PDF — Präsentationsdeck
 *
 * 8-slide landscape A4 presentation for foundation officers and donors.
 * Reuses COLORS from gesuch-dokument/styles.ts.
 *
 * The narrative, figures and credential claims here were written for the
 * reference tenant. `lib/pdf/authored.ts` refuses to build this document for
 * any other tenant until it has content of its own — assembling it from
 * somebody else's material states their certifications under a name that
 * does not hold them, to funders.
 * To support a new org, rewrite this file's content.
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Tenant } from '@/lib/tenant/profile';
import { PLATFORM_BRAND } from '@/lib/config/platform-brand';
import { COLORS, pdfFormatCHF } from '@/lib/pdf/gesuch-dokument/styles';
import {
  CO2_PER_LAPTOP,
  CO2_TOTAL_TONNES,
  CO2_NEW_LAPTOP_MANUFACTURE,
  LAPTOPS_REFURBISHED_COUNT,
} from '@/lib/config/numbers';
import {
  COMPLETE_YEARS,
  CUMULATIVE_WARENVERKAUF,
  CURRENT_YEAR_DATA,
  PEAK_REVENUE,
  PEAK_YEAR,
} from '@/app/(tenant)/finanzen/data';
import { FINANCIAL_YEAR_RANGE, FINANCIAL_YEAR_START } from '@/lib/config/financial-constants';
import { DEVICES_PER_YEAR_TARGET, DEVICES_PER_YEAR_CURRENT } from '@/lib/config/projections';

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

const CURRENT_YEAR = CURRENT_YEAR_DATA.year;
const CURRENT_REVENUE = CURRENT_YEAR_DATA.revenue;
const TOTAL_SLIDES = 8;

const AMBER = COLORS.amber;

// ---------------------------------------------------------------------------
// Slide styles (landscape A4 = 842 × 595 pt)
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  slide: {
    padding: 0,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  // Full-bleed header band
  slideBand: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  bandSub: { fontSize: 9, color: COLORS.bgBlue },

  // Body area
  body: {
    paddingHorizontal: 40,
    paddingTop: 18,
    paddingBottom: 18,
    flex: 1,
  },

  // Cover
  coverFull: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  coverOrg: { fontSize: 42, fontWeight: 'bold', color: COLORS.white, textAlign: 'center' },
  coverTagline: {
    fontSize: 15,
    color: COLORS.bgBlue,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  coverDivider: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.accent,
    marginVertical: 16,
  },
  coverMeta: { fontSize: 10, color: COLORS.bgBlue, textAlign: 'center' },

  // Two-column layout
  twoCol: { flexDirection: 'row', gap: 20 },
  col: { flex: 1 },

  // Three-column layout
  threeCol: { flexDirection: 'row', gap: 16 },
  thirdCol: { flex: 1 },

  // Big metric boxes
  metricBox: {
    backgroundColor: COLORS.bgLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 14,
    flex: 1,
  },
  metricBoxGreen: {
    backgroundColor: COLORS.bgGreen,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    padding: 14,
    flex: 1,
  },
  metricBoxAccent: {
    backgroundColor: COLORS.bgAccent,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    padding: 14,
    flex: 1,
  },
  metricValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  metricValueGreen: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary },
  metricValueAccent: { fontSize: 28, fontWeight: 'bold', color: COLORS.accent },
  metricLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4 },
  metricSub: { fontSize: 8, color: COLORS.textLight, marginTop: 2 },

  // Problem callout
  problemBox: {
    backgroundColor: COLORS.bgDanger,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    padding: 12,
    marginBottom: 10,
  },
  problemStat: { fontSize: 22, fontWeight: 'bold', color: COLORS.danger },
  problemLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },

  // Cascade tier
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  tierNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tierNumText: { fontSize: 13, fontWeight: 'bold', color: COLORS.white },
  tierContent: { flex: 1 },
  tierName: { fontSize: 11, fontWeight: 'bold', color: COLORS.text },
  tierDetail: { fontSize: 8, color: COLORS.textMuted, marginTop: 2 },
  tierRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    minWidth: 44,
    textAlign: 'right',
  },

  // Financial bar (simplified)
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  barLabel: { width: 36, fontSize: 8, color: COLORS.textMuted, textAlign: 'right' },
  barTrack: { flex: 1, height: 14, backgroundColor: COLORS.border },
  barFill: { height: 14, backgroundColor: COLORS.primary },
  barValue: { width: 60, fontSize: 8, textAlign: 'right', color: COLORS.text },

  // Text helpers
  h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 14 },
  h3: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  p: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  small: { fontSize: 8, color: COLORS.textMuted },
  bold: { fontWeight: 'bold' },
  primary: { color: COLORS.primary },
  accent: { color: COLORS.accent },
  negative: { color: COLORS.danger },
  positive: { color: COLORS.secondary },

  // Bullet
  bulletRow: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { width: 12, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.textMuted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
  },

  // Info highlight box
  infoBox: {
    backgroundColor: COLORS.bgBlue,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 10,
    marginBottom: 10,
  },
});

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function SlideFooter({ tenant, slide }: { tenant: Tenant; slide: number }) {
  return (
    <View style={s.footer} fixed>
      <Text>{[tenant.name, tenant.website].filter(Boolean).join(' · ')}</Text>
      <Text>
        {slide} / {TOTAL_SLIDES}
      </Text>
    </View>
  );
}

function SlideHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.slideBand}>
      <Text style={s.bandTitle}>{title}</Text>
      {sub && <Text style={s.bandSub}>{sub}</Text>}
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>›</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Slide 1: Cover
// ---------------------------------------------------------------------------

function Slide1Cover({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <View style={s.coverFull}>
        <Text style={s.coverOrg}>{tenant.name}</Text>
        <View style={s.coverDivider} />
        <Text style={s.coverTagline}>
          Kreislaufwirtschaft · Arbeitsintegration · Digitale Bildung
        </Text>
        <Text style={s.coverMeta}>Präsentation für Stiftungen & Förderer · {CURRENT_YEAR}</Text>
        <Text style={[s.coverMeta, { marginTop: 20 }]}>
          {tenant.legalForm} · Gegründet {tenant.founded} · {tenant.location}
        </Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 2: Problem
// ---------------------------------------------------------------------------

function Slide2Problem({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <SlideHeader title="Das Problem" sub="Warum Handeln jetzt nötig ist" />
      <View style={s.body}>
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.h3}>Elektroschrott wächst exponentiell</Text>
            <View style={s.problemBox}>
              <Text style={s.problemStat}>62 Mio. t</Text>
              <Text style={s.problemLabel}>E-Waste pro Jahr weltweit (2023)</Text>
            </View>
            <View style={s.problemBox}>
              <Text style={s.problemStat}>~{CO2_NEW_LAPTOP_MANUFACTURE} kg CO₂</Text>
              <Text style={s.problemLabel}>Herstellungs-CO₂ pro Laptop (Fraunhofer IZM 2023)</Text>
            </View>
            <Text style={s.small}>
              Nur ~20% des globalen E-Waste wird fachgerecht recycelt. Refurbishing ist die
              wirksamste Massnahme gegen diesen Trend.
            </Text>
          </View>
          <View style={s.col}>
            <Text style={s.h3}>Digitale & soziale Ausgrenzung</Text>
            <View style={[s.infoBox, { marginBottom: 10 }]}>
              <Text style={[s.p, s.bold]}>Gerätepreise bleiben hoch</Text>
              <Text style={s.p}>
                Neue Laptops kosten CHF 800–1500+. Für Menschen mit kleinen Budgets — Geflüchtete,
                Sozialhilfebeziehende, Auszubildende — ist das eine reale Teilhabe-Barriere.
              </Text>
            </View>
            <View style={[s.infoBox]}>
              <Text style={[s.p, s.bold]}>Arbeitsintegration braucht sinnvolle Tätigkeiten</Text>
              <Text style={s.p}>
                Automatisierung verdrängt Einstiegsjobs. IT-Refurbishing bietet strukturierte,
                sinnvolle und qualifizierende Arbeit.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <SlideFooter tenant={tenant} slide={2} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 3: Solution (Value Cascade)
// ---------------------------------------------------------------------------

function Slide3Solution({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <SlideHeader title="Unsere Lösung" sub="Die Wertschöpfungskaskade" />
      <View style={s.body}>
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Jedes Gerät durchläuft die Kaskade</Text>

            <View style={s.tier}>
              <View style={s.tierNum}>
                <Text style={s.tierNumText}>1</Text>
              </View>
              <View style={s.tierContent}>
                <Text style={s.tierName}>Vollständiges Refurbishing</Text>
                <Text style={s.tierDetail}>
                  Diagnose · SSD/RAM-Upgrade · Linux · 6 Monate Garantie
                </Text>
              </View>
              <Text style={s.tierRate}>~60%</Text>
            </View>

            <View style={[s.tier, { borderLeftColor: AMBER }]}>
              <View style={[s.tierNum, { backgroundColor: AMBER }]}>
                <Text style={s.tierNumText}>2</Text>
              </View>
              <View style={s.tierContent}>
                <Text style={s.tierName}>Ersatzteilgewinnung</Text>
                <Text style={s.tierDetail}>
                  Funktionierende Komponenten werden ins Teilelager aufgenommen
                </Text>
              </View>
              <Text style={[s.tierRate, { color: AMBER }]}>~25%</Text>
            </View>

            <View style={[s.tier, { borderLeftColor: COLORS.textMuted }]}>
              <View style={[s.tierNum, { backgroundColor: COLORS.textMuted }]}>
                <Text style={s.tierNumText}>3</Text>
              </View>
              <View style={s.tierContent}>
                <Text style={s.tierName}>Fachgerechtes Recycling</Text>
                <Text style={s.tierDetail}>
                  SWICO-zertifizierter Partner · Rohstoffrückgewinnung
                </Text>
              </View>
              <Text style={[s.tierRate, { color: COLORS.textMuted }]}>~15%</Text>
            </View>
          </View>

          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Was uns auszeichnet</Text>
            <Bullet>{`Linux-First: Alle Geräte mit Ubuntu/Mint — keine Lizenzkosten`}</Bullet>
            <Bullet>{`Solidarisches Preismodell: Wer mehr zahlen kann, zahlt mehr`}</Bullet>
            <Bullet>{`Datenvernichtung nach NIST 800-88 Standard`}</Bullet>
            <Bullet>{`Arbeitsintegration im Refurbishment-Prozess integriert`}</Bullet>
            <Bullet>{`100% gemeinnützig — Überschüsse fliessen in die Mission`}</Bullet>
            <View style={[s.infoBox, { marginTop: 12 }]}>
              <Text style={[s.p, s.bold]}>Ergebnis</Text>
              <Text style={s.p}>
                Über 85% aller Geräte werden wiederverwendet oder als Ersatzteile genutzt — nur ~15%
                landen im Recycling.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <SlideFooter tenant={tenant} slide={3} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 4: Impact Numbers
// ---------------------------------------------------------------------------

function Slide4Impact({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <SlideHeader
        title="Unsere Wirkung"
        sub={`Seit ${FINANCIAL_YEAR_START} — aus Kivitendo-Quelldaten`}
      />
      <View style={s.body}>
        <View style={[s.threeCol, { marginBottom: 16 }]}>
          <View style={s.metricBoxGreen}>
            <Text style={s.metricValueGreen}>
              ~{LAPTOPS_REFURBISHED_COUNT.toLocaleString('de-CH')}+
            </Text>
            <Text style={s.metricLabel}>Geräte refurbisht</Text>
            <Text
              style={s.metricSub}
            >{`seit ${FINANCIAL_YEAR_START}, geschätzt aus Umsatzdaten`}</Text>
          </View>
          <View style={s.metricBoxGreen}>
            <Text style={s.metricValueGreen}>~{CO2_TOTAL_TONNES} t</Text>
            <Text style={s.metricLabel}>CO₂ gespart (gesamt)</Text>
            <Text
              style={s.metricSub}
            >{`${CO2_PER_LAPTOP} kg pro Gerät · Fraunhofer IZM 2023`}</Text>
          </View>
          <View style={s.metricBoxGreen}>
            <Text style={s.metricValueGreen}>{75}%</Text>
            <Text style={s.metricLabel}>Reuse-Rate</Text>
            <Text style={s.metricSub}>Refurbishing + Ersatzteile</Text>
          </View>
        </View>

        <View style={s.threeCol}>
          <View style={s.metricBox}>
            <Text style={s.metricValue}>{'100+'}</Text>
            <Text style={s.metricLabel}>Menschen begleitet</Text>
            <Text
              style={s.metricSub}
            >{`Praktika & Integration seit ${tenant.milestones?.integrationProgram ?? tenant.founded}`}</Text>
          </View>
          <View style={s.metricBox}>
            <Text style={s.metricValue}>{String(tenant.yearsActive)}+</Text>
            <Text style={s.metricLabel}>Jahre Erfahrung</Text>
            <Text style={s.metricSub}>{`Kontinuierlicher Betrieb seit ${tenant.founded}`}</Text>
          </View>
          <View style={s.metricBoxAccent}>
            <Text style={s.metricValueAccent}>~{150}</Text>
            <Text style={s.metricLabel}>Geräte/Jahr (aktuell)</Text>
            <Text
              style={s.metricSub}
            >{`Kapazität ausbaubar auf ${DEVICES_PER_YEAR_TARGET}+/Jahr mit Hub`}</Text>
          </View>
        </View>

        <Text style={[s.small, { marginTop: 10 }]}>
          Alle Metriken mit Quellenangaben und Methodikdokumentation abrufbar unter{' '}
          {tenant.website ? `${tenant.website}/methodik` : '/methodik'}
        </Text>
      </View>
      <SlideFooter tenant={tenant} slide={4} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 5: Financial Overview
// ---------------------------------------------------------------------------

function Slide5Financials({ tenant }: { tenant: Tenant }) {
  const maxRevenue = Math.max(...COMPLETE_YEARS.map((y) => y.revenue));

  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <SlideHeader
        title={`Finanzielle Entwicklung ${FINANCIAL_YEAR_RANGE}`}
        sub="Ehrliche Ausgangslage"
      />
      <View style={s.body}>
        <View style={s.twoCol}>
          {/* Bar chart simulation */}
          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Einnahmen nach Jahr</Text>
            {COMPLETE_YEARS.map((yr) => (
              <View key={yr.year} style={s.barRow}>
                <Text style={s.barLabel}>{yr.year}</Text>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${Math.round((yr.revenue / maxRevenue) * 100)}%`,
                        backgroundColor: yr.year === PEAK_YEAR ? COLORS.accent : COLORS.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={s.barValue}>{pdfFormatCHF(yr.revenue)}</Text>
              </View>
            ))}
            <Text style={[s.small, { marginTop: 6 }]}>
              ★ = Rekordjahr {PEAK_YEAR} ({pdfFormatCHF(PEAK_REVENUE)})
            </Text>
          </View>

          {/* Context */}
          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 8 }]}>Warum jetzt Förderung?</Text>
            <View style={[s.problemBox, { marginBottom: 10 }]}>
              <Text style={[s.p, s.bold]}>{'Einnahmen um >50% gefallen'}</Text>
              <Text style={s.p}>
                {`Von ${pdfFormatCHF(PEAK_REVENUE)} (${PEAK_YEAR}) auf ${pdfFormatCHF(CURRENT_REVENUE)} (${CURRENT_YEAR}).`}{' '}
                Haupttreiber: Verlust von B2B-Hosting-Kunden.
              </Text>
            </View>
            <View style={s.infoBox}>
              <Text style={[s.p, s.bold]}>Stiftungsgelder = Diversifizierung</Text>
              <Text style={s.p}>
                Das aktuelle Modell ist abhängig von wenigen Grosskunden — und damit fragil.
                Förderung ermöglicht strukturelle Diversifizierung:
              </Text>
              <Bullet>Ausbau Geräteverkauf & Solidaritätspreise</Bullet>
              <Bullet>Bildungsprogramme als eigene Einnahmequelle</Bullet>
              <Bullet>Öffentliche Arbeitsintegrations-Mandate</Bullet>
            </View>
          </View>
        </View>
      </View>
      <SlideFooter tenant={tenant} slide={5} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 6: The Ask — Community Tech Hub
// ---------------------------------------------------------------------------

function Slide6TheAsk({ tenant, p1p3Count }: { tenant: Tenant; p1p3Count: number }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <SlideHeader title="Vision 2028: Community Tech Hub" sub="Was wir aufbauen" />
      <View style={s.body}>
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Der Hub ermöglicht</Text>
            <Bullet>Professionelle Refurbishment-Werkstatt (3× aktuelle Kapazität)</Bullet>
            <Bullet>{`~${DEVICES_PER_YEAR_TARGET} Geräte/Jahr statt heute ~${DEVICES_PER_YEAR_CURRENT}`}</Bullet>
            <Bullet>Bildungsräume: Linux-Kurse, Repair-Workshops, Hacking</Bullet>
            <Bullet>20–30 strukturierte Integrationsplätze/Jahr</Bullet>
            <Bullet>Community Events: Repair-Cafés, Tech-Talks, Ausstellungen</Bullet>

            <View style={[s.infoBox, { marginTop: 12 }]}>
              <Text style={[s.p, s.bold]}>Ziel-Finanzierungsmix 2028</Text>
              <Bullet>40% Gerätverkauf & Dienstleistungen</Bullet>
              <Bullet>25% Arbeitsintegrations-Mandate</Bullet>
              <Bullet>20% Stiftungsförderung</Bullet>
              <Bullet>15% Workshops, Events, Vermietung</Bullet>
            </View>
          </View>

          <View style={s.col}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Warum jetzt der richtige Zeitpunkt?</Text>
            <Bullet>{`${String(tenant.yearsActive)} Jahre Operational Track Record — kein Startup-Risiko`}</Bullet>
            <Bullet>Bestehende Partnerschaften (AOZ, Caritas, RAV, SWICO)</Bullet>
            <Bullet>Bewiesene Nachfrage: Geräte werden schnell verkauft</Bullet>
            <Bullet>Linux-Expertise & Community bereits aufgebaut</Bullet>
            <Bullet>Kreislaufwirtschaft im Zeitgeist — politischer Rückenwind</Bullet>

            <View style={[s.metricBox, { marginTop: 12 }]}>
              <Text style={s.metricValue}>{p1p3Count}</Text>
              <Text style={s.metricLabel}>Passende Stiftungen identifiziert</Text>
              <Text style={s.metricSub}>P1–P3 mit Fit-Score analysiert und bewertet</Text>
            </View>
          </View>
        </View>
      </View>
      <SlideFooter tenant={tenant} slide={6} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 7: Why Us / Track Record
// ---------------------------------------------------------------------------

function Slide7WhyUs({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      {/* Was a hardcoded question naming the reference tenant. Every tenant's
          slide 7 carried one organisation's name, in a deck sent to funders. */}
      <SlideHeader title={`Warum ${tenant.name}?`} sub="Track Record & Alleinstellungsmerkmale" />
      <View style={s.body}>
        <View style={s.threeCol}>
          <View style={s.thirdCol}>
            <Text style={[s.h3, { marginBottom: 8 }]}>Bewährter Betrieb</Text>
            <Bullet>{`Seit ${tenant.founded} operativ — ${String(tenant.yearsActive)} Jahre`}</Bullet>
            <Bullet>{`Über CHF ${Math.round(CUMULATIVE_WARENVERKAUF / 1000)}K Warenverkauf (Kivitendo-Buchhaltung)`}</Bullet>
            <Bullet>Kontinuierliche Lieferkette für Geräte etabliert</Bullet>
            <Bullet>Zertifizierte Datenvernichtung (NIST 800-88)</Bullet>
            <Bullet>SWICO-Recyclingpartnerschaft</Bullet>
          </View>
          <View style={s.thirdCol}>
            <Text style={[s.h3, { marginBottom: 8 }]}>Soziale Verankerung</Text>
            <Bullet>100+ Menschen in Praktika & Integration</Bullet>
            <Bullet>Zusammenarbeit mit AOZ, Caritas, RAV</Bullet>
            <Bullet>Solidarisches Preismodell (Pay-what-you-can)</Bullet>
            <Bullet>Niederschwelliger Zugang zu IT-Bildung</Bullet>
            <Bullet>Verwurzelung in der Zürcher Community</Bullet>
          </View>
          <View style={s.thirdCol}>
            <Text style={[s.h3, { marginBottom: 8 }]}>Technische Expertise</Text>
            <Bullet>{`Linux-Pioniere in der Schweiz seit ${tenant.founded}`}</Bullet>
            <Bullet>Vollständiger Qualitätsprozess (Diagnose → Garantie)</Bullet>
            <Bullet>Wärmeleitpaste, SSD/RAM-Upgrades aus eigenem Lager</Bullet>
            <Bullet>Stresstest & Akkumessung vor Verkauf</Bullet>
            <Bullet>Transparente Methodikdokumentation</Bullet>
          </View>
        </View>

        <View style={[s.infoBox, { marginTop: 14 }]}>
          <Text style={[s.p, s.bold]}>Gemeinnützigkeit & Transparenz</Text>
          <Text style={s.p}>
            {tenant.taxExemption ?? 'Gemeinnützig'}. Alle Finanzdaten und Wirkungszahlen mit
            Quellenangaben öffentlich einsehbar auf{' '}
            {tenant.website
              ? `${tenant.website}/finanzen und ${tenant.website}/wirkung`
              : '/finanzen und /wirkung'}{' '}
            — keine Blackboxes.
          </Text>
        </View>
      </View>
      <SlideFooter tenant={tenant} slide={7} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Slide 8: Contact
// ---------------------------------------------------------------------------

function Slide8Contact({ tenant }: { tenant: Tenant }) {
  return (
    <Page size="A4" orientation="landscape" style={s.slide}>
      <View style={[s.coverFull, { backgroundColor: COLORS.text }]}>
        <Text style={[s.coverOrg, { fontSize: 32, marginBottom: 8 }]}>
          Wir freuen uns auf das Gespräch
        </Text>
        <View style={s.coverDivider} />
        <Text style={[s.coverTagline, { marginBottom: 30 }]}>
          {tenant.name} · {tenant.legalForm}
        </Text>

        <View style={s.twoCol}>
          <View style={[s.col, { alignItems: 'flex-end', paddingRight: 20 }]}>
            <Text style={{ fontSize: 11, color: COLORS.bgBlue, marginBottom: 4 }}>
              {tenant.contactName ?? tenant.name}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.bgBlue, marginBottom: 2 }}>
              {tenant.email}
            </Text>
            {tenant.phone && (
              <Text style={{ fontSize: 10, color: COLORS.bgBlue }}>{tenant.phone}</Text>
            )}
          </View>
          <View
            style={[
              s.col,
              { borderLeftWidth: 1, borderLeftColor: COLORS.textMuted, paddingLeft: 20 },
            ]}
          >
            <Text style={{ fontSize: 10, color: COLORS.bgBlue, marginBottom: 2 }}>
              {tenant.address ?? ''}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.white, marginTop: 8 }}>
              {tenant.website ?? ''}
            </Text>
          </View>
        </View>

        <Text style={[s.coverMeta, { marginTop: 30, fontSize: 8 }]}>
          Alle Wirkungsdaten mit Quellenangaben:{' '}
          {tenant.website ? `${tenant.website}/methodik` : '/methodik'}
          {'  ·  '}Finanzdaten: {tenant.website ? `${tenant.website}/finanzen` : '/finanzen'}
        </Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function PitchDeckPDF({
  tenant,
  p1p3Count,
}: {
  /** Whose deck this is. Rendered outside any request, so it is passed in. */
  tenant: Tenant;
  p1p3Count: number;
}) {
  return (
    <Document
      title={`Pitch Deck ${CURRENT_YEAR} — ${tenant.name}`}
      author={tenant.name}
      subject="Präsentation für Stiftungen und Förderer"
      keywords="Pitch Deck, Refurbishing, Arbeitsintegration, Open Source, Kreislaufwirtschaft"
      // Carried the reference tenant's DEPLOYMENT slug in every tenant's PDF
      // metadata. The producer of the file is the platform; the subject is the
      // tenant.
      creator={`${tenant.name} — ${PLATFORM_BRAND.name}`}
    >
      <Slide1Cover tenant={tenant} />
      <Slide2Problem tenant={tenant} />
      <Slide3Solution tenant={tenant} />
      <Slide4Impact tenant={tenant} />
      <Slide5Financials tenant={tenant} />
      <Slide6TheAsk tenant={tenant} p1p3Count={p1p3Count} />
      <Slide7WhyUs tenant={tenant} />
      <Slide8Contact tenant={tenant} />
    </Document>
  );
}
