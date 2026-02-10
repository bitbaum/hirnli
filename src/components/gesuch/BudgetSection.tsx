import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { formatCHF } from '@/lib/utils/format';

interface BudgetSectionProps {
  dok: ComposedGesuchDokument;
}

function BudgetCategoryRows({ lines, total }: { lines: { label: string; description: string; amount: number }[]; total: number }) {
  return (
    <>
      {lines.map((line) => (
        <tr key={line.label} className="border-b border-border">
          <td className="py-1.5">
            <span>{line.label}</span>
            <span className="ml-2 text-xs text-text-muted">{line.description}</span>
          </td>
          <td className="py-1.5 text-right">{formatCHF(line.amount)}</td>
          <td className="py-1.5 text-right text-text-muted">{Math.round(line.amount / total * 100)}%</td>
        </tr>
      ))}
    </>
  );
}

export default function BudgetSection({ dok }: BudgetSectionProps) {
  const personalLines = dok.budget.lines.filter((l) => l.category === 'personal');
  const sachLines = dok.budget.lines.filter((l) => l.category === 'sachkosten');
  const programmLines = dok.budget.lines.filter((l) => l.category === 'programm');
  const remaining = dok.budget.total - dok.budget.eigenleistung.amount - dok.budget.requestedAmount;

  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 text-2xl font-bold text-grey-dark">
        Budget und Finanzierungsplan
      </h2>
      <p className="mb-6 text-xs text-text-muted">
        Projektlaufzeit: {dok.budget.projectDuration} | Gesamtbudget: {formatCHF(dok.budget.total)}
      </p>

      {/* Budget table */}
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-grey-dark text-left">
            <th className="pb-2 font-semibold">Position</th>
            <th className="pb-2 text-right font-semibold">Betrag</th>
            <th className="pb-2 text-right font-semibold">%</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border bg-bg-light">
            <td className="py-2 font-semibold" colSpan={3}>Personalkosten</td>
          </tr>
          <BudgetCategoryRows lines={personalLines} total={dok.budget.total} />

          <tr className="border-b border-border bg-bg-light">
            <td className="py-2 font-semibold" colSpan={3}>Sachkosten</td>
          </tr>
          <BudgetCategoryRows lines={sachLines} total={dok.budget.total} />

          <tr className="border-b border-border bg-bg-light">
            <td className="py-2 font-semibold" colSpan={3}>Programmkosten</td>
          </tr>
          <BudgetCategoryRows lines={programmLines} total={dok.budget.total} />

          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Gesamtkosten</td>
            <td className="py-2 text-right">{formatCHF(dok.budget.total)}</td>
            <td className="py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>

      {/* Financing plan */}
      <h3 className="mb-3 text-lg font-semibold text-grey-dark">Finanzierungsplan</h3>
      <table className="mb-6 w-full text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-1.5">
              <span>{dok.budget.eigenleistung.label}</span>
              <span className="ml-2 text-xs text-text-muted">{dok.budget.eigenleistung.description}</span>
            </td>
            <td className="py-1.5 text-right">{formatCHF(dok.budget.eigenleistung.amount)}</td>
            <td className="py-1.5 text-right text-text-muted">
              {Math.round(dok.budget.eigenleistung.amount / dok.budget.total * 100)}%
            </td>
          </tr>
          <tr className="border-b border-border font-semibold text-primary">
            <td className="py-1.5">Beantragt bei {dok.foundation.name}</td>
            <td className="py-1.5 text-right">{formatCHF(dok.budget.requestedAmount)}</td>
            <td className="py-1.5 text-right">
              {Math.round(dok.budget.requestedAmount / dok.budget.total * 100)}%
            </td>
          </tr>
          {remaining > 0 && (
            <tr className="border-b border-border text-text-muted">
              <td className="py-1.5">Weitere Stiftungen (beantragt)</td>
              <td className="py-1.5 text-right">{formatCHF(remaining)}</td>
              <td className="py-1.5 text-right">
                {Math.round(remaining / dok.budget.total * 100)}%
              </td>
            </tr>
          )}
          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Total Finanzierung</td>
            <td className="py-2 text-right">{formatCHF(dok.budget.total)}</td>
            <td className="py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
