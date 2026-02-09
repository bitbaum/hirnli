import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { STIFTUNGEN_DATA, STATUS_LABELS } from '@/lib/config/foundations';
import type { FoundationStatus } from '@/lib/schemas/foundation';

export const metadata: Metadata = {
  title: 'Fundraising & Vision 2026',
  description: 'Fundraising Hub - Vision, Budget, Pipeline und Foerdermoeglichkeiten',
};

// -- Derived data from STIFTUNGEN_DATA ----------------------------------------

function computePipelineStats() {
  const statusCounts: Record<FoundationStatus, number> = {
    open: 0,
    closed: 0,
    rolling: 0,
    soon: 0,
  };

  let totalFit = 0;
  let fitCount = 0;
  let upcomingDeadlines = 0;
  const now = new Date();
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (const f of STIFTUNGEN_DATA) {
    statusCounts[f.status]++;

    if (f.fit) {
      totalFit += f.fit;
      fitCount++;
    }

    if (f.deadline) {
      const deadline = new Date(f.deadline);
      if (deadline >= now && deadline <= threeMonths) {
        upcomingDeadlines++;
      }
    }
  }

  const avgFit = fitCount > 0 ? totalFit / fitCount : 0;
  const highFitCount = STIFTUNGEN_DATA.filter((f) => f.fit >= 3).length;

  return {
    total: STIFTUNGEN_DATA.length,
    statusCounts,
    avgFit,
    highFitCount,
    upcomingDeadlines,
  };
}

// -- Static config for the page -----------------------------------------------

const STATUS_BADGE_VARIANT: Record<FoundationStatus, 'success' | 'warning' | 'danger' | 'primary'> = {
  open: 'success',
  rolling: 'primary',
  soon: 'warning',
  closed: 'danger',
};

const PILLARS = [
  {
    title: 'Oekologie & Kreislaufwirtschaft',
    color: 'border-emerald-500',
    bgHighlight: 'bg-emerald-50',
    items: [
      'E-Waste reduzieren durch Wiederverwendung',
      'Lebensdauer von Geraeten verlaengern',
      'Linux statt Windows = laengere Nutzung',
      'Reparieren statt wegwerfen',
    ],
    highlight: 'Wirkung: 1000+ Geraete/Jahr gerettet = 285 Tonnen CO2 eingespart',
  },
  {
    title: 'Soziale Integration',
    color: 'border-amber-500',
    bgHighlight: 'bg-amber-50',
    items: [
      'Praktikumsplaetze fuer Menschen in Uebergangssituationen',
      'Skills entwickeln: Hardware, Software, Kundenkontakt',
      'Begleitung auf dem Weg zurueck in den Arbeitsmarkt',
      'Bezahlbare IT fuer alle',
    ],
    highlight: 'Wirkung: 100+ Menschen begleitet, 90% Erfolgsquote',
  },
  {
    title: 'Tech-Bildung fuer alle',
    color: 'border-blue-500',
    bgHighlight: 'bg-blue-50',
    items: [
      'Reparatur-Wissen weitergeben (Repair Cafe)',
      'Digitale Kompetenzen vermitteln',
      'Kritisches Tech-Verstaendnis foerdern',
      'Hands-on Lernen statt passiver Konsum',
    ],
    highlight: 'Vision: 200+ Workshop-Teilnehmer/Jahr, 40+ Kurse',
  },
];

const HUB_ZONES = [
  { name: 'Shop', description: 'Refurbished Geraete, Beratung' },
  { name: 'Werkstatt', description: 'Reparatur, Praktikumsplaetze' },
  { name: 'Repair Cafe', description: 'Gemeinsam reparieren lernen' },
  { name: 'Schulungsraum', description: 'Kurse, Workshops, Bildung' },
  { name: 'Hackerspace', description: 'Maker-Bereich, Tuefteln' },
  { name: 'Museum', description: 'Computergeschichte, Hands-on' },
];

const BUDGET_ITEMS = [
  { label: 'Umzug & Einrichtung', amount: "CHF 130'000" },
  { label: '2 Program Manager', amount: "CHF 216'000" },
  { label: 'Standort-Mehrkosten', amount: "CHF 102'000" },
  { label: 'Repair Cafe & Hackerspace', amount: "CHF 25'000" },
  { label: 'Weiterbildung & Kurse', amount: "CHF 20'000" },
  { label: 'Museum & Hands-on', amount: "CHF 17'000" },
];

const PACKAGES = [
  { name: 'Hauptpartner', amount: "CHF 185'000", description: 'Der Hub existiert', featured: true },
  { name: 'Hub-Einrichtung', amount: "CHF 130'000", description: 'Umzug & Aufbau', featured: false },
  { name: 'Bildungsprogramm', amount: "CHF 108'000", description: '1 Jahr Kurse & Workshops', featured: false },
  { name: 'Integration', amount: "CHF 108'000", description: '1 Jahr Praktikumsbetreuung', featured: false },
  { name: 'Jahrespartner', amount: "CHF 55'000", description: '1 Jahr Standortkosten', featured: false },
  { name: 'Repair Cafe', amount: "CHF 15'000", description: 'Community-Reparaturwerkstatt', featured: false },
];

const RESOURCES = [
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'Impact-Zahlen mit Quellen' },
  { href: '/fundraising/stiftungen', label: 'Stiftungen-Uebersicht', description: '45+ Foerderer mit Deadlines' },
  { href: '/finanzen', label: 'Finanzdaten', description: 'Kivitendo-Daten visualisiert' },
];

const NEXT_STEPS = [
  {
    step: '1. Stiftung auswaehlen',
    description: 'Priorisierte Liste mit Deadlines und Anforderungen.',
    href: '/fundraising/stiftungen',
    linkLabel: 'Stiftungen-Uebersicht oeffnen',
  },
  {
    step: '2. Gesuch vorbereiten',
    description: 'Templates und Bausteine fuer schnellere Antraege.',
    href: '/dokumente',
    linkLabel: 'Vorlagen herunterladen',
  },
  {
    step: '3. Wirkung belegen',
    description: 'Zahlen mit Quellenangaben fuer Glaubwuerdigkeit.',
    href: '/wirkung',
    linkLabel: 'Impact-Daten ansehen',
  },
];

// -- Page Component ------------------------------------------------------------

export default function FundraisingPage() {
  const stats = computePipelineStats();

  return (
    <>
      <PageHeader
        title="Fundraising & Vision 2026"
        subtitle="Community Tech Hub - Oekologie, Soziales und Bildung unter einem Dach"
        badge="Fundraising"
      />

      {/* Summary Metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Stiftungen total"
          value={String(stats.total)}
          subtitle="Recherchierte Foerderer"
          sourceType="live"
        />
        <MetricCard
          label="Hoher Fit (3/3)"
          value={String(stats.highFitCount)}
          subtitle="Beste Uebereinstimmung"
          sourceType="derived"
        />
        <MetricCard
          label="Durchschn. Fit"
          value={stats.avgFit.toFixed(1)}
          subtitle="von 3.0"
          sourceType="derived"
        />
        <MetricCard
          label="Deadlines (90 Tage)"
          value={String(stats.upcomingDeadlines)}
          subtitle="Anstehende Fristen"
          sourceType="live"
        />
      </MetricGrid>

      {/* Pipeline by Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fundraising Pipeline</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.entries(stats.statusCounts) as [FoundationStatus, number][]).map(
            ([status, count]) => (
              <div key={status} className="rounded-lg bg-gray-50 p-4 text-center">
                <Badge variant={STATUS_BADGE_VARIANT[status]} className="mb-2">
                  {STATUS_LABELS[status].text}
                </Badge>
                <div className="text-2xl font-bold text-grey-dark">{count}</div>
                <div className="text-xs text-text-muted">{STATUS_LABELS[status].desc}</div>
              </div>
            )
          )}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/fundraising/stiftungen"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Stiftungen & Foerderer Uebersicht
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </Card>

      {/* Vision Hero */}
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">Community Tech Hub 2026</h2>
        <p className="mb-2 text-lg italic opacity-90">
          &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
        </p>
        <p className="mb-6 opacity-95">
          Seit 2003 verbinden wir Kreislaufwirtschaft, Arbeitsintegration und Tech-Bildung unter
          einem Dach.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Oekologie', value: '285 kg', sub: 'CO2 pro Laptop gespart' },
            { label: 'Soziales', value: '100+', sub: 'Menschen begleitet' },
            { label: 'Bildung', value: '20+', sub: 'Jahre Erfahrung' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white/15 p-4 text-center"
            >
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm opacity-90">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Three Pillars */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unsere drei Saeulen</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className={`border-t-4 ${pillar.color}`}>
              <h3 className="mb-3 font-semibold text-grey-dark">{pillar.title}</h3>
              <ul className="mb-3 space-y-1 pl-5 text-sm text-text-muted">
                {pillar.items.map((item) => (
                  <li key={item} className="list-disc">
                    {item}
                  </li>
                ))}
              </ul>
              <div className={`rounded-lg ${pillar.bgHighlight} p-3 text-sm`}>
                <strong>{pillar.highlight.split(':')[0]}:</strong>
                {pillar.highlight.split(':').slice(1).join(':')}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Financial Situation */}
      <Card className="mb-8 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100">
        <h3 className="mb-3 font-semibold text-amber-800">Die ehrliche Finanzlage</h3>
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            <strong>Was passiert ist:</strong> Der Verlust von zwei B2B-Grosskunden hat unsere
            Dienstleistungs-Einnahmen um 76% reduziert. Von CHF 130&apos;000 (2022-23) auf ~CHF
            42&apos;000 (2025).
          </p>
          <p>
            <strong>Der Grund:</strong> Abhaengigkeit von wenigen Kunden (Kivitendo-Hosting). Keine
            diversifizierten Einnahmequellen.
          </p>
          <p className="font-medium text-emerald-800">
            <strong>Das Positive:</strong> Unser Kerngeschaeft (Geraeteverkauf) blieb stabil. Der
            Hub ist unsere Turnaround-Strategie: diversifizierte Einnahmen durch Kurse, Repair Cafe
            und Community.
          </p>
        </div>
      </Card>

      {/* Hub Vision */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Der Community Tech Hub</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-text-muted">
          Ein Ort, an dem Oekologie, Soziales und Bildung zusammenkommen. 320 m&#178; fuer
          nachhaltige Technologie.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {HUB_ZONES.map((zone) => (
            <div key={zone.name} className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-sm font-semibold">{zone.name}</div>
              <div className="text-xs text-text-muted">{zone.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* The Ask / Budget */}
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-8 text-white">
        <h2 className="mb-4 text-xl font-bold">Der Foerderbedarf</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white/10 p-4">
            <h4 className="mb-3 text-sm font-medium opacity-90">Verwendung (2 Jahre)</h4>
            <div className="space-y-2">
              {BUDGET_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between border-b border-white/10 pb-2 text-sm last:border-0"
                >
                  <span>{item.label}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-emerald-300">
                <span>Eigenertraege (datenbasiert)</span>
                <span>- CHF 145&apos;000</span>
              </div>
              <div className="mt-2 flex justify-between border-t-2 border-white/30 pt-3 text-base font-bold">
                <span>Foerderbedarf Total</span>
                <span>CHF 370&apos;000</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold">CHF 370k</span>
            <span className="mt-1 text-lg opacity-90">Foerderbedarf ueber 2 Jahre</span>
            <p className="mt-3 text-sm opacity-80">
              Wir finanzieren 28% selbst - trotz Krise
            </p>
            <p className="mt-1 text-sm opacity-80">
              74% der Eigenertraege historisch belegt
            </p>
          </div>
        </div>
      </section>

      {/* Sponsorship Packages */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Beteiligungsmoeglichkeiten</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.name}
              className={`text-center transition-transform hover:-translate-y-0.5 ${
                pkg.featured ? 'relative border-2 border-emerald-500' : ''
              }`}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Empfohlen
                </span>
              )}
              <div className="text-sm font-semibold">{pkg.name}</div>
              <div className="my-2 text-2xl font-bold text-primary">{pkg.amount}</div>
              <div className="text-sm text-text-muted">{pkg.description}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Resources */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wichtige Ressourcen</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RESOURCES.map((resource) => (
            <Link key={resource.href} href={resource.href} className="block">
              <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
                <div className="flex-1">
                  <strong className="block text-sm">{resource.label}</strong>
                  <span className="text-xs text-text-muted">{resource.description}</span>
                </div>
                <span className="text-primary" aria-hidden="true">&rarr;</span>
              </Card>
            </Link>
          ))}
        </div>
        <Card className="mt-4 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-sm text-amber-900">
            <strong>Dokumente zum Download:</strong> Pitch Deck, Gesuch-Vorlagen und Excel-Dateien
            sind im{' '}
            <a
              href="https://cloud.revamp-it.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-800 underline"
            >
              Nextcloud (Revamp-Hirn)
            </a>{' '}
            unter <code className="text-xs">01_Management/B_Finanzen/Fundraising/</code>{' '}
            verfuegbar.
          </p>
        </Card>
      </section>

      {/* Next Steps CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 p-8 text-white">
        <h2 className="mb-6 text-xl font-bold">Naechste Schritte</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {NEXT_STEPS.map((step) => (
            <div key={step.step} className="rounded-xl bg-white/10 p-5">
              <h3 className="mb-2 font-semibold opacity-90">{step.step}</h3>
              <p className="mb-3 text-sm opacity-85">{step.description}</p>
              <Link href={step.href} className="text-sm font-medium text-cyan-300 hover:underline">
                &rarr; {step.linkLabel}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-white/20 pt-4 text-sm opacity-80">
          <strong>Fragen?</strong> Kontaktiere das Team oder nutze das Organisationsprofil als
          Referenz fuer alle Gesuche.
        </p>
      </section>
    </>
  );
}
