import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import type { ThemeKey } from '@/lib/content/story-themes';
import { getThemedLabel } from '@/lib/domain/budget-calculations';
import { formatCHF } from '@/lib/utils/format';
import { EIGENLEISTUNG_CONFIG } from '@/lib/config/budget-scenarios';

interface BudgetSectionProps {
  dok: ComposedGesuchDokument;
}

function LineItemRows({
  items,
  total,
  themeKey,
}: {
  items: BudgetLineItem[];
  total: number;
  themeKey?: ThemeKey;
}) {
  return (
    <>
      {items.map((item) => {
        const themed = getThemedLabel(item, themeKey);
        return (
          <tr key={item.id} className="border-b border-border-default">
            <td className="py-1.5">
              <span className="font-medium">
                {item.icon} {themed.label}
              </span>
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
  // No budget means the organisation has not stated what its project costs.
  // The section is omitted rather than rendered with zeros, which would read as
  // a measured result. See ComposedGesuchDokument['budget'].
  const budget = dok.budget;
  if (!budget) return null;

  const themeKey = budget.primaryThemeKey;
  const einmalig = budget.lineItems.filter((m) => m.type === 'einmalig');
  const jaehrlich = budget.lineItems.filter((m) => m.type === 'jaehrlich');
  const einmaligTotal = einmalig.reduce((sum, m) => sum + m.amount, 0);
  const jaehrlichTotal = jaehrlich.reduce((sum, m) => sum + m.amount, 0);
  const year1Total = einmaligTotal + jaehrlichTotal;
  const eigenleistung = budget.scenario.threeYearModel.year1.eigenleistung;
  const remaining = year1Total - eigenleistung - budget.requestedAmount;

  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 heading-section">
        Budget und Finanzierungsplan
      </h2>
      <p className="mb-6 text-sm text-text-muted">
        {budget.projectDuration} | Gesamtbedarf 3 Jahre: {formatCHF(budget.project3yTotal)}
      </p>

      {/* 3-Year Trajectory — the headline story */}
      <h3 className="mb-3 heading-card">3-Jahres-Finanzmodell (degressiv)</h3>
      <div className="overflow-x-auto">
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-grey-dark text-left">
              <th scope="col" className="pb-2 font-semibold" />
              {budget.threeYearModel.map((y) => (
                <th key={y.year} scope="col" className="pb-2 text-right font-semibold">
                  {y.year}
                  <br />
                  <span className="text-sm font-normal text-text-muted">{y.label}</span>
                </th>
              ))}
              <th scope="col" className="pb-2 text-right font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-default">
              <td className="py-1.5">Einmalige Investitionen</td>
              {budget.threeYearModel.map((y) => (
                <td key={y.year} className="py-1.5 text-right">
                  {y.einmalig > 0 ? formatCHF(y.einmalig) : '—'}
                </td>
              ))}
              <td className="py-1.5 text-right font-medium">{formatCHF(einmaligTotal)}</td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-1.5">Stiftungsfinanzierung (jährlich)</td>
              {budget.threeYearModel.map((y) => (
                <td key={y.year} className="py-1.5 text-right">
                  {formatCHF(y.stiftungen)}
                </td>
              ))}
              <td className="py-1.5 text-right font-medium">
                {formatCHF(budget.threeYearModel.reduce((s, y) => s + y.stiftungen, 0))}
              </td>
            </tr>
            <tr className="border-b border-border-default bg-success/10">
              <td className="py-1.5 font-medium text-success-text">
                Eigenleistung {dok.tenant.name}
              </td>
              {budget.threeYearModel.map((y) => (
                <td key={y.year} className="py-1.5 text-right text-success-text">
                  {formatCHF(y.eigen)}
                </td>
              ))}
              <td className="py-1.5 text-right font-medium text-success-text">
                {formatCHF(budget.eigen3yTotal)}
              </td>
            </tr>
            <tr className="border-b-2 border-grey-dark font-bold">
              <td className="py-2">Total pro Jahr</td>
              {budget.threeYearModel.map((y) => (
                <td key={y.year} className="py-2 text-right">
                  {formatCHF(y.total)}
                </td>
              ))}
              <td className="py-2 text-right">{formatCHF(budget.project3yTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-8 text-sm text-text-muted">
        Stiftungsanteil sinkt von{' '}
        {budget.threeYearModel[0].total > 0
          ? Math.round(
              ((budget.threeYearModel[0].stiftungen + budget.threeYearModel[0].einmalig) /
                budget.threeYearModel[0].total) *
                100,
            )
          : 0}
        % (Jahr 1) auf{' '}
        {budget.threeYearModel[2].total > 0
          ? Math.round((budget.threeYearModel[2].stiftungen / budget.threeYearModel[2].total) * 100)
          : 0}
        % (Jahr 3). Eigenleistung = bewertete Freiwilligenarbeit (Stunden × CHF{' '}
        {EIGENLEISTUNG_CONFIG.ratePerHour}/h), kein Cashflow. Wächst durch Community-Aufbau und
        Hub-Betrieb.
      </p>

      {/* Budget detail by line item (Jahr 1) */}
      <h3 className="mb-3 heading-card">Budgetdetail Jahr 1 ({formatCHF(year1Total)})</h3>
      <div className="mb-4 text-sm text-text-muted bg-accent-muted p-3 rounded">
        <strong>Szenario:</strong> {budget.scenario.label} — {budget.scenario.description}
      </div>
      <div className="overflow-x-auto">
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-grey-dark text-left">
              <th scope="col" className="pb-2 font-semibold">
                Position
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Betrag
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Einmalige Investitionen */}
            <tr className="border-b border-border-default bg-surface-raised">
              <td className="py-2 font-semibold" colSpan={2}>
                Einmalige Investitionen
              </td>
              <td className="py-2 text-right text-sm text-text-muted">
                {formatCHF(einmaligTotal)}
              </td>
            </tr>
            <LineItemRows items={einmalig} total={year1Total} themeKey={themeKey} />

            {/* Jährliche Kosten */}
            <tr className="border-b border-border-default bg-surface-raised">
              <td className="py-2 font-semibold" colSpan={2}>
                Jährliche Kosten
              </td>
              <td className="py-2 text-right text-sm text-text-muted">
                {formatCHF(jaehrlichTotal)}
              </td>
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
                <span>Eigenleistung {dok.tenant.name}</span>
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
              <td className="py-1.5 text-right">{formatCHF(budget.requestedAmount)}</td>
              <td className="py-1.5 text-right">
                {Math.round((budget.requestedAmount / year1Total) * 100)}%
              </td>
            </tr>
            {remaining > 0 && (
              <tr className="border-b border-border-default text-text-muted">
                <td className="py-1.5">Weitere Stiftungen und Partner (beantragt/geplant)</td>
                <td className="py-1.5 text-right">{formatCHF(remaining)}</td>
                <td className="py-1.5 text-right">{Math.round((remaining / year1Total) * 100)}%</td>
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
