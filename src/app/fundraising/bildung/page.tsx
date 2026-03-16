import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import { TEAM_MEMBERS } from '@/app/team/data';
import {
  BILDUNGSPROGRAMMLEITER,
  MULTIPLICATION_EFFECT,
  TEAM_SALARIES,
} from '@/lib/config/team';
import {
  BPL_HARDWARE_PER_YEAR_DISPLAY,
  BPL_SOFTWARE_PER_YEAR_DISPLAY,
  PEOPLE_REACHED_PER_YEAR,
} from '@/lib/config/projections';
import { formatNumber } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'Bildungsprogramm — Train-the-Trainer',
  description: `2× Bildungsprogrammleiter:innen ermöglichen Train-the-Trainer und erreichen ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr`,
};

export default function BildungPage() {
  return (
    <>
      <PageHeader
        title="Bildungsprogramm"
        subtitle={`Train-the-Trainer: 2× Bildungsprogrammleiter:innen, ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreichen`}
        badge="Bildung"
      />

      <WhyThisMatters
        purpose={`Das Bildungsprogramm zeigt, wie wir durch strukturiertes Train-the-Trainer ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreichen — ohne das ganze Team zu vervielfachen.`}
        connection="Kombiniert mit dem Hub (Infrastruktur) skalieren wir sowohl Geräte-Kapazität als auch Bildungswirkung."
      />

      {/* Problem: Current Bottleneck */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Das Problem: Soziale Reichweite ist begrenzt</h2>
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0" aria-hidden="true">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Aktueller Engpass</h3>
              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  <strong>{TEAM_MEMBERS.length} Personen im Team</strong> (Leitung, Techniker, Betrieb) — aber nur 3 in der Leitung (Vero, Dani, Andreas), keine dedizierte Bildungskapazität
                </p>
                <p>
                  <strong>Aktuelle Reichweite:</strong> ~5 Menschen/Jahr direkt trainiert (Schätzung, nicht systematisch erfasst)
                </p>
                <p>
                  <strong>Was fehlt:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dedizierte Bildungsprogrammleiter:innen für systematisches Training</li>
                  <li>Train-the-Trainer Ansatz: Trainer:innen ausbilden statt nur direkt trainieren</li>
                  <li>Strukturierte Curricula für Hardware- und Software-/AI-Bildung</li>
                  <li>Skalierbare Kapazität: Von informellem Training zu {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Vision: Train-the-Trainer */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Lösung: Train-the-Trainer</h2>
        <div className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 p-8 text-white mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">{PEOPLE_REACHED_PER_YEAR}</div>
            <div className="text-xl opacity-90">
              Menschen/Jahr direkt erreicht durch strukturiertes Training + Workshops
            </div>
          </div>
          <p className="text-lg mb-4 leading-relaxed text-center max-w-3xl mx-auto">
            Unsere <strong>2× Bildungsprogrammleiter:innen</strong> bilden Techniker und Entwickler aus
            und führen Workshops durch. Strukturiertes Training statt informellem Wissenstransfer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
              <div className="text-3xl font-bold">2 VZÄ</div>
              <div className="text-sm opacity-90">Bildungsprogrammleiter:innen</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
              <div className="text-3xl font-bold">18</div>
              <div className="text-sm opacity-90">Direkt trainiert/Jahr</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
              <div className="text-3xl font-bold">{PEOPLE_REACHED_PER_YEAR}</div>
              <div className="text-sm opacity-90">Mit Workshops erreicht/Jahr</div>
            </div>
          </div>
        </div>
      </section>

      {/* Die 2 Rollen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Zwei Bildungsprogrammleiter:innen — Zwei Fokusgebiete</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {BILDUNGSPROGRAMMLEITER.map((bpl) => (
            <Card key={bpl.name} className="border-l-4 border-l-violet-500">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl flex-shrink-0">
                  {bpl.name.includes('Hardware') ? '🔧' : '💻'}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-grey-dark mb-1">{bpl.role}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info">{bpl.vza} VZÄ</Badge>
                    <Badge variant={bpl.status === 'aktiv' ? 'success' : 'warning'}>
                      {bpl.status === 'aktiv' ? 'Aktiv' : 'Geplant'}
                    </Badge>
                    <Badge variant="default">{bpl.bereich}</Badge>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-grey-dark mb-2">Fachgebiete:</h4>
                <div className="flex flex-wrap gap-2">
                  {bpl.fachgebiete?.map((fg) => (
                    <Badge key={fg} variant="outline" className="text-xs">
                      {fg}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-violet-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-violet-900 mb-2">
                  Multiplikationseffekt:
                </h4>
                {bpl.name.includes('Hardware') ? (
                  <div className="text-sm text-violet-800 space-y-1">
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.hardware_bpl.direct_training} Techniker/Jahr</strong> direkt trainiert
                    </p>
                    <p>
                      Strukturierte Refurbishment-Ausbildung mit Curricula und Qualitätssicherung
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-violet-800 space-y-1">
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.software_bpl.direct_training} Menschen/Jahr</strong> direkt trainiert
                    </p>
                    <p>
                      AI Literacy, Coding, Open-Source-Workshops für verschiedene Niveaus
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Wie funktioniert Train-the-Trainer? */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wie funktioniert Train-the-Trainer?</h2>
        <Card>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Transparenz-Hinweis:</strong> Train-the-Trainer ist ein etabliertes Konzept in Bildung und Capacity Building
              (z.B. WHO, viele NGOs nutzen diesen Ansatz).
            </p>
            <p className="text-sm text-blue-900">
              Die spezifischen Zahlen unten ({BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr, etc.) sind <strong>Projektionen</strong>
              basierend auf unserer informellen Erfahrung und Schätzungen. <strong>Nicht empirisch gemessen.</strong>
              Wir werden diese ab 2026 systematisch erfassen (Data-Strategie).
            </p>
          </div>
          <div className="space-y-6">
            {/* Stufe 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-900 font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">
                  Bildungsprogrammleiter:innen trainieren Trainer:innen
                </h3>
                <p className="text-sm text-text-light mb-3">
                  Hardware-BPL bildet <strong>{BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr</strong> aus. Software/AI-BPL trainiert <strong>{BPL_SOFTWARE_PER_YEAR_DISPLAY} Entwickler/Jahr</strong>.
                  Total: <strong>18 Menschen/Jahr direkt</strong> (vs. 5 heute).
                </p>
                <div className="bg-violet-50 rounded-lg p-3 text-sm text-violet-800">
                  <strong>Beispiel Hardware:</strong> Ein:e Teilnehmer:in lernt nicht nur Laptop-Reparatur, sondern auch,
                  wie man dieses Wissen weitervermittelt (Didaktik, Curricula, Praxisanleitung).
                </div>
              </div>
            </div>

            {/* Stufe 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-violet-900 font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">
                  Trainer:innen trainieren andere
                </h3>
                <p className="text-sm text-text-light mb-3">
                  Hardware: <strong>5 gleichzeitig aktive Techniker</strong> → je 10 Menschen/Jahr = <strong>50 indirekt</strong>.
                  Software/AI: <strong>3 AI-Literacy-Trainer</strong> → je ~13 Menschen/Jahr = <strong>40 indirekt</strong>.
                </p>
                <div className="bg-violet-50 rounded-lg p-3 text-sm text-violet-800">
                  <strong>Beispiel Software:</strong> Ein:e trainierte Entwickler:in gibt AI-Literacy-Workshops in Asylorganisationen,
                  Bibliotheken oder Schulen → erreicht 40+ Menschen/Jahr ohne dass wir direkt involviert sind.
                </div>
              </div>
            </div>

            {/* Stufe 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-300 flex items-center justify-center text-violet-900 font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">
                  Community-Effekte & Workshops
                </h3>
                <p className="text-sm text-text-light mb-3">
                  Zusätzlich zu direktem und indirektem Training: <strong>Workshops, Events, Repair Cafés</strong> im Hub erreichen weitere 50-80 Menschen/Jahr.
                </p>
                <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800">
                  <strong>Gesamt-Reichweite (konservativ):</strong> 18 (direkt trainiert) + 20-40 (Workshop-Teilnehmer) = <strong>{PEOPLE_REACHED_PER_YEAR} Menschen/Jahr</strong>.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Budget */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Budget: Was kostet das?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-grey-dark mb-4">Personalkosten (pro Jahr)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-sm text-text-light">Hardware-BPL (1 VZÄ)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {formatNumber(TEAM_SALARIES.hardware_bpl)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-sm text-text-light">Software/AI-BPL (1 VZÄ)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {formatNumber(TEAM_SALARIES.software_bpl)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-sm text-text-light">Sozialabgaben (20%)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {formatNumber((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * 0.2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 bg-blue-50 rounded-lg p-3">
                <span className="text-md font-bold text-blue-900">Total pro Jahr</span>
                <span className="text-xl font-bold text-blue-900">
                  CHF {formatNumber((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">Return on Investment</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Investition pro direkt Trainierter</div>
                <div className="text-2xl font-bold text-emerald-900">
                  CHF {formatNumber(Math.round(((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier) / MULTIPLICATION_EFFECT.combined.direct_training))}
                </div>
                <div className="text-xs text-emerald-700">pro direkt trainierter Person/Jahr</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Menschen erreicht (konservativ)</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops}
                </div>
                <div className="text-xs text-emerald-700">Menschen/Jahr (direkt + Workshops)</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Finanzierungsziel</div>
                <div className="text-2xl font-bold text-emerald-900">3 Jahre</div>
                <div className="text-xs text-emerald-700">CHF {formatNumber((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier)}/Jahr bis Selbsttragung</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Finanzierungsstrategie */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Finanzierungsstrategie: 3 Jahre bis Selbsttragung</h2>
        <Card>
          <p className="text-sm text-text-light mb-6">
            Wir suchen <strong>Stiftungsfinanzierung über 3 Jahre</strong> (CHF {formatNumber((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier)}/Jahr, degressiv),
            um die Bildungsprogrammleiter:innen-Stellen zu finanzieren, während wir parallel Einnahmequellen aufbauen.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">Jahr 1</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Aufbau & Pilotphase</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Hardware-BPL eingestellt, Curricula entwickelt, erste Trainings</li>
                  <li>Erste trainierte Techniker werden aktiv (2-3 Trainer:innen)</li>
                  <li>Finanzierung: 100% Stiftungsgelder (1× BPL: CHF {formatNumber(TEAM_SALARIES.hardware_bpl * TEAM_SALARIES.social_charges_multiplier)} inkl. Sozialabgaben)</li>
                  <li>Einnahmen: Workshop-Fees beginnen (CHF 5-10k, nicht ausreichend für Selbsttragung)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">Jahr 2</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Skalierung & zweite:r BPL</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Software/AI-BPL eingestellt, beide Programme laufen parallel</li>
                  <li>5 Hardware-Techniker + 3 AI-Trainer gleichzeitig aktiv</li>
                  <li>Finanzierung: degressiv (Stiftungsgelder sinken, Eigenmittel durch Kurseinnahmen steigen)</li>
                  <li>Einnahmen: Corporate Trainings, Workshop-Fees (CHF 30-40k/Jahr)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="success" className="mt-1">Jahr 3 (Ziel)</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Selbsttragung erreicht</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Train-the-Trainer voll etabliert, {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreicht</li>
                  <li>Trainer:innen trainieren ohne unsere direkte Beteiligung</li>
                  <li>Finanzierung: 50% Stiftungsgelder, 50% Eigenmittel (Workshop-Fees, Corporate Training)</li>
                  <li>Einnahmen: Corporate Trainings, Workshops, Zuschüsse (CHF 80-100k/Jahr)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Warum beide zusammen? */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Warum Hub + Bildung zusammen?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-amber-500">
            <h3 className="text-lg font-semibold text-grey-dark mb-3">❌ Bildung ohne Hub = Begrenzte Kapazität</h3>
            <p className="text-sm text-text-light mb-4">
              Ohne grösseren Raum fehlen Werkstattplätze, Schulungsräume und Equipment für mehr Teilnehmende.
              Trainings bleiben theoretisch, weil die Praxis-Infrastruktur fehlt.
            </p>
            <Badge variant="warning">Limitiert durch Raumkapazität</Badge>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3">✅ Hub + Bildung = Exponentielles Wachstum</h3>
            <p className="text-sm text-emerald-900 mb-4">
              Hub bietet <strong>Infrastruktur</strong> (Werkstatt, Schulungsräume, Equipment).
              Bildungsprogrammleiter:innen bieten <strong>Know-how-Multiplikation</strong> (Train-the-Trainer).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-900">480</div>
                <div className="text-xs text-emerald-700">Geräte/Jahr (Hub)</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-900">{PEOPLE_REACHED_PER_YEAR}</div>
                <div className="text-xs text-emerald-700">Menschen/Jahr (Bildung)</div>
              </div>
            </div>
            <Badge variant="success">Beide Dimensionen skalieren</Badge>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Unterstütze das Bildungsprogramm</h3>
          <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
            Mit <strong>CHF {formatNumber((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier)}/Jahr über 3 Jahre</strong> (degressiv finanziert) schaffen wir ein selbsttragendes Train-the-Trainer-Programm,
            das {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreicht.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/fundraising"
              className="rounded-lg bg-white px-8 py-4 font-bold text-grey-dark shadow-lg transition-colors hover:bg-bg-light"
            >
              📊 Fundraising-Übersicht
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="rounded-lg border-2 border-white bg-grey-dark px-8 py-4 font-bold text-white transition-colors hover:bg-grey-dark/85"
            >
              🏛️ Passende Stiftungen finden
            </Link>
            <Link
              href="/strategie-2030"
              className="rounded-lg border-2 border-white bg-grey-dark px-8 py-4 font-bold text-white transition-colors hover:bg-grey-dark/85"
            >
              🚀 Gesamtstrategie 2030
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
