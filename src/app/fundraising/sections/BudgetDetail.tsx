import Card from '@/components/ui/Card';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import { formatCHF } from '@/lib/utils/format';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import {
  BUDGET_EINMALIG,
  BUDGET_JAEHRLICH,
  BUDGET_EINMALIG_TOTAL,
  BUDGET_JAEHRLICH_TOTAL,
  BUDGET_SUMMARY,
  STIFTUNGEN_3Y_TOTAL,
} from '../data';
import Inspectable, { type InspectorHandle } from './Inspectable';

function BudgetLineItemCard({ item, borderColor }: { item: BudgetLineItem; borderColor: string }) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-3">
        {item.icon && <span className="text-2xl" aria-hidden="true">{item.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="heading-item">{item.label}</h4>
            <span className="shrink-0 font-bold text-text-primary">{formatCHF(item.amount)}</span>
          </div>
          <p className="mt-1 text-sm text-text-muted">{item.description}</p>
          {item.subItems && item.subItems.length > 0 && (
            <ul className="mt-3 space-y-1">
              {item.subItems.map((sub, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-text-muted">{sub.label}</span>
                  <span className="text-text-primary">{formatCHF(sub.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function BudgetDetail({ inspector }: { inspector: InspectorHandle }) {
  const inspectBudgetTotal = NumberSources.budget_total_y1
    ? metricToInspectorData(NumberSources.budget_total_y1, formatCHF(BUDGET_SUMMARY.total))
    : { label: 'Gesamtbudget Jahr 1', value: formatCHF(BUDGET_SUMMARY.total), sourceType: 'derived' as const, source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectEinmalig = NumberSources.budget_einmalig
    ? metricToInspectorData(NumberSources.budget_einmalig, formatCHF(BUDGET_EINMALIG_TOTAL))
    : { label: 'Einmalige Investitionen', value: formatCHF(BUDGET_EINMALIG_TOTAL), sourceType: 'derived' as const, source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectJaehrlich = NumberSources.budget_jaehrlich
    ? metricToInspectorData(NumberSources.budget_jaehrlich, formatCHF(BUDGET_JAEHRLICH_TOTAL))
    : { label: 'Jährliche Kosten', value: formatCHF(BUDGET_JAEHRLICH_TOTAL), sourceType: 'derived' as const, source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectStiftungen3Y = NumberSources.stiftungen_3y_total
    ? metricToInspectorData(NumberSources.stiftungen_3y_total, formatCHF(STIFTUNGEN_3Y_TOTAL))
    : { label: 'Stiftungsfinanzierung 3 Jahre', value: formatCHF(STIFTUNGEN_3Y_TOTAL), sourceType: 'derived' as const, source: 'fundraising/data.ts → THREE_YEAR_MODEL', confidence: 'Hoch' };

  return (
    <section className="mb-8">
      <h2 className="mb-2 heading-subsection">Budgetdetail Jahr 1</h2>
      <p className="mb-6 text-sm text-text-muted">
        7 Module, einzeln förderbar. Einmalige Investitionen + jährliche Kosten ={' '}
        <Inspectable data={inspectBudgetTotal} inspector={inspector}>
          {formatCHF(BUDGET_SUMMARY.total)}
        </Inspectable>.
      </p>

      {/* Einmalige Investitionen */}
      <div className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="heading-card">
            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-primary" />
            Einmalige Investitionen
          </h3>
          <Inspectable data={inspectEinmalig} inspector={inspector} className="text-lg font-bold tabular-nums text-primary">
            {formatCHF(BUDGET_EINMALIG_TOTAL)}
          </Inspectable>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {BUDGET_EINMALIG.map((item) => (
            <BudgetLineItemCard key={item.id} item={item} borderColor="border-l-primary" />
          ))}
        </div>
      </div>

      {/* Jährliche Kosten */}
      <div className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="heading-card">
            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-pillar-vision" />
            Jährliche Kosten
            <span className="ml-2 text-sm font-normal text-text-muted">(degressiv finanziert über 3 Jahre)</span>
          </h3>
          <Inspectable data={inspectJaehrlich} inspector={inspector} className="text-lg font-bold tabular-nums text-pillar-vision">
            {formatCHF(BUDGET_JAEHRLICH_TOTAL)}<span className="text-sm font-normal text-text-muted">/Jahr</span>
          </Inspectable>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {BUDGET_JAEHRLICH.map((item) => (
            <BudgetLineItemCard key={item.id} item={item} borderColor="border-l-pillar-vision" />
          ))}
        </div>
      </div>

      {/* Budget Summary */}
      <Card className="border-border-default">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="heading-section">
              <Inspectable data={inspectBudgetTotal} inspector={inspector}>
                {formatCHF(BUDGET_SUMMARY.total)}
              </Inspectable>
              {' '}<span className="text-base font-normal text-text-muted">Jahr 1</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Davon {formatCHF(BUDGET_SUMMARY.eigenleistung)} Eigenleistung* ({BUDGET_SUMMARY.selfFinancingPct}%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-pillar-vision">Stiftungs-Förderbedarf</div>
            <Inspectable data={inspectStiftungen3Y} inspector={inspector} className="text-xl font-bold tabular-nums text-pillar-vision">
              {formatCHF(STIFTUNGEN_3Y_TOTAL)}
            </Inspectable>
            <div className="text-sm text-text-muted">über 3 Jahre (degressiv)</div>
          </div>
        </div>
      </Card>
    </section>
  );
}
