import type { BudgetScenario } from '@/lib/schemas/budget';
import { calculate3YearTotals } from '@/lib/domain/budget-calculations';
import { formatCHF } from '@/lib/utils/format';
import Card from '@/components/ui/Card';

/**
 * BudgetSummary Component
 *
 * Displays 3-year financial model for a scenario:
 * - Year 1: Einmalig + Jaehrlich
 * - Year 2-3: Jaehrlich only
 * - Eigenleistung per year
 * - Totals (Stiftungen, Eigenleistung, Project Total)
 */

interface BudgetSummaryProps {
  scenario: BudgetScenario;
  className?: string;
}

export default function BudgetSummary({ scenario, className = '' }: BudgetSummaryProps) {
  const totals = calculate3YearTotals(scenario);
  const { year1, year2, year3 } = scenario.threeYearModel;

  return (
    <Card className={className}>
      <h3 className="heading-card mb-4">3-Jahres-Finanzplan</h3>

      {/* Year-by-year breakdown */}
      <div className="space-y-4 mb-6">
        {/* Year 1 */}
        <div className="p-4 bg-accent-muted rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="heading-item">Jahr 1</h4>
            <span className="heading-stat-sm text-primary">{formatCHF(totals.y1Total)}</span>
          </div>
          <div className="text-sm space-y-1 text-text-secondary">
            <div className="flex justify-between">
              <span>Einmalige Kosten:</span>
              <span className="font-medium">{formatCHF(year1.einmalig)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jährliche Kosten:</span>
              <span className="font-medium">{formatCHF(year1.jaehrlich)}</span>
            </div>
            <div className="flex justify-between text-success pt-1 border-t border-accent-border">
              <span>+ Eigenleistung (kein Cash):</span>
              <span className="font-medium">{formatCHF(year1.eigenleistung)}</span>
            </div>
          </div>
        </div>

        {/* Year 2 */}
        <div className="p-4 bg-surface-raised rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="heading-item">Jahr 2</h4>
            <span className="heading-stat-sm">{formatCHF(totals.y2Total)}</span>
          </div>
          <div className="text-sm space-y-1 text-text-secondary">
            <div className="flex justify-between">
              <span>Jährliche Kosten:</span>
              <span className="font-medium">{formatCHF(year2.jaehrlich)}</span>
            </div>
            <div className="flex justify-between text-success pt-1 border-t border-border-default">
              <span>+ Eigenleistung (kein Cash):</span>
              <span className="font-medium">{formatCHF(year2.eigenleistung)}</span>
            </div>
          </div>
        </div>

        {/* Year 3 */}
        <div className="p-4 bg-surface-raised rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="heading-item">Jahr 3</h4>
            <span className="heading-stat-sm">{formatCHF(totals.y3Total)}</span>
          </div>
          <div className="text-sm space-y-1 text-text-secondary">
            <div className="flex justify-between">
              <span>Jährliche Kosten:</span>
              <span className="font-medium">{formatCHF(year3.jaehrlich)}</span>
            </div>
            <div className="flex justify-between text-success pt-1 border-t border-border-default">
              <span>+ Eigenleistung (kein Cash):</span>
              <span className="font-medium">{formatCHF(year3.eigenleistung)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grand totals */}
      <div className="pt-4 border-t-2 border-border-default space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Stiftungen Total (3 Jahre):</span>
          <span className="font-bold text-primary">{formatCHF(totals.stiftungenTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Eigenleistung Total (bewertete Freiwilligenarbeit):</span>
          <span className="font-bold text-success">{formatCHF(totals.eigenTotal)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border-default">
          <span className="heading-detail">Projektwert Total:</span>
          <span className="text-xl font-bold text-text-primary">{formatCHF(totals.projectTotal)}</span>
        </div>
      </div>

      {/* Space requirement */}
      <div className="mt-4 pt-4 border-t border-border-default text-sm text-text-secondary">
        <div className="flex justify-between">
          <span>Raumbedarf:</span>
          <span className="font-medium">
            {scenario.spaceRequirement.min_sqm}–{scenario.spaceRequirement.max_sqm} m²
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Zielstiftungen:</span>
          <span className="font-medium">Typ {scenario.targetFoundations.join(', ')}</span>
        </div>
      </div>
    </Card>
  );
}
