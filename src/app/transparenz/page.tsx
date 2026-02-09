import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { NumberSources } from '@/lib/config/metrics';
import type { Metric } from '@/lib/schemas/metric';

export const metadata: Metadata = {
  title: 'Transparenz & Zahlen-Integrität',
  description: 'First Principles Approach: Jede Zahl ist nachvollziehbar, validierbar und kontextualisiert.',
};

// ---------------------------------------------------------------------------
// Derive stats from NumberSources at build time (server component)
// ---------------------------------------------------------------------------

function computeTransparencyStats() {
  const metrics = Object.values(NumberSources);
  const total = metrics.length;

  const clickable = metrics.filter(
    (m) => m.source?.path || m.formula,
  ).length;

  const verifiable = metrics.filter((m) => {
    if (m.source?.path) return true;
    if (m.source?.account) return true;
    if (
      m.formula?.dependencies?.every(
        (dep: string) => NumberSources[dep] !== undefined,
      )
    )
      return true;
    return false;
  }).length;

  const highConfidence = metrics.filter(
    (m) => m.source?.confidence === 'high',
  ).length;

  return { total, clickable, verifiable, highConfidence };
}

// ---------------------------------------------------------------------------
// Table row type
// ---------------------------------------------------------------------------

interface IntegrityRow {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  confidence: string;
  isClickable: boolean;
  isVerifiable: boolean;
}

function buildIntegrityRows(): IntegrityRow[] {
  return Object.entries(NumberSources).map(([key, m]) => {
    const isClickable = !!(m.source?.path || m.formula);
    const isVerifiable =
      !!m.source?.path ||
      !!m.source?.account ||
      !!(
        m.formula?.dependencies?.every(
          (dep: string) => NumberSources[dep] !== undefined,
        )
      );

    return {
      id: key,
      name: m.name,
      category: m.category,
      sourceType: m.source?.type ?? '--',
      confidence: m.source?.confidence ?? 'unknown',
      isClickable,
      isVerifiable,
    };
  });
}

// ---------------------------------------------------------------------------
// Columns for the integrity table
// ---------------------------------------------------------------------------

const CONFIDENCE_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  high: { label: 'High', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'danger' },
  unknown: { label: 'Unbekannt', variant: 'default' },
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  high: { label: 'OK', variant: 'success' },
  medium: { label: 'Warning', variant: 'warning' },
  low: { label: 'Warning', variant: 'warning' },
  unknown: { label: 'Missing', variant: 'danger' },
};

const INTEGRITY_COLUMNS = [
  {
    key: 'name',
    header: 'Zahl',
    render: (row: IntegrityRow) => <span className="font-medium">{row.name}</span>,
  },
  { key: 'category', header: 'Kategorie' },
  { key: 'sourceType', header: 'Type' },
  {
    key: 'confidence',
    header: 'Confidence',
    render: (row: IntegrityRow) => {
      const conf = CONFIDENCE_BADGE_MAP[row.confidence] ?? CONFIDENCE_BADGE_MAP.unknown;
      return <Badge variant={conf.variant}>{conf.label}</Badge>;
    },
  },
  {
    key: 'isClickable',
    header: 'Klickbar',
    align: 'center' as const,
    render: (row: IntegrityRow) => (
      <span className={row.isClickable ? 'text-success' : 'text-danger'}>
        {row.isClickable ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'isVerifiable',
    header: 'Verifizierbar',
    align: 'center' as const,
    render: (row: IntegrityRow) => (
      <span className={row.isVerifiable ? 'text-success' : 'text-danger'}>
        {row.isVerifiable ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: IntegrityRow) => {
      const status = STATUS_MAP[row.confidence] ?? STATUS_MAP.unknown;
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TransparenzPage() {
  const stats = computeTransparencyStats();
  const rows = buildIntegrityRows();

  return (
    <>
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-800 via-blue-500 to-emerald-500 p-8 text-white">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">
          Totale Transparenz & Zahlen-Integrität
        </h1>
        <p className="text-lg opacity-90">
          First Principles Approach: Jede Zahl ist nachvollziehbar, validierbar und kontextualisiert.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-sm">
            <span className="block text-3xl font-bold">{stats.total}</span>
            <span className="mt-1 block text-sm opacity-90">Total Zahlen</span>
          </div>
          <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-sm">
            <span className="block text-3xl font-bold">{stats.clickable}</span>
            <span className="mt-1 block text-sm opacity-90">Klickbar</span>
          </div>
          <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-sm">
            <span className="block text-3xl font-bold">{stats.verifiable}</span>
            <span className="mt-1 block text-sm opacity-90">Verifizierbar</span>
          </div>
          <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-sm">
            <span className="block text-3xl font-bold">{stats.highConfidence}</span>
            <span className="mt-1 block text-sm opacity-90">High Confidence</span>
          </div>
        </div>
      </div>

      {/* Integrity Report Table */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">
          Zahlen-Integritäts-Report
        </h2>
        <Card>
          <p className="mb-4 text-sm text-text-muted">
            Vollständige Übersicht über alle Zahlen im Dashboard: Status, Konfidenz, Validierung
          </p>
          <Table
            columns={INTEGRITY_COLUMNS}
            data={rows}
            keyExtractor={(row) => row.id}
            compact
          />
        </Card>
      </section>

      {/* Transparenz-Prinzipien */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Transparenz-Prinzipien</h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold">Was wir tun</h3>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li>Jede Zahl ist klickbar mit vollständiger Quelle</li>
                <li>Formeln sind explizit dokumentiert</li>
                <li>Annahmen werden offengelegt</li>
                <li>Limitationen werden klar benannt</li>
                <li>Cross-Validierungen werden durchgeführt</li>
                <li>Audit-Trail für alle Änderungen</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold">Was wir nicht tun</h3>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li>Keine erfundenen Zahlen</li>
                <li>Keine Pseudo-Präzision</li>
                <li>Keine versteckten Annahmen</li>
                <li>Keine Broken Links</li>
                <li>Keine unverifizierbaren Behauptungen</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* First Principles */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">First Principles Denken</h2>
        <Card>
          <p className="text-sm">
            Statt zu fragen: <em>&laquo;Was zeigt diese Zahl?&raquo;</em><br />
            Fragen wir: <strong>&laquo;Was ist die fundamentale Wahrheit hinter dieser Zahl?&raquo;</strong>
          </p>

          <div className="mt-6 rounded-lg border-l-4 border-primary bg-blue-50 p-6">
            <h4 className="mb-3 font-semibold">Die 7 Transparenz-Fragen:</h4>
            <ol className="list-decimal space-y-2 pl-6 text-sm">
              <li><strong>Was ist es?</strong> Definition, Einheit, Kontext</li>
              <li><strong>Woher kommt es?</strong> Source of Truth, Konto, Datum</li>
              <li><strong>Wie wird es berechnet?</strong> Exakte Formel, Schritt-für-Schritt</li>
              <li><strong>Was wird angenommen?</strong> Explizite & implizite Annahmen</li>
              <li><strong>Was sind die Einschränkungen?</strong> Datenlücken, Constraints</li>
              <li><strong>Ist es korrekt?</strong> Validierung, Cross-Checks</li>
              <li><strong>Was bedeutet es?</strong> Kontext, Impact, Trends</li>
            </ol>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            Vollständige Dokumentation:{' '}
            <code className="rounded bg-bg-light px-1">
              01_Management/C_Kennzahlen_und_Reporting/Transparency_Principles.md
            </code>
            <br />
            <a
              href="https://cloud.revamp-it.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Im Nextcloud öffnen
            </a>
          </p>
        </Card>
      </section>
    </>
  );
}
