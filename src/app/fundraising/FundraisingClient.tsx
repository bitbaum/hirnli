'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import { STATUS_LABELS } from '@/lib/config/foundations';
import { CORE_FACTS } from '@/lib/config/stories';
import type { FoundationStatus } from '@/lib/schemas/foundation';
import type { BudgetModule } from '@/lib/config/stories';
import { formatCHF } from '@/lib/utils/format';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import type { InspectorData } from '@/lib/schemas/inspector';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import {
  computePipelineStats,
  STATUS_BADGE_VARIANT,
  BUDGET_EINMALIG,
  BUDGET_JAEHRLICH,
  BUDGET_EINMALIG_TOTAL,
  BUDGET_JAEHRLICH_TOTAL,
  BUDGET_SUMMARY,
  HERO_STATS,
  RESOURCES,
  NEXT_STEPS,
  SPACE_PLAN,
  SPACE_PLAN_TOTAL,
  SPACE_TOTAL_WITH_CIRCULATION,
  THREE_YEAR_MODEL,
  REVENUE_STREAMS,
  REVENUE_CURRENT_TOTAL,
  REVENUE_YEAR3_TOTAL,
  PROJECT_DURATION,
  PROJECT_DURATION_LABEL,
  STIFTUNGEN_3Y_TOTAL,
  EIGEN_3Y_TOTAL,
  PROJECT_3Y_TOTAL,
  STIFTUNGEN_Y1,
  STIFTUNGEN_Y3,
  REDUCTION_PCT,
  FINANCIAL_CONTEXT,
  REVENUE_HISTORY,
  COST_STRUCTURE_2023,
  TRACK_RECORD,
} from './data';

// -- Inspectable number wrapper -----------------------------------------------

function Inspectable({
  children,
  data,
  inspector,
  className = '',
}: {
  children: React.ReactNode;
  data: InspectorData;
  inspector: ReturnType<typeof useNumberInspector>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => inspector.inspect(data)}
      className={`cursor-pointer underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid ${className}`}
      title="Klicken für Quellenangabe"
    >
      {children}
    </button>
  );
}

// -- Budget module card -------------------------------------------------------

function BudgetModuleCard({ module, borderColor }: { module: BudgetModule; borderColor: string }) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-3">
        {module.icon && <span className="text-2xl" aria-hidden="true">{module.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-semibold text-grey-dark">{module.label}</h4>
            <span className="shrink-0 font-bold text-grey-dark">{formatCHF(module.amount)}</span>
          </div>
          <p className="mt-1 text-sm text-text-muted">{module.description}</p>
          <ul className="mt-3 space-y-1">
            {module.items.map((item) => (
              <li key={item.label} className="flex justify-between text-sm">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-grey-dark">{formatCHF(item.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// -- Main client component ----------------------------------------------------

export default function FundraisingClient() {
  const stats = computePipelineStats();
  const inspector = useNumberInspector();

  // Pre-build inspector data for key metrics
  const inspectProject3Y: InspectorData = NumberSources.project_3y_total
    ? metricToInspectorData(NumberSources.project_3y_total, formatCHF(PROJECT_3Y_TOTAL))
    : { label: 'Gesamtprojekt 3 Jahre', value: formatCHF(PROJECT_3Y_TOTAL), sourceType: 'derived', source: 'fundraising/data.ts → THREE_YEAR_MODEL', formula: 'SUM(THREE_YEAR_MODEL[].total)', confidence: 'Hoch', description: 'Summe aller 3 Jahresbudgets.' };

  const inspectStiftungen3Y: InspectorData = NumberSources.stiftungen_3y_total
    ? metricToInspectorData(NumberSources.stiftungen_3y_total, formatCHF(STIFTUNGEN_3Y_TOTAL))
    : { label: 'Stiftungsfinanzierung 3 Jahre', value: formatCHF(STIFTUNGEN_3Y_TOTAL), sourceType: 'derived', source: 'fundraising/data.ts → THREE_YEAR_MODEL', confidence: 'Hoch' };

  const inspectEigen3Y: InspectorData = NumberSources.eigen_3y_total
    ? metricToInspectorData(NumberSources.eigen_3y_total, formatCHF(EIGEN_3Y_TOTAL))
    : { label: 'Eigenleistung 3 Jahre', value: formatCHF(EIGEN_3Y_TOTAL), sourceType: 'derived', source: 'fundraising/data.ts → THREE_YEAR_MODEL', confidence: 'Hoch' };

  const inspectReduction: InspectorData = {
    label: 'Reduktion Stiftungsgelder',
    value: `-${REDUCTION_PCT}%`,
    sourceType: 'derived',
    source: 'fundraising/data.ts → THREE_YEAR_MODEL',
    formula: `(1 - ${formatCHF(STIFTUNGEN_Y3)} / ${formatCHF(STIFTUNGEN_Y1)}) × 100`,
    confidence: 'Hoch',
    description: `Stiftungsfinanzierung sinkt von ${formatCHF(STIFTUNGEN_Y1)} (Jahr 1) auf ${formatCHF(STIFTUNGEN_Y3)} (Jahr 3). Degressives Modell gemäss DEGRESSIVE_CONFIG.`,
  };

  const inspectBudgetTotal: InspectorData = NumberSources.budget_total_y1
    ? metricToInspectorData(NumberSources.budget_total_y1, formatCHF(BUDGET_SUMMARY.total))
    : { label: 'Gesamtbudget Jahr 1', value: formatCHF(BUDGET_SUMMARY.total), sourceType: 'derived', source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectEinmalig: InspectorData = NumberSources.budget_einmalig
    ? metricToInspectorData(NumberSources.budget_einmalig, formatCHF(BUDGET_EINMALIG_TOTAL))
    : { label: 'Einmalige Investitionen', value: formatCHF(BUDGET_EINMALIG_TOTAL), sourceType: 'derived', source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectJaehrlich: InspectorData = NumberSources.budget_jaehrlich
    ? metricToInspectorData(NumberSources.budget_jaehrlich, formatCHF(BUDGET_JAEHRLICH_TOTAL))
    : { label: 'Jährliche Kosten', value: formatCHF(BUDGET_JAEHRLICH_TOTAL), sourceType: 'derived', source: 'BUDGET_MODULES', confidence: 'Hoch' };

  const inspectRevenueCurrent: InspectorData = NumberSources.revenue_current
    ? metricToInspectorData(NumberSources.revenue_current, formatCHF(REVENUE_CURRENT_TOTAL))
    : { label: 'Einnahmen aktuell', value: formatCHF(REVENUE_CURRENT_TOTAL), sourceType: 'estimated', source: 'Kivitendo', confidence: 'Mittel' };

  const inspectRevenueYear3: InspectorData = NumberSources.revenue_year3
    ? metricToInspectorData(NumberSources.revenue_year3, formatCHF(REVENUE_YEAR3_TOTAL))
    : { label: 'Einnahmen-Prognose Jahr 3', value: formatCHF(REVENUE_YEAR3_TOTAL), sourceType: 'estimated', source: 'Geschäftsplan', confidence: 'Mittel' };

  const inspectSpace: InspectorData = NumberSources.space_total
    ? metricToInspectorData(NumberSources.space_total, `${SPACE_TOTAL_WITH_CIRCULATION} m²`)
    : { label: 'Gesamtfläche', value: `${SPACE_TOTAL_WITH_CIRCULATION} m²`, sourceType: 'derived', source: 'SPACE_PLAN', confidence: 'Hoch' };

  return (
    <>
      <PageHeader
        title="Fundraising 2026–2028"
        subtitle="3-Jahres-Plan: Was wir brauchen, warum, und wie wir unabhängig werden"
        badge="Fundraising"
      />

      <WhyThisMatters
        purpose="3-Jahres-Fundraising-Plan zeigt WARUM wir Stiftungsgelder brauchen (B2B-Einnahmen gefallen) und WIE wir damit unabhängig werden."
        connection="Revenue = Operations finanziert. Stiftungen = Impact finanziert (Hub, kostenlose Geräte, Workshops)."
      />

      {/* ================================================================ */}
      {/* HEADLINE NUMBERS — 3-Year at a glance                           */}
      {/* ================================================================ */}
      <section className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 md:p-8">
        <div className="mb-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{PROJECT_DURATION}</div>
          <div className="text-sm text-text-muted">{PROJECT_DURATION_LABEL}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className="text-xs font-medium text-text-muted">Gesamtprojekt</div>
            <Inspectable data={inspectProject3Y} inspector={inspector} className="mt-1 text-2xl font-bold tabular-nums text-grey-dark">
              {formatCHF(PROJECT_3Y_TOTAL)}
            </Inspectable>
            <div className="text-xs text-text-muted">über 3 Jahre</div>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-center shadow-sm">
            <div className="text-xs font-medium text-violet-600">Stiftungen</div>
            <Inspectable data={inspectStiftungen3Y} inspector={inspector} className="mt-1 text-2xl font-bold tabular-nums text-violet-700">
              {formatCHF(STIFTUNGEN_3Y_TOTAL)}
            </Inspectable>
            <div className="text-xs text-violet-600">degressiv über 3 Jahre</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
            <div className="text-xs font-medium text-emerald-600">Eigenleistung</div>
            <Inspectable data={inspectEigen3Y} inspector={inspector} className="mt-1 text-2xl font-bold tabular-nums text-emerald-700">
              {formatCHF(EIGEN_3Y_TOTAL)}
            </Inspectable>
            <div className="text-xs text-emerald-600">wachsend über 3 Jahre</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center shadow-sm">
            <div className="text-xs font-medium text-amber-600">Reduktion</div>
            <Inspectable data={inspectReduction} inspector={inspector} className="mt-1 text-2xl font-bold tabular-nums text-amber-700">
              -{REDUCTION_PCT}%
            </Inspectable>
            <div className="text-xs text-amber-600">weniger Stiftungsgelder (J1→J3)</div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* VISION HERO                                                      */}
      {/* ================================================================ */}
      <section className="gradient-hero-fundraising mb-8 rounded-2xl p-4 text-white md:p-8">
        <h2 className="mb-2 text-xl font-bold md:text-2xl">Community Tech Hub 2026–2028</h2>
        <p className="mb-2 text-lg italic opacity-90">
          &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
        </p>
        <p className="mb-4 opacity-95">
          Seit 2003 verbinden wir Kreislaufwirtschaft, Arbeitsintegration und Tech-Bildung unter
          einem Dach. Auf{' '}
          <button
            type="button"
            onClick={() => inspector.inspect(inspectSpace)}
            className="cursor-pointer underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid"
            title="Klicken für Quellenangabe"
          >
            {SPACE_TOTAL_WITH_CIRCULATION} m²
          </button>
          {' '}bauen wir Werkstatt, Makerspace, AI Lab, Event-/Kulturraum
          und Museum — ein Ort für nachhaltige Technologie, souveräne KI und Community.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HERO_STATS.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white/15 p-4 text-center"
            >
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm opacity-90">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/strategie#community-tech-space" className="text-sm font-medium text-cyan-300 hover:underline">
            Vollständige Vision & Strategie &rarr;
          </Link>
        </div>
      </section>

      {/* Track Record — verified Kivitendo data */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-grey-dark">Leistungsausweis (verifiziert)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { value: `${TRACK_RECORD.yearsActive}+`, label: 'Jahre aktiv', sub: `Seit ${CORE_FACTS.organization.founded}` },
            { value: TRACK_RECORD.totalCustomers.toLocaleString('de-CH'), label: 'Kunden', sub: 'im Kivitendo ERP' },
            { value: TRACK_RECORD.totalInvoices.toLocaleString('de-CH'), label: 'Rechnungen', sub: 'seit 2007' },
            { value: TRACK_RECORD.productsInCatalog.toLocaleString('de-CH'), label: 'Produkte', sub: 'im Katalog' },
            { value: TRACK_RECORD.deliveryNotes.toLocaleString('de-CH'), label: 'Lieferungen', sub: 'ausgeführt' },
            { value: `${TRACK_RECORD.quoteConversion}%`, label: 'Offerten-Konversion', sub: 'Zuverlässigkeit' },
          ].map((item) => (
            <Inspectable
              key={item.label}
              data={{
                label: item.label,
                value: item.value,
                sourceType: 'live',
                source: TRACK_RECORD.source,
                confidence: 'Hoch',
                description: item.sub,
              }}
              inspector={inspector}
              className="block rounded-xl border border-gray-200 bg-white p-3 text-center transition-shadow hover:shadow-sm"
            >
              <div className="text-xl font-bold tabular-nums text-grey-dark">{item.value}</div>
              <div className="text-xs font-medium text-text-muted">{item.label}</div>
              <div className="text-[10px] text-text-muted">{item.sub}</div>
            </Inspectable>
          ))}
        </div>
        <p className="mt-2 text-right text-xs text-text-muted">Quelle: {TRACK_RECORD.source}</p>
      </section>

      {/* Pipeline Metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Stiftungen total"
          value={String(stats.total)}
          subtitle="Recherchierte Förderer"
          sourceType="live"
        />
        <MetricCard
          label="Hoher Fit (3/3)"
          value={String(stats.highFitCount)}
          subtitle="Beste Übereinstimmung"
          sourceType="derived"
        />
        <MetricCard
          label="Durchschn. Fit"
          value={stats.avgFit.toFixed(1)}
          subtitle="von 3.0"
          sourceType="derived"
        />
        <MetricCard
          label="Deadlines (90 Tage)"
          value={String(stats.upcomingDeadlines)}
          subtitle="Anstehende Fristen"
          sourceType="live"
        />
      </MetricGrid>

      {/* Financial Situation — honest, data-driven */}
      <Card className="mb-8 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100">
        <h3 className="mb-3 font-semibold text-amber-800">Die ehrliche Finanzlage</h3>
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            <strong>Was passiert ist:</strong> Der Verlust von B2B-Grosskunden hat unsere
            Dienstleistungs-Einnahmen um{' '}
            <Inspectable
              data={{
                label: 'Einnahmenrückgang Dienstleistungen',
                value: `${FINANCIAL_CONTEXT.decline_pct}%`,
                sourceType: 'derived',
                source: 'Kivitendo Erfolgsrechnung 3400 (2022-2025)',
                formula: `(${formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)} - ${formatCHF(FINANCIAL_CONTEXT.services_2025)}) / ${formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)} × 100`,
                confidence: 'Hoch',
                description: `Dienstleistungen (3400): CHF ${FINANCIAL_CONTEXT.services_2022.toLocaleString('de-CH')} (2022), CHF ${FINANCIAL_CONTEXT.services_2023.toLocaleString('de-CH')} (2023), CHF ${FINANCIAL_CONTEXT.services_2024.toLocaleString('de-CH')} (2024), CHF ${FINANCIAL_CONTEXT.services_2025.toLocaleString('de-CH')} (2025). Quelle: Kivitendo Erfolgsrechnung, verifiziert 11.02.2026.`,
              }}
              inspector={inspector}
              className="text-amber-900"
            >
              {FINANCIAL_CONTEXT.decline_pct}%
            </Inspectable>
            {' '}reduziert. Von ~
            <Inspectable
              data={{
                label: 'Dienstleistungseinnahmen Durchschnitt 2022-23',
                value: formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23),
                sourceType: 'live',
                source: 'Kivitendo Erfolgsrechnung 3400',
                formula: `(${formatCHF(FINANCIAL_CONTEXT.services_2022)} + ${formatCHF(FINANCIAL_CONTEXT.services_2023)}) / 2`,
                confidence: 'Hoch',
              }}
              inspector={inspector}
              className="text-amber-900"
            >
              {formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)}
            </Inspectable>
            {' '}(Durchschnitt 2022-23) auf{' '}
            <Inspectable
              data={{
                label: 'Dienstleistungseinnahmen 2025',
                value: formatCHF(FINANCIAL_CONTEXT.services_2025),
                sourceType: 'live',
                source: 'Kivitendo Erfolgsrechnung 3400 (2025, Gesamtjahr)',
                confidence: 'Hoch',
              }}
              inspector={inspector}
              className="text-amber-900"
            >
              {formatCHF(FINANCIAL_CONTEXT.services_2025)}
            </Inspectable>
            {' '}(2025). Gesamteinnahmen fielen von {formatCHF(FINANCIAL_CONTEXT.total_2023)} auf {formatCHF(FINANCIAL_CONTEXT.total_2025)}.
          </p>
          <p>
            <strong>Der Grund:</strong> Abhängigkeit von wenigen B2B-Hosting-Kunden. Keine
            diversifizierten Einnahmequellen. Keine aktive Akquise.
          </p>
          <p className="font-medium text-emerald-800">
            <strong>Das Positive:</strong> Geräteverkauf ({formatCHF(FINANCIAL_CONTEXT.warenverkauf_2025)} in 2025) bleibt
            stabil. {TRACK_RECORD.yearsActive} Jahre Erfahrung, {TRACK_RECORD.totalInvoices.toLocaleString('de-CH')} Rechnungen,{' '}
            {TRACK_RECORD.totalCustomers.toLocaleString('de-CH')} Kunden — die Kompetenz ist da. Der Hub ist unsere Turnaround-Strategie.
          </p>
        </div>
      </Card>

      {/* Revenue History — verified Kivitendo data */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Einnahmen-Entwicklung 2018–2025</h2>
        <p className="mb-4 text-sm text-text-muted">
          Alle Zahlen aus Kivitendo Erfolgsrechnung, verifiziert 11.02.2026.
          Kosten nur bis 2023 vollständig gebucht.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="space-y-1.5 p-4">
            {REVENUE_HISTORY.map((row) => {
              const maxTotal = Math.max(...REVENUE_HISTORY.map(r => r.total));
              const barPct = (row.total / maxTotal) * 100;
              const dlPct = (row.dienstleistungen / row.total) * 100;
              const wvPct = (row.warenverkauf / row.total) * 100;
              const isIncomplete = row.year >= 2024;
              return (
                <div key={row.year} className="flex items-center gap-3">
                  <span className={`w-10 text-right text-xs font-medium tabular-nums ${isIncomplete ? 'text-amber-600' : 'text-text-muted'}`}>
                    {row.year}
                  </span>
                  <div className="flex-1">
                    <div className="relative h-6 w-full overflow-hidden rounded bg-gray-100">
                      <div className="flex h-full" style={{ width: `${barPct}%` }}>
                        <div className="bg-violet-500" style={{ width: `${dlPct}%` }} title={`Dienstleistungen: ${formatCHF(row.dienstleistungen)}`} />
                        <div className="bg-blue-400" style={{ width: `${wvPct}%` }} title={`Warenverkauf: ${formatCHF(row.warenverkauf)}`} />
                        <div className="flex-1 bg-gray-300" title="Übrige Einnahmen" />
                      </div>
                    </div>
                  </div>
                  <Inspectable
                    data={{
                      label: `Gesamteinnahmen ${row.year}`,
                      value: formatCHF(row.total),
                      sourceType: 'live',
                      source: `Kivitendo Erfolgsrechnung ${row.year}`,
                      description: `Warenverkauf (3100): ${formatCHF(row.warenverkauf)} | Dienstleistungen (3400): ${formatCHF(row.dienstleistungen)} | Übrige: ${formatCHF(row.total - row.warenverkauf - row.dienstleistungen)}`,
                      confidence: 'Hoch',
                    }}
                    inspector={inspector}
                    className={`w-20 text-right text-xs font-bold tabular-nums ${isIncomplete ? 'text-amber-600' : 'text-grey-dark'}`}
                  >
                    {formatCHF(row.total)}
                  </Inspectable>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-text-muted">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-violet-500" /> Dienstleistungen</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-blue-400" /> Warenverkauf</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-gray-300" /> Übrige</span>
            <span className="ml-auto text-amber-600">* 2024-25: nur Einnahmen gebucht</span>
          </div>
        </div>
      </section>

      {/* Cost Structure 2023 — last complete year */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Kostenstruktur 2023 (letztes vollständiges Jahr)</h2>
        <p className="mb-4 text-sm text-text-muted">
          Einnahmen {formatCHF(COST_STRUCTURE_2023.totalRevenue)} vs. Ausgaben {formatCHF(COST_STRUCTURE_2023.totalExpenses)} = Verlust{' '}
          <span className="font-semibold text-red-600">{formatCHF(COST_STRUCTURE_2023.result)}</span>.
          Miete allein frisst fast die Hälfte der Ausgaben.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {/* Stacked bar */}
          <div className="flex h-8 w-full overflow-hidden">
            {COST_STRUCTURE_2023.categories.map((cat) => (
              <div
                key={cat.label}
                className={`${cat.color} transition-all hover:opacity-80`}
                style={{ width: `${cat.pctOfExpenses}%` }}
                title={`${cat.label}: ${formatCHF(cat.amount)} (${cat.pctOfExpenses}%)`}
              />
            ))}
          </div>
          {/* Legend table */}
          <div className="divide-y divide-gray-100">
            {COST_STRUCTURE_2023.categories.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-sm ${cat.color}`} />
                  <span className="text-grey-dark">{cat.label}</span>
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-muted">{cat.pctOfExpenses}%</span>
                  <span className="w-20 text-right font-medium tabular-nums text-grey-dark">{formatCHF(cat.amount)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between bg-red-50 px-4 py-2 text-sm font-semibold">
              <span className="text-red-800">Total Aufwand (119% der Einnahmen)</span>
              <span className="tabular-nums text-red-800">{formatCHF(COST_STRUCTURE_2023.totalExpenses)}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-text-muted">
            Quelle: {COST_STRUCTURE_2023.source}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3-YEAR MODEL — The core story                                    */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">3-Jahres-Modell: Weg zur Selbständigkeit</h2>
        <p className="mb-6 text-sm text-text-muted">
          Einmalige Investitionen nur im Jahr 1. Stiftungsgelder sinken jedes Jahr.
          Eigenleistung verdreifacht sich durch neue Einnahmequellen.
        </p>

        {/* Year cards with visual bars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {THREE_YEAR_MODEL.map((year, i) => {
            const stiftungenAmt = year.stiftungen + year.einmalig;
            const stiftungenPct = Math.round((stiftungenAmt / year.total) * 100);
            const eigenPct = Math.round((year.eigen / year.total) * 100);
            return (
              <div key={year.year} className={`rounded-2xl border p-5 ${i === 0 ? 'border-violet-300 bg-violet-50/50' : i === 2 ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
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
                  className="mb-4 text-2xl font-bold tabular-nums text-grey-dark"
                >
                  {formatCHF(year.total)}
                </Inspectable>

                {/* Stacked horizontal bar */}
                <div className="mb-3 h-5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="flex h-full">
                    {year.einmalig > 0 && (
                      <div
                        className="bg-blue-500"
                        style={{ width: `${Math.round((year.einmalig / year.total) * 100)}%` }}
                      />
                    )}
                    <div
                      className="bg-violet-500"
                      style={{ width: `${Math.round((year.stiftungen / year.total) * 100)}%` }}
                    />
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${eigenPct}%` }}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1.5 text-xs">
                  {year.einmalig > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                        Einmalig
                      </span>
                      <span className="tabular-nums font-medium">{formatCHF(year.einmalig)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-500" />
                      Stiftungen
                    </span>
                    <span className="tabular-nums font-medium">{formatCHF(year.stiftungen)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                      Eigenleistung
                    </span>
                    <span className="tabular-nums font-medium">{formatCHF(year.eigen)}</span>
                  </div>
                </div>

                {/* Percentage callout */}
                <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-center text-xs">
                  <span className="font-semibold text-violet-700">{stiftungenPct}%</span>
                  <span className="text-text-muted"> Stiftungen</span>
                  <span className="mx-1.5 text-text-muted">/</span>
                  <span className="font-semibold text-emerald-700">{eigenPct}%</span>
                  <span className="text-text-muted"> Eigen</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-year summary table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 font-semibold text-grey-dark" />
                {THREE_YEAR_MODEL.map((y) => (
                  <th key={y.year} className="px-4 py-2.5 text-right font-semibold text-grey-dark">{y.year}</th>
                ))}
                <th className="px-4 py-2.5 text-right font-bold text-grey-dark">3-Jahres-Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
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
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                    Stiftungsfinanzierung
                  </span>
                </td>
                {THREE_YEAR_MODEL.map((y) => (
                  <td key={y.year} className="px-4 py-2 text-right tabular-nums text-violet-700">{formatCHF(y.stiftungen)}</td>
                ))}
                <td className="px-4 py-2 text-right tabular-nums font-medium text-violet-700">{formatCHF(THREE_YEAR_MODEL.reduce((s, y) => s + y.stiftungen, 0))}</td>
              </tr>
              <tr className="border-b border-gray-100 bg-emerald-50/50">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Eigenleistung
                  </span>
                </td>
                {THREE_YEAR_MODEL.map((y) => (
                  <td key={y.year} className="px-4 py-2 text-right tabular-nums text-emerald-700">{formatCHF(y.eigen)}</td>
                ))}
                <td className="px-4 py-2 text-right tabular-nums font-medium text-emerald-700">
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
      </section>

      {/* ================================================================ */}
      {/* SPACE PLAN                                                       */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">
          Raumkonzept:{' '}
          <Inspectable data={inspectSpace} inspector={inspector}>
            {SPACE_TOTAL_WITH_CIRCULATION} m²
          </Inspectable>
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          Von 250 auf {SPACE_TOTAL_WITH_CIRCULATION} m² — endlich Platz für das, was wir tun.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {/* Visual bar showing proportional sizes */}
          <div className="flex h-8 w-full overflow-hidden bg-gray-100">
            {SPACE_PLAN.map((space, i) => {
              const colors = [
                'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500',
                'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500',
                'bg-indigo-500', 'bg-red-500', 'bg-gray-400',
              ];
              return (
                <div
                  key={space.area}
                  className={`${colors[i]} transition-all hover:opacity-80`}
                  style={{ width: `${(space.sqm / SPACE_TOTAL_WITH_CIRCULATION) * 100}%` }}
                  title={`${space.area}: ${space.sqm} m²`}
                />
              );
            })}
            {/* Verkehrsfläche */}
            <div
              className="bg-gray-300"
              style={{ width: `${(100 / SPACE_TOTAL_WITH_CIRCULATION) * 100}%` }}
              title="Verkehrsfläche: ~100 m²"
            />
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 font-semibold text-grey-dark">Bereich</th>
                <th className="px-4 py-2.5 text-right font-semibold text-grey-dark">m²</th>
                <th className="px-4 py-2.5 font-semibold text-grey-dark">Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {SPACE_PLAN.map((space, i) => {
                const colors = [
                  'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500',
                  'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500',
                  'bg-indigo-500', 'bg-red-500', 'bg-gray-400',
                ];
                return (
                  <tr key={space.area} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-sm ${colors[i]}`} />
                        <span className="font-medium text-grey-dark">{space.area}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-grey-dark">{space.sqm}</td>
                    <td className="px-4 py-2 text-text-muted">{space.description}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                <td className="px-4 py-2 text-grey-dark">Nutzfläche + Verkehrsfläche (~100 m²)</td>
                <td className="px-4 py-2 text-right tabular-nums font-bold text-grey-dark">~{SPACE_TOTAL_WITH_CIRCULATION}</td>
                <td className="px-4 py-2 text-text-muted">{SPACE_PLAN_TOTAL} m² Nutzfläche + ~100 m² Flure, Treppen</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BUDGET MODULES — Year 1 detail                                   */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Budgetdetail Jahr 1</h2>
        <p className="mb-6 text-sm text-text-muted">
          7 Module, einzeln förderbar. Einmalige Investitionen + jährliche Kosten ={' '}
          <Inspectable data={inspectBudgetTotal} inspector={inspector}>
            {formatCHF(BUDGET_SUMMARY.total)}
          </Inspectable>.
        </p>

        {/* Einmalige Investitionen */}
        <div className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-lg font-semibold text-grey-dark">
              <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-blue-500" />
              Einmalige Investitionen
            </h3>
            <Inspectable data={inspectEinmalig} inspector={inspector} className="text-lg font-bold tabular-nums text-blue-600">
              {formatCHF(BUDGET_EINMALIG_TOTAL)}
            </Inspectable>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {BUDGET_EINMALIG.map((m) => (
              <BudgetModuleCard key={m.label} module={m} borderColor="border-l-blue-500" />
            ))}
          </div>
        </div>

        {/* Jährliche Kosten */}
        <div className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-lg font-semibold text-grey-dark">
              <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-violet-500" />
              Jährliche Kosten
              <span className="ml-2 text-sm font-normal text-text-muted">(degressiv finanziert über 3 Jahre)</span>
            </h3>
            <Inspectable data={inspectJaehrlich} inspector={inspector} className="text-lg font-bold tabular-nums text-violet-600">
              {formatCHF(BUDGET_JAEHRLICH_TOTAL)}<span className="text-sm font-normal text-text-muted">/Jahr</span>
            </Inspectable>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {BUDGET_JAEHRLICH.map((m) => (
              <BudgetModuleCard key={m.label} module={m} borderColor="border-l-violet-500" />
            ))}
          </div>
        </div>

        {/* Budget Summary */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-2xl font-bold text-grey-dark">
                <Inspectable data={inspectBudgetTotal} inspector={inspector}>
                  {formatCHF(BUDGET_SUMMARY.total)}
                </Inspectable>
                {' '}<span className="text-base font-normal text-text-muted">Jahr 1</span>
              </div>
              <p className="mt-1 text-sm text-text-muted">
                Davon {formatCHF(BUDGET_SUMMARY.eigenleistung)} Eigenleistung ({BUDGET_SUMMARY.selfFinancingPct}%)
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-violet-700">Stiftungs-Förderbedarf</div>
              <Inspectable data={inspectStiftungen3Y} inspector={inspector} className="text-xl font-bold tabular-nums text-violet-700">
                {formatCHF(STIFTUNGEN_3Y_TOTAL)}
              </Inspectable>
              <div className="text-xs text-text-muted">über 3 Jahre (degressiv)</div>
            </div>
          </div>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* REVENUE & SUSTAINABILITY                                         */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Einnahmequellen & Nachhaltigkeit</h2>
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

        {/* Revenue comparison bar */}
        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-baseline justify-between text-sm">
            <span className="text-text-muted">Heute: {formatCHF(REVENUE_CURRENT_TOTAL)}</span>
            <span className="font-semibold text-emerald-700">Jahr 3: {formatCHF(REVENUE_YEAR3_TOTAL)}</span>
          </div>
          <div className="flex gap-1">
            <div className="h-3 rounded-full bg-gray-300" style={{ width: `${(REVENUE_CURRENT_TOTAL / REVENUE_YEAR3_TOTAL) * 100}%` }} />
            <div className="h-3 flex-1 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-1 text-right text-xs text-emerald-600">
            +{Math.round(((REVENUE_YEAR3_TOTAL - REVENUE_CURRENT_TOTAL) / REVENUE_CURRENT_TOTAL) * 100)}% Wachstum
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REVENUE_STREAMS.map((stream) => {
            const growth = stream.current > 0
              ? Math.round(((stream.year3 - stream.current) / stream.current) * 100)
              : null;
            const isNew = stream.current === 0;
            const barWidth = Math.round((stream.year3 / REVENUE_YEAR3_TOTAL) * 100);
            return (
              <Card key={stream.source} className={`${isNew ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-grey-dark">{stream.source}</h4>
                  {isNew && <Badge variant="success">Neu</Badge>}
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div>
                    <div className="text-xs text-text-muted">Heute</div>
                    <div className="text-lg font-bold tabular-nums text-grey-dark">{formatCHF(stream.current)}</div>
                  </div>
                  <span className="text-text-muted" aria-hidden="true">&rarr;</span>
                  <div>
                    <div className="text-xs text-text-muted">Jahr 3</div>
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
                      className="text-lg font-bold tabular-nums text-emerald-700"
                    >
                      {formatCHF(stream.year3)}
                    </Inspectable>
                  </div>
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${barWidth}%` }} />
                </div>
                {growth !== null && (
                  <div className="mt-1 text-xs text-emerald-600">+{growth}%</div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* PIPELINE                                                         */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fundraising Pipeline</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.entries(stats.statusCounts) as [FoundationStatus, number][]).map(
            ([status, count]) => (
              <Link
                key={status}
                href={`/fundraising/stiftungen?status=${status}`}
                className="block rounded-lg bg-gray-50 p-4 text-center transition-shadow hover:shadow-md"
              >
                <Badge variant={STATUS_BADGE_VARIANT[status]} className="mb-2">
                  {STATUS_LABELS[status].text}
                </Badge>
                <div className="text-2xl font-bold text-grey-dark">{count}</div>
                <div className="text-xs text-text-muted">{STATUS_LABELS[status].desc}</div>
              </Link>
            )
          )}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/fundraising/stiftungen"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Stiftungen & Förderer Übersicht
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </Card>

      {/* Key Resources */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wichtige Ressourcen</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RESOURCES.map((resource) => (
            <Link key={resource.href} href={resource.href} className="block">
              <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
                <div className="flex-1">
                  <strong className="block text-sm">{resource.label}</strong>
                  <span className="text-xs text-text-muted">{resource.description}</span>
                </div>
                <span className="text-primary" aria-hidden="true">&rarr;</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Nächste Schritte</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {NEXT_STEPS.map((step) => (
            <div key={step.step} className="rounded-lg border border-gray-100 p-4">
              <h3 className="mb-2 font-semibold text-grey-dark">{step.step}</h3>
              <p className="mb-3 text-sm text-text-muted">{step.description}</p>
              <Link href={step.href} className="text-sm font-medium text-primary hover:underline">
                {step.linkLabel} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Number Inspector Modal */}
      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />

      <StoryBridge bridges={STORY_BRIDGES.fundraising} />
    </>
  );
}
