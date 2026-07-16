import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';
import { computeFunnelStats } from '@/lib/domain/pipeline-stats';
import {
  PLATTFORM_META,
  PLATTFORM_HERO,
  PROBLEM,
  HOW_IT_WORKS,
  FUNNEL,
  FOR_WHOM,
  PRINCIPLES,
  SEE_IT,
  OUTLOOK,
} from './data';

export const metadata: Metadata = {
  title: PLATTFORM_META.title,
  description: PLATTFORM_META.description,
};

export default function PlattformPage() {
  // Live funnel numbers — computed from the generated data at build time,
  // never hand-typed (the page must stay true as the pipeline grows).
  const stats = computeFunnelStats();
  const actionable = stats.pCounts[1] + stats.pCounts[2] + stats.pCounts[3];

  const funnelStats = [
    { value: SWISS_FOUNDATIONS_DISPLAY, label: FUNNEL.labels.universe },
    { value: String(STIFTUNGEN_DATA.length), label: FUNNEL.labels.analyzed },
    { value: String(actionable), label: FUNNEL.labels.actionable },
    { value: String(stats.gesuchReady), label: FUNNEL.labels.gesuchReady },
  ];

  return (
    <>
      <PageHeader title={PLATTFORM_HERO.title} subtitle={PLATTFORM_HERO.lead} badge={PLATTFORM_HERO.overline} />
      <p className="-mt-6 mb-12 text-sm text-text-tertiary">{PLATTFORM_HERO.context}</p>

      {/* Das Problem */}
      <section className="mb-12">
        <h2 className="mb-2 heading-section">{PROBLEM.heading}</h2>
        <p className="mb-6 text-text-secondary">{PROBLEM.lead}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PROBLEM.sides.map((side) => (
            <Card key={side.title}>
              <h3 className="mb-3 heading-card">{side.title}</h3>
              <ul className="space-y-2">
                {side.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-text-muted" aria-hidden="true">—</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="mb-12">
        <h2 className="mb-2 heading-section">{HOW_IT_WORKS.heading}</h2>
        <p className="mb-6 text-text-secondary">{HOW_IT_WORKS.lead}</p>
        <ol className="space-y-4">
          {HOW_IT_WORKS.steps.map((step) => (
            <li key={step.title}>
              <Card>
                <h3 className="mb-1 heading-card">{step.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Live funnel */}
      <section className="mb-12">
        <h2 className="mb-2 heading-section">{FUNNEL.heading}</h2>
        <p className="mb-6 text-text-secondary">{FUNNEL.lead}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {funnelStats.map((s) => (
            <Card key={s.label} className="text-center">
              <p className="heading-page text-primary-text">{s.value}</p>
              <p className="mt-1 text-sm text-text-muted">{s.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Für wen */}
      <section className="mb-12">
        <h2 className="mb-6 heading-section">{FOR_WHOM.heading}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FOR_WHOM.audiences.map((a) => (
            <Card key={a.title}>
              <h3 className="mb-2 heading-card">{a.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{a.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Prinzipien */}
      <section className="mb-12">
        <h2 className="mb-6 heading-section">{PRINCIPLES.heading}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRINCIPLES.items.map((p) => (
            <Card key={p.title}>
              <h3 className="mb-2 heading-card">{p.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{p.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Selbst ansehen */}
      <section className="mb-12">
        <h2 className="mb-2 heading-section">{SEE_IT.heading}</h2>
        <p className="mb-6 text-text-secondary">{SEE_IT.lead}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SEE_IT.links.map((l) => (
            <Link key={l.href} href={l.href} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <h3 className="mb-2 heading-card group-hover:text-primary-text">{l.title} →</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{l.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Ausblick */}
      <section className="mb-12">
        <Card>
          <h2 className="mb-2 heading-card">{OUTLOOK.heading}</h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">{OUTLOOK.body}</p>
          {/* target="_self" routes mailto through the plain <a> branch of Button (not next/link) */}
          <Button href={`mailto:${OUTLOOK.cta.email}`} target="_self">{OUTLOOK.cta.label}</Button>
        </Card>
      </section>
    </>
  );
}
