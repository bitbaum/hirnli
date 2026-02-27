'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import { STATUS_LABELS, STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { computeTierCounts, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/domain/foundation-helpers';
import { CORE_FACTS } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import type { FoundationStatus } from '@/lib/schemas/foundation';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import { formatCHF } from '@/lib/utils/format';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import type { InspectorData } from '@/lib/schemas/inspector';
import { TEAM_MEMBERS } from '@/app/team/data';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  PEOPLE_REACHED_DISPLAY,
  REVENUE_GROWTH_DISPLAY,
  REVENUE_PEAK_DISPLAY,
  REVENUE_PEAK_YEAR,
  REVENUE_CURRENT_DISPLAY,
} from '@/lib/config/projections';
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
  STIFTUNGEN_3Y_TOTAL,
  EIGEN_3Y_TOTAL,
  PROJECT_3Y_TOTAL,
  STIFTUNGEN_Y1,
  STIFTUNGEN_Y3,
  REDUCTION_PCT,
  FINANCIAL_CONTEXT,
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

function BudgetLineItemCard({ item, borderColor }: { item: BudgetLineItem; borderColor: string }) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-3">
        {item.icon && <span className="text-2xl" aria-hidden="true">{item.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-semibold text-grey-dark">{item.label}</h4>
            <span className="shrink-0 font-bold text-grey-dark">{formatCHF(item.amount)}</span>
          </div>
          <p className="mt-1 text-sm text-text-muted">{item.description}</p>
          {item.subItems && item.subItems.length > 0 && (
            <ul className="mt-3 space-y-1">
              {item.subItems.map((sub, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-text-muted">{sub.label}</span>
                  <span className="text-grey-dark">{formatCHF(sub.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

// -- Main client component ----------------------------------------------------

export default function FundraisingClient() {
  const stats = computePipelineStats();
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);
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

  const _inspectReduction: InspectorData = {
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

      {/* Quick actions — where a working fundraiser goes from here */}
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

      {/* ================================================================ */}
      {/* THE STORY — Why we need your help                                */}
      {/* ================================================================ */}
      <section className="mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-bold text-blue-900 mt-0">Die Situation: Warum wir Stiftungen brauchen</h2>

            <p className="text-gray-700 leading-relaxed">
              Seit 2003 reparieren und verkaufen wir refurbished Computer. <strong>Aber unser aktuelles Geschäftsmodell ist nicht nachhaltig.</strong>
            </p>

            <p className="text-gray-700 leading-relaxed">
              <strong>Die Herausforderung:</strong> Unsere Einnahmen sind von {REVENUE_PEAK_DISPLAY} ({REVENUE_PEAK_YEAR.year}) auf {REVENUE_CURRENT_DISPLAY} (2025) gefallen — B2B-Hosting-Kunden verloren,
              Dienstleistungen von CHF 80k auf CHF 28k geschrumpft. Das aktuelle Modell — abhängig von wenigen Einzelkunden — ist fragil.
            </p>

            <p className="text-gray-700 leading-relaxed">
              <strong>Das eigentliche Problem:</strong> Nicht fehlende Refurbishment-Kapazität, sondern <strong>fehlende Organisation
              für Verkauf und Ausführung</strong>. Wir haben bereits zu viel Inventar in 2 Lagern. Viele Organisationen in Zürich
              entsorgen alte Technologie — aber wir brauchen keine zusätzlichen Geräte, sondern bessere Prozesse.
            </p>

            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 my-4">
              <p className="text-amber-900 font-semibold mb-2">Das Problem in einem Satz:</p>
              <p className="text-amber-800 mb-0">
                Wir haben {TEAM_MEMBERS.length} Menschen im Team (Techniker, Betrieb, Leitung) — aber zu wenig bezahlte Kapazität und keine
                dedizierte Bildungsstruktur, um Prozesse zu professionalisieren und das volle Potenzial auszuschöpfen.
                <br /><span className="text-xs mt-1 block">Leitung: Andreas, Veronica (Sozialpädagogin), Dani. Technik & Betrieb: Freiwillige, Praktikanten, Reintegrations-Teilnehmer.</span>
              </p>
            </div>

            <h3 className="text-lg font-bold text-blue-900 mt-6">Die Lösung: Professionalisierung + Bildung + Community</h3>

            <p className="text-gray-700 leading-relaxed">
              Statt nur Refurbishment zu skalieren, wollen wir unser Modell <strong>transformieren</strong>:
            </p>

            <ul className="text-gray-700 space-y-2">
              <li>
                <strong>Professionelle Prozesse:</strong> 2 Bildungsprogrammleiter organisieren Refurbishment-Workflows,
                bilden Techniker aus (mit sozialpädagogischer Begleitung durch Veronica)
              </li>
              <li>
                <strong>Tech-Bildung & AI Lab:</strong> Nicht nur Geräte reparieren, sondern Menschen befähigen.
                AI-Souveränität durch eigene GPUs (gespendet oder gekauft — verschiedene Setups möglich, siehe Hub-Details)
              </li>
              <li>
                <strong>Community Hub:</strong> Ein Ort für Kreislaufwirtschaft, Makerspace, Tech-Kultur — wo Menschen
                nicht nur konsumieren, sondern lernen und gestalten
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed">
              <strong>Warum Stiftungen?</strong> Weil wir eine soziale Mission haben, keine Silicon-Valley-Startup-Mentalität.
              Wir arbeiten mit Reintegrations-Programmen (z.B. GEP), Freiwilligen, Praktikanten. Professionalisierung braucht
              Ressourcen — und die kommen nicht aus Verkaufserlösen allein.
            </p>

            <h3 className="text-lg font-bold text-blue-900 mt-6">Was wir von Stiftungen brauchen</h3>

            <p className="text-gray-700 leading-relaxed mb-0">
              Wir brauchen <strong>Anschubfinanzierung für 3 Jahre</strong>, um Hub + Team aufzubauen.
              Danach sind wir selbsttragend (Operations durch Revenue finanziert).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 not-prose">
              {THREE_YEAR_MODEL.map((year, i) => {
                const stiftungenAmt = year.stiftungen + year.einmalig;
                const stiftungenPct = Math.round((stiftungenAmt / year.total) * 100);
                const colors = [
                  { border: 'border-blue-200', text: 'text-blue-600', bold: 'text-blue-900' },
                  { border: 'border-violet-200', text: 'text-violet-600', bold: 'text-violet-900' },
                  { border: 'border-emerald-200', text: 'text-emerald-600', bold: 'text-emerald-900' },
                ];
                const labels = ['Aufbau: Hub-Einrichtung + Team-Rekrutierung', 'Wachstum: Revenue steigt, Stiftungen sinken', `Verselbständigung: Revenue ${formatCHF(REVENUE_YEAR3_TOTAL)}, Operations zunehmend selbsttragend`];
                return (
                  <div key={year.year} className={`bg-white rounded-lg p-4 border-2 ${colors[i].border}`}>
                    <div className={`text-sm ${colors[i].text} font-semibold`}>{year.year} ({2026 + i})</div>
                    <div className={`text-2xl font-bold ${colors[i].bold} my-2`}>{formatCHF(stiftungenAmt)}</div>
                    <div className="text-xs text-gray-600">{stiftungenPct}% von Stiftungen<br/>{labels[i]}</div>
                  </div>
                );
              })}
            </div>

            <p className="text-gray-700 leading-relaxed mt-4 mb-0">
              <strong>Degressives Modell:</strong> Je mehr wir wachsen, desto weniger Stiftungsgelder brauchen wir.
              Jahr 1 → Jahr 3: <strong>-{REDUCTION_PCT}% weniger Stiftungsgelder</strong>. Ab Jahr 4: Nur noch Impact-Finanzierung
              (kostenlose Geräte, Stipendien), keine Betriebskosten mehr.
            </p>
          </div>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* HUB + MENSCHEN — What we're fundraising for                      */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wir sammeln für 2 Dinge: Hub + Menschen</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Hub */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start gap-4">
              <span className="text-4xl" aria-hidden="true">🏢</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-grey-dark">1. Community Tech Hub (Raum)</h3>
                <p className="mt-2 text-sm text-text-light">
                  <strong>{HUB_SPACE_DISPLAY}:</strong> Werkstatt, AI Lab, Event Space, Shop, Offices — alles unter einem Dach
                </p>
                <p className="mt-2 text-sm text-text-light">
                  <strong>Ergebnis:</strong> Effizientere Prozesse, mehr parallele Arbeitsplätze, neue Einnahmequellen
                </p>
                <Link
                  href="/fundraising/hub"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  📊 Hub-Details & Budget ansehen →
                </Link>
              </div>
            </div>
          </Card>

          {/* Menschen */}
          <Card className="border-l-4 border-l-violet-500">
            <div className="flex items-start gap-4">
              <span className="text-4xl" aria-hidden="true">👥</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-grey-dark">2. Bildungsprogrammleiter (Team)</h3>
                <p className="mt-2 text-sm text-text-light">
                  <strong>2× neue Stellen:</strong> Hardware-BPL + Software/AI-BPL
                </p>
                <p className="mt-2 text-sm text-text-light">
                  <strong>Train-the-Trainer:</strong> Strukturierte Ausbildung statt informellem Wissenstransfer
                </p>
                <p className="mt-2 text-sm text-text-light">
                  <strong>Ergebnis:</strong> {PEOPLE_REACHED_DISPLAY} erreicht (Techniker + Entwickler + Workshop-Teilnehmer)
                </p>
                <Link
                  href="/fundraising/bildung"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
                >
                  📊 Bildung-Details & Multiplikationseffekt →
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Combined Effect */}
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 p-6 text-center">
          <div className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Kombinierter Effekt: Hub + Menschen
          </div>
          <div className="mt-2 text-lg text-gray-700">
            Bessere Prozesse + strukturierte Bildung + diversifizierte Einnahmen
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr + {PEOPLE_REACHED_DISPLAY} trainiert
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {REVENUE_GROWTH_DISPLAY}
          </div>
          <div className="mt-1 text-sm font-semibold text-violet-600">
            + {PEOPLE_REACHED_DISPLAY} in Tech-Bildung & Integration
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <Link
              href="/fundraising/hub"
              className="inline-flex items-center gap-2 rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-grey-dark/85"
            >
              <span>📖</span>
              <span>Detaillierte Hub-Planung ansehen</span>
              <span>→</span>
            </Link>
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
            { value: TRACK_RECORD.totalInvoices.toLocaleString('de-CH'), label: 'Rechnungen', sub: `seit ${ORG_PROFILE.milestones.kivitendoStart}` },
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

      {/* Pipeline Metrics — honest tiered numbers */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label={TIER_LABELS.anwendungsbereit}
          value={(tierCounts.anwendungsbereit).toLocaleString('de-CH')}
          subtitle={TIER_DESCRIPTIONS.anwendungsbereit}
          sourceType="live"
        />
        <MetricCard
          label={`${TIER_LABELS.recherchiert}+`}
          value={(tierCounts.anwendungsbereit + tierCounts.recherchiert).toLocaleString('de-CH')}
          subtitle={TIER_DESCRIPTIONS.recherchiert}
          sourceType="derived"
        />
        <MetricCard
          label="Im Verzeichnis"
          value={stats.total.toLocaleString('de-CH')}
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

      {/* Revenue & Business Model Challenge */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Geschäftsmodell-Herausforderung</h2>
        <Card>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              <strong>Unsere aktuelle Situation:</strong> Wir haben 2 grosse Kivitendo-Kunden verloren. Das hat
              unsere B2B-Einnahmen stark reduziert.
            </p>

            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 my-4">
              <p className="text-amber-900 font-semibold mb-2">Warum wir nicht einfach &bdquo;mehr verkaufen&ldquo; können:</p>
              <ul className="text-amber-800 space-y-2 mb-0">
                <li>Unser Kivitendo-System braucht dringend eine Überarbeitung — aber uns fehlen die Ressourcen</li>
                <li>Web-Design-Praxis ist aus demselben Grund nicht funktionsfähig</li>
                <li>Problem ist nicht fehlende Geräte, sondern fehlende Organisation für Verkauf & Ausführung</li>
                <li>Wir haben bereits zu viel Inventar in 2 Lagern — mehr Geräte helfen nicht</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              <strong>Was wir brauchen:</strong> Nicht mehr Verkauf, sondern <strong>bessere Prozesse</strong> und
              <strong> diversifizierte Einnahmen</strong> (Tech-Bildung, Workshops, AI Lab Services, Corporate Training,
              Community Events).
            </p>

            <p className="text-gray-700 leading-relaxed mb-0">
              Detaillierte Finanzdaten sind verfügbar im{' '}
              <Link href="/finanzen" className="underline">Finanzen-Bereich</Link> — alle Zahlen aus Kivitendo,
              klickbar mit Quellenangabe.
            </p>
          </div>
        </Card>
      </section>

      {/* Cost Structure 2023 — narrative explanation */}
      <section className="mb-8">
        <Card className="prose prose-sm max-w-none">
          <h2>Kostenstruktur 2023: Warum wir Verlust machen</h2>

          <p>
            2023 war das letzte vollständige Geschäftsjahr vor unserer aktuellen Krise.
            Einnahmen <strong>{formatCHF(COST_STRUCTURE_2023.totalRevenue)}</strong> vs. Ausgaben <strong>{formatCHF(COST_STRUCTURE_2023.totalExpenses)}</strong> ={' '}
            <span className="text-red-600 font-semibold">Verlust {formatCHF(COST_STRUCTURE_2023.result)}</span>.
          </p>

          <h3>Wohin geht das Geld?</h3>

          <p>
            <strong>Die grössten Kostentreiber 2023:</strong>
          </p>

          <ul>
            {COST_STRUCTURE_2023.categories.map((cat) => (
              <li key={cat.label}>
                <strong>{cat.label}:</strong> {formatCHF(cat.amount)} ({cat.pctOfExpenses}% der Ausgaben)
              </li>
            ))}
          </ul>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
            <p className="font-semibold text-red-800 mb-2">Das Problem:</p>
            <p className="text-red-700">
              Die Miete allein ({formatCHF(COST_STRUCTURE_2023.categories[0].amount)}) übersteigt unsere gesamten Einnahmen 2025 ({formatCHF(FINANCIAL_CONTEXT.total_2025)}).
              Die Ausgaben 2023 waren <strong>{Math.round((COST_STRUCTURE_2023.totalExpenses / COST_STRUCTURE_2023.totalRevenue) * 100)}% der Einnahmen</strong> — das ist nicht nachhaltig.
            </p>
          </div>

          <h3>Die Lösung: Hub + Menschen</h3>

          <p>
            Der Hub bringt Laden + Lager + Werkstatt unter ein Dach. Dadurch sparen wir Doppelmiete,
            gewinnen Effizienz, und schaffen Platz für neue Einnahmequellen (Workshops, Corporate Training, Events).
          </p>

          <p>
            <strong>Unser Ziel:</strong> Nicht mehr mit Defizit arbeiten, sondern durch Effizienzgewinn + neue Revenue-Streams
            einen nachhaltigen Betrieb aufbauen.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 not-prose">
            <strong>Datenquelle:</strong> {COST_STRUCTURE_2023.source}. Alle Zahlen verifiziert 11.02.2026.
          </div>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* 3-YEAR MODEL — The core story                                    */}
      {/* ================================================================ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">3-Jahres-Modell: Weg zur Selbständigkeit</h2>
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

                {/* Breakdown (no visual bar, just text) */}
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
                      Eigenleistung*
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
                    Eigenleistung*
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

        <p className="mt-3 text-xs text-text-muted italic">
          * Eigenleistung = bewertete Freiwilligenarbeit (Stunden × CHF 35/h, NGO-Standard), kein Cashflow.
          Jahr 3 setzt ~6.857 Freiwilligen-Stunden voraus (~3.4 Vollzeit-Äquivalente).
        </p>
      </section>

      {/* ================================================================ */}
      {/* SPACE PLAN — narrative explanation                              */}
      {/* ================================================================ */}
      <section className="mb-8">
        <Card className="prose prose-sm max-w-none">
          <h2>Raumkonzept: Von 250 m² auf {SPACE_TOTAL_WITH_CIRCULATION} m²</h2>

          <p>
            <strong>Heute haben wir:</strong> 250 m² verteilt auf zwei getrennte Standorte (Laden + Lager).
            Das ist ineffizient, teuer, und hemmt unser Wachstum.
          </p>

          <p>
            <strong>Der Hub bringt alles unter ein Dach:</strong> ~{SPACE_TOTAL_WITH_CIRCULATION} m² Gesamtfläche
            (inkl. Verkehrsfläche) mit {SPACE_PLAN_TOTAL} m² Nutzfläche für {SPACE_PLAN.length} Bereiche.
          </p>

          <h3>Die {SPACE_PLAN.length} Bereiche:</h3>

          <div className="space-y-3 not-prose">
            {SPACE_PLAN.map((space) => (
              <div key={space.area} className="border-l-4 border-blue-400 pl-4 py-2">
                <div className="flex items-baseline justify-between mb-1">
                  <strong className="text-base text-grey-dark">{space.area}</strong>
                  <span className="text-sm font-semibold text-grey-dark tabular-nums">{space.sqm} m²</span>
                </div>
                <p className="text-sm text-text-muted m-0">{space.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 my-4">
            <p className="font-semibold text-emerald-800 mb-2">Warum so viel Raum?</p>
            <p className="text-emerald-700">
              Unser Ziel ist <strong>{DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr bis Ende Jahr 3</strong> (von aktuell ~150/Jahr geschätzt).
              Dafür brauchen wir effizientere Infrastruktur und strukturierte Prozesse.
            </p>
            <p className="text-emerald-700 mt-2">
              Plus: Workshops, Trainings, Events, und Community-Treffpunkt generieren neue Einnahmequellen,
              die langfristig unsere Unabhängigkeit sichern.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            <strong>Gesamtfläche:</strong> {SPACE_PLAN_TOTAL} m² Nutzfläche + ~{SPACE_TOTAL_WITH_CIRCULATION - SPACE_PLAN_TOTAL} m² Verkehrsfläche (Flure, Treppen, Toiletten)
            = ~{SPACE_TOTAL_WITH_CIRCULATION} m² Total.
          </p>
        </Card>
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
            {BUDGET_EINMALIG.map((item) => (
              <BudgetLineItemCard key={item.id} item={item} borderColor="border-l-blue-500" />
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
            {BUDGET_JAEHRLICH.map((item) => (
              <BudgetLineItemCard key={item.id} item={item} borderColor="border-l-violet-500" />
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
                Davon {formatCHF(BUDGET_SUMMARY.eigenleistung)} Eigenleistung* ({BUDGET_SUMMARY.selfFinancingPct}%)
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

        {/* Revenue narrative */}
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-grey-dark mb-2">
            <strong>Aktuell:</strong> {formatCHF(REVENUE_CURRENT_TOTAL)}/Jahr
            (B2B Services + Geräteverkauf + Integration + Spenden)
          </p>
          <p className="text-base font-semibold text-emerald-700 mb-1">
            <strong>Ziel Jahr 3:</strong> {formatCHF(REVENUE_YEAR3_TOTAL)}/Jahr (Prognose)
            — das wäre +{Math.round(((REVENUE_YEAR3_TOTAL - REVENUE_CURRENT_TOTAL) / REVENUE_CURRENT_TOTAL) * 100)}% Wachstum
          </p>
          <p className="text-xs text-emerald-600">
            Durch neue Einnahmequellen (Workshops, Corporate Training, Events, erhöhter Geräteverkauf)
            decken wir immer mehr unserer laufenden Kosten selbst.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REVENUE_STREAMS.map((stream) => {
            const growth = stream.current > 0
              ? Math.round(((stream.year3 - stream.current) / stream.current) * 100)
              : null;
            const isNew = stream.current === 0;
            const _barWidth = Math.round((stream.year3 / REVENUE_YEAR3_TOTAL) * 100);
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
                    <div className="text-xs text-text-muted">Jahr 3 (Ziel)</div>
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
                {growth !== null && (
                  <div className="mt-2 text-xs font-medium text-emerald-600">
                    Wachstum: +{growth}%
                  </div>
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
