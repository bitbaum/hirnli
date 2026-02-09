import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Table from '@/components/ui/Table';

export const metadata: Metadata = {
  title: 'Strategie & Vision',
  description: 'Mission, Werte und strategische Ausrichtung von Revamp-IT',
};

/* ────────────────────────────────────────────
   Static data for this page
   ──────────────────────────────────────────── */

const VALUES = [
  { icon: '🌍', title: 'Nachhaltigkeit', description: 'Wir verlängern die Lebensdauer von IT-Geräten und reduzieren aktiv Elektroschrott und CO2-Emissionen.', color: 'border-l-emerald-500' },
  { icon: '🔓', title: 'Offenheit', description: 'Wir setzen auf Open Source Software, transparente Prozesse und teilen unser Wissen frei mit der Community.', color: 'border-l-blue-500' },
  { icon: '🤝', title: 'Inklusion', description: 'Wir schaffen Zugang zu Technologie für alle – unabhängig von Einkommen, Vorwissen oder Herkunft.', color: 'border-l-violet-500' },
  { icon: '💡', title: 'Befähigung', description: 'Wir bilden Menschen aus, vermitteln Fähigkeiten und schaffen Perspektiven für berufliche Entwicklung.', color: 'border-l-amber-500' },
  { icon: '⚡', title: 'Innovation', description: 'Wir finden kreative Lösungen für alte Probleme und beweisen, dass Nachhaltigkeit und Leistung Hand in Hand gehen.', color: 'border-l-red-500' },
  { icon: '🎯', title: 'Wirkung', description: 'Jede unserer Aktivitäten dient einem messbaren ökologischen, sozialen oder ökonomischen Nutzen.', color: 'border-l-cyan-500' },
] as const;

const PILLARS = [
  { icon: '♻️', title: '1. Umweltschutz', description: 'Reduktion von Elektroschrott durch Wiederinstandsetzung, Reparatur, Weiterverwendung und fachgerechtes Recycling' },
  { icon: '🐧', title: '2. Digitale Souveränität', description: 'Förderung von Linux & Open-Source Software als nachhaltige, kostengünstige und befähigende Technologieoption' },
  { icon: '📚', title: '3. Bildung & Aufklärung', description: 'Workshops, technische Unterstützung und niederschwellige Lernangebote für alle Altersgruppen' },
  { icon: '🤝', title: '4. Soziale Integration', description: 'Unterstützung bei der beruflichen Wiedereingliederung durch Struktur, Routinen und sinnvolle Tätigkeiten' },
] as const;

const VISION_TARGETS = [
  { value: "10'000+", label: 'Geräte jährlich vor Elektroschrott gerettet' },
  { value: 'Schweizweit', label: 'Netzwerk von Repair-Hubs aufbauen' },
  { value: '500+', label: 'Menschen pro Jahr in digitalen Skills ausbilden' },
  { value: '100%', label: 'Finanzielle Nachhaltigkeit durch Social Business' },
  { value: '#1', label: 'Führende Organisation für nachhaltige IT in der Schweiz' },
  { value: 'Community Tech Space', label: 'Museum, Werkstatt & Treffpunkt' },
] as const;

const COMMUNITY_SPACES = [
  { icon: '🏛️', title: 'Vintage-Hardware Museum', description: 'Von Apple I bis Amiga, von Commodore 64 bis frühen Linux-Workstations' },
  { icon: '🎹', title: 'Synthesizer-Sammlung', description: 'Historische Synthesizer & elektronische Musikinstrumente' },
  { icon: '🔧', title: 'Offene Werkstatt', description: 'Community-Reparatur-Events und Hands-on Workshops' },
  { icon: '☕', title: 'Community Cafe', description: 'Austausch und informelles Networking' },
] as const;

const TOC_STEPS = [
  { level: 'Input', highlight: false },
  { level: 'Aktivitäten', highlight: false },
  { level: 'Output', highlight: false },
  { level: 'Outcome', highlight: false },
  { level: 'Impact', highlight: true },
] as const;

type TocRow = { level: string; measure: string; kpi: string; source: string };

const TOC_TABLE_DATA: TocRow[] = [
  { level: 'Input', measure: 'Ressourcen, die wir einsetzen', kpi: 'Volunteer-Stunden, Spendeneinnahmen', source: 'Kivitendo' },
  { level: 'Aktivitäten', measure: 'Was wir tun', kpi: 'Workshops durchgeführt, Geräte aufbereitet', source: 'Tracking' },
  { level: 'Output', measure: 'Direkte Ergebnisse', kpi: 'DEV_SAVED, WS_PEOPLE, PARTICIPANTS', source: 'KPI System' },
  { level: 'Outcome', measure: 'Veränderungen bei Zielgruppen', kpi: 'Reintegration erfolgreich, Digitale Skills erworben', source: 'Befragung' },
  { level: 'Impact', measure: 'Langfristige gesellschaftliche Wirkung', kpi: 'CO2 vermieden, Elektroschrott reduziert', source: 'Berechnet' },
];

type SdgRow = { sdg: string; name: string; activities: string };

const SDG_DATA: SdgRow[] = [
  { sdg: 'SDG 4', name: 'Hochwertige Bildung', activities: 'Workshops, Digital-Skills-Training, Praktikanten-Ausbildung' },
  { sdg: 'SDG 8', name: 'Menschenwürdige Arbeit', activities: 'Arbeitsintegrationsprogramme, sinnvolle Beschäftigung' },
  { sdg: 'SDG 9', name: 'Innovation & Infrastruktur', activities: 'Zugang zu IT-Infrastruktur, Open-Source-Lösungen' },
  { sdg: 'SDG 10', name: 'Weniger Ungleichheiten', activities: 'Solidarisches Preismodell, Gratis-Geräte für Bedürftige' },
  { sdg: 'SDG 12', name: 'Nachhaltiger Konsum', activities: 'Refurbishment, Reparatur statt Neukauf' },
  { sdg: 'SDG 13', name: 'Klimaschutz', activities: 'CO2-Vermeidung durch Lebensdauerverlängerung' },
];

const SDG_COLORS: Record<string, string> = {
  'SDG 4': 'from-red-700 to-red-500',
  'SDG 8': 'from-pink-800 to-pink-600',
  'SDG 9': 'from-orange-600 to-orange-400',
  'SDG 10': 'from-pink-700 to-red-500',
  'SDG 12': 'from-yellow-700 to-yellow-500',
  'SDG 13': 'from-green-700 to-green-600',
};

type EwasteRow = { stat: string; description: string };

const EWASTE_FACTS: EwasteRow[] = [
  { stat: '62 Mio. Tonnen', description: 'Elektroschrott jährlich weltweit' },
  { stat: '22.3%', description: 'werden korrekt recycelt' },
  { stat: '~23 kg', description: 'E-Waste pro Person/Jahr in der Schweiz' },
  { stat: '~331 kg CO2', description: 'Herstellung eines neuen Laptops' },
];

const UNIQUE_POINTS = [
  { icon: '✨', title: 'Ganzheitlicher Ansatz', text: 'Wir kombinieren Umweltschutz, soziale Wirkung und ökonomische Nachhaltigkeit in einem Modell.' },
  { icon: '🔬', title: 'Expertise', text: 'Spezialisierung auf Vintage-Computer, Legacy-Systeme und Datenrettung – Wissen, das sonst verloren geht.' },
  { icon: '👥', title: 'Community', text: 'Starkes Netzwerk aus Freiwilligen, Praktikanten und Partnern.' },
  { icon: '📊', title: 'Messbare Wirkung', text: 'Klare KPIs und transparentes Impact-Reporting – jede Zahl ist nachvollziehbar.' },
  { icon: '📍', title: 'Lokale Verankerung', text: 'Zürich-basiert mit schweizweitem Service, physischer Treffpunkt und persönliche Beratung.' },
] as const;

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */

export default function StrategiePage() {
  return (
    <>
      <PageHeader
        title="Strategie & Vision"
        subtitle="Mission, Werte und strategische Ausrichtung von Revamp-IT"
      />

      {/* Unsere Geschichte */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unsere Geschichte</h2>
        <Card>
          <div className="flex flex-wrap gap-8">
            <div className="min-w-[300px] flex-[2]">
              <h3 className="mt-0 text-lg font-semibold text-primary">Gegründet Dezember 2003</h3>
              <p className="mt-2 text-sm text-text-light">
                Revamp-IT wurde im Dezember 2003 in Zürich gegründet – geboren aus einer einfachen Beobachtung:
                Immer mehr brauchbare Computer landeten im Müll. &ldquo;Da muss etwas passieren&rdquo;, war der Gedanke,
                der alles ins Rollen brachte.
              </p>
              <p className="mt-2 text-sm text-text-light">
                In der Toni Molkerei in Zürich-West – in einem alten Käsekeller – begannen die Gründer
                Michel, Eckhardt und Andreas, sich mit der Reparatur und Lebensverlängerung von Computern
                zu beschäftigen. Schritt für Schritt hat sich daraus ein Verein entwickelt, der sich auf{' '}
                <strong>Kreislaufwirtschaft, digitale Teilhabe und Open-Source-Technologie</strong> konzentriert.
              </p>
              <h4 className="mt-4 text-sm font-semibold">Drei Themen von Anfang an:</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-light">
                <li><strong>Hardware und Reparatur</strong> – die Freude daran, Geräte zu reparieren und länger nutzbar zu machen</li>
                <li><strong>Freie und Open-Source-Software</strong> – insbesondere Linux, um ältere Geräte ohne zusätzliche Lizenzkosten weiter zu betreiben</li>
                <li><strong>Soziale Wirkung</strong> – die Überzeugung, dass Technologie Menschen unterstützen soll, statt sie auszuschliessen</li>
              </ul>
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-bg-light p-6 text-center">
                <span className="mb-3 text-4xl">🏢</span>
                <h3 className="text-base font-semibold">Heute</h3>
                <p className="mt-2 text-left text-sm text-text-light">
                  <strong>Laden:</strong> Birmensdorferstrasse 379, Zürich<br />
                  <strong>Lager:</strong> Badenerstrasse 816<br /><br />
                  Werkstatt, Verkauf und Community-Treffpunkt unter einem Dach.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

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
                  <span className="text-xl text-text-muted">→</span>
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

      {/* Kontakt */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Kontakt</h2>
        <Card className="text-center">
          <h3 className="mb-3 text-lg font-semibold">Revamp-IT</h3>
          <p className="text-sm"><strong>Adresse:</strong> Birmensdorferstrasse 379, 8055 Zürich</p>
          <p className="text-sm"><strong>Telefon:</strong> +41 44 586 86 86</p>
          <p className="text-sm"><strong>E-Mail:</strong> empfang@revamp-it.ch</p>
          <p className="text-sm">
            <strong>Web:</strong>{' '}
            <a href="https://revampit.vercel.app" target="_blank" rel="noopener noreferrer">
              revampit.vercel.app
            </a>
          </p>
          <p className="mt-6 text-sm italic text-text-muted">
            &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
          </p>
        </Card>
      </section>
    </>
  );
}
