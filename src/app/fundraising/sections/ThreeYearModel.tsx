import Badge from '@/components/ui/Badge';
import { formatCHF } from '@/lib/utils/format';
import { EIGENLEISTUNG_CONFIG } from '@/lib/config/budget-scenarios';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import {
  THREE_YEAR_MODEL,
  BUDGET_EINMALIG_TOTAL,
  EIGEN_3Y_TOTAL,
  PROJECT_3Y_TOTAL,
} from '../data';
import Inspectable, { type InspectorHandle } from './Inspectable';

export default function ThreeYearModel({ inspector }: { inspector: InspectorHandle }) {
  const inspectProject3Y = NumberSources.project_3y_total
    ? metricToInspectorData(NumberSources.project_3y_total, formatCHF(PROJECT_3Y_TOTAL))
    : { label: 'Gesamtprojekt 3 Jahre', value: formatCHF(PROJECT_3Y_TOTAL), sourceType: 'derived' as const, source: 'fundraising/data.ts → THREE_YEAR_MODEL', formula: 'SUM(THREE_YEAR_MODEL[].total)', confidence: 'Hoch', description: 'Summe aller 3 Jahresbudgets.' };

  const inspectEigen3Y = NumberSources.eigen_3y_total
    ? metricToInspectorData(NumberSources.eigen_3y_total, formatCHF(EIGEN_3Y_TOTAL))
    : { label: 'Eigenleistung 3 Jahre', value: formatCHF(EIGEN_3Y_TOTAL), sourceType: 'derived' as const, source: 'fundraising/data.ts → THREE_YEAR_MODEL', confidence: 'Hoch' };

  const inspectEinmalig = NumberSources.budget_einmalig
    ? metricToInspectorData(NumberSources.budget_einmalig, formatCHF(BUDGET_EINMALIG_TOTAL))
    : { label: 'Einmalige Investitionen', value: formatCHF(BUDGET_EINMALIG_TOTAL), sourceType: 'derived' as const, source: 'BUDGET_MODULES', confidence: 'Hoch' };

  return (
    <section className="mb-8">
      <h2 className="mb-2 heading-subsection">3-Jahres-Modell: Weg zur Selbständigkeit</h2>
      <p className="mb-6 text-sm text-text-muted">
        Einmalige Investitionen nur im Jahr 1. Stiftungsgelder sinken jedes Jahr.
        Eigenleistung (bewertete Freiwilligenarbeit, kein Cash) wächst durch Community-Aufbau.
      </p>

      {/* Year cards with visual bars */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {THREE_YEAR_MODEL.map((year, i) => {
          const stiftungenAmt = year.stiftungen + year.einmalig;
          const stiftungenPct = Math.round((stiftungenAmt / year.total) * 100);
          const eigenPct = Math.round((year.eigen / year.total) * 100);
          return (
            <div key={year.year} className={`rounded-2xl border p-5 ${i === 0 ? 'border-pillar-vision/30 bg-pillar-vision/5' : i === 2 ? 'border-success/20 bg-success/10' : 'border-border bg-white'}`}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-bold text-text-muted">{year.year}</span>
                <Badge variant={i === 0 ? 'primary' : i === 2 ? 'success' : 'warning'}>{year.label}</Badge>
              </div>
              <Inspectable
                data={{
                  label: `Budget ${year.year}`,
                  value: formatCHF(year.total),
                  sourceType: 'derived',
                  source: 'fundraising/data.ts → THREE_YEAR_MODEL',
                  formula: i === 0
                    ? `BUDGET_EINMALIG_TOTAL (${formatCHF(year.einmalig)}) + BUDGET_JAEHRLICH_TOTAL (${formatCHF(year.stiftungen)}) + Eigenleistung (${formatCHF(year.eigen)})`
                    : `Stiftungen (${formatCHF(year.stiftungen)}) + Eigenleistung (${formatCHF(year.eigen)})`,
                  confidence: 'Hoch',
                  description: i === 0
                    ? 'Jahr 1: Vollständig aus BUDGET_MODULES abgeleitet.'
                    : `${year.year}: Degressives Modell gemäss DEGRESSIVE_CONFIG.`,
                }}
                inspector={inspector}
                className="mb-4 heading-section tabular-nums"
              >
                {formatCHF(year.total)}
              </Inspectable>

              {/* Breakdown */}
              <div className="space-y-1.5 text-sm">
                {year.einmalig > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                      Einmalig
                    </span>
                    <span className="tabular-nums font-medium">{formatCHF(year.einmalig)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-pillar-vision" />
                    Stiftungen
                  </span>
                  <span className="tabular-nums font-medium">{formatCHF(year.stiftungen)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" />
                    Eigenleistung*
                  </span>
                  <span className="tabular-nums font-medium">{formatCHF(year.eigen)}</span>
                </div>
              </div>

              {/* Percentage callout */}
              <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-center text-sm">
                <span className="font-semibold text-pillar-vision">{stiftungenPct}%</span>
                <span className="text-text-muted"> Stiftungen</span>
                <span className="mx-1.5 text-text-muted">/</span>
                <span className="font-semibold text-success">{eigenPct}%</span>
                <span className="text-text-muted"> Eigen</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-year summary table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-light text-left">
              <th className="px-4 py-2.5 heading-detail" />
              {THREE_YEAR_MODEL.map((y) => (
                <th key={y.year} className="px-4 py-2.5 text-right heading-detail">{y.year}</th>
              ))}
              <th className="px-4 py-2.5 text-right font-bold text-grey-dark">3-Jahres-Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-2 text-text-muted">Einmalige Investitionen</td>
              {THREE_YEAR_MODEL.map((y) => (
                <td key={y.year} className="px-4 py-2 text-right tabular-nums">{y.einmalig > 0 ? formatCHF(y.einmalig) : '—'}</td>
              ))}
              <td className="px-4 py-2 text-right tabular-nums font-medium">
                <Inspectable data={inspectEinmalig} inspector={inspector}>
                  {formatCHF(BUDGET_EINMALIG_TOTAL)}
                </Inspectable>
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-pillar-vision" />
                  Stiftungsfinanzierung
                </span>
              </td>
              {THREE_YEAR_MODEL.map((y) => (
                <td key={y.year} className="px-4 py-2 text-right tabular-nums text-pillar-vision">{formatCHF(y.stiftungen)}</td>
              ))}
              <td className="px-4 py-2 text-right tabular-nums font-medium text-pillar-vision">{formatCHF(THREE_YEAR_MODEL.reduce((s, y) => s + y.stiftungen, 0))}</td>
            </tr>
            <tr className="border-b border-border bg-success/10">
              <td className="px-4 py-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-success" />
                  Eigenleistung*
                </span>
              </td>
              {THREE_YEAR_MODEL.map((y) => (
                <td key={y.year} className="px-4 py-2 text-right tabular-nums text-success">{formatCHF(y.eigen)}</td>
              ))}
              <td className="px-4 py-2 text-right tabular-nums font-medium text-success">
                <Inspectable data={inspectEigen3Y} inspector={inspector}>
                  {formatCHF(EIGEN_3Y_TOTAL)}
                </Inspectable>
              </td>
            </tr>
            <tr className="border-t-2 border-grey-dark font-bold">
              <td className="px-4 py-2.5">Total</td>
              {THREE_YEAR_MODEL.map((y) => (
                <td key={y.year} className="px-4 py-2.5 text-right tabular-nums">{formatCHF(y.total)}</td>
              ))}
              <td className="px-4 py-2.5 text-right tabular-nums">
                <Inspectable data={inspectProject3Y} inspector={inspector}>
                  {formatCHF(PROJECT_3Y_TOTAL)}
                </Inspectable>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-text-muted italic">
        * Eigenleistung = bewertete Freiwilligenarbeit (Stunden × CHF {EIGENLEISTUNG_CONFIG.ratePerHour}/h, NGO-Standard), kein Cashflow.
        Jahr 3 setzt ~6.857 Freiwilligen-Stunden voraus (~3.4 Vollzeit-Äquivalente).
      </p>
    </section>
  );
}
