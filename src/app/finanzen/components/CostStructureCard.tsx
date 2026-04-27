// ---------------------------------------------------------------------------
// CostStructureCard — expense breakdown for a given year
// ---------------------------------------------------------------------------

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

      {/* Stacked bar */}
      <div className="mb-4 flex h-8 overflow-hidden rounded-lg">
        {EXPENSE_CATEGORIES.map((cat) => {
          const amount = detail[cat.key];
          const pct = total > 0 ? (amount / total) * 100 : 0;
          if (pct < 0.5) return null;
          return (
            <div
              key={cat.key}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${pct}%`, backgroundColor: cat.color }}
              title={`${cat.label}: ${formatCHF(amount)} (${pct.toFixed(1)}%)`}
            >
              {pct > 8 ? `${pct.toFixed(0)}%` : ''}
            </div>
          );
        })}
      </div>

      {/* Legend table */}
      <div className="space-y-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const amount = detail[cat.key];
          const pct = total > 0 ? (amount / total) * 100 : 0;
          return (
            <div key={cat.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
                <span className="text-xs text-text-muted">({cat.codes})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted">{pct.toFixed(1)}%</span>
                <span className="font-medium">{formatCHF(amount)}</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
          <span>Total Aufwand</span>
          <span>{formatCHF(total)}</span>
        </div>
      </div>

      {/* Context */}
      <div className="mt-3 rounded-lg bg-danger-bg/20 p-3 text-sm text-text-light">
        <strong>Ergebnis {entry.year}:</strong>{' '}
        <span className={entry.result >= 0 ? 'text-success' : 'text-danger'}>
          {formatCHF(entry.result)}
        </span>
        {' '}bei {formatCHF(entry.revenue)} Einnahmen.
        {entry.year === 2023 && (
          <span className="ml-1">
            Miete macht {((detail.miete / total) * 100).toFixed(0)}% der Kosten aus —
            der grösste Kostentreiber.
          </span>
        )}
      </div>

      {entry.note && (
        <p className="mt-2 text-xs text-text-muted">⚠ {entry.note}</p>
      )}
    </Card>
  );
}
