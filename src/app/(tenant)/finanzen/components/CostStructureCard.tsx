// ---------------------------------------------------------------------------
// CostStructureCard — expense breakdown for a given year
// ---------------------------------------------------------------------------

import { BarChart } from '@bitbaum/chartkit/react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCHF } from '@/lib/utils/format';
import { EXPENSE_CATEGORIES, type AnnualPLEntry } from '../data';

export function CostStructureCard({ entry }: { entry: AnnualPLEntry }) {
  if (!entry.expenseDetail || !entry.isComplete) return null;

  const detail = entry.expenseDetail;
  const total = entry.expenses;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Kostenstruktur {entry.year}</CardTitle>
      </CardHeader>

      <BarChart
        rows={EXPENSE_CATEGORIES.map((cat) => ({
          label: cat.label,
          value: detail[cat.key],
          share: total > 0 ? detail[cat.key] / total : 0,
          note: `Konten ${cat.codes}`,
        }))}
        unit="CHF"
        caption={`Aufwand ${entry.year} nach Kostenart, mit Anteil am Total`}
        locale="de-CH"
        labels={{ row: 'Kostenart', value: 'Betrag', share: 'Anteil', note: 'Konten' }}
      />

      <div className="mt-3 flex items-center justify-between border-t border-border-default pt-2 heading-detail">
        <span>Total Aufwand</span>
        <span>{formatCHF(total)}</span>
      </div>

      {/* Context */}
      <div className="mt-3 rounded-lg bg-danger-bg/20 p-3 text-sm text-text-secondary">
        <strong>Ergebnis {entry.year}:</strong>{' '}
        <span className={entry.result >= 0 ? 'text-success' : 'text-danger'}>
          {formatCHF(entry.result)}
        </span>{' '}
        bei {formatCHF(entry.revenue)} Einnahmen.
        {entry.year === 2023 && (
          <span className="ml-1">
            Miete macht {((detail.miete / total) * 100).toFixed(0)}% der Kosten aus — der grösste
            Kostentreiber.
          </span>
        )}
      </div>

      {entry.note && <p className="mt-2 text-sm text-text-muted">⚠ {entry.note}</p>}
    </Card>
  );
}
