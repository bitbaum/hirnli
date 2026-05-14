/* ────────────────────────────────────────────
   Reusable helper components for Operations page
   ──────────────────────────────────────────── */

import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';
import MetricGrid from '@/components/metrics/MetricGrid';
import {
  VISUAL_INSPECTION, COMPONENT_CHECK, HARDWARE_TESTS, CATEGORIES,
  CLEANING_EXTERNAL, CLEANING_INTERNAL, LINUX_DISTROS,
} from './data';

export function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 border-b border-border pb-2 text-sm last:border-0">
          <span className="text-text-muted">☐</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TimeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────
   Section: Triage & Testing (Step 2)
   ──────────────────────────────────────────── */

export function TriageSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">2. Triage & Testing</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Erstbewertung</CardTitle>
              <TimeBadge>10-15 Min</TimeBadge>
            </div>
          </CardHeader>
          <p className="mb-3 text-sm text-text-muted">
            <strong>Wer:</strong> Techniker/in
          </p>
          <h4 className="mb-2 heading-detail">Visuelle Inspektion:</h4>
          <Checklist items={VISUAL_INSPECTION} />
          <h4 className="mb-2 mt-4 heading-detail">Komponenten prüfen:</h4>
          <Checklist items={COMPONENT_CHECK} />
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Funktionstest</CardTitle>
              <TimeBadge>15-30 Min</TimeBadge>
            </div>
          </CardHeader>
          <h4 className="mb-2 heading-detail">Hardware-Tests:</h4>
          <Checklist items={HARDWARE_TESTS} />
        </Card>
      </div>

      {/* Kategorisierung */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Kategorisierung – Entscheidungsbaum</CardTitle>
        </CardHeader>
        <pre className="overflow-x-auto rounded-lg bg-bg-light p-4 font-mono text-sm">
{`Gerät funktioniert vollständig?
├─ JA → Kategorie A (Refurbishment)
│
├─ TEILWEISE → Reparatur möglich & wirtschaftlich?
│  ├─ JA → Kategorie B (Reparatur nötig)
│  └─ NEIN → Kategorie C (Ersatzteile)
│
└─ NEIN → Kategorie D (Recycling)`}
        </pre>
        <MetricGrid columns={4} className="mt-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="text-center">
              <Badge variant="raw" size="md" className={`px-3 py-1 text-sm font-semibold ${cat.color}`}>
                {cat.label}
              </Badge>
              <p className="mt-2 text-sm text-text-muted">
                {cat.title}<br />{cat.description}
              </p>
            </div>
          ))}
        </MetricGrid>
      </Card>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Reinigung, Upgrade & Linux (Steps 4-6)
   ──────────────────────────────────────────── */

export function RefurbishmentStepsSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">4-6. Reinigung, Upgrade & Linux-Installation</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reinigung */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>4. Reinigung</CardTitle>
              <TimeBadge>15-30 Min</TimeBadge>
            </div>
          </CardHeader>
          <h4 className="mb-2 heading-detail">Extern:</h4>
          <Checklist items={CLEANING_EXTERNAL} />
          <h4 className="mb-2 mt-4 heading-detail">Intern (bei Bedarf):</h4>
          <Checklist items={CLEANING_INTERNAL} />
        </Card>

        {/* Hardware-Upgrade */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>5. Hardware-Upgrade</CardTitle>
              <TimeBadge>10-30 Min</TimeBadge>
            </div>
          </CardHeader>
          <h4 className="mb-1 heading-detail">RAM-Upgrade:</h4>
          <p className="mb-3 text-sm text-text-light">Minimum: 4 GB (besser 8 GB)</p>
          <h4 className="mb-1 heading-detail">SSD-Upgrade:</h4>
          <p className="mb-3 text-sm text-text-light">Wenn Festplatte &lt; 250 GB oder defekt</p>
          <h4 className="mb-1 heading-detail">Weitere:</h4>
          <ul className="list-disc pl-5 text-sm text-text-light">
            <li>WiFi-Karte (wenn fehlend)</li>
            <li>Akku (wenn verfügbar)</li>
          </ul>
        </Card>

        {/* Linux-Installation */}
        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>6. Linux-Installation</CardTitle>
              <TimeBadge>35-50 Min</TimeBadge>
            </div>
          </CardHeader>
          <h4 className="mb-2 heading-detail">Standard-Distributionen:</h4>
          <div className="space-y-2">
            {LINUX_DISTROS.map((d) => (
              <div key={d.target} className="flex justify-between rounded bg-bg-light px-3 py-2 text-sm">
                <span className="text-text-muted">{d.target}</span>
                <span className="font-medium">{d.distro}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-text-light">
            <strong>Default:</strong> Linux Mint (Cinnamon)
          </p>
        </Card>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   Section: Lager-Management
   ──────────────────────────────────────────── */

export function WarehouseSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Lager-Management Regeln</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lagerdauer-Regeln</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
              <strong>&lt; 30 Tage</strong>
              <span className="text-success">Ziel: Normaler Umschlag</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
              <strong>&gt; 3 Monate</strong>
              <span className="text-warning">Preis reduzieren</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
              <strong>&gt; 6 Monate</strong>
              <span className="text-danger">Spenden oder Recyclen</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kapazitäts-Regeln</CardTitle>
          </CardHeader>
          <Callout color="warning" className="mb-4 p-3">
            <strong className="text-sm">Wenn Lager &gt; 200 Geräte:</strong>
          </Callout>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-light">
            <li>Annahmestopp für &ldquo;Low Quality&rdquo;</li>
            <li>Sofortiger &ldquo;Sale&rdquo; (Rabattaktion)</li>
            <li>Geräte spenden an Partner</li>
          </ul>
        </Card>
      </div>
      <p className="mt-2 text-sm text-text-muted">
        <Badge variant="live">Quelldokument</Badge>{' '}
        Finanzstrategie_2025.md, Operative Kennzahlen
      </p>
    </section>
  );
}
