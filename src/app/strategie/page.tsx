import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import MetricGrid from '@/components/metrics/MetricGrid';
import { PILLARS, VISION_TARGETS, HUB_CORE_SPACES, HUB_CULTURAL_SPACES, SDG_DATA, SDG_COLORS } from './data';
import type { SdgRow } from './data';
import { GeschichteSection, KontaktSection, SovereigntyPillar, VisionMetric } from './components';
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
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vier Säulen</h2>
        <MetricGrid columns={4}>
          {PILLARS.map((p) => (
            <div key={p.title} className="flex flex-col items-center rounded-xl border border-border bg-white p-5 text-center shadow-sm">
              <span className="mb-3 text-4xl">{p.icon}</span>
              <h3 className="text-sm font-semibold">{p.title}</h3>
              <p className="mt-2 text-xs text-text-muted">{p.description}</p>
            </div>
          ))}
        </MetricGrid>
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
      <section className="mb-8">
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
