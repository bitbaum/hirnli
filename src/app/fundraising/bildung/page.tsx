import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import {
  BILDUNGSPROGRAMMLEITER,
  MULTIPLICATION_EFFECT,
  TEAM_CAPACITY,
  TEAM_SALARIES,
} from '@/lib/config/team';

export const metadata: Metadata = {
  title: 'Bildungsprogramm — Train-the-Trainer',
  description: '2× Bildungsprogrammleiter:innen schaffen 32× Social Impact durch Multiplikationseffekt',
};

export default function BildungPage() {
  return (
    <>
      <PageHeader
        title="Bildungsprogramm"
        subtitle="Train-the-Trainer: 2× Menschen bezahlen, 160+ Menschen/Jahr erreichen"
        badge="Bildung"
      />

      <WhyThisMatters
        purpose="Das Bildungsprogramm zeigt, wie wir von 5 Menschen/Jahr auf 160+ Menschen/Jahr skalieren — ohne das ganze Team zu vervielfachen."
        connection="Kombiniert mit dem Hub (Infrastruktur) ergibt sich exponentielles Wachstum: 6× Geräte + 32× Menschen."
      />

      {/* Problem: Current Bottleneck */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Das Problem: Soziale Reichweite ist begrenzt</h2>
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Aktueller Engpass</h3>
              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  <strong>3 VZÄ Kernteam:</strong> Vero (Geschäftsleitung), Dani (Operations), Andreas (Strategie)
                </p>
                <p>
                  <strong>Aktuelle Reichweite:</strong> ~5 Menschen/Jahr direkt trainiert (Schätzung, nicht systematisch erfasst)
                </p>
                <p>
                  <strong>Was fehlt:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dedizierte Bildungsprogrammleiter:innen für systematisches Training</li>
                  <li>Train-the-Trainer Ansatz: Traineren ausbilden statt nur direkt trainieren</li>
                  <li>Strukturierte Curricula für Hardware- und Software-/AI-Bildung</li>
                  <li>Skalierbare Kapazität: Aus 5 Menschen/Jahr werden 160+ Menschen/Jahr</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Vision: Train-the-Trainer */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Lösung: Train-the-Trainer Multiplikationseffekt</h2>
        <div className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 p-8 text-white mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">32×</div>
            <div className="text-xl opacity-90">
              Social Impact Multiplier: Von 5 Menschen/Jahr auf 160+ Menschen/Jahr
            </div>
          </div>
          <p className="text-lg mb-4 leading-relaxed text-center max-w-3xl mx-auto">
            Statt selbst zu trainieren, bilden unsere <strong>2× Bildungsprogrammleiter:innen</strong> Traineren aus,
            die wiederum andere trainieren. Exponentielles Wachstum durch systematisches Train-the-Trainer.
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
              <div className="text-3xl font-bold">160+</div>
              <div className="text-sm opacity-90">Total erreicht/Jahr (inkl. indirekt)</div>
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
                      <strong>{MULTIPLICATION_EFFECT.hardware_bpl.trained_technicians_active} gleichzeitig aktiv</strong> als Traineren
                    </p>
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.hardware_bpl.indirect_reach} Menschen/Jahr</strong> indirekt erreicht
                    </p>
                    <p className="pt-2 border-t border-violet-300">
                      <strong>Total: {MULTIPLICATION_EFFECT.hardware_bpl.total_reach} Menschen/Jahr</strong>
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-violet-800 space-y-1">
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.software_bpl.direct_training} Menschen/Jahr</strong> direkt trainiert
                    </p>
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.software_bpl.ai_literacy_trainers} Trainer</strong> ausgebildet (AI Literacy)
                    </p>
                    <p>
                      <strong>{MULTIPLICATION_EFFECT.software_bpl.indirect_reach} Menschen/Jahr</strong> indirekt erreicht
                    </p>
                    <p className="pt-2 border-t border-violet-300">
                      <strong>Total: {MULTIPLICATION_EFFECT.software_bpl.total_reach} Menschen/Jahr</strong>
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
          <div className="space-y-6">
            {/* Stufe 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-900 font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">
                  Bildungsprogrammleiter:innen trainieren Traineren
                </h3>
                <p className="text-sm text-text-light mb-3">
                  Hardware-BPL bildet <strong>10 Techniker/Jahr</strong> aus. Software/AI-BPL trainiert <strong>8 Entwickler/Jahr</strong>.
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
                  Traineren trainieren andere
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
                  <strong>Gesamt-Reichweite:</strong> 18 (direkt) + 90 (indirekt) + 50-80 (Workshops) = <strong>160+ Menschen/Jahr</strong> (32× mehr als heute).
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
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-text-light">Hardware-BPL (1 VZÄ)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {TEAM_SALARIES.hardware_bpl.toLocaleString('de-CH')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-text-light">Software/AI-BPL (1 VZÄ)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {TEAM_SALARIES.software_bpl.toLocaleString('de-CH')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-text-light">Sozialabgaben (20%)</span>
                <span className="text-md font-semibold text-grey-dark">
                  CHF {((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * 0.2).toLocaleString('de-CH')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 bg-blue-50 rounded-lg p-3">
                <span className="text-md font-bold text-blue-900">Total pro Jahr</span>
                <span className="text-xl font-bold text-blue-900">
                  CHF {((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier).toLocaleString('de-CH')}
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">Return on Investment</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Investition pro Kopf</div>
                <div className="text-2xl font-bold text-emerald-900">
                  CHF {Math.round(((TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) * TEAM_SALARIES.social_charges_multiplier) / MULTIPLICATION_EFFECT.combined.total_people_reached).toLocaleString('de-CH')}
                </div>
                <div className="text-xs text-emerald-700">pro erreichter Person/Jahr</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Social Impact Multiplier</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {MULTIPLICATION_EFFECT.combined.social_impact_multiplier}×
                </div>
                <div className="text-xs text-emerald-700">von 5 auf 160 Menschen/Jahr</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-emerald-700 mb-1">Finanzierungsziel</div>
                <div className="text-2xl font-bold text-emerald-900">3 Jahre</div>
                <div className="text-xs text-emerald-700">CHF 525k bis Selbsttragung</div>
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
            Wir suchen <strong>CHF 525k Stiftungsfinanzierung über 3 Jahre</strong> (CHF 175k/Jahr),
            um die Bildungsprogrammleiter:innen-Stellen zu finanzieren, während wir parallel Einnahmequellen aufbauen.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">Jahr 1</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Aufbau & Pilotphase</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Hardware-BPL eingestellt, Curricula entwickelt, erste Trainings</li>
                  <li>Erste trainierte Techniker werden aktiv (2-3 Traineren)</li>
                  <li>Finanzierung: 100% Stiftungsgelder (CHF 85k + Sozialabgaben)</li>
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
                  <li>Finanzierung: 80% Stiftungsgelder (CHF 140k), 20% Eigenmittel (CHF 35k)</li>
                  <li>Einnahmen: Corporate Trainings, Workshop-Fees (CHF 30-40k/Jahr)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="success" className="mt-1">Jahr 3</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Selbsttragung erreicht</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Train-the-Trainer voll etabliert, 160+ Menschen/Jahr erreicht</li>
                  <li>Traineren trainieren ohne unsere direkte Beteiligung</li>
                  <li>Finanzierung: 50% Stiftungsgelder (CHF 87.5k), 50% Eigenmittel (CHF 87.5k)</li>
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
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-900">6×</div>
                <div className="text-xs text-emerald-700">Geräte (Hub)</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-900">32×</div>
                <div className="text-xs text-emerald-700">Menschen (Bildung)</div>
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
            Mit <strong>CHF 175k/Jahr über 3 Jahre</strong> schaffen wir ein selbsttragendes Train-the-Trainer-Programm,
            das 160+ Menschen/Jahr erreicht — 32× mehr als heute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-8 py-4 bg-white text-violet-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              📊 Fundraising-Übersicht
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-8 py-4 bg-violet-700 text-white font-bold rounded-lg hover:bg-violet-800 transition-colors duration-200 border-2 border-white"
            >
              🏛️ Passende Stiftungen finden
            </Link>
            <Link
              href="/strategie-2030"
              className="px-8 py-4 bg-violet-700 text-white font-bold rounded-lg hover:bg-violet-800 transition-colors duration-200 border-2 border-white"
            >
              🚀 Gesamtstrategie 2030
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
