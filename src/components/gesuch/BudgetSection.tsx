import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import type { BudgetModule } from '@/lib/config/stories';
import { formatCHF } from '@/lib/utils/format';

interface BudgetSectionProps {
  dok: ComposedGesuchDokument;
}

function ModuleRows({ modules, total }: { modules: BudgetModule[]; total: number }) {
  return (
    <>
      {modules.map((mod) => (
        <tr key={mod.label} className="border-b border-border">
          <td className="py-1.5">
            <span className="font-medium">{mod.label}</span>
            <span className="ml-2 text-xs text-text-muted">{mod.description}</span>
            {mod.items.length > 1 && (
              <div className="mt-1 ml-4 text-xs text-text-muted">
                {mod.items.map((item) => (
                  <span key={item.label} className="mr-3">
                    {item.label}: {formatCHF(item.amount)}
                  </span>
                ))}
              </div>
            )}
          </td>
          <td className="py-1.5 text-right align-top">{formatCHF(mod.amount)}</td>
          <td className="py-1.5 text-right align-top text-text-muted">
            {Math.round(mod.amount / total * 100)}%
          </td>
        </tr>
      ))}
    </>
  );
}

export default function BudgetSection({ dok }: BudgetSectionProps) {
  const einmalig = dok.budget.modules.filter((m) => m.type === 'einmalig');
  const jaehrlich = dok.budget.modules.filter((m) => m.type === 'jaehrlich');
  const einmaligTotal = einmalig.reduce((sum, m) => sum + m.amount, 0);
  const jaehrlichTotal = jaehrlich.reduce((sum, m) => sum + m.amount, 0);
  const remaining = dok.budget.total - dok.budget.eigenleistung.amount - dok.budget.requestedAmount;

  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 text-2xl font-bold text-grey-dark">
        Budget und Finanzierungsplan
      </h2>
      <p className="mb-6 text-xs text-text-muted">
        {dok.budget.projectDuration} | Gesamtbedarf: {formatCHF(dok.budget.total)}
      </p>

      {/* Budget table by module */}
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-grey-dark text-left">
            <th className="pb-2 font-semibold">Modul</th>
            <th className="pb-2 text-right font-semibold">Betrag</th>
            <th className="pb-2 text-right font-semibold">%</th>
          </tr>
        </thead>
        <tbody>
          {/* Einmalige Investitionen */}
          <tr className="border-b border-border bg-bg-light">
            <td className="py-2 font-semibold" colSpan={2}>Einmalige Investitionen</td>
            <td className="py-2 text-right text-xs text-text-muted">{formatCHF(einmaligTotal)}</td>
          </tr>
          <ModuleRows modules={einmalig} total={dok.budget.total} />

          {/* Jährliche Kosten */}
          <tr className="border-b border-border bg-bg-light">
            <td className="py-2 font-semibold" colSpan={2}>Jährliche Kosten</td>
            <td className="py-2 text-right text-xs text-text-muted">{formatCHF(jaehrlichTotal)}</td>
          </tr>
          <ModuleRows modules={jaehrlich} total={dok.budget.total} />

          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Gesamtbedarf</td>
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
              <td className="py-1.5">Weitere Stiftungen und Partner (beantragt/geplant)</td>
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
