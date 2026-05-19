import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import type { ThemeKey } from '@/lib/config/stories';
import { getThemedLabel } from '@/lib/domain/budget-calculations';
import { formatCHF } from '@/lib/utils/format';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { EIGENLEISTUNG_CONFIG } from '@/lib/config/budget-scenarios';

interface BudgetSectionProps {
  dok: ComposedGesuchDokument;
}

function LineItemRows({ items, total, themeKey }: { items: BudgetLineItem[]; total: number; themeKey?: ThemeKey }) {
  return (
    <>
      {items.map((item) => {
        const themed = getThemedLabel(item, themeKey);
        return (
        <tr key={item.id} className="border-b border-border-default">
          <td className="py-1.5">
            <span className="font-medium">{item.icon} {themed.label}</span>
            <span className="ml-2 text-sm text-text-muted">{themed.description}</span>
            {item.subItems && item.subItems.length > 0 && (
              <div className="mt-1 ml-4 text-sm text-text-muted">
                {item.subItems.map((sub, idx) => (
                  <span key={idx} className="mr-3">
                    {sub.label}: {formatCHF(sub.amount)}
                  </span>
                ))}
              </div>
            )}
          </td>
          <td className="py-1.5 text-right align-top">{formatCHF(item.amount)}</td>
          <td className="py-1.5 text-right align-top text-text-muted">
            {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
          </td>
        </tr>
        );
      })}
    </>
  );
}

export default function BudgetSection({ dok }: BudgetSectionProps) {
  const themeKey = dok.budget.primaryThemeKey;
  const einmalig = dok.budget.lineItems.filter((m) => m.type === 'einmalig');
  const jaehrlich = dok.budget.lineItems.filter((m) => m.type === 'jaehrlich');
  const einmaligTotal = einmalig.reduce((sum, m) => sum + m.amount, 0);
  const jaehrlichTotal = jaehrlich.reduce((sum, m) => sum + m.amount, 0);
  const year1Total = einmaligTotal + jaehrlichTotal;
  const eigenleistung = dok.budget.scenario.threeYearModel.year1.eigenleistung;
  const remaining = year1Total - eigenleistung - dok.budget.requestedAmount;

  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 heading-section">
        Budget und Finanzierungsplan
      </h2>
      <p className="mb-6 text-sm text-text-muted">
        {dok.budget.projectDuration} | Gesamtbedarf 3 Jahre: {formatCHF(dok.budget.project3yTotal)}
      </p>

      {/* 3-Year Trajectory — the headline story */}
      <h3 className="mb-3 heading-card">3-Jahres-Finanzmodell (degressiv)</h3>
      <div className="overflow-x-auto">
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-grey-dark text-left">
            <th scope="col" className="pb-2 font-semibold" />
            {dok.budget.threeYearModel.map((y) => (
              <th key={y.year} scope="col" className="pb-2 text-right font-semibold">
                {y.year}<br /><span className="text-sm font-normal text-text-muted">{y.label}</span>
              </th>
            ))}
            <th scope="col" className="pb-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border-default">
            <td className="py-1.5">Einmalige Investitionen</td>
            {dok.budget.threeYearModel.map((y) => (
              <td key={y.year} className="py-1.5 text-right">{y.einmalig > 0 ? formatCHF(y.einmalig) : '—'}</td>
            ))}
            <td className="py-1.5 text-right font-medium">{formatCHF(einmaligTotal)}</td>
          </tr>
          <tr className="border-b border-border-default">
            <td className="py-1.5">Stiftungsfinanzierung (jährlich)</td>
            {dok.budget.threeYearModel.map((y) => (
              <td key={y.year} className="py-1.5 text-right">{formatCHF(y.stiftungen)}</td>
            ))}
            <td className="py-1.5 text-right font-medium">
              {formatCHF(dok.budget.threeYearModel.reduce((s, y) => s + y.stiftungen, 0))}
            </td>
          </tr>
          <tr className="border-b border-border-default bg-success/10">
            <td className="py-1.5 font-medium text-success-text">Eigenleistung {ORG_PROFILE.name}</td>
            {dok.budget.threeYearModel.map((y) => (
              <td key={y.year} className="py-1.5 text-right text-success-text">{formatCHF(y.eigen)}</td>
            ))}
            <td className="py-1.5 text-right font-medium text-success-text">{formatCHF(dok.budget.eigen3yTotal)}</td>
          </tr>
          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Total pro Jahr</td>
            {dok.budget.threeYearModel.map((y) => (
              <td key={y.year} className="py-2 text-right">{formatCHF(y.total)}</td>
            ))}
            <td className="py-2 text-right">{formatCHF(dok.budget.project3yTotal)}</td>
          </tr>
        </tbody>
      </table>

      </div>

      <p className="mb-8 text-sm text-text-muted">
        Stiftungsanteil sinkt von {dok.budget.threeYearModel[0].total > 0 ? Math.round((dok.budget.threeYearModel[0].stiftungen + dok.budget.threeYearModel[0].einmalig) / dok.budget.threeYearModel[0].total * 100) : 0}% (Jahr 1) auf {dok.budget.threeYearModel[2].total > 0 ? Math.round(dok.budget.threeYearModel[2].stiftungen / dok.budget.threeYearModel[2].total * 100) : 0}% (Jahr 3).
        Eigenleistung = bewertete Freiwilligenarbeit (Stunden × CHF {EIGENLEISTUNG_CONFIG.ratePerHour}/h), kein Cashflow. Wächst durch Community-Aufbau und Hub-Betrieb.
      </p>

      {/* Budget detail by line item (Jahr 1) */}
      <h3 className="mb-3 heading-card">Budgetdetail Jahr 1 ({formatCHF(year1Total)})</h3>
      <div className="mb-4 text-sm text-text-muted bg-primary/10 p-3 rounded">
        <strong>Szenario:</strong> {dok.budget.scenario.label} — {dok.budget.scenario.description}
      </div>
      <div className="overflow-x-auto">
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-grey-dark text-left">
            <th scope="col" className="pb-2 font-semibold">Position</th>
            <th scope="col" className="pb-2 text-right font-semibold">Betrag</th>
            <th scope="col" className="pb-2 text-right font-semibold">%</th>
          </tr>
        </thead>
        <tbody>
          {/* Einmalige Investitionen */}
          <tr className="border-b border-border-default bg-surface-raised">
            <td className="py-2 font-semibold" colSpan={2}>Einmalige Investitionen</td>
            <td className="py-2 text-right text-sm text-text-muted">{formatCHF(einmaligTotal)}</td>
          </tr>
          <LineItemRows items={einmalig} total={year1Total} themeKey={themeKey} />

          {/* Jährliche Kosten */}
          <tr className="border-b border-border-default bg-surface-raised">
            <td className="py-2 font-semibold" colSpan={2}>Jährliche Kosten</td>
            <td className="py-2 text-right text-sm text-text-muted">{formatCHF(jaehrlichTotal)}</td>
          </tr>
          <LineItemRows items={jaehrlich} total={year1Total} themeKey={themeKey} />

          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Gesamtbedarf Jahr 1</td>
            <td className="py-2 text-right">{formatCHF(year1Total)}</td>
            <td className="py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>

      </div>

      {/* Financing plan */}
      <h3 className="mb-3 heading-card">Finanzierungsplan</h3>
      <div className="overflow-x-auto">
      <table className="mb-6 w-full text-sm">
        <tbody>
          <tr className="border-b border-border-default">
            <td className="py-1.5">
              <span>Eigenleistung {ORG_PROFILE.name}</span>
              <span className="ml-2 text-sm text-text-muted">
                Erlöse Geräteverkauf, IT-Dienstleistungen, Infrastruktur und Freiwilligenarbeit
              </span>
            </td>
            <td className="py-1.5 text-right">{formatCHF(eigenleistung)}</td>
            <td className="py-1.5 text-right text-text-muted">
              {Math.round((eigenleistung / year1Total) * 100)}%
            </td>
          </tr>
          <tr className="border-b border-border-default font-semibold text-primary">
            <td className="py-1.5">Beantragt bei {dok.foundation.name}</td>
            <td className="py-1.5 text-right">{formatCHF(dok.budget.requestedAmount)}</td>
            <td className="py-1.5 text-right">
              {Math.round((dok.budget.requestedAmount / year1Total) * 100)}%
            </td>
          </tr>
          {remaining > 0 && (
            <tr className="border-b border-border-default text-text-muted">
              <td className="py-1.5">Weitere Stiftungen und Partner (beantragt/geplant)</td>
              <td className="py-1.5 text-right">{formatCHF(remaining)}</td>
              <td className="py-1.5 text-right">
                {Math.round((remaining / year1Total) * 100)}%
              </td>
            </tr>
          )}
          <tr className="border-b-2 border-grey-dark font-bold">
            <td className="py-2">Total Finanzierung Jahr 1</td>
            <td className="py-2 text-right">{formatCHF(year1Total)}</td>
            <td className="py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>
      </div>
    </section>
  );
}
