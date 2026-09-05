import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import Card from '@/components/ui/Card';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { CASCADE_MODELS, CASCADE_TIERS } from '@/lib/config/value-cascade';
import { PAGE_TITLE, PAGE_SUBTITLE, WHY_THIS_MATTERS, CASCADE_METRICS } from './data';
import { CascadeDiagram, TierDetailCard, FutureVisionBlock } from './components';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_SUBTITLE,
};

export default async function WieWirArbeitenPage() {
  const tenant = await getTenant();

  // This page is one organisation's own material. Rendering it for another
  // tenant presented those facts as theirs; see lib/content/page-content.ts.
  if (!(await ownsCodeContent('wie-wir-arbeiten'))) {
    return (
      <>
        <PageHeader title="Wie wir arbeiten" subtitle={`Wie wir arbeiten von ${tenant.name}`} />
        <ContentNotPublished
          page="Wie wir arbeiten"
          tenantName={tenant.name}
          describes="Hier erscheint die Wertschöpfungskaskade der Organisation, sobald sie beschrieben ist."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />

      <WhyThisMatters purpose={WHY_THIS_MATTERS.purpose} connection={WHY_THIS_MATTERS.connection} />

      {/* Key metrics */}
      <section className="mb-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CASCADE_METRICS.map((m) => (
            <Card key={m.label} className="text-center">
              <p className="heading-page text-primary">{m.value}</p>
              <p className="heading-detail">{m.label}</p>
              <p className="mt-1 text-sm text-text-muted">{m.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Block 1: Unsere Methode (current 3-tier cascade) */}
      <section className="mb-12">
        <h2 className="mb-2 heading-section">Unsere Methode</h2>
        <p className="mb-6 text-base text-text-secondary">
          Jedes gespendete Gerät durchläuft eine mehrstufige Kaskade. Ziel: Maximale Wertschöpfung,
          minimaler Abfall.
        </p>

        {/* Horizontal flow diagram */}
        <Card className="mb-8">
          <h3 className="mb-4 heading-card">{CASCADE_MODELS.current.label}</h3>
          <CascadeDiagram tiers={CASCADE_MODELS.current.tiers} />
          <p className="mt-4 text-center text-sm text-text-muted">
            Über 85% aller Geräte werden wiederverwendet oder als Ersatzteile genutzt — nur ~15%
            landen im Recycling.
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
        <h2 className="mb-2 heading-section">Was der Community Tech Space ermöglicht</h2>
        <p className="mb-6 text-base text-text-secondary">
          Mit einem eigenen Hub entsteht ein neuer Pfad für Geräte, die bisher direkt ins Recycling
          gingen. Vintage-Hardware und Kunst reduzieren den Abfall weiter.
        </p>

        <FutureVisionBlock>
          {/* Future flow diagram */}
          <Card className="mb-8 border-0 bg-surface-base/80">
            <h3 className="mb-4 heading-card">{CASCADE_MODELS.future.label}</h3>
            <CascadeDiagram tiers={CASCADE_MODELS.future.tiers} />
            <p className="mt-4 text-center text-sm text-text-muted">
              Neuer Tier 3 (Vintage & Kunst) fängt Geräte auf, die sonst direkt recycelt würden →
              Recycling-Anteil sinkt auf &lt;10%.
            </p>
          </Card>

          {/* Highlight: the new tier */}
          <TierDetailCard tier={CASCADE_TIERS.vintage_art} />
        </FutureVisionBlock>
      </section>

      {/* Principle: why cascading matters */}
      <section className="mb-12">
        <Card className="border-l-4 border-l-primary bg-surface-raised">
          <h2 className="mb-4 heading-subsection">Warum Kaskade statt Recycling?</h2>
          <p className="text-base leading-relaxed text-text-secondary">
            Recycling zerstört die Struktur eines Geräts, um Rohstoffe zurückzugewinnen. Das ist
            besser als Deponie — aber es vernichtet die Wertschöpfung, die in der Montage steckt.
            Unsere Kaskade kehrt das um: Zuerst wird die höchstmögliche Nutzung gesucht
            (funktionierendes Gerät), dann die nächsthöhere (Ersatzteile), und erst ganz am Ende die
            Rohstoffrückgewinnung.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            Das entspricht der Abfallhierarchie der EU (Vermeidung → Wiederverwendung → Recycling →
            Beseitigung) — angewendet auf IT-Hardware.
          </p>
        </Card>
      </section>

      <StoryBridge bridges={STORY_BRIDGES['wie-wir-arbeiten'] ?? []} />
    </>
  );
}
