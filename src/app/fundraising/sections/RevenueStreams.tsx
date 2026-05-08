import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCHF } from '@/lib/utils/format';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import {
  REVENUE_STREAMS,
  REVENUE_CURRENT_TOTAL,
  REVENUE_YEAR3_TOTAL,
} from '../data';
import Inspectable, { type InspectorHandle } from './Inspectable';

export default function RevenueStreamsSection({ inspector }: { inspector: InspectorHandle }) {
  const inspectRevenueCurrent = NumberSources.revenue_current
    ? metricToInspectorData(NumberSources.revenue_current, formatCHF(REVENUE_CURRENT_TOTAL))
    : { label: 'Einnahmen aktuell', value: formatCHF(REVENUE_CURRENT_TOTAL), sourceType: 'estimated' as const, source: 'Kivitendo', confidence: 'Mittel' };

  const inspectRevenueYear3 = NumberSources.revenue_year3
    ? metricToInspectorData(NumberSources.revenue_year3, formatCHF(REVENUE_YEAR3_TOTAL))
    : { label: 'Einnahmen-Prognose Jahr 3', value: formatCHF(REVENUE_YEAR3_TOTAL), sourceType: 'estimated' as const, source: 'Geschäftsplan', confidence: 'Mittel' };

  return (
    <section className="mb-8">
      <h2 className="mb-2 heading-subsection">Einnahmequellen & Nachhaltigkeit</h2>
      <p className="mb-4 text-sm text-text-muted">
        Von{' '}
        <Inspectable data={inspectRevenueCurrent} inspector={inspector}>
          {formatCHF(REVENUE_CURRENT_TOTAL)}
        </Inspectable>
        {' '}heute auf{' '}
        <Inspectable data={inspectRevenueYear3} inspector={inspector}>
          {formatCHF(REVENUE_YEAR3_TOTAL)}
        </Inspectable>
        {' '}in Jahr 3 — das ist der Weg zur Unabhängigkeit.
      </p>

      {/* Revenue narrative */}
      <div className="mb-6 rounded-xl border border-success/20 bg-success/10 p-4">
        <p className="text-sm text-grey-dark mb-2">
          <strong>Aktuell:</strong> {formatCHF(REVENUE_CURRENT_TOTAL)}/Jahr
          (B2B Services + Geräteverkauf + Integration + Spenden)
        </p>
        <p className="text-base font-semibold text-success mb-1">
          <strong>Ziel Jahr 3:</strong> {formatCHF(REVENUE_YEAR3_TOTAL)}/Jahr (Prognose)
          — das wäre +{Math.round(((REVENUE_YEAR3_TOTAL - REVENUE_CURRENT_TOTAL) / REVENUE_CURRENT_TOTAL) * 100)}% Wachstum
        </p>
        <p className="text-sm text-success">
          Durch neue Einnahmequellen (Workshops, Corporate Training, Events, erhöhter Geräteverkauf)
          decken wir immer mehr unserer laufenden Kosten selbst.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REVENUE_STREAMS.map((stream) => {
          const growth = stream.current > 0
            ? Math.round(((stream.year3 - stream.current) / stream.current) * 100)
            : null;
          const isNew = stream.current === 0;
          return (
            <Card key={stream.source} className={`${isNew ? 'border-l-4 border-l-success' : ''}`}>
              <div className="flex items-baseline justify-between">
                <h4 className="font-semibold text-grey-dark">{stream.source}</h4>
                {isNew && <Badge variant="success">Neu</Badge>}
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <div>
                  <div className="text-sm text-text-muted">Heute</div>
                  <div className="text-lg font-bold tabular-nums text-grey-dark">{formatCHF(stream.current)}</div>
                </div>
                <span className="text-text-muted" aria-hidden="true">&rarr;</span>
                <div>
                  <div className="text-sm text-text-muted">Jahr 3 (Ziel)</div>
                  <Inspectable
                    data={{
                      label: `${stream.source} — Jahr 3 Prognose`,
                      value: formatCHF(stream.year3),
                      sourceType: 'estimated',
                      source: 'Geschäftsplan / Prognose',
                      confidence: 'Mittel',
                      description: stream.rationale,
                    }}
                    inspector={inspector}
                    className="text-lg font-bold tabular-nums text-success"
                  >
                    {formatCHF(stream.year3)}
                  </Inspectable>
                </div>
              </div>
              {growth !== null && (
                <div className="mt-2 text-sm font-medium text-success">
                  Wachstum: +{growth}%
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
