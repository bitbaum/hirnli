// ---------------------------------------------------------------------------
// Methodik: 8. Zahlen-Integritäts-Report section
// ---------------------------------------------------------------------------

import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { CONFIDENCE_BADGE_MAP } from './MethodologyHelpers';

interface IntegrityRow {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  confidence: string;
  isClickable: boolean;
  isVerifiable: boolean;
}

export function computeTransparencyStats(NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }>) {
  const metrics = Object.values(NumberSources);
  const total = metrics.length;
  const clickable = metrics.filter((m) => m.source?.path || m.formula).length;
  const verifiable = metrics.filter((m) => {
    if (m.source?.path) return true;
    if (m.source?.account) return true;
    if (m.formula?.dependencies?.every((dep: string) => NumberSources[dep] !== undefined)) return true;
    return false;
  }).length;
  const highConfidence = metrics.filter((m) => m.source?.confidence === 'high').length;
  return { total, clickable, verifiable, highConfidence };
}

export function buildIntegrityRows(NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }>): IntegrityRow[] {
  return Object.entries(NumberSources).map(([key, m]) => ({
    id: key,
    name: m.name,
    category: m.category,
    sourceType: m.source?.type ?? '--',
    confidence: m.source?.confidence ?? 'unknown',
    isClickable: !!(m.source?.path || m.formula),
    isVerifiable: !!m.source?.path || !!m.source?.account || !!(m.formula?.dependencies?.every((dep: string) => NumberSources[dep] !== undefined)),
  }));
}

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
];

export function IntegrityReportSection({ NumberSources }: { NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }> }) {
  const stats = computeTransparencyStats(NumberSources);
  const rows = buildIntegrityRows(NumberSources);

  return (
    <section id="integrity-report" className="scroll-mt-8">
      <Card>
        <CardHeader>
          <CardTitle>8. Zahlen-Integritäts-Report</CardTitle>
        </CardHeader>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.total}</span>
            <span className="text-sm text-text-muted">Total Zahlen</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.clickable}</span>
            <span className="text-sm text-text-muted">Klickbar</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.verifiable}</span>
            <span className="text-sm text-text-muted">Verifizierbar</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.highConfidence}</span>
            <span className="text-sm text-text-muted">High Confidence</span>
          </div>
        </div>

        <Table
          columns={INTEGRITY_COLUMNS}
          data={rows}
          keyExtractor={(row) => row.id}
          compact
        />
      </Card>
    </section>
  );
}
