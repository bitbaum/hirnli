/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import YearSelector from '@/components/ui/YearSelector';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import ShareButton from '@/components/ui/ShareButton';

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-white text-text-muted">Laden...</div>,
});
const CategoryBreakdown = dynamic(() => import('@/components/charts/CategoryBreakdown'), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-white text-text-muted">Laden...</div>,
});
const AnnualTrendChart = dynamic(() => import('@/components/charts/AnnualTrendChart'), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-white text-text-muted">Laden...</div>,
});

import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import {
  formatCHF,
  formatPercent,
  formatMonthShort,
  calcGrowth,
} from '@/lib/utils/format';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import {
  REVENUE_CATEGORIES,
  ANNUAL_PL,
  COMPLETE_YEARS,
  LATEST_COMPLETE,
  PEAK_REVENUE,
  PEAK_YEAR,
  CUMULATIVE_RESULT,
  AVG_REVENUE,
  DATA_QUALITY,
} from './data';
import {
  InsightCard,
  DataQualityBanner,
  ProfitLossTable,
  CostStructureCard,
  YearComparison,
  MonthlyBreakdownTable,
} from './components';

const TABS = [
  { id: 'overview', label: 'Jahresübersicht' },
  { id: 'monthly', label: 'Monatsdetails' },
];

export default function FinanzenClient() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlyData,
    totals,
    monthCount,
    monthlyAvg,
    selfFinancingRate,
  } = useFinancialData(2025);

  const inspector = useNumberInspector();

  // Previous year for comparison
  const prevYear = useFinancialData(selectedYear - 1);
  const growth = prevYear.totals.total > 0
    ? calcGrowth(prevYear.totals.total, totals.total)
    : 0;

  // Derived values
  const earned = totals.warenverkauf + totals.dienstleistungen + totals.integration;
  const donations = totals.spenden + totals.aufstockung;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-0">
        <PageHeader
          title="Finanzübersicht"
          subtitle="Einnahmen & Aufwand — Kivitendo Buchhaltung 2018–2025"
          badge="Quelldaten aus Buchhaltung"
        />
        <div className="shrink-0 pt-1">
          <ShareButton />
        </div>
      </div>

      <WhyThisMatters
        purpose="Transparente Finanzdaten zeigen unsere wirtschaftliche Entwicklung und Herausforderungen."
        connection="Zahlen erklären WARUM wir Stiftungsgelder brauchen — und warum Transformation jetzt nötig ist, nicht irgendwann."
      />

      {/* Revenue decline narrative — the "burning platform" */}
      <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-50">
        <h3 className="font-semibold text-grey-dark mb-2">Warum jetzt? Die Ausgangslage ehrlich</h3>
        <div className="text-sm text-text-light space-y-2">
          <p>
            Unsere Einnahmen sind von <strong>CHF {formatCHF(PEAK_REVENUE)}</strong> ({PEAK_YEAR}) auf <strong>{formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)}</strong> ({ANNUAL_PL[ANNUAL_PL.length - 1].year}) gefallen — ein Rückgang von über 50%.
            Der Haupttreiber: Verlust von B2B-Hosting-Kunden (Dienstleistungen von {formatCHF(Math.max(...ANNUAL_PL.filter(y => y.isComplete).map(y => y.revenueDetail.dienstleistungen)))} auf {formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenueDetail.dienstleistungen)}).
          </p>
          <p>
            Das aktuelle Modell — abhängig von wenigen grossen Einzelkunden — ist <strong>fragil</strong>.
            Stiftungsgelder sind keine Wachstumsinvestition, sondern ermöglichen die <strong>Diversifizierung</strong>,
            die Revamp-IT zum langfristigen Überleben braucht.
          </p>
          <p className="text-xs text-text-muted">
            Alle Zahlen aus Kivitendo Buchhaltung. Vollständige P&L nur für {DATA_QUALITY.completeRange} verfügbar.
            Seit 2024 wurden keine Aufwände verbucht.
          </p>
        </div>
      </Card>

      <Card className="mb-6 bg-blue-50 border-l-4 border-blue-500">
        <p className="text-sm">
          <strong>Diese Seite zeigt:</strong> Einnahmen & Ausgaben (woher kommt das Geld?)<br />
          <strong>Impact ansehen:</strong> <Link href="/wirkung" className="text-blue-600 hover:underline font-medium">Wirkungsseite</Link>
          {' '}zeigt, was wir mit dem Geld bewirken.
        </p>
      </Card>

      <Tabs tabs={TABS} defaultTab="overview">
        {(activeTab) => (
          <>
            {/* ====================================================
                TAB 1: Jahresübersicht (8 Jahre)
                ==================================================== */}
            {activeTab === 'overview' && (
              <div>
                {/* Data quality banner — prominent at top */}
                <div className="mb-6 rounded-lg border-2 border-warning/50 bg-warning-bg/30 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl text-warning">&#9888;</span>
                    <div>
                      <h3 className="text-sm font-bold text-grey-dark">
                        Wichtig: Eingeschränkte Datenverfügbarkeit
                      </h3>
                      <p className="mt-1 text-sm text-text-light">
                        <strong>Vollständige P&L (Einnahmen + Aufwände):</strong> {DATA_QUALITY.completeRange}.{' '}
                        <strong>Nur Einnahmen:</strong> {DATA_QUALITY.incompleteRange} — Aufwände wurden im Buchhaltungssystem nicht verbucht.
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        Quelle: {DATA_QUALITY.source}. {DATA_QUALITY.caveat}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary metrics */}
                <MetricGrid columns={4} className="mb-8">
                  <MetricCard
                    label="Spitzenjahr"
                    value={formatCHF(PEAK_REVENUE)}
                    subtitle={`${PEAK_YEAR} — höchster Umsatz`}
                    sourceType="live"
                    onClick={() =>
                      inspector.inspect({
                        label: 'Spitzenumsatz',
                        value: formatCHF(PEAK_REVENUE),
                        sourceType: 'live',
                        source: DATA_QUALITY.source,
                        description: `Höchster Jahresumsatz war ${PEAK_YEAR} mit ${formatCHF(PEAK_REVENUE)}.`,
                      })
                    }
                  />
                  <MetricCard
                    label={`Umsatz ${ANNUAL_PL[ANNUAL_PL.length - 1].year}`}
                    value={formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)}
                    subtitle="Aktuellstes Jahr"
                    trend={{
                      value: calcGrowth(
                        ANNUAL_PL[ANNUAL_PL.length - 2].revenue,
                        ANNUAL_PL[ANNUAL_PL.length - 1].revenue,
                      ),
                      label: `vs. ${ANNUAL_PL[ANNUAL_PL.length - 2].year}`,
                    }}
                    sourceType="live"
                    onClick={() =>
                      inspector.inspect({
                        label: `Umsatz ${ANNUAL_PL[ANNUAL_PL.length - 1].year}`,
                        value: formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue),
                        sourceType: 'live',
                        source: DATA_QUALITY.source,
                        description: ANNUAL_PL[ANNUAL_PL.length - 1].note || 'Einnahmen aus Kivitendo Erfolgsrechnung.',
                      })
                    }
                  />
                  <MetricCard
                    label="Kumuliertes Ergebnis"
                    value={formatCHF(CUMULATIVE_RESULT)}
                    subtitle={`${DATA_QUALITY.completeRange} (${COMPLETE_YEARS.length} Jahre)`}
                    sourceType="derived"
                    onClick={() =>
                      inspector.inspect({
                        label: 'Kumuliertes Ergebnis',
                        value: formatCHF(CUMULATIVE_RESULT),
                        sourceType: 'derived',
                        source: DATA_QUALITY.source,
                        formula: `SUM(Ergebnis ${DATA_QUALITY.completeRange})`,
                        description: `Summe aller Geschäftsergebnisse ${DATA_QUALITY.completeRange}. Nur vollständige Jahre (mit verbuchten Aufwänden) berücksichtigt.`,
                      })
                    }
                  />
                  <MetricCard
                    label="Durchschnitt"
                    value={formatCHF(AVG_REVENUE)}
                    subtitle={`Ø Umsatz ${DATA_QUALITY.completeRange}`}
                    sourceType="derived"
                    onClick={() =>
                      inspector.inspect({
                        label: 'Durchschnittlicher Umsatz',
                        value: formatCHF(AVG_REVENUE),
                        sourceType: 'derived',
                        source: DATA_QUALITY.source,
                        formula: `SUM(Umsatz ${DATA_QUALITY.completeRange}) / ${COMPLETE_YEARS.length}`,
                        description: 'Durchschnittlicher Jahresumsatz über alle vollständigen Geschäftsjahre.',
                      })
                    }
                  />
                </MetricGrid>

                {/* 8-year trend chart */}
                <div className="mb-8">
                  <AnnualTrendChart data={ANNUAL_PL} />
                </div>

                {/* P&L table */}
                <ProfitLossTable data={ANNUAL_PL} />

                {/* Cost structure for benchmark year (2023) */}
                <CostStructureCard entry={LATEST_COMPLETE} />

                {/* Management insights */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Analyse</CardTitle>
                  </CardHeader>
                  {(() => {
                    // Derive insight values from ANNUAL_PL (SSOT)
                    const lossYears = COMPLETE_YEARS.filter(y => y.result < 0);
                    const lossYearRange = lossYears.length > 0
                      ? `${lossYears[0].year}–${lossYears[lossYears.length - 1].year}`
                      : '';
                    const rentFirst = ANNUAL_PL[0].expenseDetail?.miete ?? 0;
                    const rentPeak = Math.max(...COMPLETE_YEARS.filter(y => y.expenseDetail?.miete).map(y => y.expenseDetail!.miete));
                    const profitYear = COMPLETE_YEARS.find(y => y.result > 0);

                    return (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InsightCard
                          variant="warning"
                          title={`${lossYears.length} Jahre Verlust (${lossYearRange})`}
                          text={`Kumulierter Verlust: ${formatCHF(CUMULATIVE_RESULT)}. Hauptursache: Miete von ${formatCHF(rentFirst)} (${ANNUAL_PL[0].year}) auf ${formatCHF(rentPeak)} (2021+), während Einnahmen stagnierten.`}
                        />
                        <InsightCard
                          variant="warning"
                          title="Umsatzrückgang 2024–2025"
                          text={`Von ${formatCHF(PEAK_REVENUE)} (${PEAK_YEAR}) auf ${formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)} (${ANNUAL_PL[ANNUAL_PL.length - 1].year}). Dienstleistungen am stärksten betroffen.`}
                        />
                        <InsightCard
                          variant="info"
                          title={`Kostenstruktur ${LATEST_COMPLETE.year}`}
                          text={`Miete & Nebenkosten: ${formatCHF(LATEST_COMPLETE.expenseDetail?.miete ?? 0)} (50% der Kosten). Personal: ${formatCHF(LATEST_COMPLETE.expenseDetail?.personal ?? 0)} (30%).`}
                        />
                        {profitYear && (
                          <InsightCard
                            variant="info"
                            title={`Einziges Gewinnjahr: ${profitYear.year}`}
                            text={`${formatCHF(profitYear.result)} Gewinn bei niedrigen Kosten (Miete: ${formatCHF(profitYear.expenseDetail?.miete ?? 0)}, Personal: ${formatCHF(profitYear.expenseDetail?.personal ?? 0)}). Seither strukturelle Unterdeckung.`}
                          />
                        )}
                      </div>
                    );
                  })()}
                </Card>

                {/* Data source */}
                <Card>
                  <div className="text-sm text-text-light">
                    <p className="font-medium text-grey-dark">Datenquelle</p>
                    <p>{DATA_QUALITY.source}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      System: {DATA_QUALITY.sourceSystem} | Vollständig: {DATA_QUALITY.completeRange} | Unvollständig: {DATA_QUALITY.incompleteRange}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {DATA_QUALITY.caveat}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* ====================================================
                TAB 2: Monatsdetails (existing monthly revenue view)
                ==================================================== */}
            {activeTab === 'monthly' && (
              <div>
                <YearSelector
                  years={availableYears}
                  selected={selectedYear}
                  onChange={setSelectedYear}
                  className="mb-6"
                />

                {/* Financial overview metrics */}
                <MetricGrid columns={4} className="mb-8">
                  <MetricCard
                    label="Gesamteinnahmen"
                    value={formatCHF(totals.total)}
                    subtitle={`${monthCount} Monate erfasst`}
                    trend={growth !== 0 ? { value: growth, label: `vs. ${selectedYear - 1}` } : undefined}
                    sourceType="live"
                    onClick={() =>
                      inspector.inspect(metricToInspectorData(
                        NumberSources.financial_total_2025,
                        formatCHF(totals.total),
                        { year: selectedYear },
                      ))
                    }
                  />
                  <MetricCard
                    label="Eigenerwirtschaftet"
                    value={formatCHF(earned)}
                    subtitle="Waren + Dienste + Integration"
                    sourceType="derived"
                    onClick={() =>
                      inspector.inspect(metricToInspectorData(
                        NumberSources.financial_earned_2025,
                        formatCHF(earned),
                        {
                          year: selectedYear,
                          formula: `${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)} + ${formatCHF(totals.integration)}`,
                        },
                      ))
                    }
                  />
                  <MetricCard
                    label="Spenden & Förderung"
                    value={formatCHF(donations)}
                    subtitle={`${formatPercent(totals.total > 0 ? donations / totals.total : 0)} vom Total`}
                    sourceType="live"
                    onClick={() =>
                      inspector.inspect(metricToInspectorData(
                        NumberSources.financial_donations_2025,
                        formatCHF(donations),
                        {
                          year: selectedYear,
                          formula: `${formatCHF(totals.spenden)} + ${formatCHF(totals.aufstockung)}`,
                        },
                      ))
                    }
                  />
                  <MetricCard
                    label="Eigenfinanzierung"
                    value={formatPercent(selfFinancingRate)}
                    subtitle="Ziel: >70%"
                    sourceType="derived"
                    onClick={() =>
                      inspector.inspect(metricToInspectorData(
                        NumberSources.financial_self_financing_2025,
                        formatPercent(selfFinancingRate),
                        {
                          year: selectedYear,
                          formula: `(${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)}) / ${formatCHF(totals.total)}`,
                        },
                      ))
                    }
                  />
                </MetricGrid>

                {/* Category breakdown cards */}
                <section className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold text-grey-dark">Einnahmen nach Kategorie</h2>
                  <MetricGrid columns={3}>
                    {REVENUE_CATEGORIES.map((cat) => {
                      const amount = totals[cat.key];
                      const share = totals.total > 0 ? amount / totals.total : 0;
                      return (
                        <MetricCard
                          key={cat.key}
                          label={cat.label}
                          value={formatCHF(amount)}
                          subtitle={`${formatPercent(share)} vom Total | Konto ${cat.code}`}
                          sourceType="live"
                          onClick={() =>
                            inspector.inspect({
                              label: cat.label,
                              value: formatCHF(amount),
                              sourceType: 'live',
                              source: `revamp-Einnahmen-${selectedYear}.xlsx`,
                              account: `${cat.code} (${cat.label})`,
                              description: `Einnahmen aus ${cat.label} im Jahr ${selectedYear}`,
                            })
                          }
                        />
                      );
                    })}
                    <MetricCard
                      label="Monatsdurchschnitt"
                      value={formatCHF(monthlyAvg)}
                      subtitle="pro aktivem Monat"
                      sourceType="derived"
                      onClick={() =>
                        inspector.inspect(metricToInspectorData(
                          NumberSources.financial_monthly_avg_2025,
                          formatCHF(monthlyAvg),
                          { year: selectedYear, formula: `${formatCHF(totals.total)} / ${monthCount} Monate` },
                        ))
                      }
                    />
                  </MetricGrid>
                </section>

                {/* Charts: Revenue over time + Category breakdown */}
                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                  <RevenueChart data={monthlyData} title={`Monatlicher Umsatzverlauf ${selectedYear}`} />
                  <CategoryBreakdown
                    warenverkauf={totals.warenverkauf}
                    dienstleistungen={totals.dienstleistungen}
                    integration={totals.integration}
                    spenden={totals.spenden + totals.aufstockung}
                    title={`Einnahmenverteilung ${selectedYear}`}
                  />
                </div>

                {/* Year-over-year comparison */}
                <YearComparison
                  selectedYear={selectedYear}
                  totals={totals}
                  prevTotals={prevYear.totals}
                  donations={donations}
                  prevDonations={prevYear.totals.spenden + prevYear.totals.aufstockung}
                />

                {/* Monthly breakdown table */}
                <MonthlyBreakdownTable
                  selectedYear={selectedYear}
                  monthlyData={monthlyData}
                  totals={totals}
                />

                {/* Insights */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Management Insights</CardTitle>
                  </CardHeader>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InsightCard
                      variant={selfFinancingRate >= 0.6 ? 'success' : 'warning'}
                      title={selfFinancingRate >= 0.6 ? 'Eigenfinanzierung stabil' : 'Hohe Spendenabhängigkeit'}
                      text={
                        selfFinancingRate >= 0.6
                          ? `Mit ${formatPercent(selfFinancingRate)} Eigenfinanzierung ist die Organisation gut aufgestellt.`
                          : `Nur ${formatPercent(selfFinancingRate)} werden selbst erwirtschaftet. Diversifizierung empfohlen.`
                      }
                    />
                    {monthlyData.length > 0 && (
                      <InsightCard
                        variant="info"
                        title="Stärkster Monat"
                        text={(() => {
                          const best = monthlyData.reduce((a, b) => (b.total > a.total ? b : a));
                          return `${formatMonthShort(best.period)} mit ${formatCHF(best.total)} war der umsatzstärkste Monat.`;
                        })()}
                      />
                    )}
                    {growth !== 0 && (
                      <InsightCard
                        variant={growth > 0 ? 'success' : 'warning'}
                        title={growth > 0 ? 'Wachstum gegenüber Vorjahr' : 'Rückgang gegenüber Vorjahr'}
                        text={`${growth > 0 ? '+' : ''}${formatPercent(growth)} Einnahmen verglichen mit ${selectedYear - 1}.`}
                      />
                    )}
                    <InsightCard
                      variant="info"
                      title="Warenverkauf-Anteil"
                      text={`Warenverkauf macht ${formatPercent(totals.total > 0 ? totals.warenverkauf / totals.total : 0)} der Gesamteinnahmen aus.`}
                    />
                  </div>
                </Card>

                {/* Data source info */}
                <Card>
                  <div className="text-sm text-text-light">
                    <p className="font-medium text-grey-dark">Datenquelle</p>
                    <p>Kivitendo Buchhaltung (Export: revamp-Einnahmen-{selectedYear}.xlsx)</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Konten: 3100 Warenverkauf, 3400 Dienstleistungen, 3450 Integration, 3500 Spenden, 3510 Aufstockung
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </Tabs>

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />

      <StoryBridge bridges={STORY_BRIDGES.finanzen} />
    </div>
  );
}
