import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricGrid from '@/components/metrics/MetricGrid';
import { DATA_TYPES, PIPELINE_STEPS, TOC_ITEMS } from './data';
import {
  IncomeDataSection,
  SelfFinancingSection,
  DeviceEstimationSection,
  CO2CalculationSection,
  EWasteSection,
  PricingModelSection,
  DataGapsSection,
  IntegrityReportSection,
  TransparencyPrinciplesSection,
} from './components';
import { NumberSources } from '@/lib/config/metrics';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { ORG_PROFILE } from '@/lib/config/org-profile';

export const metadata: Metadata = {
  title: 'Methodik & Datenquellen',
  description: 'Vollständige Transparenz über alle Berechnungen und Annahmen',
};

export default function MethodikPage() {
  return (
    <>
      <PageHeader
        title="Methodik & Datenquellen"
        subtitle="Vollständige Transparenz über alle Berechnungen und Annahmen"
      />

      <WhyThisMatters
        purpose="Vollständige Transparenz: Jede Zahl, jede Berechnung, jede Annahme ist hier dokumentiert."
        connection="Diese Methodik erklärt, wie wir alle Zahlen in Finanzen, Wirkung und Operations berechnen."
      />

      <p className="mb-8 text-sm text-text-light">
        Jede Zahl im Dashboard ist hier erklärt und nachvollziehbar dokumentiert.
      </p>

      {/* Datentypen-Legende */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Datentypen</h2>
        <Card>
          <MetricGrid columns={3}>
            {DATA_TYPES.map((dt) => (
              <div key={dt.label} className="text-center">
                <Badge variant={dt.badgeVariant} className="text-sm">{dt.label}</Badge>
                <p className="mt-2 text-sm font-medium">{dt.confidence}</p>
                <p className="mt-1 text-sm text-text-muted">{dt.description}</p>
              </div>
            ))}
          </MetricGrid>
        </Card>
      </section>

      {/* Datenfluss */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Datenfluss</h2>
        <Card>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-bg-light p-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`min-w-[80px] rounded-lg p-3 text-center text-sm ${
                    step.highlight
                      ? 'bg-primary font-semibold text-white'
                      : 'bg-white'
                  }`}
                >
                  <span className="mb-1 block text-xs text-text-muted">{step.icon}</span>
                  {step.label}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className="text-lg text-text-muted">&rarr;</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-text-muted">
            Quelldatei: <code className="rounded bg-bg-light px-1">revamp-Einnahmen-2025.xlsx</code> |
            Dokumentation: <code className="rounded bg-bg-light px-1">DATA_ARCHITECTURE.md</code> im{' '}
            <a href={ORG_PROFILE.cloudUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Nextcloud
            </a>
          </p>
        </Card>
      </section>

      {/* Inhaltsverzeichnis */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Inhaltsverzeichnis</h2>
        <Card>
          <nav>
            <ul className="divide-y divide-border">
              {TOC_ITEMS.map((item) => (
                <li key={item.id} className="py-2">
                  <a href={`#${item.id}`} className="text-sm text-primary hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Card>
      </section>

      {/* Methodology sections */}
      <div className="space-y-8">
        <IncomeDataSection />
        <SelfFinancingSection />
        <DeviceEstimationSection />
        <CO2CalculationSection />
        <EWasteSection />
        <PricingModelSection />
        <DataGapsSection />
        <IntegrityReportSection NumberSources={NumberSources} />
      </div>

      <TransparencyPrinciplesSection />

      <StoryBridge bridges={STORY_BRIDGES.methodik} />
    </>
  );
}
