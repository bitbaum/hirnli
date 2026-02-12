import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { NumberWithSource } from '@/components/data/NumberWithSource';
import { CommunitySpaceCard } from '@/app/strategie/components';

export const metadata: Metadata = {
  title: 'Community Tech Hub',
  description: '1000m² Hub für Kreislaufwirtschaft, Tech-Bildung und digitale Souveränität',
};

export default function HubPage() {
  return (
    <>
      <PageHeader
        title="Community Tech Hub"
        subtitle="250m² → 1000m²: Vom Käsekeller zum Tech-Leuchtturm"
        badge="Hub"
      />

      {/* ========== PROBLEM: Current Constraints ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Das Problem: Räumliche Grenzen</h2>
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Aktueller Engpass</h3>
              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  <strong>250m² verteilt auf 2 Standorte:</strong> Laden (120m²) + Lager (130m²)
                </p>
                <p>
                  <strong>Kapazität:</strong> Maximal 30-35 Geräte/Monat mit aktuellem Setup
                </p>
                <p>
                  <strong>Was fehlt:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Professionelle Werkstatt mit Testinfrastruktur</li>
                  <li>AI Lab für Diagnostik & Software-Entwicklung</li>
                  <li>Schulungsräume für Workshops & Ausbildung</li>
                  <li>Event Space für Community & Partnerships</li>
                  <li>Zentrale Lage mit guter Erreichbarkeit</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ========== VISION: 1000m² Hub ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Vision: 1000m² Community Tech Hub</h2>
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              <NumberWithSource numberKey="HUB_SPACE_TOTAL" size="xl" showLabel={false} />
            </div>
            <div className="text-xl opacity-90">Gesamt-Hub: Werkstatt + AI Lab + Event Space + Shop + Offices</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">4×</div>
              <div className="text-sm opacity-90">Raum-Multiplikator</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">180</div>
              <div className="text-sm opacity-90">Geräte/Monat (Ziel Jahr 3)</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">150-200</div>
              <div className="text-sm opacity-90">Menschen/Jahr trainiert</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== RÄUME: Space Breakdown ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Räume: Was entsteht im Hub</h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Werkstatt */}
          <CommunitySpaceCard
            icon="🔧"
            title="Professionelle Refurbishment-Werkstatt"
            tagline="600m² — Das Herzstück"
            description="Hochmoderne Werkstatt mit Testinfrastruktur, Diagnose-Tools und Prozesslinien für effizientes Refurbishment."
            type="core"
            activities={[
              'Intake & Triage Station (2× Arbeitsplätze)',
              'Data Wipe & Security Zone (4× Workstations)',
              'Repair & Refurbishment Linien (6× Arbeitsplätze)',
              'Quality Assurance Lab (Automated Testing)',
              'Komponenten-Lager & Werkzeug-Bibliothek',
            ]}
            capacity="6× parallele Prozesslinien, 150-200 Geräte/Monat"
            targetAudience="Techniker, Praktikanten, Reintegrations-Programme"
            sdgs={['SDG 12: Responsible Consumption', 'SDG 8: Decent Work']}
            estimatedCost="CHF 180'000 (Einrichtung + Erstjahr)"
          />

          {/* AI Lab */}
          <CommunitySpaceCard
            icon="🤖"
            title="AI Lab & Software-Entwicklung"
            tagline="150m² — Innovation Hub"
            description="Raum für AI-gestützte Diagnostik, Open-Source Entwicklung und digitale Souveränität."
            type="core"
            activities={[
              'AI-Diagnostik: Automatisierte Hardware-Tests',
              'Software-Entwicklung: Linux, FOSS, Tools',
              'AI-Literacy Workshops für Community',
              'Entwickler-Arbeitsplätze (Hot-Desking)',
            ]}
            capacity="10-12 Entwickler gleichzeitig, 8-10 trainiert/Jahr"
            targetAudience="Software-Entwickler, AI-Interessierte, Open-Source Contributors"
            sdgs={['SDG 9: Innovation', 'SDG 4: Quality Education']}
            estimatedCost="CHF 90'000 (Einrichtung + Erstjahr)"
          />

          {/* Event Space */}
          <CommunitySpaceCard
            icon="🎭"
            title="Event Space & Kulturraum"
            tagline="100m² — Community Treffpunkt"
            description="Mehrzweckraum für Workshops, Events, Ausstellungen und Community-Aktivitäten."
            type="core"
            activities={[
              'Tech-Workshops & Repair Cafés',
              'Corporate Offsites & Team-Buildings',
              'Ausstellungen (Circular Economy, Tech-Geschichte)',
              'Community Events & Meetups',
            ]}
            capacity="50 Personen (Event-Modus), 20 Personen (Workshop-Modus)"
            targetAudience="Öffentlichkeit, Unternehmen, Schulen, Community"
            sdgs={['SDG 11: Sustainable Cities', 'SDG 17: Partnerships']}
            estimatedCost="CHF 50'000 (Einrichtung + Erstjahr)"
          />

          {/* Shop */}
          <CommunitySpaceCard
            icon="🏪"
            title="Shop & Kundenbereich"
            tagline="50m² — Verkauf & Service"
            description="Verkaufsfläche für refurbished Geräte, Reparatur-Annahme und Kundenberatung."
            type="core"
            activities={[
              'Verkauf refurbished IT-Geräte',
              'Reparatur-Annahme & Beratung',
              'Pickup Point für Online-Bestellungen',
            ]}
            capacity="3-4 Kunden gleichzeitig"
            targetAudience="Privatkunden, KulturLegi-Inhaber, Organisationen"
            estimatedCost="CHF 25'000 (Einrichtung + Erstjahr)"
          />

          {/* Offices */}
          <CommunitySpaceCard
            icon="💼"
            title="Offices & Sozialräume"
            tagline="100m² — Team & Verwaltung"
            description="Büros für Geschäftsleitung, Koordination, Meetings plus Aufenthaltsraum für Team."
            type="core"
            activities={[
              'Geschäftsleitung & Koordination (3 Büros)',
              'Meeting-Raum',
              'Pausenraum & Küche',
              'Storage für Admin & Dokumente',
            ]}
            capacity="5-9 FTE Team"
            targetAudience="Kernteam, Bildungsprogrammleiter"
            estimatedCost="CHF 40'000 (Einrichtung + Erstjahr)"
          />
        </div>
      </section>

      {/* ========== TEAM: Who Works Here ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Das Team: Wer arbeitet im Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-grey-dark mb-3 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Kernteam (3 FTE)
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Vero:</strong> Geschäftsleitung & Koordination</div>
              <div><strong>Dani:</strong> Operations & Refurbishment</div>
              <div><strong>Andreas:</strong> Strategie & Entwicklung</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <h3 className="text-lg font-bold text-grey-dark mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Bildungsprogrammleiter (2 FTE)
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Hardware-BPL:</strong> Techniker ausbilden (8-12/Jahr)</div>
              <div><strong>Software/AI-BPL:</strong> Entwickler trainieren (6-10/Jahr)</div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <strong>Multiplikator:</strong> Train-the-Trainer → 1:100 Ratio
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== PLAN: Timeline ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Der Plan: Meilensteine</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Milestones */}
          <div className="space-y-6 relative">
            {[
              { year: '2026 (Jahr 1)', title: 'Fundraising & Planung', items: ['Stiftungsgesuche eingereicht', 'Standortsuche & Verhandlungen', 'Team-Rekrutierung (2× BPL)', 'Detailplanung Infrastruktur'] },
              { year: '2027 (Jahr 2)', title: 'Aufbau & Einrichtung', items: ['Hub-Eröffnung Q2/Q3', 'Werkstatt-Einrichtung', 'AI Lab Setup', 'Team-Onboarding & Training'] },
              { year: '2028 (Jahr 3)', title: 'Vollbetrieb', items: ['150-200 Geräte/Monat', '150-200 Menschen/Jahr trainiert', 'CHF 290k Revenue', 'Reduktion Stiftungsgelder -44%'] },
            ].map((milestone, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 relative z-10">
                  {idx + 1}
                </div>
                <Card className="flex-1">
                  <div className="font-bold text-blue-900 mb-1">{milestone.year}</div>
                  <div className="text-lg font-semibold text-grey-dark mb-2">{milestone.title}</div>
                  <ul className="space-y-1 text-sm text-text-light">
                    {milestone.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== KOSTEN: Investment Breakdown ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Kosten: Investment-Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-lg font-bold text-grey-dark mb-4">Einmalige Investitionen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Werkstatt-Einrichtung</span>
                <span className="font-semibold">CHF 180'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>AI Lab Setup</span>
                <span className="font-semibold">CHF 90'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Event Space</span>
                <span className="font-semibold">CHF 50'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Shop & Offices</span>
                <span className="font-semibold">CHF 65'000</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-blue-900">
                <span>Total Einmalig</span>
                <span>CHF 385'000</span>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <h3 className="text-lg font-bold text-grey-dark mb-4">Jährliche Betriebskosten (Jahr 1)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Miete 1000m² (CHF 300/m²)</span>
                <span className="font-semibold">CHF 300'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Nebenkosten (Strom, etc.)</span>
                <span className="font-semibold">CHF 50'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Versicherungen</span>
                <span className="font-semibold">CHF 15'000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span>Instandhaltung</span>
                <span className="font-semibold">CHF 20'000</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-violet-900">
                <span>Total Jährlich</span>
                <span>CHF 385'000</span>
              </div>
            </div>
          </Card>
        </div>
        <div className="mt-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 p-4 text-sm">
          <strong>Hinweis:</strong> Personalkosten (CHF 475k/Jahr) kommen zusätzlich.
          Total Jahr 1: CHF 385k (Einmalig) + CHF 385k (Miete/Betrieb) + CHF 475k (Personal) = <strong>CHF 1'245k</strong>.
          Ab Jahr 2 reduziert sich auf CHF 860k/Jahr (ohne Einmalig-Investitionen).
        </div>
      </section>

      {/* ========== WIRKUNG: Impact Projections ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Wirkung: Erwarteter Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-l-4 border-l-emerald-500">
            <div className="text-4xl mb-2">🌱</div>
            <div className="text-3xl font-bold text-emerald-900">2'160</div>
            <div className="text-sm text-emerald-700 mb-2">Geräte/Jahr (Jahr 3)</div>
            <div className="text-xs text-gray-600">
              6× mehr als heute<br />
              ~615 Tonnen CO₂ gespart/Jahr
            </div>
          </Card>

          <Card className="text-center border-l-4 border-l-blue-500">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-blue-900">150-200</div>
            <div className="text-sm text-blue-700 mb-2">Menschen/Jahr trainiert</div>
            <div className="text-xs text-gray-600">
              32× mehr als heute<br />
              Train-the-Trainer Multiplikator
            </div>
          </Card>

          <Card className="text-center border-l-4 border-l-violet-500">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-violet-900">CHF 290k</div>
            <div className="text-sm text-violet-700 mb-2">Revenue Jahr 3</div>
            <div className="text-xs text-gray-600">
              3.6× Wachstum<br />
              Selbsttragend (Operations)
            </div>
          </Card>
        </div>
      </section>

      {/* ========== CTA: Next Steps ========== */}
      <section className="mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Bereit, Teil dieser Vision zu werden?</h2>
            <p className="text-blue-800 mb-6">
              Wir suchen Stiftungen und Partner, die Kreislaufwirtschaft, Tech-Bildung und digitale Souveränität ermöglichen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/fundraising/stiftungen"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Stiftungsliste ansehen
              </Link>
              <Link
                href="/fundraising/gesuch-vorlagen"
                className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Gesuch-Vorlagen
              </Link>
              <Link
                href="/team"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                Team & Menschen kennenlernen
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
