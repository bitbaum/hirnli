'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import NumberInspector from '@/components/metrics/NumberInspector';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { QUICK_ACTIONS, HERO_STATS, SPACE_TOTAL_WITH_CIRCULATION, PROJECT_YEAR_RANGE } from './data';
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

export default function FundraisingClient() {
  const inspector = useNumberInspector();

  const inspectSpace = NumberSources.space_total
    ? metricToInspectorData(NumberSources.space_total, `${SPACE_TOTAL_WITH_CIRCULATION} m²`)
    : { label: 'Gesamtfläche', value: `${SPACE_TOTAL_WITH_CIRCULATION} m²`, sourceType: 'derived' as const, source: 'SPACE_PLAN', confidence: 'Hoch' };

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
            className="flex items-center justify-between rounded-xl border-2 border-border bg-bg-light px-5 py-4 font-semibold text-grey-dark transition-colors hover:bg-grey-light"
          >
            <span>{label}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <WhyWeNeedFunding />
      <TwoAsks />

      {/* Vision Hero */}
      <section className="gradient-hero-fundraising mb-8 rounded-2xl p-4 text-white md:p-8">
        <h2 className="mb-2 text-xl font-bold md:text-2xl">Community Tech Hub {PROJECT_YEAR_RANGE}</h2>
        <p className="mb-2 text-lg italic opacity-90">
          &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
        </p>
        <p className="mb-4 opacity-95">
          Seit {ORG_PROFILE.founded} verbinden wir Kreislaufwirtschaft, Arbeitsintegration und Tech-Bildung unter
          einem Dach. Auf{' '}
          <Inspectable
            data={inspectSpace}
            inspector={inspector}
            className="underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid"
          >
            {SPACE_TOTAL_WITH_CIRCULATION} m²
          </Inspectable>
          {' '}bauen wir Werkstatt, Makerspace, AI Lab, Event-/Kulturraum
          und Museum — ein Ort für nachhaltige Technologie, souveräne KI und Community.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HERO_STATS.map((item) => (
            <div key={item.label} className="rounded-xl bg-white/15 p-4 text-center">
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm opacity-90">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/strategie#community-tech-space" className="text-sm font-medium text-chart-6 hover:underline">
            Vollständige Vision & Strategie &rarr;
          </Link>
        </div>
      </section>

      <TrackRecord inspector={inspector} />
      <PipelineMetrics />
      <FinancialSituation inspector={inspector} />
      <BusinessModelChallenge />
      <CostStructure />
      <ThreeYearModel inspector={inspector} />
      <SpaceConcept />
      <BudgetDetail inspector={inspector} />
      <RevenueStreamsSection inspector={inspector} />
      <PipelineStatus />
      <KeyResources />
      <NextSteps />

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
      <StoryBridge bridges={STORY_BRIDGES.fundraising} />
    </>
  );
}
