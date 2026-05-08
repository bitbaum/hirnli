/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 */
import CTABanner from '@/components/ui/CTABanner';
import { CommunitySpaceCard } from '../components';
import { formatCHF } from '@/lib/utils/format';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  getCombinedSpaceCost,
  getSpaceCostDisplay,
} from '@/lib/config/projections';

export default function CommunityTechSpaceSection() {
  return (
    <section id="community-tech-space" className="mb-8">
      <div className="mb-6 rounded-2xl gradient-hero-community p-6 text-white md:p-8">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Community Tech Space</h2>
        <p className="text-base mb-3 leading-relaxed md:text-lg">
          <strong className="text-warning">⏰ Deadline: Ende 2026</strong> — Wir müssen unser aktuelles Lokal verlassen.
        </p>
        <p className="text-base mb-4 leading-relaxed md:text-lg">
          Das ist unsere Chance, etwas Grösseres zu schaffen: Ein Ort, an dem <strong>Nachhaltigkeit, Technologie und Gemeinschaft</strong> zusammenkommen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-3xl font-bold">{HUB_SPACE_DISPLAY}</div>
            <div className="text-sm opacity-90">Werkstatt, Events, Schulung, Kultur</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-3xl font-bold">3 Jahre</div>
            <div className="text-sm opacity-90">Aufbauphase mit Stiftungsfinanzierung</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-3xl font-bold">{DEVICES_PER_YEAR_TARGET_DISPLAY}</div>
            <div className="text-sm opacity-90">Geräte/Jahr Zielkapazität (Jahr 3)</div>
          </div>
        </div>
      </div>

      {/* Core Spaces */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-grey-dark mb-4">Kernbereiche</h3>
        <p className="text-sm text-text-light mb-6">
          Fünf Bereiche, die direkt aus unserer heutigen Arbeit wachsen. Zusammen bilden sie den Kern des Community Tech Space.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommunitySpaceCard
            icon="🔧"
            title="Offene Werkstatt & Makerspace"
            tagline="Vom Repair Café bis zum eigenen Projekt"
            description={`Teil des ${HUB_SPACE_DISPLAY} Hub mit professioneller Ausstattung für Community-Reparatur, Prototyping und Maker-Projekte.`}
            type="core"
            activities={[
              'Repair Cafés: Öffentliche Reparatur-Events (2× pro Monat)',
              '3D-Drucker, Lasercutter, CNC-Fräse für Prototyping',
              'Lötarbeitsplätze für Elektronik-Reparatur & Modding',
              'Robotik-Kits & Arduino-Projekte für Schulen',
              'Tool Library: Werkzeugverleih für CHF 20/Tag',
            ]}
            capacity="30-40 Arbeitsplätze gleichzeitig, 100+ Menschen/Woche"
            targetAudience="Hobbyisten, Schüler, Startups, Community"
            sdgs={['SDG 12', 'SDG 9', 'SDG 4']}
            estimatedCost={`${formatCHF(getCombinedSpaceCost(['Refurbishment Workshop', 'Makerspace & Hackerspace']))} (Werkzeuge, Maschinen, Einrichtung)`}
          />

          <CommunitySpaceCard
            icon="🎓"
            title="Schulungs- & Hackerspace"
            tagline="Digitale Kompetenzen für alle"
            description="60 m² Schulungsraum mit 20 Arbeitsplätzen für Kurse, Workshops und offenes Tüfteln."
            type="core"
            activities={[
              'Linux-Einführungskurse (Deutsch, Englisch, Ukrainisch)',
              'Repair-Skills: Laptop-Reparatur von Grund auf',
              'Programmieren lernen (Python, JavaScript für Anfänger)',
              'Digital Literacy für Geflüchtete (Asylorganisationen)',
              'Hackathons & Community-Events',
            ]}
            capacity="20 Kursplätze, 500+ Teilnehmer/Jahr"
            targetAudience="Geflüchtete, Arbeitslose, Quereinsteiger, Schüler"
            sdgs={['SDG 4', 'SDG 8', 'SDG 10']}
            estimatedCost={`${getSpaceCostDisplay('Training & Course Room')} (20× Computer, Möbel, AV-Equipment)`}
          />

          <CommunitySpaceCard
            icon="🖥️"
            title="Sovereign AI Lab"
            tagline="Lokale KI-Modelle hosten, trainieren, vermitteln"
            description="GPU-Cluster aus Unternehmens-Spenden für souveränes KI-Hosting. Schweizer Organisationen können eigene Modelle trainieren — ohne Cloud-Abhängigkeit."
            type="core"
            activities={[
              'KI-Hosting für Schweizer NGOs & KMUs (Data Sovereignty)',
              'AI Literacy Workshops: Wie nutze ich ChatGPT sicher?',
              'Modell-Training für spezifische Use Cases (lokale Sprachen, Fachdaten)',
              'AI Ethics: Diskussionen zu Bias, Privacy, Automatisierung',
              'Corporate AI Training: Workshops für Unternehmen (Revenue)',
            ]}
            capacity="20-30 GPU-Nodes, 60 Workshop-Teilnehmer/Monat"
            targetAudience="NGOs, KMUs, Geflüchtete, Studierende"
            sdgs={['SDG 4', 'SDG 9', 'SDG 10']}
            estimatedCost={`CHF ${getSpaceCostDisplay('AI Lab (Server Room)')}`}
          />

          <CommunitySpaceCard
            icon="☕"
            title="Begegnungsraum & Café"
            tagline="Tags Treffpunkt, abends Veranstaltungen"
            description="130 m² flexibler Raum für 50-80 Personen. Tags offener Treffpunkt mit Café und Co-Working, abends Tech-Talks, Panels und Community-Events."
            type="core"
            activities={[
              'Tagsüber: Café, Co-Working & Tech-Support-Sprechstunde',
              'Abends: Tech-Talks & Panels zu Nachhaltigkeit, KI, Open Source',
              'Repair-Partys: Social + Reparatur + Musik',
              'Community-Board für Projekte, Jobs, Gesuche',
              'Offener Treffpunkt: Keine Konsumpflicht, WiFi, Steckdosen',
            ]}
            capacity="50-80 Personen, 2-3 Events/Woche"
            targetAudience="Alle — Tech-Community, Nachbarschaft, Kulturinteressierte"
            sdgs={['SDG 11', 'SDG 17']}
            estimatedCost={`${getSpaceCostDisplay('Event Space + Community Café (MULTI-PURPOSE)')} (Möbel, Küche, PA-Anlage)`}
          />

          <CommunitySpaceCard
            icon="🏛️"
            title="Technik-Museum"
            tagline="Computergeschichte zum Anfassen"
            description="80 m² für eine permanente Ausstellung historischer Computer und Führungen für Schulklassen."
            type="core"
            activities={[
              'Permanente Ausstellung: Von Commodore 64 über Amiga bis NeXT',
              'Führungen für Schulklassen (CHF 200/Klasse)',
              'Depot für historische Hardware (Schenkungen)',
              'Interaktive Stationen: Alte Systeme ausprobieren',
            ]}
            capacity="30-40 Besucher gleichzeitig"
            targetAudience="Schulklassen, Tech-Nostalgiker, Familien"
            sdgs={['SDG 4', 'SDG 11']}
            estimatedCost="CHF 50'000 (Vitrinen, Ausstellungskonzept, Objekte)"
          />
        </div>
      </div>

      {/* Expansion Spaces */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-grey-dark mb-4">Mögliche Erweiterungen</h3>
        <p className="text-sm text-text-light mb-6">
          Vier Programmbereiche, die den Hub einzigartig machen könnten. Sie nutzen die Kernbereiche (Werkstatt, Begegnungsraum, Museum) als Infrastruktur — abhängig von Funding und Community-Interesse.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CommunitySpaceCard
            icon="🎨"
            title="Kunst aus Elektroschrott"
            tagline="Skulpturen & Installationen"
            description="Künstler:innen erschaffen aus ausrangierten Platinen, Gehäusen und Komponenten neue Kunstwerke — ausgestellt im Museum."
            type="expansion"
            activities={[
              'Resident Artists: 3-6 Monate Atelierplatz',
              'E-Waste-Art-Workshops für Schulen',
              'Wechselausstellungen & Verkauf',
            ]}
            targetAudience="Künstler, Schulen, Kunstinteressierte"
          />

          <CommunitySpaceCard
            icon="🎹"
            title="Elektronische Musik"
            tagline="Synthesizer, Drum Machines"
            description="Vintage-Synths restaurieren, Circuit-Bending lernen und Live-Konzerte im Begegnungsraum veranstalten."
            type="expansion"
            activities={[
              'Synth-Restaurierung (Roland, Korg, Moog)',
              'Circuit-Bending-Workshops in der Werkstatt',
              'Live-Konzerte & DJ-Sets im Begegnungsraum',
            ]}
            targetAudience="Musiker, Elektronik-Fans"
          />

          <CommunitySpaceCard
            icon="📖"
            title="Tech-Bibliothek"
            tagline="Bücher, Zines, Magazine"
            description="Kuratierte Sammlung zu Technologie, Nachhaltigkeit und Maker-Kultur — im Café-Bereich zugänglich."
            type="expansion"
            activities={[
              'Bücher-Tausch & Spenden',
              'Zine-Produktion: Selbstverlag fördern',
              'Lesekreise zu Tech-Ethik, KI, Klimakrise',
            ]}
            targetAudience="Alle"
          />

          <CommunitySpaceCard
            icon="🎬"
            title="Filmabende & Diskussionen"
            tagline="Dokumentarfilme zu Tech & Gesellschaft"
            description="Monatliche Screenings mit anschliessender Diskussion im Begegnungsraum."
            type="expansion"
            activities={[
              'Dokumentarfilm-Screenings (1×/Monat)',
              'Panel-Diskussionen mit Expert:innen',
              'Community-Voting: Welchen Film als nächstes?',
            ]}
            targetAudience="Tech-Community, Aktivisten"
          />
        </div>
      </div>

      {/* Call to Action */}
      <CTABanner
        title="Hilf uns, diese Vision zu verwirklichen"
        description={<>Der Community Tech Space ist mehr als ein Gebäude — es ist eine Plattform für <strong>digitale Teilhabe, nachhaltige Technologie und soziale Innovation</strong>. Mit deiner Unterstützung können wir diesen Ort schaffen.</>}
        links={[
          { href: '/revamp-2030', label: '🚀 Revamp 2030 ansehen' },
          { href: '/wirkung', label: '🌱 Unsere Wirkung in Zahlen', variant: 'secondary' },
        ]}
      />
    </section>
  );
}
