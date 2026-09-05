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
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import ContentNotPublished from '@/components/layout/ContentNotPublished';

export const metadata: Metadata = {
  title: 'Methodik & Datenquellen',
  description: 'Vollständige Transparenz über alle Berechnungen und Annahmen',
};

export default async function MethodikPage() {
  const tenant = await getTenant();

  // Partial, not all-or-nothing. The transparency PRINCIPLES and the
  // integrity mechanism are the product and belong to everyone. What each
  // section below documents — this organisation's accounting export, its
  // device-price assumption, its pricing decisions, its data gaps — is one
  // organisation's, and described somebody else's method to every reader.
  const ownsMethod = await ownsCodeContent('methodik');
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

      <p className="mb-8 text-sm text-text-secondary">
        Jede Zahl im Dashboard ist hier erklärt und nachvollziehbar dokumentiert.
      </p>

      {/* Datentypen-Legende */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Datentypen</h2>
        <Card>
          <MetricGrid columns={3}>
            {DATA_TYPES.map((dt) => (
              <div key={dt.label} className="text-center">
                <Badge variant={dt.badgeVariant} className="text-sm">
                  {dt.label}
                </Badge>
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
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-surface-raised p-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`min-w-[80px] rounded-lg p-3 text-center text-sm ${
                    step.highlight ? 'bg-primary font-semibold text-white' : 'bg-surface-base'
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
            Quelldatei:{' '}
            <code className="rounded bg-surface-raised px-1">revamp-Einnahmen-2025.xlsx</code> |
            Dokumentation:{' '}
            <code className="rounded bg-surface-raised px-1">DATA_ARCHITECTURE.md</code>
            {tenant.cloudUrl && (
              <>
                {' '}
                im{' '}
                <a
                  href={tenant.cloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Nextcloud
                </a>
              </>
            )}
          </p>
        </Card>
      </section>

      {/* Inhaltsverzeichnis — every entry points at an org-specific section */}
      {ownsMethod && (
        <section className="mb-8">
          <h2 className="mb-4 heading-subsection">Inhaltsverzeichnis</h2>
          <Card>
            <nav aria-label="Inhaltsverzeichnis">
              <ul className="divide-y divide-border">
                {(ownsMethod ? TOC_ITEMS : []).map((item) => (
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
      )}

      {/* Methodology sections — each documents how ONE organisation's numbers
          are produced. `SelfFinancingSection` is the exception: a
          self-financing ratio is defined the same way for anybody. */}
      <div className="space-y-8">
        {ownsMethod ? (
          <>
            <IncomeDataSection />
            <SelfFinancingSection />
            <DeviceEstimationSection />
            <CO2CalculationSection />
            <EWasteSection />
            <PricingModelSection />
            <DataGapsSection />
            <IntegrityReportSection NumberSources={NumberSources} />
          </>
        ) : (
          <ContentNotPublished
            page="Methodik"
            tenantName={tenant.name}
            describes="Hier erscheint die Herleitung jeder Zahl — Datenquellen, Formeln und Annahmen —, sobald die Organisation ihre Kennzahlen dokumentiert hat."
          />
        )}
      </div>

      <TransparencyPrinciplesSection />

      <StoryBridge bridges={STORY_BRIDGES.methodik} />
    </>
  );
}
