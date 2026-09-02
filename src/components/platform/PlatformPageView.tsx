/**
 * Platform product page — shared view for /plattform (de) and /en/platform (en).
 *
 * Mobile-first: every section is a single column by default and only becomes
 * a grid at md+. Touch targets ≥44px, no fixed widths, no horizontal scroll.
 * All copy comes from PLATFORM_CONTENT; funnel numbers are computed at build
 * time from the generated foundation data (never hand-typed).
 */

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Foundation } from '@/lib/schemas/foundation';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';
import { computeFunnelStats } from '@/lib/domain/pipeline-stats';
import {
  PLATFORM_CONTENT,
  PLATFORM_CONTACT_EMAIL,
  type PlatformLocale,
} from '@/lib/config/platform-content';
import { RoadmapTimeline } from './RoadmapTimeline';

function SectionHeading({ heading, lead }: { heading: string; lead?: string }) {
  return (
    <>
      <h2 className="mb-2 heading-section">{heading}</h2>
      {lead && <p className="mb-6 max-w-2xl text-text-secondary">{lead}</p>}
    </>
  );
}

export default function PlatformPageView({
  locale,
  foundations,
}: {
  locale: PlatformLocale;
  foundations: Foundation[];
}) {
  const c = PLATFORM_CONTENT[locale];
  const stats = computeFunnelStats(foundations);
  const actionable = stats.pCounts[1] + stats.pCounts[2] + stats.pCounts[3];

  const funnelStats = [
    { value: SWISS_FOUNDATIONS_DISPLAY, label: c.funnel.labels.universe },
    { value: String(foundations.length), label: c.funnel.labels.analyzed },
    { value: String(actionable), label: c.funnel.labels.actionable },
    { value: String(stats.gesuchReady), label: c.funnel.labels.gesuchReady },
  ];

  return (
    <>
      {/* Hero — YC style: overline, one big claim, one paragraph, two CTAs */}
      <section className="mb-14 border-b border-border-subtle pb-10 pt-2">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary-text">
          {c.hero.overline}
        </p>
        <h1 className="mb-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl md:leading-[1.1]">
          {c.hero.title}
        </h1>
        <p className="mb-3 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
          {c.hero.lead}
        </p>
        <p className="mb-6 text-sm text-text-tertiary">{c.hero.context}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {c.hero.ctas.map((cta, i) => (
            <Button key={cta.href} href={cta.href} variant={i === 0 ? 'primary' : 'secondary'}>
              {cta.label} →
            </Button>
          ))}
        </div>
      </section>

      {/* Problem — two honest sides */}
      <section className="mb-14">
        <SectionHeading heading={c.problem.heading} lead={c.problem.lead} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {c.problem.sides.map((side) => (
            <Card key={side.title}>
              <h3 className="mb-3 heading-card">{side.title}</h3>
              <ul className="space-y-2.5">
                {side.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                    <span className="mt-0.5 shrink-0 text-text-muted" aria-hidden="true">
                      —
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works — numbered vertical steps with connector line */}
      <section className="mb-14">
        <SectionHeading heading={c.how.heading} lead={c.how.lead} />
        <ol className="relative space-y-6 border-l border-border-default pl-6 md:pl-8">
          {c.how.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[37px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:-left-[46px] md:h-8 md:w-8 md:text-sm"
              >
                {i + 1}
              </span>
              <h3 className="mb-1 heading-card">{step.title}</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Live funnel — 2 cols on mobile, 4 on desktop */}
      <section className="mb-14">
        <SectionHeading heading={c.funnel.heading} lead={c.funnel.lead} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {funnelStats.map((s) => (
            <Card key={s.label} className="text-center">
              <p className="heading-page text-primary-text">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-text-muted md:text-sm">{s.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Market — sourced external numbers */}
      <section className="mb-14">
        <SectionHeading heading={c.market.heading} lead={c.market.lead} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {c.market.stats.map((s) => (
            <Card key={s.label} className="text-center">
              <p className="heading-page text-text-primary">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-text-muted md:text-sm">{s.label}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-tertiary">{c.market.source}</p>
      </section>

      {/* Audiences */}
      <section className="mb-14">
        <SectionHeading heading={c.audiences.heading} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {c.audiences.items.map((a) => (
            <Card key={a.title}>
              <h3 className="mb-2 heading-card">{a.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{a.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="mb-14">
        <SectionHeading heading={c.principles.heading} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {c.principles.items.map((p) => (
            <Card key={p.title}>
              <h3 className="mb-2 heading-card">{p.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{p.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap — the multi-tenant answer */}
      <section className="mb-14 scroll-mt-24" id="roadmap">
        <SectionHeading heading={c.roadmap.heading} lead={c.roadmap.lead} />
        <RoadmapTimeline roadmap={c.roadmap} />
        <p className="mt-4 text-xs text-text-tertiary">{c.roadmap.disclaimer}</p>
      </section>

      {/* Business model */}
      <section className="mb-14">
        <SectionHeading heading={c.businessModel.heading} />
        <Card>
          <ul className="space-y-2.5">
            {c.businessModel.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                <span className="mt-0.5 shrink-0 text-primary-text" aria-hidden="true">
                  →
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* See it yourself */}
      <section className="mb-14">
        <SectionHeading heading={c.seeIt.heading} lead={c.seeIt.lead} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {c.seeIt.links.map((l) => (
            <Link key={l.href} href={l.href} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <h3 className="mb-2 heading-card group-hover:text-primary-text">{l.title} →</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{l.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Outlook + contact */}
      <section className="mb-12">
        <Card>
          <h2 className="mb-2 heading-card">{c.outlook.heading}</h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-text-secondary">
            {c.outlook.body}
          </p>
          {/* target="_self" routes mailto through the plain <a> branch of Button (not next/link) */}
          <Button href={`mailto:${PLATFORM_CONTACT_EMAIL}`} target="_self">
            {c.outlook.ctaLabel}
          </Button>
        </Card>
      </section>
    </>
  );
}
