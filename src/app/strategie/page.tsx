import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import MetricGrid from '@/components/metrics/MetricGrid';
import { PILLARS, VISION_TARGETS, HUB_CORE_SPACES, HUB_CULTURAL_SPACES, SDG_DATA, SDG_COLORS } from './data';
import type { SdgRow } from './data';
import { GeschichteSection, KontaktSection, SovereigntyPillar, VisionMetric, PillarDetail, CommunitySpaceCard } from './components';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { CO2_PER_LAPTOP, getNumericValue } from '@/lib/config/numbers';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_MONTH_CURRENT_DISPLAY,
  DEVICES_PER_MONTH_TARGET,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  PEOPLE_REACHED_DISPLAY,
  getCombinedSpaceCost,
  getSpaceCostDisplay,
} from '@/lib/config/projections';
import { formatCHF } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'Mission & Werte',
  description: `Vier Säulen, Souveränität und SDG-Alignment — was ${ORG_PROFILE.name} heute ausmacht`,
};

export default function StrategiePage() {
  return (
    <>
      <PageHeader
        title="Mission & Werte"
        subtitle="Woher wir kommen, wofür wir stehen — unsere vier Säulen"
      />

      <WhyThisMatters
        purpose="Unsere Mission, Werte und Vision 2030 erklären WARUM wir existieren und WOHIN wir gehen."
        connection="Strategie ist die Grundlage für alle anderen Seiten: Operations (WIE), Fundraising (WOMIT), Wirkung (ERGEBNIS)."
      />

      <GeschichteSection />

      {/* Mission Statement */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Mission</h2>
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <p className="text-lg font-semibold text-emerald-800">
            {ORG_PROFILE.name} gestaltet die Zukunft der IT durch Reparatur, Refurbishing und Lebensdauerverlängerung.
          </p>
          <p className="mt-3 text-sm text-text-light">
            Wir retten gebrauchte Computer vor dem Elektroschrott, indem wir sie mit Linux und Open-Source-Software
            wiederbeleben. Gleichzeitig schaffen wir Zugang zu bezahlbarer Technologie, fördern digitale Kompetenzen
            und unterstützen Menschen bei der beruflichen Wiedereingliederung.
          </p>
        </Card>
      </section>

      {/* Vier Säulen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vier Säulen unserer Arbeit</h2>
        <p className="mb-6 text-sm text-text-light">
          Unsere Mission ruht auf vier gleichwertigen Säulen. Klicke auf «Mehr erfahren», um zu sehen,
          was wir konkret tun, warum es wichtig ist und was wir erreicht haben.
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PillarDetail
            icon="♻️"
            title="1. Umweltschutz"
            description="Reduktion von Elektroschrott durch Wiederinstandsetzung, Reparatur, Weiterverwendung und fachgerechtes Recycling"
            colorScheme="emerald"
            activities={[
              `Professionelles Refurbishment: ${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat aktuell (Ziel mit Hub: ~${DEVICES_PER_MONTH_TARGET}/Monat)`,
              'Datenvernichtung nach NIST 800-88 Standard (secure data wipe)',
              'Fachgerechtes Recycling für nicht reparierbare Komponenten',
              `Lebensdauerverlängerung: Ältere Hardware läuft mit Linux weitere ~${getNumericValue('DEVICE_LIFESPAN_EXTENSION')} Jahre`,
            ]}
            whyItMatters={`Jeder neue Laptop verursacht ~350 kg CO₂ bei der Herstellung, Refurbishment nur ~65 kg. Netto-Einsparung: ${CO2_PER_LAPTOP} kg CO₂ pro Gerät (Fraunhofer IZM 2023). Elektroschrott ist einer der am schnellsten wachsenden Abfallströme weltweit (62 Mio. Tonnen/Jahr). Gleichzeitig schonen wir wertvolle Rohstoffe wie Kupfer, Gold und seltene Erden.`}
            achievements={[
              '~1\'600+ Geräte seit 2018 (geschätzt aus Kivitendo-Warenverkauf: CHF 238\'309 / ~CHF 150 Durchschnittspreis)',
              `Aktuelle Kapazität: ${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat, ~150/Jahr (geschätzt aus Umsatzdaten)`,
              `Durchschnittliche Lebensdauerverlängerung: ~${getNumericValue('DEVICE_LIFESPAN_EXTENSION')} Jahre pro Gerät (alte Hardware mit Linux)`,
              'Fachgerechtes Recycling für nicht reparierbare Teile (Quote nicht systematisch erfasst)',
            ]}
            relatedPages={[
              { title: 'Wirkung', href: '/wirkung', reason: 'Siehe detaillierte Umwelt-Impact-Zahlen' },
              { title: 'Operations', href: '/operations', reason: 'Wie unser Refurbishment-Prozess funktioniert' },
              { title: 'Methodik', href: '/methodik', reason: 'Wie wir CO₂-Einsparungen berechnen' },
            ]}
          />

          <PillarDetail
            icon="🐧"
            title="2. Digitale Souveränität"
            description="Förderung von Linux & Open-Source Software als nachhaltige, kostengünstige und befähigende Technologieoption"
            colorScheme="blue"
            activities={[
              '100% Linux-Installation (Ubuntu, Linux Mint, Pop!_OS) auf allen verkauften Geräten',
              'Keine Lizenzkosten = niedrigere Preise für Endkunden',
              'Workshops zu Linux-Grundlagen, Terminal, Softwareinstallation',
              'Community-Support & Dokumentation in deutscher Sprache',
            ]}
            whyItMatters="Digitale Souveränität bedeutet: Du besitzt dein Gerät wirklich. Keine Zwangsupdates, keine Vendor Lock-ins, keine Lizenzkosten. Open-Source-Software gibt Nutzern Kontrolle zurück und ermöglicht es, ältere Hardware weiter zu nutzen. Das ist besonders wichtig für Menschen mit geringem Einkommen und für Organisationen, die unabhängig bleiben wollen."
            achievements={[
              'Seit 2003: Pioniere für Linux-Desktop in der Schweiz',
              '~1\'600+ Geräte mit vorinstalliertem Linux verkauft (2018-2025, geschätzt aus Umsatzdaten)',
              '100% Open-Source-Software auf allen verkauften Geräten',
              'Teil der weltweiten Open-Source-Bewegung',
            ]}
            relatedPages={[
              { title: 'Preismodell', href: '/preismodell', reason: 'Wie Open-Source niedrigere Preise ermöglicht' },
              { title: 'Strategie → Souveränität', href: '/strategie#souveraenitat', reason: 'Unser Souveränitäts-Pfad im Detail' },
            ]}
          />

          <PillarDetail
            icon="📚"
            title="3. Bildung & Aufklärung"
            description="Workshops, technische Unterstützung und niederschwellige Lernangebote — von Reparaturwissen bis zu digitalen Kompetenzen"
            colorScheme="violet"
            activities={[
              'Repair-Workshops: Wie repariere ich meinen eigenen Laptop?',
              'Linux-Einführungskurse für Einsteiger (Deutsch & Englisch)',
              'Technischer Support per E-Mail, Telefon und vor Ort',
              'Community-Events: Repair Cafés, Tech-Talks, Wissensaustausch',
            ]}
            whyItMatters="In einer Welt, die sich durch Automatisierung und KI rasant verändert, werden digitale Kompetenzen zur Grundvoraussetzung für Teilhabe. Gleichzeitig geht Reparaturwissen verloren – dabei ist es ein Schlüssel zu Nachhaltigkeit und Unabhängigkeit. Wir vermitteln beides: Wie man Technologie nutzt UND wie man sie wartet."
            achievements={[
              'Seit 2003: 100+ Menschen in Workshops & Praktika begleitet (Schätzung, nicht systematisch erfasst)',
              'Repair-Workshops, Linux-Kurse, technischer Support',
              'Niederschwelliger Zugang: Keine Vorkenntnisse erforderlich',
              'Wissensdokumentation: Anleitungen & How-Tos für Community',
            ]}
            relatedPages={[
              { title: 'Team', href: '/team', reason: 'Wer diese Workshops durchführt' },
              { title: 'Wirkung', href: '/wirkung', reason: 'Wie viele Menschen wir erreicht haben' },
            ]}
          />

          <PillarDetail
            icon="🤝"
            title="4. Soziale Integration"
            description="Unterstützung bei der beruflichen Wiedereingliederung durch Struktur, Routinen und sinnvolle Tätigkeiten"
            colorScheme="amber"
            activities={[
              'Arbeitsintegrationsprogramme für Menschen mit erschwertem Arbeitsmarktzugang',
              'Praktikumsplätze mit Betreuung & Skill-Entwicklung',
              'Strukturierte Tagesabläufe: Refurbishment, Verkauf, Werkstatt',
              'Zusammenarbeit mit Sozialdiensten (AOZ, Caritas, etc.)',
            ]}
            whyItMatters="Geflüchtete, Langzeitarbeitslose und Menschen mit Behinderungen haben oft erschwerten Zugang zum Arbeitsmarkt – nicht wegen fehlender Fähigkeiten, sondern wegen fehlender Chancen. Wir bieten einen geschützten Rahmen, um praktische IT-Skills zu entwickeln, Selbstvertrauen aufzubauen und Referenzen zu sammeln. Das ist besonders wichtig, wenn Automatisierung traditionelle Einstiegsjobs ersetzt."
            achievements={[
              'Seit 2009: Arbeitsintegrationsprogramme für benachteiligte Menschen',
              'Zusammenarbeit mit AOZ, Caritas und anderen Sozialpartnern',
              'Erfolgreiche Vermittlungen in den ersten Arbeitsmarkt',
              'Sinnvolle Arbeit: Jedes refurbishte Gerät ist messbarer Impact',
            ]}
            relatedPages={[
              { title: 'Wirkung', href: '/wirkung', reason: 'Soziale Impact-Metriken im Detail' },
              { title: 'Team', href: '/team', reason: 'Unser Team & unsere Werte' },
            ]}
          />
        </div>
      </section>

      {/* Vision 2030 */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vision 2030</h2>
        <div className="gradient-hero-vision rounded-2xl p-8 text-white">
          <h3 className="mb-2 text-xl font-bold">
            Jedes IT-Gerät schöpft sein volles Potenzial aus. Niemand wird aufgrund mangelnder Technologie ausgeschlossen.
          </h3>
          <p className="text-sm opacity-90 mb-6">
            💡 Klicke auf die Metriken, um Details zur Datenquelle und Methodik zu sehen.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VISION_TARGETS.map((target) => (
              <VisionMetric
                key={target.value}
                value={target.value}
                label={target.label}
                source={target.source}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Der Souveränitäts-Pfad */}
      <section id="souveraenitat" className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unser Weg: Souveränität auf jeder Ebene</h2>
        <Card>
          <p className="mb-6 text-sm text-text-light">
            Von Anfang an ging es um Unabhängigkeit — von geplanter Obsoleszenz, von Lizenzkosten, von Abhängigkeit.
            Dieser Weg führt konsequent weiter:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SovereigntyPillar
              icon="🔧"
              title="Hardware-Souveränität"
              description="Repariere dein eigenes Gerät. Seit 2003."
              colorScheme="emerald"
              achievements={[
                'Seit 2003: Repair-Workshops & Open-Source-Hardware',
                `${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat aktuell, ~${DEVICES_PER_MONTH_TARGET}/Monat (Ziel mit Hub)`,
                'Right to Repair — Community-getrieben',
              ]}
              relatedPages={[
                { title: 'Operations', href: '/operations', reason: 'Wie unser Refurbishment-Prozess funktioniert' },
                { title: 'Wirkung', href: '/wirkung', reason: 'Wie viele Geräte wir gerettet haben' },
              ]}
            />
            <SovereigntyPillar
              icon="🐧"
              title="Software-Souveränität"
              description="Linux & Open Source statt Lizenzen."
              colorScheme="blue"
              achievements={[
                'Seit 2003: Linux-Fokus (Ubuntu, Linux Mint, etc.)',
                '100% Open-Source-Software auf allen Geräten',
                'Keine Lizenzkosten = niedrigere Preise',
              ]}
              relatedPages={[
                { title: 'Preismodell', href: '/preismodell', reason: 'Wie Open-Source Zugang ermöglicht' },
                { title: 'Team', href: '/team', reason: 'Unser Linux-Expertise' },
              ]}
            />
            <SovereigntyPillar
              icon="☁️"
              title="Daten-Souveränität"
              description="Schweizer Cloud & Hosting. Seit 2022."
              colorScheme="violet"
              achievements={[
                'Seit 2022: Nextcloud (Swiss Hosting)',
                'Alle Daten bleiben in der Schweiz',
                'DSGVO-konform, transparent, selbst gehostet',
              ]}
              relatedPages={[
                { title: 'Methodik', href: '/methodik', reason: 'Wie wir Daten verarbeiten' },
              ]}
            />
            <SovereigntyPillar
              icon="🧠"
              title="KI-Souveränität"
              description="Eigene Modelle hosten, trainieren, vermitteln."
              colorScheme="amber"
              achievements={[
                'GPU-Cluster geplant (Community Tech Space)',
                'Lokale KI-Modelle statt Cloud-Abhängigkeit',
                'Sovereign AI Lab für Schweizer Organisationen',
              ]}
              relatedPages={[
                { title: 'Strategie → Community Tech Space', href: '/strategie#community-tech-space', reason: 'Sovereign AI Lab Details' },
              ]}
            />
          </div>
        </Card>
      </section>

      {/* Community Tech Space Vision */}
      <section id="community-tech-space" className="mb-8">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Community Tech Space</h2>
          <p className="text-lg mb-3 leading-relaxed">
            <strong className="text-yellow-300">⏰ Deadline: Ende 2026</strong> — Wir müssen unser aktuelles Lokal verlassen.
          </p>
          <p className="text-lg mb-4 leading-relaxed">
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
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Kernbereiche (Essential)</h3>
          <p className="text-sm text-gray-600 mb-6">
            Diese Bereiche wachsen direkt aus unserer heutigen Arbeit und sind essenziell für die Vision 2030.
            Klicke auf «Mehr Details», um Aktivitäten, Kapazität und SDG-Beitrag zu sehen.
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
                'Hackathons, Tech-Talks, Community-Events',
              ]}
              capacity="20 Kursplätze, 500+ Teilnehmer/Jahr"
              targetAudience="Geflüchtete, Arbeitslose, Quereinsteiger, Schüler"
              sdgs={['SDG 4', 'SDG 8', 'SDG 10']}
              estimatedCost={`${getSpaceCostDisplay('Training & Course Room')} (20× Computer, Möbel, AV-Equipment)`}
            />

            <CommunitySpaceCard
              icon="🎤"
              title="Event- & Kulturraum"
              tagline="Tags Café, abends Konzerte & Talks"
              description="100 m² flexibler Raum für 50-80 Personen. Tags Co-Working & Café, abends Events, Konzerte, Filmabende."
              type="core"
              activities={[
                'Tagsüber: Community Café & Co-Working (CHF 5/Tag)',
                'Tech-Talks & Panels zu Nachhaltigkeit, KI, Open Source',
                'Konzerte (elektronische Musik, Vintage-Synths)',
                'Filmabende: Dokumentarfilme zu Tech & Gesellschaft',
                'Repair-Partys: Social + Reparatur + Musik',
              ]}
              capacity="50-80 Personen, 2-3 Events/Woche"
              targetAudience="Tech-Community, Nachbarschaft, Kulturinteressierte"
              sdgs={['SDG 11', 'SDG 17']}
              estimatedCost={`${getSpaceCostDisplay('Event Space + Community Café (MULTI-PURPOSE)')} (PA-Anlage, Möbel, Küche, Bar)`}
            />

            <CommunitySpaceCard
              icon="🏛️"
              title="Museum & Kulturraum"
              tagline="Computergeschichte zum Anfassen"
              description="80 m² für Ausstellungen, E-Waste-Kunst und Vintage-Tech. Von Commodore 64 bis zur ersten Cray."
              type="core"
              activities={[
                'Permanent: Computergeschichte-Ausstellung (Commodore, Amiga, NeXT)',
                'Wechselausstellungen: E-Waste-Kunst, Tech-Fotografie',
                'Vintage-Synth-Restaurierung & Konzerte',
                'Führungen für Schulklassen (CHF 200/Klasse)',
                'Depot für historische Hardware (Schenkungen)',
              ]}
              capacity="30-40 Besucher gleichzeitig"
              targetAudience="Schulklassen, Tech-Nostalgiker, Kulturinteressierte"
              sdgs={['SDG 11', 'SDG 4']}
              estimatedCost="CHF 50'000 (Vitrinen, Ausstellungskonzept, Objekte)"
            />

            <CommunitySpaceCard
              icon="☕"
              title="Community Café"
              tagline="Niederschwelliger Treffpunkt"
              description="30 m² Café-Bereich für Austausch, Networking und informelles Lernen."
              type="core"
              activities={[
                'Fair-Trade-Kaffee & Snacks (kostendeckend)',
                'Offener Treffpunkt: Keine Konsumpflicht',
                'Tech-Support-Sprechstunde (Di + Do 14-17 Uhr)',
                'Community-Board für Projekte, Jobs, Gesuche',
                'WiFi, Steckdosen, informelles Coworking',
              ]}
              capacity="15-20 Sitzplätze"
              targetAudience="Alle — niederschwelliger Zugang"
              sdgs={['SDG 11']}
              estimatedCost="CHF 30'000 (Café-Ausstattung, Möbel)"
            />
          </div>
        </div>

        {/* Expansion Spaces */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">✨ Mögliche Erweiterungen</h3>
          <p className="text-sm text-gray-600 mb-6">
            Diese Bereiche könnten den Hub einzigartig machen — abhängig von Funding, Partnerschaften und Community-Interesse.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CommunitySpaceCard
              icon="🎨"
              title="Kunst aus Elektroschrott"
              tagline="Skulpturen & Installationen"
              description="Künstler:innen erschaffen aus ausrangierten Platinen, Gehäusen und Komponenten neue Kunstwerke."
              type="expansion"
              activities={[
                'Resident Artists: 3-6 Monate Atelierplatz',
                'E-Waste-Art-Workshops für Schulen',
                'Ausstellungen & Verkauf (50% für Künstler)',
              ]}
              targetAudience="Künstler, Schulen, Kunstinteressierte"
            />

            <CommunitySpaceCard
              icon="🎹"
              title="Elektronische Musik"
              tagline="Synthesizer, Drum Machines"
              description="Vintage-Synths restaurieren, Circuit-Bending, Modular-Synthese lernen und Live-Konzerte veranstalten."
              type="expansion"
              activities={[
                'Synth-Restaurierung (Roland, Korg, Moog)',
                'Circuit-Bending-Workshops',
                'Modular-Synthese für Anfänger',
                'Live-Konzerte & DJ-Sets',
              ]}
              targetAudience="Musiker, Elektronik-Fans"
            />

            <CommunitySpaceCard
              icon="📖"
              title="Tech-Bibliothek"
              tagline="Bücher, Zines, Magazine"
              description="Leseecke mit kuratierter Sammlung zu Technologie, Nachhaltigkeit, Maker-Kultur und digitaler Gesellschaft."
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
              description="Monatliche Filmabende mit anschliessender Diskussion zu Themen wie Überwachung, KI-Ethik, Klimakrise."
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
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Hilf uns, diese Vision zu verwirklichen</h3>
          <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
            Der Community Tech Space ist mehr als ein Gebäude — es ist eine Plattform für <strong>digitale Teilhabe, nachhaltige Technologie und soziale Innovation</strong>. Mit deiner Unterstützung können wir diesen Ort schaffen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              📊 3-Jahres-Fundraising-Plan ansehen
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              🏛️ Passende Stiftungen finden
            </Link>
          </div>
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">UN Sustainable Development Goals</h2>
        <Card>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {SDG_DATA.map((sdg) => (
              <span
                key={sdg.sdg}
                className={`inline-block rounded-full bg-gradient-to-br ${SDG_COLORS[sdg.sdg]} px-4 py-2 text-sm font-semibold text-white`}
              >
                {sdg.sdg}
              </span>
            ))}
          </div>
          <Table<SdgRow>
            columns={[
              { key: 'sdg', header: 'SDG', render: (r) => <strong>{r.sdg}</strong> },
              { key: 'name', header: 'Ziel' },
              { key: 'activities', header: 'Unser Beitrag' },
            ]}
            data={SDG_DATA}
            keyExtractor={(r) => r.sdg}
            compact
          />
        </Card>
      </section>

      <KontaktSection />

      <StoryBridge bridges={STORY_BRIDGES.strategie} />
    </>
  );
}
