'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import { STATUS_LABELS, STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { formatNumber } from '@/lib/utils/format';
import { computeTierCounts, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/domain/foundation-helpers';
import { CORE_FACTS } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import type { FoundationStatus } from '@/lib/schemas/foundation';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import {
  computePipelineStats,
  STATUS_BADGE_VARIANT,
  HERO_STATS,
  RESOURCES,
  NEXT_STEPS,
  TRACK_RECORD,
  SPACE_TOTAL_WITH_CIRCULATION,
  PROJECT_YEAR_RANGE,
} from './data';

// Extracted sections
import Inspectable from './sections/Inspectable';
import WhyWeNeedFunding from './sections/WhyWeNeedFunding';
import TwoAsks from './sections/TwoAsks';
import ThreeYearModel from './sections/ThreeYearModel';
import BudgetDetail from './sections/BudgetDetail';
import RevenueStreamsSection from './sections/RevenueStreams';
import FinancialSituation from './sections/FinancialSituation';
import SpaceConcept from './sections/SpaceConcept';
import CostStructure from './sections/CostStructure';

export default function FundraisingClient() {
  const stats = computePipelineStats();
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);
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
        <Link
          href="/fundraising/stiftungen"
          className="flex items-center justify-between rounded-xl border-2 border-border bg-bg-light px-5 py-4 font-semibold text-grey-dark transition-colors hover:bg-grey-light"
        >
          <span>Stiftungen durchsuchen</span>
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/fundraising/applications"
          className="flex items-center justify-between rounded-xl border-2 border-border bg-bg-light px-5 py-4 font-semibold text-grey-dark transition-colors hover:bg-grey-light"
        >
          <span>Pipeline öffnen</span>
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/fundraising/dashboard"
          className="flex items-center justify-between rounded-xl border-2 border-border bg-bg-light px-5 py-4 font-semibold text-grey-dark transition-colors hover:bg-grey-light"
        >
          <span>Dashboard</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* THE STORY */}
      <WhyWeNeedFunding />

      {/* HUB + MENSCHEN */}
      <TwoAsks />

      {/* VISION HERO */}
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
          <Link href="/strategie#community-tech-space" className="text-sm font-medium text-chart-6 hover:underline">
            Vollständige Vision & Strategie &rarr;
          </Link>
        </div>
      </section>

      {/* Track Record */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-grey-dark">Leistungsausweis (verifiziert)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { value: `${TRACK_RECORD.yearsActive}+`, label: 'Jahre aktiv', sub: `Seit ${CORE_FACTS.organization.founded}` },
            { value: formatNumber(TRACK_RECORD.totalCustomers), label: 'Kunden', sub: 'im Kivitendo ERP' },
            { value: formatNumber(TRACK_RECORD.totalInvoices), label: 'Rechnungen', sub: `seit ${ORG_PROFILE.milestones.kivitendoStart}` },
            { value: formatNumber(TRACK_RECORD.productsInCatalog), label: 'Produkte', sub: 'im Katalog' },
            { value: formatNumber(TRACK_RECORD.deliveryNotes), label: 'Lieferungen', sub: 'ausgeführt' },
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
              className="block rounded-xl border border-border bg-white p-3 text-center transition-shadow hover:shadow-sm"
            >
              <div className="text-xl font-bold tabular-nums text-grey-dark">{item.value}</div>
              <div className="text-sm font-medium text-text-muted">{item.label}</div>
              <div className="text-sm text-text-muted">{item.sub}</div>
            </Inspectable>
          ))}
        </div>
        <p className="mt-2 text-right text-sm text-text-muted">Quelle: {TRACK_RECORD.source}</p>
      </section>

      {/* Pipeline Metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label={TIER_LABELS.anwendungsbereit}
          value={formatNumber(tierCounts.anwendungsbereit)}
          subtitle={TIER_DESCRIPTIONS.anwendungsbereit}
          sourceType="live"
        />
        <MetricCard
          label={`${TIER_LABELS.recherchiert}+`}
          value={formatNumber(tierCounts.anwendungsbereit + tierCounts.recherchiert)}
          subtitle={TIER_DESCRIPTIONS.recherchiert}
          sourceType="derived"
        />
        <MetricCard
          label="Im Verzeichnis"
          value={formatNumber(stats.total)}
          subtitle="Schweizer Stiftungen erfasst"
          sourceType="live"
        />
        <MetricCard
          label="Hoher Fit (3/3)"
          value={String(stats.highFitCount)}
          subtitle="Beste Übereinstimmung"
          sourceType="derived"
        />
      </MetricGrid>

      {/* Financial Situation */}
      <FinancialSituation inspector={inspector} />

      {/* Business Model Challenge */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Geschäftsmodell-Herausforderung</h2>
        <Card>
          <div className="prose prose-sm max-w-none">
            <p className="text-grey-dark leading-relaxed">
              <strong>Unsere aktuelle Situation:</strong> Wir haben 2 grosse Kivitendo-Kunden verloren. Das hat
              unsere B2B-Einnahmen stark reduziert.
            </p>

            <div className="bg-warning/10 border-l-4 border-warning p-4 my-4">
              <p className="text-warning font-semibold mb-2">Warum wir nicht einfach &bdquo;mehr verkaufen&ldquo; können:</p>
              <ul className="text-warning space-y-2 mb-0">
                <li>Unser Kivitendo-System braucht dringend eine Überarbeitung — aber uns fehlen die Ressourcen</li>
                <li>Web-Design-Praxis ist aus demselben Grund nicht funktionsfähig</li>
                <li>Problem ist nicht fehlende Geräte, sondern fehlende Organisation für Verkauf & Ausführung</li>
                <li>Wir haben bereits zu viel Inventar in 2 Lagern — mehr Geräte helfen nicht</li>
              </ul>
            </div>

            <p className="text-grey-dark leading-relaxed">
              <strong>Was wir brauchen:</strong> Nicht mehr Verkauf, sondern <strong>bessere Prozesse</strong> und
              <strong> diversifizierte Einnahmen</strong> (Tech-Bildung, Workshops, AI Lab Services, Corporate Training,
              Community Events).
            </p>

            <p className="text-grey-dark leading-relaxed mb-0">
              Detaillierte Finanzdaten sind verfügbar im{' '}
              <Link href="/finanzen" className="underline">Finanzen-Bereich</Link> — alle Zahlen aus Kivitendo,
              klickbar mit Quellenangabe.
            </p>
          </div>
        </Card>
      </section>

      {/* Cost Structure 2023 */}
      <CostStructure />

      {/* 3-YEAR MODEL */}
      <ThreeYearModel inspector={inspector} />

      {/* SPACE PLAN */}
      <SpaceConcept />

      {/* BUDGET MODULES */}
      <BudgetDetail inspector={inspector} />

      {/* REVENUE & SUSTAINABILITY */}
      <RevenueStreamsSection inspector={inspector} />

      {/* PIPELINE */}
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
                className="block rounded-lg bg-bg-light p-4 text-center transition-shadow hover:shadow-md"
              >
                <Badge variant={STATUS_BADGE_VARIANT[status]} className="mb-2">
                  {STATUS_LABELS[status].text}
                </Badge>
                <div className="text-2xl font-bold text-grey-dark">{count}</div>
                <div className="text-sm text-text-muted">{STATUS_LABELS[status].desc}</div>
              </Link>
            )
          )}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/fundraising/stiftungen"
            className="inline-flex items-center gap-2 rounded-lg bg-grey-dark px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-grey-dark/85"
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
            <Link
              key={resource.href}
              href={resource.href}
              className="block"
              {...(resource.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
                <div className="flex-1">
                  <strong className="block text-sm">{resource.label}</strong>
                  <span className="text-sm text-text-muted">{resource.description}</span>
                </div>
                <span className="text-primary" aria-hidden="true">
                  {resource.external ? '↓' : '→'}
                </span>
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
            <div key={step.step} className="rounded-lg border border-border p-4">
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
