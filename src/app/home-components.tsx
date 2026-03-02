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
  IMPACT_HEADING,
  IMPACT_METRICS,
  PILLARS_HEADING,
  PILLAR_BORDER_COLORS,
  GROWTH_HEADING,
  GROWTH_SUBHEADING,
  GROWTH_TRAJECTORIES,
  TRANSPARENCY,
  NAV_HEADING,
  NAV_CARDS,
} from './home-data';
import type { NumberConfidence } from '@/lib/config/numbers';

// -- Helpers -----------------------------------------------------------------

const CONFIDENCE_BADGE: Record<NumberConfidence, { color: string; label: string }> = {
  high: { color: 'green', label: 'Verifiziert' },
  medium: { color: 'blue', label: 'Dokumentiert' },
  estimated: { color: 'orange', label: 'Geschätzt' },
  target: { color: 'purple', label: 'Ziel' },
  unknown: { color: 'gray', label: 'Unbekannt' },
};

// -- Section 1: Hero ---------------------------------------------------------

export function HeroSection() {
  return (
    <section className="mb-12">
      <div className="gradient-hero-transparency rounded-2xl p-6 text-white md:p-12">
        <h1 className="text-3xl font-bold mb-2 md:text-5xl">{HERO.name}</h1>
        <p className="text-lg mb-2 md:text-2xl font-medium opacity-95">
          {HERO.subtitle}
        </p>
        <p className="text-base mb-1 opacity-80">{HERO.context}</p>
        <p className="text-sm mb-8 opacity-70">{HERO.platformNote}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HERO.metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-white/10 p-6 backdrop-blur">
              <div className="text-4xl font-bold mb-2">{m.value}</div>
              <div className="text-lg">{m.label}</div>
              <div className="text-sm opacity-80 mt-1">{m.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- Section 2: Impact -------------------------------------------------------

export function ImpactGrid() {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-grey-dark">{IMPACT_HEADING}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {IMPACT_METRICS.map((m) => {
          const badge = CONFIDENCE_BADGE[m.confidence];
          return (
            <Card key={m.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-grey-dark mb-1">
                {m.value}
              </div>
              <div className="text-sm font-medium text-text-light mb-2">{m.label}</div>
              <Badge color={badge.color} className="mb-1">{badge.label}</Badge>
              <div className="text-xs text-text-muted mt-1">{m.source}</div>
            </Card>
          );
        })}
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

// -- Section 4: Growth -------------------------------------------------------

export function GrowthVision() {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-grey-dark">{GROWTH_HEADING}</h2>
      <div className="rounded-xl border-2 border-dashed border-primary/40 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge color="blue">{GROWTH_SUBHEADING}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GROWTH_TRAJECTORIES.map((t) => (
            <div
              key={t.label}
              className="rounded-lg border border-border bg-white p-4 text-center"
            >
              <div className="text-xl mb-1" aria-hidden="true">{t.icon}</div>
              <div className="text-xs font-medium text-text-muted mb-2">{t.label}</div>
              <div className="text-sm text-text-light">{t.current}</div>
              <div className="text-primary font-bold my-1">→</div>
              <div className="text-lg font-bold text-grey-dark">{t.target}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button href="/revamp-2030" variant="secondary" size="sm">
            Vision 2030 ansehen →
          </Button>
        </div>
      </div>
    </section>
  );
}

// -- Section 5: Transparency -------------------------------------------------

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
              <span aria-hidden="true">✓</span> {point}
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}

// -- Section 6: Navigation ---------------------------------------------------

export function NavCardGrid() {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-grey-dark">{NAV_HEADING}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="block group">
            <Card
              className={`border-l-4 ${card.borderColor} hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl" aria-hidden="true">{card.icon}</div>
                  <div>
                    <h3 className={`text-lg font-semibold text-grey-dark ${card.hoverColor}`}>
                      {card.title}
                    </h3>
                    <Badge color={card.badgeColor}>{card.badge}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">{card.description}</p>
              <div className={`text-xs font-semibold ${card.hoverColor}`}>
                → {card.linkLabel}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
