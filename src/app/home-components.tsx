/**
 * Homepage section components — server components (no 'use client')
 *
 * All data from home-data.ts; all styling via design tokens.
 */

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import {
  HERO,
  GUIDE_HEADING,
  GUIDE_SECTIONS,
  PILLARS_HEADING,
  TRANSPARENCY,
} from './home-data';


// -- Section 1: Hero ---------------------------------------------------------

export function HeroSection() {
  return (
    <section className="mb-12 border-b border-border-subtle pb-10">
      <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary-text">
        {HERO.platformNote}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3 md:text-5xl md:leading-tight">
        {HERO.name}
      </h1>
      <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-2">
        {HERO.story}
      </p>
      <p className="text-sm text-text-tertiary mb-6">{HERO.context}</p>

      <div className="flex flex-wrap gap-3">
        {HERO.ctas.map((cta) => (
          <Button
            key={cta.href}
            href={cta.href}
            variant={cta.variant === 'primary' ? 'primary' : 'secondary'}
          >
            {cta.label} →
          </Button>
        ))}
      </div>
    </section>
  );
}

// -- Section 2: Platform guide -----------------------------------------------

export function PlatformGuide() {
  return (
    <section className="mb-12">
      <h2 className="heading-page mb-6">{GUIDE_HEADING}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUIDE_SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="group block">
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0" aria-hidden="true">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="heading-item group-hover:text-primary">
                      {s.title}
                    </div>
                    <span className="text-text-tertiary group-hover:text-primary ml-2 flex-shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                  </div>
                  <p className="text-sm text-text-secondary">{s.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

// -- Section 3: Pillars ------------------------------------------------------

export function PillarGrid() {
  return (
    <section className="mb-12">
      <h2 className="heading-page mb-6">{PILLARS_HEADING}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SCHWERPUNKT_IDS.map((id) => {
          const s = SCHWERPUNKTE[id];
          const border = s.borderClass ?? 'border-l-grey-medium';
          return (
            <Card key={id} className={`border-l-4 ${border}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0" aria-hidden="true">
                  {s.icon}
                </div>
                <div>
                  <h3 className="heading-card mb-1">{s.label}</h3>
                  <p className="text-sm text-text-secondary mb-2">{s.description}</p>
                  <Badge color="gray">{s.pillar}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// -- Section 4: Transparency -------------------------------------------------

export function TransparencyBlock() {
  return (
    <section className="mb-12">
      <Card className="border-l-4 border-l-primary">
        <h2 className="heading-subsection mb-2">{TRANSPARENCY.heading}</h2>
        <p className="text-base text-text-secondary mb-4">{TRANSPARENCY.lead}</p>
        <div className="flex flex-wrap gap-3">
          {TRANSPARENCY.points.map((point) => (
            <Badge key={point} variant="primary" className="gap-1.5 px-3 py-1 text-sm">
              <span aria-hidden="true">&#x2713;</span> {point}
            </Badge>
          ))}
        </div>
      </Card>
    </section>
  );
}
