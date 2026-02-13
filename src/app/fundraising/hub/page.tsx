import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CommunitySpaceCard } from '@/app/strategie/components';

export const metadata: Metadata = {
  title: 'Revamp Hub — Community Tech Space',
  description: 'Werkstatt, Kultur, Innovation: Wo Nachhaltigkeit, Technologie und Gemeinschaft zusammenkommen',
};

export default function HubPage() {
  return (
    <>
      <PageHeader
        title="Revamp Hub"
        subtitle="Mehr als eine Werkstatt: Ein Ort, wo Technologie, Kultur und Gemeinschaft zusammenkommen"
        badge="Hub"
      />

      {/* Vision */}
      <section className="mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-grey-dark">Der Revamp Hub: Prozesse professionalisieren, Menschen befähigen</h2>
          <p className="text-base text-text-light mb-4 leading-relaxed">
            <strong>Das Kernproblem heute:</strong> Nicht fehlende Fläche, sondern fehlende Organisation.
            Wir haben zu viel Inventar in 2 Lagern, aber keine effizienten Verkaufs- und Refurbishment-Prozesse.
            4 Reparaturtische vorhanden, meist nur 1-2 in Nutzung. Unstrukturierte Workflows.
          </p>
          <p className="text-base text-text-light mb-6 leading-relaxed">
            <strong>Die Lösung:</strong> ~500-600 m² effizienter, gut organisierter Raum. Nicht endlos Platz —
            sondern <strong>strukturierte Prozesse</strong> mit 2 Bildungsprogrammleitern + sozialpädagogischer Begleitung (Veronica).
            Plus: Tech-Bildung, AI Lab, Makerspace — damit Menschen nicht nur konsumieren, sondern lernen und gestalten.
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <p className="text-sm text-amber-900 mb-2">
              <strong>Hinweis:</strong> Die Quadratmeterzahlen unten sind <strong>Planungsentwürfe</strong> und werden
              noch konkretisiert. Jede Zahl muss begründbar und anklickbar sein (Quellenangabe folgt).
            </p>
            <p className="text-xs text-amber-800">
              Feedback willkommen: Sind diese Zahlen realistisch? Wo müssen wir effizienter sein?
            </p>
          </div>
        </Card>
      </section>

      {/* Core Business: Shop & Refurbishment */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🏪 Das Kerngeschäft: Shop & Refurbishment</h2>
        <p className="text-sm text-text-light mb-6">
          Wo alles beginnt: Kunden bringen Geräte, wir reparieren & verkaufen sie. Das ist unser Fundament.
        </p>
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏪</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Shop & Kundenbereich</h3>
                  <p className="text-sm text-emerald-700 font-medium">80 m² — Verkauf, Beratung, Annahme</p>
                </div>
              </div>
              <Badge color="emerald">CHF 35'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Erste Anlaufstelle für Kunden: Geräte kaufen, zur Reparatur bringen, beraten lassen.
              Heute: Kein dedizierter Verkaufsraum. Neu: Professioneller Shop mit Ausstellungsfläche.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-grey-dark mb-2">Flächen:</p>
                <ul className="space-y-1 text-text-light">
                  <li>• 50 m² Verkaufsfläche (20-30 Geräte ausgestellt)</li>
                  <li>• 15 m² Beratungs- & Kassenbereich</li>
                  <li>• 15 m² Annahme & Triage (Geräte-Eingang)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-grey-dark mb-2">Ausstattung:</p>
                <ul className="space-y-1 text-text-light">
                  <li>• Ausstellungsregale & Vitrinen</li>
                  <li>• Testgeräte für Kunden (Laptops ausprobieren)</li>
                  <li>• Kassensystem & Inventarverwaltung</li>
                  <li>• Annahme-Protokoll für Reparaturen</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-text-light">
              <strong>Zielgruppe:</strong> Privatkunden, KulturLegi, NGOs, Schulen
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔧</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Refurbishment-Werkstatt</h3>
                  <p className="text-sm text-blue-700 font-medium">~150 m² — Effiziente Reparatur, Test & QA (ENTWURF)</p>
                </div>
              </div>
              <Badge color="blue">CHF 80'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Das Herzstück: Hier entstehen refurbishte Geräte. <strong>Heute:</strong> 4 Tische, chaotisch, nur 1-2 in Nutzung.
              <strong> Neu:</strong> Strukturierte Prozesse (Triage → Data Wipe → Repair → Test → QA), nicht endlos Platz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="font-semibold text-grey-dark mb-2">Flächen & Zonen (ENTWURF):</p>
                <ul className="space-y-1 text-text-light">
                  <li>• <strong>70 m²</strong> Haupt-Werkstatt (6-8× Reparaturtische)</li>
                  <li>• <strong>30 m²</strong> Test & Data Wipe (10× Plätze parallel)</li>
                  <li>• <strong>30 m²</strong> Quality Assurance & Verpackung</li>
                  <li>• <strong>20 m²</strong> Ersatzteile & Werkzeug-Lager</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Kapazität:</p>
                <ul className="space-y-1 text-text-light">
                  <li>• <strong>6-8× Reparaturtische</strong> (kompakt, effizient)</li>
                  <li>• <strong>10× Test/Data-Wipe-Plätze</strong> (parallel)</li>
                  <li>• <strong>Personal:</strong> 2-4 Techniker gleichzeitig</li>
                  <li>• <strong>Kapazität:</strong> 80-120 Geräte/Monat (realistischer)</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Effizienz durch Prozesse, nicht durch Platz</p>
              <p className="text-blue-800 text-xs">
                Nicht 600m² Werkstatt, sondern <strong>klare Prozesse</strong> mit 2× Bildungsprogrammleitern.
                Sie organisieren Workflows, bilden Techniker aus, koordinieren Freiwillige & Reintegrations-Teilnehmer.
                Plus: Sozialpädagogische Begleitung (Veronica) für nachhaltige Arbeitsintegration.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-text-light">
              <strong>Zielgruppe:</strong> Techniker (fest & Praktikanten), Reintegrations-Programme, Freiwillige, Schulungs-Teilnehmer
            </div>
          </Card>
        </div>
      </section>

      {/* Operations & Infrastructure */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">💼 Betrieb & Infrastruktur</h2>
        <p className="text-sm text-text-light mb-6">
          Was im Hintergrund läuft: Büros, Lager, Logistik. Nicht glamourös, aber essentiell.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-gray-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">💼</div>
              <h3 className="text-md font-semibold text-grey-dark">Offices & Sozialräume</h3>
            </div>
            <p className="text-sm text-text-light mb-3">
              <strong>100 m²</strong> für Geschäftsleitung, Koordination, Meetings, Pausenraum, Sozialräume.
            </p>
            <ul className="text-xs text-text-light space-y-1 mb-3">
              <li>• 5× Büroarbeitsplätze (Kernteam + 2× BPL)</li>
              <li>• 1× Meetingraum (8 Personen)</li>
              <li>• Pausenraum & Küche</li>
              <li>• Sanitäranlagen</li>
            </ul>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-text-light">
                <strong>Team:</strong> 5 VZÄ (Kernteam + 2× BPL)<br />
                <strong>Kosten:</strong> CHF 40'000
              </p>
            </div>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">📦</div>
              <h3 className="text-md font-semibold text-grey-dark">Lager & Logistik</h3>
            </div>
            <p className="text-sm text-text-light mb-3">
              <strong>150 m²</strong> für Eingang/Triage, Ersatzteile, Fertigware, Recycling-Staging.
            </p>
            <ul className="text-xs text-text-light space-y-1 mb-3">
              <li>• 60 m² Eingang & Triage (Geräte-Annahme)</li>
              <li>• 40 m² Fertigwaren-Lager (verkaufsfertig)</li>
              <li>• 30 m² Recycling-Staging (Elektroschrott)</li>
              <li>• 20 m² Versand & Verpackung</li>
            </ul>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-text-light">
                <strong>Kapazität:</strong> 500+ Geräte gleichzeitig<br />
                <strong>Kosten:</strong> CHF 35'000
              </p>
            </div>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🚚</div>
              <h3 className="text-md font-semibold text-grey-dark">Lade- & Anlieferzone</h3>
            </div>
            <p className="text-sm text-text-light mb-3">
              <strong>50 m²</strong> für Wareneingang, LKW-Zufahrt, Palette-Handling.
            </p>
            <ul className="text-xs text-text-light space-y-1 mb-3">
              <li>• Rampe für LKW-Anlieferung</li>
              <li>• Paletten-Handling (Hubwagen)</li>
              <li>• Temporäre Lagerung (24-48h)</li>
              <li>• Recycling-Abholung</li>
            </ul>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-text-light">
                <strong>Nutzung:</strong> Täglich (Lieferungen)<br />
                <strong>Kosten:</strong> CHF 20'000
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Innovation & Education */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🚀 Innovation, Makerspace & Bildung</h2>
        <p className="text-sm text-text-light mb-6">
          Nächste Stufe: Nicht nur reparieren, sondern <strong>experimentieren, prototypen, lernen</strong>.
          Makerspace, Robotik, Schulungen. Hier entsteht Know-how.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🛠️</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Makerspace & Hackerspace</h3>
                  <p className="text-sm text-purple-700 font-medium">80 m² — Prototyping & Tüfteln</p>
                </div>
              </div>
              <Badge color="purple">CHF 70'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Offene Werkstatt: 3D-Drucker, Laser-Cutter, Lötarbeitsplätze. Vom Prototyp zum Produkt.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>12× Werkbänke</strong> (je 6m²) für Elektronik-Projekte</li>
                <li>• <strong>6× Lötarbeitsplätze</strong> mit Absaugung</li>
                <li>• <strong>4× 3D-Drucker</strong> (FDM & Resin)</li>
                <li>• <strong>1× Laser-Cutter</strong> & CNC-Fräse</li>
                <li>• Tool Library: Werkzeugverleih (CHF 20/Tag)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 20-30 Menschen gleichzeitig, 100+ Menschen/Monat<br />
              <strong>Zielgruppe:</strong> Maker, Hobbyisten, Startups, Schüler
            </div>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Robotik-Labor</h3>
                  <p className="text-sm text-indigo-700 font-medium">60 m² — Arduino, Raspberry Pi, autonome Systeme</p>
                </div>
              </div>
              <Badge color="indigo">CHF 50'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Robotik-Kits für Schulen, Arduino-Workshops, autonome Roboter bauen. MINT-Bildung hands-on.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>10× Robotik-Arbeitsplätze</strong> (je 6m²)</li>
                <li>• <strong>30× Arduino/Raspberry Pi Kits</strong> (Leihgabe an Schulen)</li>
                <li>• <strong>8× Roboter-Chassis</strong> für autonome Projekte</li>
                <li>• Sensoren, Motoren, Mikrocontroller (Lager)</li>
                <li>• Testfläche für autonome Navigation (20m²)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 20 Kursplätze, 200+ Schüler/Jahr<br />
              <strong>Zielgruppe:</strong> Schulklassen, Jugendliche, MINT-Interessierte
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎓</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Schulungs- & Kursräume</h3>
                  <p className="text-sm text-blue-700 font-medium">70 m² — Linux, AI, Coding für alle</p>
                </div>
              </div>
              <Badge color="blue">CHF 45'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Strukturierte Bildung: Linux-Kurse, AI Literacy, Programmieren lernen. Digital Literacy für alle.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>20× Kursarbeitsplätze</strong> (Laptops, Monitore)</li>
                <li>• Whiteboard, Beamer, Präsentations-Setup</li>
                <li>• Flexible Tische (Gruppen- oder Einzelarbeit)</li>
                <li>• Netzwerk-Infrastruktur (Gigabit, VPN-Zugang)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 20 Kursplätze, 500+ Teilnehmer/Jahr<br />
              <strong>Zielgruppe:</strong> Geflüchtete, Arbeitslose, Quereinsteiger, Unternehmen (Corporate Training)
            </div>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">AI Lab — Verschiedene Setups möglich</h3>
                  <p className="text-sm text-cyan-700 font-medium">20-40 m² — Eigene GPUs, digitale Souveränität</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-text-light mb-4">
              <strong>Vision:</strong> Nicht Cloud-abhängig. Eigene GPU-Infrastruktur für AI-Modelle trainieren, hosten, nutzen.
              GPUs können gekauft oder gespendet werden — <strong>verschiedene Setups möglich</strong>, je nach Budget & Spenden.
            </p>

            <div className="text-sm mb-4">
              <p className="font-semibold text-grey-dark mb-3">Mögliche Setups (aufsteigend):</p>

              <div className="space-y-3">
                <div className="bg-cyan-50 p-3 rounded-lg">
                  <p className="font-semibold text-cyan-900 mb-1">Setup A — Starter (CHF 15'000-20'000)</p>
                  <ul className="text-xs text-cyan-800 space-y-1">
                    <li>• 2-4× Consumer GPUs (NVIDIA RTX 3090/4090, gebraucht oder gespendet)</li>
                    <li>• 1× Server-Rack mit Basis-Kühlung</li>
                    <li>• <strong>Wirkung:</strong> AI Literacy Workshops (20-30 Teilnehmer/Monat), kleine Modelle fine-tunen</li>
                  </ul>
                </div>

                <div className="bg-cyan-100 p-3 rounded-lg">
                  <p className="font-semibold text-cyan-900 mb-1">Setup B — Professional (CHF 40'000-60'000)</p>
                  <ul className="text-xs text-cyan-800 space-y-1">
                    <li>• 8-12× Professional GPUs (NVIDIA A40/A100, teilweise gespendet von Unternehmen)</li>
                    <li>• 2× Server-Racks mit professioneller Kühlung</li>
                    <li>• <strong>Wirkung:</strong> AI-gestützte Hardware-Diagnostik, AI Hosting für NGOs/KMUs, größere Modelle trainieren</li>
                  </ul>
                </div>

                <div className="bg-cyan-200 p-3 rounded-lg">
                  <p className="font-semibold text-cyan-900 mb-1">Setup C — Enterprise (CHF 100'000-150'000)</p>
                  <ul className="text-xs text-cyan-800 space-y-1">
                    <li>• 20-30× Enterprise GPUs (NVIDIA H100/A100, Corporate-Spenden + Teilkauf)</li>
                    <li>• 3-4× Server-Racks mit Klimatisierung & Redundanz</li>
                    <li>• <strong>Wirkung:</strong> Alle oben + Open-Source-Modelle hosten, AI-Forschung für NGO-Sektor, Data Sovereignty für sensible Daten</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-xs text-amber-900 mb-3">
              <strong>Wichtig:</strong> Wir starten nicht mit Setup C. Wir bauen modular auf, basierend auf Spenden + verfügbarem Budget.
              Jedes Setup ist nützlich — auch Setup A ermöglicht AI Literacy Workshops und kleine Modelle.
            </div>

            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Potenzielle Wirkung (je nach Setup):</strong> 20-60 Workshop-Teilnehmer/Monat, AI Hosting für 5-20 NGOs/KMUs, Hardware-Diagnostik-Automatisierung<br />
              <strong>Zielgruppe:</strong> NGOs, KMUs, Entwickler, AI-Interessierte, Studierende
            </div>
          </Card>
        </div>
      </section>

      {/* Cultural & Community Spaces */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🎨 Kultur, Kunst & Gemeinschaft</h2>
        <p className="text-sm text-text-light mb-6">
          <strong>Warum Kultur?</strong> Weil Menschen nicht zu einer "Werkstatt" kommen — aber zu einem Konzert, einer Ausstellung, einem Filmabend.
          Kultur ist der Einstiegspunkt. Und dann sehen sie: Alte Synths machen Musik. Computer sind Geschichte. Reparatur ist Kultur, nicht Pflicht.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-pink-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏛️</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Computer History Museum</h3>
                  <p className="text-sm text-pink-700 font-medium">60 m² — Technik-Geschichte zum Anfassen</p>
                </div>
              </div>
              <Badge color="pink">CHF 50'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Von Commodore 64 bis zur ersten Cray: Computergeschichte als lebendiges Archiv.
              Zeigt, dass alte Hardware wertvoll ist — nicht Müll.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Ausstellungsflächen & Inhalte:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>40 m² Permanent-Ausstellung</strong> (Commodore, Amiga, NeXT, Cray)</li>
                <li>• <strong>20 m² Wechselausstellungen</strong> (E-Waste-Kunst, Tech-Fotografie)</li>
                <li>• Führungen für Schulklassen (CHF 200/Klasse, 2×/Monat)</li>
                <li>• Depot für historische Hardware (Schenkungen)</li>
                <li>• Tech-Nostalgie-Events: "Deine erste Konsole?" (4×/Jahr)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 30-40 Besucher gleichzeitig<br />
              <strong>Zielgruppe:</strong> Schulklassen, Tech-Nostalgiker, Kulturinteressierte
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎹</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Elektronische Musik & Synth-Labor</h3>
                  <p className="text-sm text-purple-700 font-medium">50 m² — Alte Elektronik wird Musik</p>
                </div>
              </div>
              <Badge color="purple">CHF 40'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Vintage-Synths restaurieren, Circuit-Bending lernen, Live-Konzerte veranstalten.
              Musik als Zugang zu Technologie.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>6× Synth-Restaurierungs-Arbeitsplätze</strong> (Lötkolben, Oszilloskop)</li>
                <li>• <strong>10-15× Vintage-Synths</strong> (Roland, Korg, Moog aus 70er/80er)</li>
                <li>• <strong>Modular-Synthese-Setup</strong> für Workshops</li>
                <li>• <strong>20m² Performance-Bereich</strong> für Konzerte (20-30 Besucher)</li>
                <li>• Circuit-Bending-Workshops (Spielzeug-Elektronik zu Instrumenten)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 20-30 Konzertbesucher, 10 Workshop-Teilnehmer<br />
              <strong>Zielgruppe:</strong> Musiker, Elektronik-Fans, Experimentelle Szene
            </div>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎨</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">E-Waste-Art Studio</h3>
                  <p className="text-sm text-orange-700 font-medium">40 m² — Elektroschrott wird Kunst</p>
                </div>
              </div>
              <Badge color="orange">CHF 30'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Künstler:innen schaffen aus Platinen, Gehäusen, Komponenten Skulpturen & Installationen.
              Zeigt: Schrott = Ressource.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Programm:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>3× Resident Artists-Atelierplätze</strong> (je 10-12m², 3-6 Monate)</li>
                <li>• Werkzeuge für E-Waste-Verarbeitung (Sägen, Kleber, Löten)</li>
                <li>• Wechselausstellungen im Hub (4×/Jahr)</li>
                <li>• E-Waste-Art-Workshops für Schulen (2×/Monat)</li>
                <li>• Verkauf: 50% Künstler, 50% Hub (Revenue-Modell)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 3 Resident Artists, 20 Workshop-Teilnehmer<br />
              <strong>Zielgruppe:</strong> Künstler, Schulen, Kunstinteressierte
            </div>
          </Card>

          <Card className="border-l-4 border-l-teal-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎤</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Event- & Multifunktionsraum</h3>
                  <p className="text-sm text-teal-700 font-medium">100 m² — Tags Workshops, abends Events</p>
                </div>
              </div>
              <Badge color="teal">CHF 60'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Flexibler Raum für 50-80 Personen. Tags: Workshops, Co-Working. Abends: Konzerte, Film, Talks.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Ausstattung & Nutzung:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>Bestuhlung für 50-80 Personen</strong> (flexibel)</li>
                <li>• Beamer, Sound-System, Bühne (kleinere Konzerte)</li>
                <li>• Film Nights (1×/Monat, Dokumentarfilme zu Tech & Gesellschaft)</li>
                <li>• Tech-Talks & Panels (Nachhaltigkeit, KI, Open Source)</li>
                <li>• Repair-Partys: Social + Reparatur + Musik (2×/Monat)</li>
                <li>• Corporate Events & Team-Buildings (Revenue)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 50-80 Personen (Events), 20 Personen (Workshops)<br />
              <strong>Zielgruppe:</strong> Tech-Community, Nachbarschaft, Unternehmen
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">☕</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Zero-Waste Community Kitchen</h3>
                  <p className="text-sm text-green-700 font-medium">50 m² — Gemeinsam essen, gemeinsam lernen</p>
                </div>
              </div>
              <Badge color="green">CHF 40'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Fair-Trade-Café tags, Community-Kitchen abends. Niederschwelliger Treffpunkt — keine Konsumpflicht.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Ausstattung & Angebot:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>15-20 Sitzplätze</strong> (Café-Bereich)</li>
                <li>• <strong>30 Plätze beim Community-Dinner</strong> (1×/Woche)</li>
                <li>• Fair-Trade-Kaffee & Snacks (kostendeckend, keine Gewinnmarge)</li>
                <li>• Zero-Waste-Prinzip: Kompostierung, Mehrweg, lokal</li>
                <li>• Tech-Support-Sprechstunde (Di + Do 14-17 Uhr, kostenlos)</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 15-20 Sitzplätze (Café), 30 (Community-Dinner)<br />
              <strong>Zielgruppe:</strong> Alle — niederschwelliger Zugang
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔧</div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">Repair Café</h3>
                  <p className="text-sm text-yellow-700 font-medium">30 m² — Community-Reparatur, 2×/Monat</p>
                </div>
              </div>
              <Badge color="yellow">CHF 20'000</Badge>
            </div>
            <p className="text-sm text-text-light mb-4">
              Öffentliche Reparatur-Events: Bring dein kaputtes Gerät, wir helfen dir es zu reparieren.
              Lernen durch Tun.
            </p>
            <div className="text-sm mb-3">
              <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Format:</p>
              <ul className="space-y-1 text-text-light text-xs">
                <li>• <strong>6× Reparatur-Arbeitsplätze</strong> (Werkzeuge & Material vor Ort)</li>
                <li>• Jeden 1. & 3. Samstag im Monat (10-16 Uhr)</li>
                <li>• Freiwillige Techniker helfen bei Reparatur</li>
                <li>• Spende nach eigenem Ermessen (kostenlos für KulturLegi)</li>
                <li>• Lernen durch Tun: Du reparierst, wir unterstützen</li>
              </ul>
            </div>
            <div className="text-xs text-text-light pt-3 border-t border-gray-200">
              <strong>Kapazität:</strong> 30-40 Besucher/Event, 60-80 Menschen/Monat<br />
              <strong>Zielgruppe:</strong> Jede:r mit kaputtem Gerät
            </div>
          </Card>
        </div>
      </section>

      {/* Budget */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">💰 Budget: Was kostet der Hub?</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-grey-dark mb-3">Einmalige Investitionen (Setup) — ENTWURF</h3>
              <div className="bg-amber-50 p-3 rounded mb-4 text-xs text-amber-900">
                <strong>Wichtig:</strong> Diese Zahlen sind Planungsentwürfe. Jeder Betrag muss noch validiert und mit Quellenangabe versehen werden.
              </div>
              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-text-light font-semibold mb-2">KERNGESCHÄFT (Shop + Werkstatt + Operations):</p>
                <div className="flex justify-between">
                  <span className="text-text-light">Shop & Kundenbereich (~50m²)</span>
                  <span className="font-semibold">CHF 25'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Refurbishment-Werkstatt (~150m²)</span>
                  <span className="font-semibold">CHF 80'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Offices, Lager, Logistik (~120m²)</span>
                  <span className="font-semibold">CHF 50'000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-grey-dark">Subtotal Kerngeschäft</span>
                  <span className="font-semibold text-blue-900">CHF 155'000</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-text-light font-semibold mb-2">INNOVATION (Makerspace + AI + Bildung):</p>
                <div className="flex justify-between">
                  <span className="text-text-light">Makerspace & Hackerspace (~60m²)</span>
                  <span className="font-semibold">CHF 40'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">AI Lab (Setup A-C, siehe oben)</span>
                  <span className="font-semibold">CHF 15-150k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Schulungs- & Kursräume (~50m²)</span>
                  <span className="font-semibold">CHF 30'000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-grey-dark">Subtotal Innovation</span>
                  <span className="font-semibold text-purple-900">CHF 85-220k</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-text-light font-semibold mb-2">KULTUR & COMMUNITY (optional/modular):</p>
                <div className="flex justify-between">
                  <span className="text-text-light">Event- & Multifunktionsraum (~80m²)</span>
                  <span className="font-semibold">CHF 40'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Community Kitchen (~30m²)</span>
                  <span className="font-semibold">CHF 25'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Repair Café (teilt Event-Raum)</span>
                  <span className="font-semibold">CHF 10'000</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted italic">
                  <span>Weitere Kultur-Module (Museum, Synth-Lab, E-Waste-Art)</span>
                  <span>optional</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-grey-dark">Subtotal Kultur (Basis)</span>
                  <span className="font-semibold text-pink-900">CHF 75'000</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-gray-300 text-base">
                <span className="font-bold">Total Einmalig (Setup) — ENTWURF</span>
                <span className="font-bold text-blue-900">CHF 315-450k</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Je nach AI Lab Setup (A/B/C) und optionalen Kultur-Modulen
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-grey-dark mb-3">Jährliche Kosten (Betrieb) — ENTWURF</h3>
              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-text-light font-semibold mb-2">MIETE & NEBENKOSTEN:</p>
                <div className="flex justify-between">
                  <span className="text-text-light">Miete (~500-600 m² in ZH/Agglo)</span>
                  <span className="font-semibold">CHF 120-150k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Nebenkosten (Strom, Heizung, Internet)</span>
                  <span className="font-semibold">CHF 40-50k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Versicherung & Sicherheit</span>
                  <span className="font-semibold">CHF 15k</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-grey-dark">Subtotal Infrastruktur</span>
                  <span className="font-semibold text-blue-900">CHF 175-215k</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-text-light font-semibold mb-2">MATERIAL & BETRIEB:</p>
                <div className="flex justify-between">
                  <span className="text-text-light">Ersatzteile & Komponenten</span>
                  <span className="font-semibold">CHF 30-40k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Werkzeuge & Verbrauchsmaterial</span>
                  <span className="font-semibold">CHF 15k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Events & Programm (Kultur, Workshops)</span>
                  <span className="font-semibold">CHF 20k</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-grey-dark">Subtotal Material</span>
                  <span className="font-semibold text-purple-900">CHF 65-75k</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-gray-300 text-base mb-4">
                <span className="font-bold">Total Jährlich (ohne Personal) — ENTWURF</span>
                <span className="font-bold text-blue-900">CHF 240-290k</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 mb-1">
                  <strong>Personalkosten separat:</strong> Siehe{' '}
                  <Link href="/fundraising/bildung" className="underline">Bildungsprogramm</Link>
                </p>
                <p className="text-xs text-blue-800">
                  CHF 175k/Jahr für 2× BPL (Kernteam-Gehälter bereits im Basisbetrieb enthalten)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 text-center">
            <p className="text-sm text-amber-900 mb-2 font-semibold">
              <strong>Gesamtinvestition (Setup + 1. Jahr Betrieb) — ENTWURF</strong>
            </p>
            <p className="text-3xl font-bold text-amber-900 mb-3">CHF 555-740k</p>
            <div className="text-xs text-amber-800 space-y-1">
              <p>Setup: CHF 315-450k (je nach AI Lab Setup A/B/C)</p>
              <p>Betrieb Jahr 1: CHF 240-290k (ohne Personal)</p>
              <p className="mt-3 pt-3 border-t border-amber-300">
                <strong>Ab Jahr 2:</strong> CHF 240-290k/Jahr Betrieb (ohne Personal)
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-300">
              <p className="text-xs text-amber-900 font-semibold">
                WICHTIG: Alle Zahlen sind Planungsentwürfe und müssen noch validiert werden.
                Jede Zahl braucht Quellenangabe oder Begründung.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-grey-dark">Hilf uns, diesen Ort zu schaffen</h3>
          <p className="text-base mb-6 leading-relaxed max-w-3xl mx-auto text-grey-dark">
            Der Revamp Hub ist mehr als ein Gebäude — es ist eine Plattform für <strong>digitale Teilhabe,
            kulturelle Transformation und nachhaltige Innovation</strong>. Mit deiner Unterstützung können wir zeigen:
            Elektroschrott ist nicht Müll — es ist Potenzial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-700 hover:text-white transition-all duration-200 no-underline"
            >
              📊 Fundraising-Übersicht
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-800 hover:border-emerald-800 transition-all duration-200 no-underline"
            >
              🏛️ Passende Stiftungen finden
            </Link>
            <Link
              href="/revamp-2030"
              className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg border-2 border-blue-700 hover:bg-blue-800 hover:border-blue-800 transition-all duration-200 no-underline"
            >
              🚀 Gesamtstrategie 2030
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
