/**
 * Homepage section components — server components (no 'use client')
 *
 * All data from home-data.ts; all styling via design tokens.
 */

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import {
  HERO,
  GUIDE_HEADING,
  GUIDE_SECTIONS,
  PILLARS_HEADING,
  TRANSPARENCY,
} from './home-data';

/** Border color map — full literal strings for Tailwind JIT scanner */
const PILLAR_BORDER_COLORS: Record<string, string> = {
  nachhaltigkeit: 'border-l-theme-klima',
  'soziale-integration': 'border-l-theme-sozial',
  'digitale-bildung': 'border-l-theme-bildung',
  'digitale-souveraenitaet': 'border-l-theme-digital',
};

// -- Section 1: Hero ---------------------------------------------------------

export function HeroSection() {
  return (
    <section className="mb-12">
      <div className="gradient-hero-transparency rounded-2xl p-6 text-white md:p-12">
        <h1 className="text-3xl font-bold mb-3 md:text-5xl">{HERO.name}</h1>
        <p className="text-lg mb-4 md:text-xl leading-relaxed opacity-95 max-w-2xl">
          {HERO.story}
        </p>
        <p className="text-base mb-1 opacity-80">{HERO.context}</p>
        <p className="text-sm mb-8 opacity-70">{HERO.platformNote}</p>

        <div className="flex flex-wrap gap-3">
          {HERO.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                cta.variant === 'primary'
                  ? 'bg-white text-grey-dark hover:bg-white/90'
                  : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
              }`}
            >
              {cta.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- Section 2: Platform guide -----------------------------------------------

export function PlatformGuide() {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-grey-dark">{GUIDE_HEADING}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUIDE_SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="group block">
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0" aria-hidden="true">
                  {s.icon}
                </div>
                <div>
                  <div className="font-semibold text-grey-dark group-hover:text-primary mb-1">
                    {s.title}
                  </div>
                  <p className="text-sm text-text-light">{s.description}</p>
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
      <h2 className="text-3xl font-bold mb-6 text-grey-dark">{PILLARS_HEADING}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SCHWERPUNKT_IDS.map((id) => {
          const s = SCHWERPUNKTE[id];
          const border = PILLAR_BORDER_COLORS[id] ?? 'border-l-grey-medium';
          return (
            <Card key={id} className={`border-l-4 ${border}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0" aria-hidden="true">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark mb-1">{s.label}</h3>
                  <p className="text-sm text-text-light mb-2">{s.description}</p>
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
        <h2 className="text-xl font-bold text-grey-dark mb-2">{TRANSPARENCY.heading}</h2>
        <p className="text-base text-text-light mb-4">{TRANSPARENCY.lead}</p>
        <div className="flex flex-wrap gap-3">
          {TRANSPARENCY.points.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <span aria-hidden="true">&#x2713;</span> {point}
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}
