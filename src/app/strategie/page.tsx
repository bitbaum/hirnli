import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import MetricGrid from '@/components/metrics/MetricGrid';
import { PILLARS, VISION_TARGETS, HUB_CORE_SPACES, HUB_CULTURAL_SPACES, SDG_DATA, SDG_COLORS } from './data';
import type { SdgRow } from './data';
import { GeschichteSection, KontaktSection, SovereigntyPillar, VisionMetric, PillarDetail } from './components';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Strategie & Vision',
  description: 'Mission, Werte und strategische Ausrichtung von Revamp-IT',
};

export default function StrategiePage() {
  return (
    <>
      <PageHeader
        title="Strategie & Vision"
        subtitle="Woher wir kommen, wofür wir stehen, wohin wir gehen"
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
            Revamp-IT gestaltet die Zukunft der IT durch Reparatur, Refurbishing und Lebensdauerverlängerung.
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
              'Professionelles Refurbishment: 25-35 Geräte/Monat mit standardisiertem Prozess',
              'Datenvernichtung nach NIST 800-88 Standard (secure data wipe)',
              'Fachgerechtes Recycling für nicht reparierbare Komponenten (>80% Quote)',
              'Lebensdauerverlängerung: Ältere Hardware läuft mit Linux weitere 5-10 Jahre',
            ]}
            whyItMatters="Jeder neue Laptop verursacht ~350 kg CO₂ bei der Herstellung, Refurbishment nur ~65 kg. Netto-Einsparung: 285 kg CO₂ pro Gerät (Fraunhofer IZM 2023). Elektroschrott ist einer der am schnellsten wachsenden Abfallströme weltweit (62 Mio. Tonnen/Jahr). Gleichzeitig schonen wir wertvolle Rohstoffe wie Kupfer, Gold und seltene Erden."
            achievements={[
              'Seit 2003: 1\'200+ Geräte vor Elektroschrott gerettet',
              'Aktuelle Kapazität: 25-35 Geräte/Monat (ca. 300-420/Jahr)',
              'Durchschnittliche Lebensdauerverlängerung: 5-7 Jahre pro Gerät',
              'Recycling-Quote für nicht reparierbare Teile: >80%',
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
              'Seit 2003: 1\'200+ Geräte mit vorinstalliertem Linux verkauft',
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
              'Seit 2003: 100+ Menschen in Workshops & Praktika begleitet',
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
                '25-35 Geräte/Monat professionell refurbished',
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
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Community Tech Space</h2>
        <Card>
          <p className="mb-2 text-sm text-text-light">
            Wir müssen unser aktuelles Lokal bis Ende 2026 verlassen. Das ist unsere Chance,
            etwas Grösseres zu schaffen — ein Ort, an dem Nachhaltigkeit, Technologie und Gemeinschaft zusammenkommen.
          </p>
          <p className="mb-6 text-sm text-text-light">
            Shop, Werkstatt, Schulungsraum, Rechenzentrum und Treffpunkt unter einem Dach.
          </p>

          {/* Hub Core */}
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Bereiche</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {HUB_CORE_SPACES.map((space) => (
              <div key={space.title} className="flex flex-col items-center rounded-xl border border-border bg-white p-5 text-center shadow-sm">
                <span className="mb-3 text-4xl">{space.icon}</span>
                <h3 className="text-sm font-semibold">{space.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{space.description}</p>
              </div>
            ))}
          </div>

          {/* Cultural Expansion */}
          <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-text-muted">Mögliche Erweiterungen</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HUB_CULTURAL_SPACES.map((space) => (
              <div key={space.title} className="flex flex-col items-center rounded-xl border border-dashed border-border bg-bg-light p-5 text-center">
                <span className="mb-3 text-4xl">{space.icon}</span>
                <h3 className="text-sm font-semibold">{space.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{space.description}</p>
              </div>
            ))}
          </div>
        </Card>
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
