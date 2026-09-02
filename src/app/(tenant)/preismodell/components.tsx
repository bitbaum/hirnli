import Badge from '@/components/ui/Badge';
import type { PriceExampleRow, KPIRow } from './data';

// ---------------------------------------------------------------------------
// Price example table columns (contain JSX render functions)
// ---------------------------------------------------------------------------

export const PRICE_EXAMPLE_COLUMNS = [
  {
    key: 'tier',
    header: 'Stufe',
    render: (row: PriceExampleRow) => <span className="font-medium">{row.tier}</span>,
  },
  { key: 'calculation', header: 'Berechnung' },
  {
    key: 'price',
    header: 'Du zahlst',
    render: (row: PriceExampleRow) => <span className="font-semibold">{row.price}</span>,
  },
  {
    key: 'source',
    header: 'Quelle',
    render: (row: PriceExampleRow) => (
      <Badge variant={row.sourceType === 'decision' ? 'primary' : 'derived'}>{row.source}</Badge>
    ),
  },
];

// ---------------------------------------------------------------------------
// KPI table columns (contain JSX render functions)
// ---------------------------------------------------------------------------

export const KPI_COLUMNS = [
  { key: 'kpi', header: 'KPI' },
  {
    key: 'formula',
    header: 'Formel',
    render: (row: KPIRow) => (
      <code className="rounded bg-surface-raised px-1 text-xs">{row.formula}</code>
    ),
  },
  { key: 'target', header: 'Zielwert' },
  { key: 'rationale', header: 'Begründung' },
];
