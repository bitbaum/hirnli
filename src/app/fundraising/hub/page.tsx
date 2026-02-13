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
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Die Vision</h2>
          <p className="text-xl mb-4 leading-relaxed">
            <strong>Nicht nur reparieren — transformieren.</strong> Der Revamp Hub ist ein Ort, an dem Menschen
            ihre Beziehung zu Technologie neu definieren.
          </p>
          <p className="text-lg mb-6 leading-relaxed opacity-90">
            Tags: Werkstatt brummt, Reparaturen laufen, Menschen lernen. <br />
            Abends: Konzerte aus Vintage-Synths, Filmabende über Technik & Gesellschaft, E-Waste-Kunst-Ausstellungen.<br />
            <strong>Ein Raum, der zeigt: Elektroschrott ist nicht Müll — es ist Ressource, Geschichte, Potenzial.</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
              <div className="text-3xl font-bold">~1000 m²</div>
              <div className="text-sm opacity-90">Werkstatt + Kultur + Innovation</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
              <div className="text-3xl font-bold">180+</div>
              <div className="text-sm opacity-90">Geräte/Monat (6× heute)</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-sm opacity-90">Menschen/Jahr erreicht</div>
            </div>
          </div>
        </div>
      </section>

      {/* Warum Kultur & Gemeinschaft zentral sind */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Warum Kultur & Gemeinschaft genauso wichtig sind wie Technik</h2>
        <Card className="border-l-4 border-l-pink-500">
          <p className="text-sm text-text-light mb-4">
            <strong>Technik allein ändert kein Verhalten.</strong> Menschen kommen nicht zu einer "Reparaturwerkstatt" —
            aber sie kommen zu einem Konzert, einer Ausstellung, einem Filmabend. Und dann sehen sie: "Ah, alte Synths können Musik machen.
            Alte Computer sind Kunstobjekte. Reparatur ist keine Pflicht — es ist Kultur."
          </p>
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-4">
            <p className="text-sm font-bold text-purple-900 mb-2">Das ist Impact auf einer anderen Ebene:</p>
            <p className="text-xs text-purple-800">
              Nicht nur Geräte retten, sondern <strong>wie Menschen über Technologie denken verändern</strong>.
              Kunst, Musik, Ausstellungen, gemeinsames Essen, Film — das sind Einstiegspunkte für Menschen,
              die nie zu einem "Repair-Workshop" kämen. Und plötzlich reparieren sie selbst.
            </p>
          </div>
        </Card>
      </section>

      {/* Core Production Spaces */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🔧 Produktion & Kapazität</h2>
        <p className="text-sm text-text-light mb-6">
          Das Herzstück: Professionelle Werkstatt + AI-gestützte Infrastruktur für 180+ Geräte/Monat.
        </p>
        <div className="grid grid-cols-1 gap-6">
          <CommunitySpaceCard
            icon="🔧"
            title="Refurbishment-Werkstatt"
            tagline="600m² — 6× mehr Kapazität"
            description="Professionelle Werkstatt mit Testinfrastruktur, parallelen Prozesslinien und strukturierter Organisation."
            type="core"
            activities={[
              'Intake & Triage Station (schnelle Erstdiagnose)',
              'Data Wipe & Security Zone (NIST 800-88 Standard)',
              '6× parallele Reparatur-Linien (statt 4 ungenutzte Tische)',
              'Quality Assurance Lab (automatisierte Tests)',
              'Komponenten-Lager & Tool Library',
            ]}
            capacity="6× Arbeitsplätze parallel, 150-200 Geräte/Monat"
            targetAudience="Techniker, Praktikanten, Reintegrations-Programme"
            sdgs={['SDG 12', 'SDG 8']}
            estimatedCost="CHF 180'000"
          />

          <CommunitySpaceCard
            icon="🤖"
            title="AI Sovereignty Node"
            tagline="GPU-Cluster für eigene Modelle"
            description="Nicht Cloud-abhängig, sondern eigene GPUs: AI-Modelle trainieren, hosten, vermitteln. Digitale Souveränität für Schweizer NGOs & KMUs."
            type="core"
            activities={[
              'GPU-Cluster aus Unternehmens-Spenden (NVIDIA, AMD)',
              'AI-gestützte Diagnostik (Hardware-Tests automatisieren)',
              'Eigene Modelle trainieren (nicht ChatGPT-abhängig)',
              'AI Hosting für NGOs/KMUs (Data Sovereignty)',
              'AI Literacy Workshops: "Wie nutze ich AI sicher?"',
            ]}
            capacity="20-30 GPU-Nodes, 60 Workshop-Teilnehmer/Monat"
            targetAudience="NGOs, KMUs, Entwickler, AI-Interessierte"
            sdgs={['SDG 9', 'SDG 4']}
            estimatedCost="CHF 80'000"
          />
        </div>
      </section>

      {/* Cultural & Community Spaces */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🎨 Kultur, Kunst & Gemeinschaft</h2>
        <p className="text-sm text-text-light mb-6">
          Hier passiert die kulturelle Transformation: Menschen kommen für Musik, Kunst, Film — und gehen mit neuer Perspektive auf Technik.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommunitySpaceCard
            icon="🏛️"
            title="Computer History Museum"
            tagline="Technik-Nostalgie zum Anfassen"
            description="Von Commodore 64 bis zur ersten Cray: Computergeschichte als lebendiges Archiv. Zeigt, dass alte Hardware wertvoll ist — nicht Müll."
            type="core"
            activities={[
              'Permanent-Ausstellung: Commodore, Amiga, NeXT, Cray',
              'Wechselausstellungen: E-Waste-Kunst, Tech-Fotografie',
              'Führungen für Schulklassen (CHF 200/Klasse)',
              'Depot für historische Hardware (Schenkungen)',
              'Tech-Nostalgie-Events: "Deine erste Konsole?"',
            ]}
            capacity="30-40 Besucher gleichzeitig"
            targetAudience="Schulklassen, Tech-Nostalgiker, Kulturinteressierte"
            sdgs={['SDG 11', 'SDG 4']}
            estimatedCost="CHF 50'000"
          />

          <CommunitySpaceCard
            icon="🎹"
            title="Elektronische Musik & Synth-Labor"
            tagline="Alte Elektronik wird Musik"
            description="Vintage-Synths restaurieren, Circuit-Bending-Workshops, Modular-Synthese lernen, Live-Konzerte veranstalten."
            type="core"
            activities={[
              'Synth-Restaurierung (Roland, Korg, Moog aus 70er/80er)',
              'Circuit-Bending: Spielzeug-Elektronik zu Instrumenten',
              'Modular-Synthese für Anfänger',
              'Live-Konzerte (elektronische Musik, Vintage-Synths)',
              'DJ-Sets & Experimental-Musik-Abende',
            ]}
            capacity="20 Konzert-Besucher, 10 Workshop-Teilnehmer"
            targetAudience="Musiker, Elektronik-Fans, Experimentelle Szene"
            sdgs={['SDG 11']}
            estimatedCost="CHF 40'000"
          />

          <CommunitySpaceCard
            icon="🎨"
            title="E-Waste-Art Studio"
            tagline="Elektroschrott wird Kunst"
            description="Künstler:innen schaffen aus Platinen, Gehäusen und Komponenten Skulpturen und Installationen. Zeigt: Schrott = Ressource."
            type="core"
            activities={[
              'Resident Artists: 3-6 Monate Atelierplatz',
              'E-Waste-Art-Workshops für Schulen',
              'Wechselausstellungen im Hub',
              'Verkauf (50% für Künstler, 50% für Hub)',
              'Zusammenarbeit mit lokalen Kunstschulen',
            ]}
            capacity="3 Resident Artists, 20 Workshop-Teilnehmer"
            targetAudience="Künstler, Schulen, Kunstinteressierte"
            sdgs={['SDG 11', 'SDG 12']}
            estimatedCost="CHF 30'000"
          />

          <CommunitySpaceCard
            icon="🎬"
            title="Film Nights & Diskussionen"
            tagline="Dokumentarfilme zu Tech & Gesellschaft"
            description="Monatliche Filmabende mit Diskussion: Überwachung, KI-Ethik, Klimakrise, Right to Repair."
            type="core"
            activities={[
              'Dokumentarfilm-Screenings (1×/Monat)',
              'Panel-Diskussionen mit Expert:innen',
              'Community-Voting: Welchen Film als nächstes?',
              'Themen: Überwachung, E-Waste, Planned Obsolescence',
            ]}
            capacity="50-80 Besucher"
            targetAudience="Tech-Community, Aktivisten, Nachbarschaft"
            sdgs={['SDG 4', 'SDG 11']}
            estimatedCost="CHF 15'000"
          />

          <CommunitySpaceCard
            icon="☕"
            title="Zero-Waste Community Kitchen"
            tagline="Gemeinsam essen, gemeinsam lernen"
            description="Fair-Trade-Café tags, Community-Kitchen abends. Niederschwelliger Treffpunkt — keine Konsumpflicht."
            type="core"
            activities={[
              'Fair-Trade-Kaffee & Snacks (kostendeckend)',
              'Community-Kitchen: Gemeinsames Kochen (1×/Woche)',
              'Zero-Waste-Prinzip: Kompostierung, Mehrweg',
              'Offener Treffpunkt: Keine Konsumpflicht',
              'Tech-Support-Sprechstunde (Di + Do 14-17 Uhr)',
            ]}
            capacity="15-20 Sitzplätze, 30 beim Community-Dinner"
            targetAudience="Alle — niederschwelliger Zugang"
            sdgs={['SDG 11', 'SDG 12']}
            estimatedCost="CHF 40'000"
          />

          <CommunitySpaceCard
            icon="🔧"
            title="Repair Café"
            tagline="Community-Reparatur, jeden Samstag"
            description="Öffentliche Reparatur-Events (2×/Monat): Bring dein kaputtes Gerät, wir helfen dir es zu reparieren."
            type="core"
            activities={[
              'Jeden 1. & 3. Samstag im Monat (10-16 Uhr)',
              'Freiwillige Techniker helfen bei Reparatur',
              'Werkzeuge & Material vor Ort',
              'Spende nach eigenem Ermessen',
              'Lernen durch Tun: Du reparierst, wir unterstützen',
            ]}
            capacity="30-40 Besucher/Event, 60-80 Menschen/Monat"
            targetAudience="Jede:r mit kaputtem Gerät"
            sdgs={['SDG 12', 'SDG 4']}
            estimatedCost="CHF 20'000"
          />
        </div>
      </section>

      {/* Innovation & Education */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">🚀 Innovation, Makerspace & Bildung</h2>
        <p className="text-sm text-text-light mb-6">
          Von Robotik bis 3D-Druck: Raum zum Experimentieren, Prototyping, Lernen.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommunitySpaceCard
            icon="🛠️"
            title="Makerspace & Hackerspace"
            tagline="Prototyping, Tüfteln, Erfinden"
            description="Offene Werkstatt mit 3D-Druckern, Laser-Cuttern, Elektronik-Lab. Vom Prototyp zum Produkt."
            type="core"
            activities={[
              '3D-Drucker (FDM & Resin)',
              'Laser-Cutter & CNC-Fräse',
              'Lötarbeitsplätze für Elektronik',
              'Tool Library: Werkzeugverleih (CHF 20/Tag)',
              'Offene Werkstatt: Jeden Mittwoch (18-22 Uhr)',
            ]}
            capacity="20-30 Arbeitsplätze, 100+ Menschen/Monat"
            targetAudience="Maker, Hobbyisten, Startups, Schüler"
            sdgs={['SDG 9', 'SDG 4']}
            estimatedCost="CHF 70'000"
          />

          <CommunitySpaceCard
            icon="🤖"
            title="Robotik & Bildung"
            tagline="Von Arduino bis autonome Roboter"
            description="Robotik-Kits für Schulen, Arduino-Workshops, autonome Systeme bauen."
            type="core"
            activities={[
              'Arduino & Raspberry Pi Workshops',
              'Robotik-Kits für Schulklassen (Leihgabe)',
              'Autonome Roboter-Projekte',
              'First Lego League Vorbereitung',
              'Hackathons für Schüler (1×/Jahr)',
            ]}
            capacity="20 Kursplätze, 200+ Schüler/Jahr"
            targetAudience="Schulen, Jugendliche, MINT-Interessierte"
            sdgs={['SDG 4', 'SDG 9']}
            estimatedCost="CHF 50'000"
          />

          <CommunitySpaceCard
            icon="🎓"
            title="Schulungs- & Kursräume"
            tagline="Linux, AI, Coding für alle"
            description="60 m² Schulungsraum mit 20 Arbeitsplätzen für Kurse, Workshops und strukturierte Bildung."
            type="core"
            activities={[
              'Linux-Einführungskurse (Deutsch, Englisch, Ukrainisch)',
              'AI Literacy: Wie nutze ich ChatGPT sicher?',
              'Programmieren lernen (Python, JavaScript)',
              'Digital Literacy für Geflüchtete',
              'Corporate Trainings (Revenue: CHF 2000-5000/Tag)',
            ]}
            capacity="20 Kursplätze, 500+ Teilnehmer/Jahr"
            targetAudience="Geflüchtete, Arbeitslose, Quereinsteiger, Unternehmen"
            sdgs={['SDG 4', 'SDG 8', 'SDG 10']}
            estimatedCost="CHF 40'000"
          />

          <CommunitySpaceCard
            icon="🎤"
            title="Event- & Multifunktionsraum"
            tagline="Tags Workshops, abends Events"
            description="100 m² flexibler Raum für 50-80 Personen. Tags: Workshops, Co-Working. Abends: Konzerte, Talks, Filmabende."
            type="core"
            activities={[
              'Tech-Talks & Panels (Nachhaltigkeit, KI, Open Source)',
              'Konzerte (elektronische Musik, Vintage-Synths)',
              'Filmabende (Dokumentarfilme zu Tech & Gesellschaft)',
              'Repair-Partys: Social + Reparatur + Musik',
              'Corporate Events & Team-Buildings (Revenue)',
            ]}
            capacity="50-80 Personen (Events), 20 Personen (Workshops)"
            targetAudience="Tech-Community, Nachbarschaft, Unternehmen"
            sdgs={['SDG 11', 'SDG 17']}
            estimatedCost="CHF 60'000"
          />
        </div>
      </section>

      {/* Operational Spaces */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">💼 Betrieb & Infrastruktur</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-gray-500">
            <h3 className="text-md font-semibold text-grey-dark mb-3">🏪 Shop & Verkauf</h3>
            <p className="text-sm text-text-light mb-3">
              50 m² Verkaufsfläche für refurbishte Geräte, Reparatur-Annahme, Kundenberatung.
            </p>
            <p className="text-xs text-text-light">
              <strong>Zielgruppe:</strong> Privatkunden, KulturLegi, NGOs<br />
              <strong>Kosten:</strong> CHF 25'000
            </p>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <h3 className="text-md font-semibold text-grey-dark mb-3">💼 Offices & Sozialräume</h3>
            <p className="text-sm text-text-light mb-3">
              100 m² für Geschäftsleitung, Koordination, Meetings, Pausenraum.
            </p>
            <p className="text-xs text-text-light">
              <strong>Team:</strong> 5 VZÄ (Kernteam + 2× BPL)<br />
              <strong>Kosten:</strong> CHF 40'000
            </p>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <h3 className="text-md font-semibold text-grey-dark mb-3">📦 Lager & Logistik</h3>
            <p className="text-sm text-text-light mb-3">
              120 m² für Eingang/Triage, Ersatzteile, Fertigware, Recycling-Staging.
            </p>
            <p className="text-xs text-text-light">
              <strong>Kapazität:</strong> 500+ Geräte gleichzeitig<br />
              <strong>Kosten:</strong> CHF 30'000
            </p>
          </Card>
        </div>
      </section>

      {/* Budget */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Budget: Was kostet der Hub?</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-grey-dark mb-3">Einmalige Investitionen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Werkstatt-Einrichtung</span>
                  <span className="font-semibold">CHF 180'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">AI Node (GPUs)</span>
                  <span className="font-semibold">CHF 80'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Makerspace & Robotik</span>
                  <span className="font-semibold">CHF 120'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Kultur (Museum, Musik, Kunst)</span>
                  <span className="font-semibold">CHF 120'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Infrastruktur (Shop, Offices, Lager)</span>
                  <span className="font-semibold">CHF 95'000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Total Einmalig</span>
                  <span className="font-bold text-blue-900">CHF 595'000</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-grey-dark mb-3">Jährliche Kosten (Jahr 1)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Miete (~1000 m² in ZH/Agglo)</span>
                  <span className="font-semibold">CHF 200'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Nebenkosten (Strom, Heizung, etc.)</span>
                  <span className="font-semibold">CHF 80'000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Versicherung & Sicherheit</span>
                  <span className="font-semibold">CHF 20'000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Total Jährlich</span>
                  <span className="font-bold text-blue-900">CHF 300'000</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Personalkosten separat:</strong> Siehe <Link href="/fundraising/bildung" className="underline">Bildungsprogramm</Link> (CHF 175k/Jahr für 2× BPL)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 text-center">
            <p className="text-sm text-emerald-900 mb-2">
              <strong>Gesamtinvestition (Einrichtung + 1. Jahr Betrieb):</strong>
            </p>
            <p className="text-4xl font-bold text-emerald-900">CHF 895'000</p>
            <p className="text-xs text-emerald-800 mt-2">
              Plus CHF 300k/Jahr ab Jahr 2 (Miete + Nebenkosten)
            </p>
          </div>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Hilf uns, diesen Ort zu schaffen</h3>
          <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
            Der Revamp Hub ist mehr als ein Gebäude — es ist eine Plattform für <strong>digitale Teilhabe,
            kulturelle Transformation und nachhaltige Innovation</strong>. Mit deiner Unterstützung können wir zeigen:
            Elektroschrott ist nicht Müll — es ist Potenzial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              📊 Fundraising-Übersicht
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              🏛️ Passende Stiftungen finden
            </Link>
            <Link
              href="/revamp-2030"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              🚀 Gesamtstrategie 2030
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
