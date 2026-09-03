'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import NumberInspector from '@/components/metrics/NumberInspector';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import { useTenant } from '@/lib/tenant/TenantProvider';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import {
  QUICK_ACTIONS,
  HERO_STATS,
  SPACE_TOTAL_WITH_CIRCULATION,
  PROJECT_YEAR_RANGE,
} from './data';
import Inspectable from './sections/Inspectable';
import WhyWeNeedFunding from './sections/WhyWeNeedFunding';
import TwoAsks from './sections/TwoAsks';
import TrackRecord from './sections/TrackRecord';
import PipelineMetrics from './sections/PipelineMetrics';
import FinancialSituation from './sections/FinancialSituation';
import BusinessModelChallenge from './sections/BusinessModelChallenge';
import CostStructure from './sections/CostStructure';
import ThreeYearModel from './sections/ThreeYearModel';
import SpaceConcept from './sections/SpaceConcept';
import BudgetDetail from './sections/BudgetDetail';
import RevenueStreamsSection from './sections/RevenueStreams';
import PipelineStatus from './sections/PipelineStatus';
import KeyResources from './sections/KeyResources';
import NextSteps from './sections/NextSteps';
import type { Foundation } from '@/lib/schemas/foundation';

export default function FundraisingClient({ foundations }: { foundations: Foundation[] }) {
  const tenant = useTenant();
  const inspector = useNumberInspector();

  const inspectSpace = NumberSources.space_total
    ? metricToInspectorData(NumberSources.space_total, `${SPACE_TOTAL_WITH_CIRCULATION} m²`)
    : {
        label: 'Gesamtfläche',
        value: `${SPACE_TOTAL_WITH_CIRCULATION} m²`,
        sourceType: 'derived' as const,
        source: 'SPACE_PLAN',
        confidence: 'Hoch',
      };

  return (
    <>
      <PageHeader
        title={`Fundraising ${PROJECT_YEAR_RANGE}`}
        subtitle="3-Jahres-Plan: Was wir brauchen, warum, und wie wir unabhängig werden"
        badge="Fundraising"
      />

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-lg border border-border-default bg-surface-base px-5 py-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
          >
            <span>{label}</span>
            <span aria-hidden="true" className="text-text-tertiary">
              →
            </span>
          </Link>
        ))}
      </div>

      <WhyWeNeedFunding />
      <TwoAsks />

      {/* Vision Section */}
      <section className="mb-8">
        <Card variant="muted">
          <h2 className="mb-1 heading-subsection">Community Tech Hub {PROJECT_YEAR_RANGE}</h2>
          <p className="mb-3 text-base italic text-text-secondary">
            &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
          </p>
          <p className="mb-4 text-sm text-text-secondary">
            Seit {tenant.founded} verbinden wir Kreislaufwirtschaft, Arbeitsintegration und
            Tech-Bildung unter einem Dach. Auf{' '}
            <Inspectable
              data={inspectSpace}
              inspector={inspector}
              className="underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid"
            >
              {SPACE_TOTAL_WITH_CIRCULATION} m²
            </Inspectable>{' '}
            bauen wir Werkstatt, Makerspace, AI Lab, Event-/Kulturraum und Museum — ein Ort für
            nachhaltige Technologie, souveräne KI und Community.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {HERO_STATS.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border-subtle bg-surface-base p-4 text-center"
              >
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="heading-section mt-1">{item.value}</div>
                <div className="text-xs text-text-secondary mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/strategie#community-tech-space"
              className="text-sm font-medium text-primary hover:underline"
            >
              Vollständige Vision & Strategie →
            </Link>
          </div>
        </Card>
      </section>

      <TrackRecord inspector={inspector} />
      <PipelineMetrics foundations={foundations} />
      <FinancialSituation inspector={inspector} />
      <BusinessModelChallenge />
      <CostStructure />
      <ThreeYearModel inspector={inspector} />
      <SpaceConcept />
      <BudgetDetail inspector={inspector} />
      <RevenueStreamsSection inspector={inspector} />
      <PipelineStatus foundations={foundations} />
      <KeyResources foundationCount={foundations.length} />
      <NextSteps />

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
      <StoryBridge bridges={STORY_BRIDGES.fundraising} />
    </>
  );
}
