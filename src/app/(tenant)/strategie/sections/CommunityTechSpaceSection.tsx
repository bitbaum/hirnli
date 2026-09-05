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
import { CULTURE_ASPIRATIONAL_COSTS } from '@/lib/config/hub-space-plan';

const HERO_STATS = [
  { value: HUB_SPACE_DISPLAY, label: 'Werkstatt, Events, Schulung, Kultur' },
  { value: '3 Jahre', label: 'Aufbauphase mit Stiftungsfinanzierung' },
  { value: DEVICES_PER_YEAR_TARGET_DISPLAY, label: 'Geräte/Jahr Zielkapazität (Jahr 3)' },
];

export default function CommunityTechSpaceSection() {
  return (
    <section id="community-tech-space" className="mb-8">
      <div className="mb-6 rounded-xl border border-border-default bg-surface-raised p-6 md:p-8">
        <h2 className="heading-section mb-3 md:text-3xl">Community Tech Space</h2>
        <p className="text-base mb-2 leading-relaxed">
          <span className="font-semibold text-warning-text">Deadline: Ende 2026</span> — Wir müssen
          unser aktuelles Lokal verlassen.
        </p>
        <p className="text-base mb-5 text-text-secondary leading-relaxed">
          Das ist unsere Chance, etwas Grösseres zu schaffen: Ein Ort, an dem{' '}
          <strong>Nachhaltigkeit, Technologie und Gemeinschaft</strong> zusammenkommen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border-subtle bg-surface-base p-4"
            >
              <div className="heading-stat">{stat.value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Spaces */}
      <div className="mb-8">
        <h3 className="heading-section mb-4">Kernbereiche</h3>
        <p className="text-sm text-text-secondary mb-6">
          Fünf Bereiche, die direkt aus unserer heutigen Arbeit wachsen. Zusammen bilden sie den
          Kern des Community Tech Space.
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
            estimatedCost={`${formatCHF(CULTURE_ASPIRATIONAL_COSTS.computer_museum)} (Vitrinen, Ausstellungskonzept, Objekte)`}
          />
        </div>
      </div>

      {/* Expansion Spaces */}
      <div className="mb-8">
        <h3 className="heading-section mb-4">Mögliche Erweiterungen</h3>
        <p className="text-sm text-text-secondary mb-6">
          Vier Programmbereiche, die den Hub einzigartig machen könnten. Sie nutzen die Kernbereiche
          (Werkstatt, Begegnungsraum, Museum) als Infrastruktur — abhängig von Funding und
          Community-Interesse.
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
        description={
          <>
            Der Community Tech Space ist mehr als ein Gebäude — es ist eine Plattform für{' '}
            <strong>digitale Teilhabe, nachhaltige Technologie und soziale Innovation</strong>. Mit
            deiner Unterstützung können wir diesen Ort schaffen.
          </>
        }
        links={[
          { href: '/vision', label: '🚀 Revamp 2030 ansehen' },
          { href: '/wirkung', label: '🌱 Unsere Wirkung in Zahlen', variant: 'secondary' },
        ]}
      />
    </section>
  );
}
