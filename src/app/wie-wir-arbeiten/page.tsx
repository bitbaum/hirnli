import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { CASCADE_MODELS, CASCADE_TIERS } from '@/lib/config/value-cascade';
import {
  PAGE_TITLE,
  PAGE_SUBTITLE,
  WHY_THIS_MATTERS,
  CASCADE_METRICS,
} from './data';
import { CascadeDiagram, TierDetailCard, FutureVisionBlock } from './components';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_SUBTITLE,
};

export default function WieWirArbeitenPage() {
  return (
    <>
      <PageHeader title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />

      <WhyThisMatters
        purpose={WHY_THIS_MATTERS.purpose}
        connection={WHY_THIS_MATTERS.connection}
      />

      {/* Key metrics */}
      <section className="mb-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CASCADE_METRICS.map((m) => (
            <Card key={m.label} className="text-center">
              <p className="text-2xl font-bold text-primary md:text-3xl">
                {m.value}
              </p>
              <p className="text-sm font-semibold text-grey-dark">{m.label}</p>
              <p className="mt-1 text-xs text-text-muted">{m.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Block 1: Unsere Methode (current 3-tier cascade) */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-bold text-grey-dark">
          Unsere Methode
        </h2>
        <p className="mb-6 text-base text-text-light">
          Jedes gespendete Gerät durchläuft eine mehrstufige Kaskade. Ziel: Maximale
          Wertschöpfung, minimaler Abfall.
        </p>

        {/* Horizontal flow diagram */}
        <Card className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-grey-dark">
            {CASCADE_MODELS.current.label}
          </h3>
          <CascadeDiagram tiers={CASCADE_MODELS.current.tiers} />
          <p className="mt-4 text-center text-xs text-text-muted">
            Über 85% aller Geräte werden wiederverwendet oder als Ersatzteile
            genutzt — nur ~15% landen im Recycling.
          </p>
        </Card>

        {/* Tier detail cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {CASCADE_MODELS.current.tiers.map((tier) => (
            <TierDetailCard key={tier.id} tier={tier} />
          ))}
        </div>
      </section>

      {/* Block 2: What the Community Tech Space enables (future model) */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-bold text-grey-dark">
          Was der Community Tech Space ermöglicht
        </h2>
        <p className="mb-6 text-base text-text-light">
          Mit einem eigenen Hub entsteht ein neuer Pfad für Geräte, die bisher direkt
          ins Recycling gingen. Vintage-Hardware und Kunst reduzieren den Abfall
          weiter.
        </p>

        <FutureVisionBlock>
          {/* Future flow diagram */}
          <Card className="mb-8 border-0 bg-white/80">
            <h3 className="mb-4 text-lg font-semibold text-grey-dark">
              {CASCADE_MODELS.future.label}
            </h3>
            <CascadeDiagram tiers={CASCADE_MODELS.future.tiers} />
            <p className="mt-4 text-center text-xs text-text-muted">
              Neuer Tier 3 (Vintage & Kunst) fängt Geräte auf, die sonst direkt
              recycelt würden → Recycling-Anteil sinkt auf &lt;10%.
            </p>
          </Card>

          {/* Highlight: the new tier */}
          <TierDetailCard tier={CASCADE_TIERS.vintage_art} />
        </FutureVisionBlock>
      </section>

      {/* Principle: why cascading matters */}
      <section className="mb-12">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-bg-light to-bg-light">
          <h2 className="mb-4 text-xl font-bold text-grey-dark">
            Warum Kaskade statt Recycling?
          </h2>
          <p className="text-base leading-relaxed text-text-light">
            Recycling zerstört die Struktur eines Geräts, um Rohstoffe zurückzugewinnen.
            Das ist besser als Deponie — aber es vernichtet die Wertschöpfung, die in der
            Montage steckt. Unsere Kaskade kehrt das um: Zuerst wird die höchstmögliche
            Nutzung gesucht (funktionierendes Gerät), dann die nächsthöhere (Ersatzteile),
            und erst ganz am Ende die Rohstoffrückgewinnung.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            Das entspricht der Abfallhierarchie der EU (Vermeidung → Wiederverwendung →
            Recycling → Beseitigung) — angewendet auf IT-Hardware.
          </p>
        </Card>
      </section>

      <StoryBridge bridges={STORY_BRIDGES['wie-wir-arbeiten'] ?? []} />
    </>
  );
}
