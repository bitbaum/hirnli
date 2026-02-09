import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricGrid from '@/components/metrics/MetricGrid';
import Table from '@/components/ui/Table';
import { VALUES, PILLARS, VISION_TARGETS, COMMUNITY_SPACES, TOC_STEPS, TOC_TABLE_DATA, SDG_DATA, SDG_COLORS, EWASTE_FACTS, UNIQUE_POINTS } from './data';
import type { TocRow, SdgRow, EwasteRow } from './data';
import { GeschichteSection, KontaktSection } from './components';

export const metadata: Metadata = {
  title: 'Strategie & Vision',
  description: 'Mission, Werte und strategische Ausrichtung von Revamp-IT',
};

export default function StrategiePage() {
  return (
    <>
      <PageHeader
        title="Strategie & Vision"
        subtitle="Mission, Werte und strategische Ausrichtung von Revamp-IT"
      />

      <GeschichteSection />

      {/* Mission Statement */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Mission Statement</h2>
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <p className="text-lg font-semibold text-emerald-800">
            Revamp-IT gestaltet die Zukunft der IT durch nachhaltige Aufarbeitung und Recycling.
          </p>
          <p className="mt-3 text-sm text-text-light">
            Wir retten gebrauchte Computer vor dem Elektroschrott, indem wir sie mit Linux und Open-Source-Software
            wiederbeleben. Gleichzeitig schaffen wir Zugang zu bezahlbarer Technologie, fördern digitale Kompetenzen
            und unterstützen Menschen bei der beruflichen Wiedereingliederung.
          </p>
          <p className="mt-3 text-xs text-text-muted">
            Quelldokument: Mission_Vision_Statement.md, Version 1.0, November 2025
          </p>
        </Card>
      </section>

      {/* Vision 2030 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vision 2030</h2>
        <div className="rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] p-8 text-white">
          <h3 className="mb-4 text-xl font-bold">
            Eine Welt, in der jedes IT-Gerät sein volles Potenzial ausschöpft und niemand aufgrund mangelnder Technologie ausgeschlossen wird.
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VISION_TARGETS.map((target) => (
              <div key={target.value} className="rounded-lg bg-white/10 p-4">
                <strong className="block text-xl">{target.value}</strong>
                <span className="text-sm opacity-90">{target.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Vision genehmigt durch Vorstand, November 2025
        </p>
      </section>

      {/* Community Tech Space Vision */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Zukunftsvision: Community Tech Space</h2>
        <Card>
          <p className="mb-4 text-sm text-text-light">
            Unser Traum ist ein grösserer Raum, der als Museum, Werkstatt und Treffpunkt für die nachhaltige Tech-Community dient:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITY_SPACES.map((space) => (
              <div key={space.title} className="flex flex-col items-center rounded-xl border border-border bg-white p-5 text-center shadow-sm">
                <span className="mb-3 text-4xl">{space.icon}</span>
                <h3 className="text-sm font-semibold">{space.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{space.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm italic text-text-muted">
            Diese Vision macht uns einzigartig: Wir verbinden die Geschichte der Informatik mit der Zukunft der nachhaltigen IT.
          </p>
        </Card>
      </section>

      {/* Unsere Werte */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unsere Werte</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} className={`border-l-4 ${v.color}`}>
              <h3 className="text-base font-semibold">
                {v.icon} {v.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{v.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Vier Säulen */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vier Säulen unserer Arbeit</h2>
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

      {/* Theory of Change */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Theory of Change</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Wie wir Wirkung erzielen</CardTitle>
          </CardHeader>

          {/* Flow visualization */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-bg-light p-6">
            {TOC_STEPS.map((step, i) => (
              <div key={step.level} className="flex items-center gap-3">
                <div className={`rounded-lg px-5 py-3 text-center shadow-sm ${
                  step.highlight ? 'bg-primary text-white' : 'bg-white'
                }`}>
                  <strong className="block text-sm">{step.level}</strong>
                </div>
                {i < TOC_STEPS.length - 1 && (
                  <span className="text-xl text-text-muted">&rarr;</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Table<TocRow>
              columns={[
                { key: 'level', header: 'Ebene', render: (r) => <strong>{r.level}</strong> },
                { key: 'measure', header: 'Was wir messen' },
                { key: 'kpi', header: 'Beispiel-KPI' },
                { key: 'source', header: 'Quelle', render: (r) => <Badge variant="live">{r.source}</Badge> },
              ]}
              data={TOC_TABLE_DATA}
              keyExtractor={(r) => r.level}
              compact
            />
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Siehe <a href="/wirkung">Impact-Zahlen</a> für detaillierte Impact-Metriken und{' '}
            <a href="/methodik">Methodik</a> für Berechnungsgrundlagen.
          </p>
        </Card>
      </section>

      {/* SDG Alignment */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Beitrag zu den UN Sustainable Development Goals</h2>
        <Card>
          {/* SDG badges */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {SDG_DATA.map((sdg) => (
              <span
                key={sdg.sdg}
                className={`inline-block rounded-full bg-gradient-to-br ${SDG_COLORS[sdg.sdg]} px-4 py-2 text-sm font-semibold text-white`}
              >
                {sdg.sdg} – {sdg.name}
              </span>
            ))}
          </div>

          <Table<SdgRow>
            columns={[
              { key: 'sdg', header: 'SDG', render: (r) => <strong>{r.sdg}</strong> },
              { key: 'name', header: 'Unser Beitrag' },
              { key: 'activities', header: 'Messbare Aktivitäten' },
            ]}
            data={SDG_DATA}
            keyExtractor={(r) => r.sdg}
            compact
          />

          <p className="mt-4 text-xs text-text-muted">
            SDG Framework:{' '}
            <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
              sdgs.un.org/goals
            </a>
          </p>
        </Card>
      </section>

      {/* Was uns einzigartig macht */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Was uns einzigartig macht</h2>
        <Card>
          <div className="space-y-4">
            {UNIQUE_POINTS.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <strong>{item.title}:</strong>{' '}
                  <span className="text-sm text-text-light">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* E-Waste Krise */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die E-Waste Krise: Warum unsere Arbeit wichtig ist</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Globale Fakten</CardTitle>
            </CardHeader>
            <Table<EwasteRow>
              columns={[
                { key: 'stat', header: 'Kennzahl', render: (r) => <strong>{r.stat}</strong> },
                { key: 'description', header: 'Beschreibung' },
              ]}
              data={EWASTE_FACTS}
              keyExtractor={(r) => r.stat}
              compact
            />
            <p className="mt-3 text-xs text-text-muted">
              Quellen: BAFU Abfallstatistik, UN E-waste Monitor 2024, wissenschaftliche LCA-Studien
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unser Ansatz: Zero-Waste-Hierarchie</CardTitle>
            </CardHeader>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-text-light">
              <li><strong>Reparieren</strong> – Geräte reparieren und an Besitzer zurückgeben (nachhaltigste Option)</li>
              <li><strong>Aufbereiten</strong> – Gespendete Geräte professionell überholen und weitergeben</li>
              <li><strong>Recyceln</strong> – Nicht mehr nutzbare Geräte fachgerecht zerlegen</li>
              <li><strong>Aufklären</strong> – Menschen befähigen, ihre Geräte länger zu nutzen</li>
            </ol>
            <p className="mt-3 text-xs text-text-muted">
              Basiert auf wissenschaftlichen Lifecycle-Assessment-Studien und der Schweizer Abfallhierarchie (BAFU)
            </p>
          </Card>
        </div>
      </section>

      <KontaktSection />
    </>
  );
}
