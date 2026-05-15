'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import YearSelector from '@/components/ui/YearSelector';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { formatCHF, formatNumber } from '@/lib/utils/format';
import { estimateDeviceCount, estimateCO2Avoided, estimateEWastePrevented } from '@/lib/domain/calculations';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import { CO2_PER_LAPTOP, AVG_DEVICE_PRICE, CO2_PER_FLIGHT_ZRH_BER, CO2_KG_PER_CAR_KM, getNumericValue } from '@/lib/config/numbers';
import { ImpactStoryCards } from './components';
import { DATA_GAPS, WIRKUNG_NEXT_STEPS } from './data';
import Callout from '@/components/ui/Callout';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import ShareButton from '@/components/ui/ShareButton';
import ProgressBar from '@/components/ui/ProgressBar';

export default function WirkungClient() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    totals,
  } = useFinancialData();

  const inspector = useNumberInspector();

  // Impact calculations from financial data
  const deviceCount = estimateDeviceCount(totals.warenverkauf);
  const co2Avoided = estimateCO2Avoided(deviceCount);
  const eWaste = estimateEWastePrevented(deviceCount, 5); // 5 kg avg weight
  const lifespanExt = getNumericValue('DEVICE_LIFESPAN_EXTENSION');
  const lifeYears = deviceCount * lifespanExt;

  // CO2 equivalents for context
  const carsKm = Math.round((co2Avoided * 1000) / CO2_KG_PER_CAR_KM);
  const flightsZurichBerlin = Math.round((co2Avoided * 1000) / CO2_PER_FLIGHT_ZRH_BER);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-0">
        <PageHeader
          title={`Unsere Wirkung ${selectedYear}`}
          subtitle="Jedes Gerät, das wir retten, vermeidet Elektroschrott und schenkt neues digitales Leben."
        />
        <div className="shrink-0 pt-1">
          <ShareButton />
        </div>
      </div>

      <WhyThisMatters
        purpose="Impact-Kennzahlen zeigen konkret, welchen Umwelt- und Sozialeffekt wir erzielen."
        connection="Wirkung = finanziert durch Solidarisches Preismodell + Stiftungsgelder (siehe Finanzen)."
      />

      <Callout color="success" className="mb-6">
        <p className="text-sm">
          <strong>Diese Seite zeigt:</strong> Impact-Kennzahlen (was bewirken wir?)<br />
          <strong>Finanzierung ansehen:</strong> <Link href="/finanzen" className="text-success hover:underline font-medium">Finanzseite</Link>
          {' '}zeigt, woher das Budget kommt.
        </p>
      </Callout>

      <YearSelector
        years={availableYears}
        selected={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />

      {/* Transparency note */}
      <Callout color="warning" className="mb-6 text-sm text-text-light">
        <strong className="text-grey-dark">Transparenz:</strong> Die meisten Wirkungszahlen sind{' '}
        <Badge variant="estimated">Schätzungen</Badge>{' '}
        basierend auf Finanzdaten. Wir zeigen offen, was wir wissen und was wir schätzen.
      </Callout>

      {/* Hero impact metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Geräte gerettet"
          value={`~${formatNumber(deviceCount)}`}
          subtitle={`Basis: ${formatCHF(totals.warenverkauf)} Warenverkauf`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.devices_estimated_2025,
              `~${formatNumber(deviceCount)}`,
              { year: selectedYear, formula: `${formatCHF(totals.warenverkauf)} / CHF ${AVG_DEVICE_PRICE} pro Gerät` },
            ))
          }
        />
        <MetricCard
          label="CO₂ vermieden"
          value={`~${co2Avoided} t`}
          subtitle={`${CO2_PER_LAPTOP} kg CO₂ pro Gerät (Fraunhofer IZM)`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.co2_total_2025,
              `~${co2Avoided} Tonnen`,
              { year: selectedYear, formula: `${formatNumber(deviceCount)} Geräte × ${CO2_PER_LAPTOP} kg CO₂ / 1000` },
            ))
          }
        />
        <MetricCard
          label="E-Waste vermieden"
          value={`~${formatNumber(eWaste)} kg`}
          subtitle="~5 kg pro Gerät"
          sourceType="estimated"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.ewaste_total_2025,
              `~${formatNumber(eWaste)} kg`,
              { year: selectedYear, formula: `${formatNumber(deviceCount)} Geräte × 5 kg` },
            ))
          }
        />
        <MetricCard
          label="Lebensjahre verlängert"
          value={`~${formatNumber(lifeYears)} J.`}
          subtitle={`~${lifespanExt} Jahre pro Gerät`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'Lebensjahre verlängert',
              value: `~${formatNumber(lifeYears)} Jahre`,
              sourceType: 'estimated',
              source: 'Berechnet aus Geräteanzahl',
              formula: `${formatNumber(deviceCount)} Geräte × ${lifespanExt} Jahre`,
              confidence: 'Niedrig',
              description:
                `Geschätzte Lebensdauerverlängerung durch Refurbishment. Annahme: ${lifespanExt} zusätzliche Nutzungsjahre pro Gerät.`,
            })
          }
        />
      </MetricGrid>

      {/* Impact story cards */}
      <ImpactStoryCards
        co2Avoided={co2Avoided}
        eWaste={eWaste}
        carsKm={carsKm}
        flightsZurichBerlin={flightsZurichBerlin}
      />

      {/* Platform / Digital Infrastructure */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Digitale Infrastruktur</CardTitle>
          <p className="text-sm text-text-muted">
            Eigenentwickelte Open-Source-Community-Plattform — skaliert Wirkung ohne proportionale Kostensteigerung
          </p>
        </CardHeader>
        <MetricGrid columns={4}>
          <MetricCard
            label="TypeScript-Dateien"
            value={formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))}
            subtitle="Eigenentwickelter Code"
            sourceType="live"
          />
          <MetricCard
            label="React-Komponenten"
            value={formatNumber(getNumericValue('PLATFORM_COMPONENTS'))}
            subtitle="Wiederverwendbare UI-Bausteine"
            sourceType="live"
          />
          <MetricCard
            label="Seiten"
            value={formatNumber(getNumericValue('PLATFORM_PAGES'))}
            subtitle="App-Router-Seiten"
            sourceType="live"
          />
          <MetricCard
            label="DB-Migrationen"
            value={formatNumber(getNumericValue('PLATFORM_DB_MIGRATIONS'))}
            subtitle="PostgreSQL-Schema-Versionen"
            sourceType="live"
          />
        </MetricGrid>
        <p className="mt-4 text-sm text-text-muted">
          Plattform: <a href="https://revampit.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">revampit.vercel.app</a> — Next.js, TypeScript, PostgreSQL, Open Source
        </p>
      </Card>

      {/* Data coverage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Datenabdeckung</CardTitle>
          <p className="text-sm text-text-muted">Wie viel unserer Wirkung können wir messen?</p>
        </CardHeader>
        <ProgressBar percent={25} size="lg" color="bg-warning" trackColor="bg-grey-light" label="Datenabdeckung: 25% der Wirkungsindikatoren messbar" />
        <div className="flex justify-between text-sm text-text-muted">
          <span>25% der Wirkungsindikatoren messbar</span>
          <span>Ziel: 75%</span>
        </div>
      </Card>

      {/* Data gaps */}
      <Card className="mb-8 border-l-4 border-l-warning bg-warning-bg/20">
        <CardHeader>
          <CardTitle>Datenlücken schliessen</CardTitle>
          <p className="text-sm text-text-muted">Um unsere Wirkung besser zu belegen, fehlen uns folgende Daten:</p>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DATA_GAPS.map((gap) => (
            <div key={gap.title} className="rounded-lg bg-white p-3 text-center">
              <div className="mb-1 text-2xl opacity-50">{gap.icon}</div>
              <p className="heading-detail">{gap.title}</p>
              <p className="text-sm text-text-muted">{gap.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Next steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nächste Schritte</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {WIRKUNG_NEXT_STEPS.map((step) => (
            <div
              key={step.label}
              className={`rounded-lg border p-4 ${
                step.priority === 'high'
                  ? 'border-l-4 border-l-danger'
                  : step.priority === 'medium'
                    ? 'border-l-4 border-l-warning'
                    : 'border-l-4 border-l-border'
              }`}
            >
              <h4 className="mb-1 heading-detail">{step.label}</h4>
              <p className="text-sm text-text-light">{step.desc}</p>
              <p className="mt-1 text-sm text-text-muted">&rarr; {step.impact}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Cross-reference */}
      <div className="mb-8 text-sm text-text-muted">
        Wie diese Wirkung entsteht, beschreibt unsere{' '}
        <a href="/strategie" className="font-medium text-primary hover:underline">Theory of Change auf der Strategie-Seite</a>.
      </div>

      {/* Data source info */}
      <Card>
        <div className="text-sm text-text-light">
          <p className="heading-detail">Datenquellen</p>
          <p>Umweltwirkung: BAFU Ökobilanz-Studie | Finanzdaten: Kivitendo Buchhaltung</p>
          <p className="mt-1 text-sm text-text-muted">
            Quelldaten: 01_Management/B_Finanzen/revamp-Einnahmen-{selectedYear}.xlsx
          </p>
        </div>
      </Card>

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />

      <StoryBridge bridges={STORY_BRIDGES.wirkung} />
    </div>
  );
}
