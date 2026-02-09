'use client';

import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { formatCHF, formatNumber } from '@/lib/utils/format';
import { estimateDeviceCount, estimateCO2Avoided, estimateEWastePrevented } from '@/lib/domain/calculations';
import { ToCColumn, ImpactStoryCards } from './components';

export default function WirkungPage() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    totals,
  } = useFinancialData(2025);

  const inspector = useNumberInspector();

  // Impact calculations from financial data
  const deviceCount = estimateDeviceCount(totals.warenverkauf);
  const co2Avoided = estimateCO2Avoided(deviceCount);
  const eWaste = estimateEWastePrevented(deviceCount, 5); // 5 kg avg weight
  const lifeYears = deviceCount * 4; // 4 years extended life per device

  // CO2 equivalents for context
  const carsKm = Math.round((co2Avoided * 1000) / 0.2); // ~200g CO2 per km
  const flightsZurichBerlin = Math.round((co2Avoided * 1000) / 1500); // ~1500kg per flight

  return (
    <div>
      <PageHeader
        title={`Unsere Wirkung ${selectedYear}`}
        subtitle="Jedes Gerät, das wir retten, vermeidet Elektroschrott und schenkt neues digitales Leben."
      />

      {/* Year selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-text-muted">Jahr:</span>
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedYear === year
                ? 'bg-primary text-white'
                : 'bg-grey-light text-grey-dark hover:bg-border'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Transparency note */}
      <div className="mb-6 rounded-lg border-l-4 border-l-warning bg-warning-bg/30 p-4 text-sm text-text-light">
        <strong className="text-grey-dark">Transparenz:</strong> Die meisten Wirkungszahlen sind{' '}
        <Badge variant="estimated">Schätzungen</Badge>{' '}
        basierend auf Finanzdaten. Wir zeigen offen, was wir wissen und was wir schätzen.
      </div>

      {/* Hero impact metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Geräte gerettet"
          value={`~${formatNumber(deviceCount)}`}
          subtitle={`Basis: ${formatCHF(totals.warenverkauf)} Warenverkauf`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'Geschätzte Geräteanzahl',
              value: `~${formatNumber(deviceCount)}`,
              sourceType: 'estimated',
              source: `Berechnet aus Warenverkauf ${selectedYear}`,
              formula: `${formatCHF(totals.warenverkauf)} / CHF 150 pro Gerät`,
              confidence: 'Niedrig',
              description:
                'Schätzung basierend auf Warenverkauf-Einnahmen. Exakte Stückzahlen werden nicht in Kivitendo erfasst. Durchschnittspreis CHF 150 ist eine Annahme.',
            })
          }
        />
        <MetricCard
          label="CO₂ vermieden"
          value={`~${co2Avoided} t`}
          subtitle="300 kg CO₂ pro Gerät"
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'CO₂ vermieden',
              value: `~${co2Avoided} Tonnen`,
              sourceType: 'estimated',
              source: 'BAFU Lifecycle Assessment',
              formula: `${formatNumber(deviceCount)} Geräte × 300 kg CO₂ / 1000`,
              confidence: 'Mittel',
              description:
                'Basiert auf BAFU-Ökobilanz für Elektronikgeräte. Laptop-Neuproduktion: ~300 kg CO₂, Refurbishment: ~15 kg CO₂. Einsparung: ~285 kg pro Gerät.',
            })
          }
        />
        <MetricCard
          label="E-Waste vermieden"
          value={`~${formatNumber(eWaste)} kg`}
          subtitle="~5 kg pro Gerät"
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'E-Waste vermieden',
              value: `~${formatNumber(eWaste)} kg`,
              sourceType: 'estimated',
              source: 'Berechnet aus Geräteanzahl',
              formula: `${formatNumber(deviceCount)} Geräte × 5 kg`,
              confidence: 'Niedrig',
              description:
                'Geschätztes Gewicht der vermiedenen Elektroschrott-Entsorgung. Durchschnittliches Gerätegewicht: 5 kg (variiert stark: Laptop ~2 kg, Desktop ~10 kg).',
            })
          }
        />
        <MetricCard
          label="Lebensjahre verlängert"
          value={`~${formatNumber(lifeYears)} J.`}
          subtitle="~4 Jahre pro Gerät"
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'Lebensjahre verlängert',
              value: `~${formatNumber(lifeYears)} Jahre`,
              sourceType: 'estimated',
              source: 'Berechnet aus Geräteanzahl',
              formula: `${formatNumber(deviceCount)} Geräte × 4 Jahre`,
              confidence: 'Niedrig',
              description:
                'Geschätzte Lebensdauerverlängerung durch Refurbishment. Annahme: 4 zusätzliche Nutzungsjahre pro Gerät.',
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

      {/* Theory of Change */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Theory of Change</CardTitle>
          <p className="text-sm text-text-muted">Von den Inputs bis zum Impact — so entsteht unsere Wirkung.</p>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-4">
          <ToCColumn
            title="Inputs"
            color="bg-blue-50 border-blue-300"
            titleColor="text-primary"
            items={[
              { label: 'Gebrauchte Hardware', status: 'missing' },
              { label: 'Freiwillige Arbeit', status: 'missing' },
              { label: 'Open-Source-Software', status: 'measured' },
              { label: 'Spenden', status: 'measured' },
            ]}
          />
          <ToCColumn
            title="Aktivitäten"
            color="bg-yellow-50 border-yellow-300"
            titleColor="text-yellow-600"
            items={[
              { label: 'Refurbishment', status: 'missing' },
              { label: 'Linux-Installation', status: 'missing' },
              { label: 'Workshops', status: 'missing' },
              { label: 'Beratung', status: 'missing' },
            ]}
          />
          <ToCColumn
            title="Outputs"
            color="bg-amber-50 border-amber-300"
            titleColor="text-amber-600"
            items={[
              { label: 'Verkaufte Geräte', status: 'estimated' },
              { label: 'Einnahmen', status: 'measured' },
              { label: 'Kursteilnehmer', status: 'missing' },
              { label: 'Integration', status: 'missing' },
            ]}
          />
          <ToCColumn
            title="Impact"
            color="bg-emerald-50 border-emerald-300"
            titleColor="text-success"
            items={[
              { label: 'CO₂ vermieden', status: 'estimated' },
              { label: 'E-Waste reduziert', status: 'estimated' },
              { label: 'Digitale Teilhabe', status: 'missing' },
              { label: 'Kompetenzen', status: 'missing' },
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" /> Gemessen
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" /> Geschätzt
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" /> Nicht erfasst
          </span>
        </div>
      </Card>

      {/* Data coverage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Datenabdeckung</CardTitle>
          <p className="text-sm text-text-muted">Wie viel unserer Wirkung können wir messen?</p>
        </CardHeader>
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-gradient-to-r from-warning to-amber-400" style={{ width: '25%' }} />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
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
          {[
            { icon: '📦', title: 'Gerätezahlen', desc: 'Exakte Stückzahlen statt Schätzungen aus Umsatz' },
            { icon: '👥', title: 'Teilnehmende', desc: 'Workshop- und Praktikums-Tracking' },
            { icon: '🐧', title: 'Linux-Quote', desc: 'Anteil Open-Source-Installationen' },
            { icon: '⏱️', title: 'Freiwilligenstunden', desc: 'Zeiterfassung für ehrenamtliche Arbeit' },
          ].map((gap) => (
            <div key={gap.title} className="rounded-lg bg-white p-3 text-center">
              <div className="mb-1 text-2xl opacity-50">{gap.icon}</div>
              <p className="text-sm font-semibold">{gap.title}</p>
              <p className="text-xs text-text-muted">{gap.desc}</p>
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
          {[
            { priority: 'high', label: 'Device-Tracking aktivieren', desc: 'Stückzahlen erfassen statt aus Umsatz schätzen', impact: 'Verbessert 8 KPIs' },
            { priority: 'high', label: 'Integration-Tracking starten', desc: 'Praktikant:innen und Erfolge dokumentieren', impact: 'Verbessert 4 KPIs (Kernmission!)' },
            { priority: 'medium', label: 'Workshop-Tracking einführen', desc: 'Teilnehmerzahlen und Feedback erfassen', impact: 'Verbessert 3 KPIs' },
            { priority: 'low', label: 'Freiwilligen-Zeiterfassung', desc: 'Optionale Stundenerfassung für Ehrenamtliche', impact: 'Verbessert Transparenz' },
          ].map((step) => (
            <div
              key={step.label}
              className={`rounded-lg border p-4 ${
                step.priority === 'high'
                  ? 'border-l-4 border-l-danger'
                  : step.priority === 'medium'
                    ? 'border-l-4 border-l-warning'
                    : 'border-l-4 border-l-gray-300'
              }`}
            >
              <h4 className="mb-1 text-sm font-semibold text-grey-dark">{step.label}</h4>
              <p className="text-xs text-text-light">{step.desc}</p>
              <p className="mt-1 text-xs text-text-muted">→ {step.impact}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data source info */}
      <Card>
        <div className="text-sm text-text-light">
          <p className="font-medium text-grey-dark">Datenquellen</p>
          <p>Umweltwirkung: BAFU Ökobilanz-Studie | Finanzdaten: Kivitendo Buchhaltung</p>
          <p className="mt-1 text-xs text-text-muted">
            Quelldaten: 01_Management/B_Finanzen/revamp-Einnahmen-{selectedYear}.xlsx
          </p>
        </div>
      </Card>

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
    </div>
  );
}
