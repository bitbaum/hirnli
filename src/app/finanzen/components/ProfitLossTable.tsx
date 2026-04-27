// ---------------------------------------------------------------------------
// ProfitLossTable — multi-year P&L comparison
// ---------------------------------------------------------------------------

import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCHF, formatPercent } from '@/lib/utils/format';
import { FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';
import type { AnnualPLEntry } from '../data';

export function ProfitLossTable({ data }: { data: AnnualPLEntry[] }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Erfolgsrechnung {FINANCIAL_YEAR_RANGE}</CardTitle>
      </CardHeader>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-muted">
              <th className="pb-2 font-medium">Jahr</th>
              <th className="pb-2 text-right font-medium">Einnahmen</th>
              <th className="pb-2 text-right font-medium">Aufwand</th>
              <th className="pb-2 text-right font-medium">Ergebnis</th>
              <th className="pb-2 text-right font-medium">Marge</th>
              <th className="pb-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const margin = row.isComplete && row.revenue > 0
                ? row.result / row.revenue
                : null;
              return (
                <tr
                  key={row.year}
                  className={`border-b border-border/50 ${!row.isComplete ? 'opacity-60' : ''}`}
                >
                  <td className="py-2.5 font-medium">
                    {row.year}
                    {row.note && (
                      <span className="ml-1 text-xs text-text-muted" title={row.note}>*</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">{formatCHF(row.revenue)}</td>
                  <td className="py-2.5 text-right">
                    {row.isComplete ? formatCHF(row.expenses) : (
                      <span className="text-text-muted">k.A.</span>
                    )}
                  </td>
                  <td className={`py-2.5 text-right font-semibold ${
                    !row.isComplete ? 'text-text-muted' :
                    row.result > 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {row.isComplete ? formatCHF(row.result) : (
                      <span className="text-text-muted">–</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {margin !== null ? (
                      <span className={margin >= 0 ? 'text-success' : 'text-danger'}>
                        {margin >= 0 ? '+' : ''}{formatPercent(margin)}
                      </span>
                    ) : (
                      <span className="text-text-muted">–</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.isComplete ? (
                      <Badge variant={row.result >= 0 ? 'success' : 'danger'}>
                        {row.result >= 0 ? 'Gewinn' : 'Verlust'}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Unvollständig</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {data.map((row) => (
          <div
            key={row.year}
            className={`rounded-lg border border-border/50 p-3 ${!row.isComplete ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{row.year}</span>
              {row.isComplete ? (
                <Badge variant={row.result >= 0 ? 'success' : 'danger'}>
                  {row.result >= 0 ? 'Gewinn' : 'Verlust'}
                </Badge>
              ) : (
                <Badge variant="warning">Unvollständig</Badge>
              )}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-text-muted">Einnahmen</span>
                <div className="font-medium">{formatCHF(row.revenue)}</div>
              </div>
              <div>
                <span className="text-text-muted">Aufwand</span>
                <div className="font-medium">
                  {row.isComplete ? formatCHF(row.expenses) : 'k.A.'}
                </div>
              </div>
              {row.isComplete && (
                <div className="col-span-2">
                  <span className="text-text-muted">Ergebnis</span>
                  <div className={`font-semibold ${row.result >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCHF(row.result)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footnotes */}
      {data.some((d) => d.note) && (
        <p className="mt-3 text-xs text-text-muted">
          * {data.filter((d) => d.note).map((d) => `${d.year}: ${d.note}`).join(' | ')}
        </p>
      )}
    </Card>
  );
}
