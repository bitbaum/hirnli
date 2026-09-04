import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { VISION_TARGETS, SDG_DATA, SDG_COLORS } from './data';
import type { SdgRow } from './data';
import { GeschichteSection, KontaktSection, VisionMetric } from './components';
import { getTenant } from '@/lib/tenant/resolve';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import FourPillarsSection from './sections/FourPillarsSection';
import SovereigntySection from './sections/SovereigntySection';
import CommunityTechSpaceSection from './sections/CommunityTechSpaceSection';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  return {
    title: 'Mission & Werte',
    description: `Vier Säulen, Souveränität und SDG-Alignment — was ${tenant.name} heute ausmacht`,
  };
}

export default async function StrategiePage() {
  const tenant = await getTenant();
  return (
    <>
      <PageHeader
        title="Mission & Werte"
        subtitle="Woher wir kommen, wofür wir stehen — unsere vier Säulen"
      />

      <WhyThisMatters
        purpose="Unsere Mission, Werte und Vision 2030 erklären WARUM wir existieren und WOHIN wir gehen."
        connection="Strategie ist die Grundlage für alle anderen Seiten: Operations (WIE), Fundraising (WOMIT), Wirkung (ERGEBNIS)."
      />

      <GeschichteSection />

      {/* Mission Statement */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Mission</h2>
        <Card className="border-l-4 border-l-success">
          <p className="heading-card text-success-text">
            {tenant.name} gestaltet die Zukunft der IT durch Reparatur, Refurbishing und
            Lebensdauerverlängerung.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            Wir retten gebrauchte Computer vor dem Elektroschrott, indem wir sie mit Linux und
            Open-Source-Software wiederbeleben. Gleichzeitig schaffen wir Zugang zu bezahlbarer
            Technologie, fördern digitale Kompetenzen und unterstützen Menschen bei der beruflichen
            Wiedereingliederung.
          </p>
        </Card>
      </section>

      <FourPillarsSection />

      {/* Vision 2030 */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Vision 2030</h2>
        <Card variant="muted">
          <h3 className="mb-1 heading-item">
            Jedes IT-Gerät schöpft sein volles Potenzial aus. Niemand wird aufgrund mangelnder
            Technologie ausgeschlossen.
          </h3>
          <p className="text-xs text-text-tertiary mb-5">
            Klicke auf die Metriken, um Details zur Datenquelle und Methodik zu sehen.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VISION_TARGETS.map((target) => (
              <VisionMetric
                key={target.value}
                value={target.value}
                label={target.label}
                source={target.source}
              />
            ))}
          </div>
        </Card>
      </section>

      <SovereigntySection />
      <CommunityTechSpaceSection />

      {/* SDG Alignment */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">UN Sustainable Development Goals</h2>
        <Card>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {SDG_DATA.map((sdg) => (
              <span
                key={sdg.sdg}
                className={`inline-block rounded-full ${SDG_COLORS[sdg.sdg]} px-4 py-2 text-sm font-semibold text-white`}
              >
                {sdg.sdg}
              </span>
            ))}
          </div>
          <Table<SdgRow>
            columns={[
              { key: 'sdg', header: 'SDG', render: (r) => <strong>{r.sdg}</strong> },
              { key: 'name', header: 'Ziel' },
              { key: 'activities', header: 'Unser Beitrag' },
            ]}
            data={SDG_DATA}
            keyExtractor={(r) => r.sdg}
            compact
          />
        </Card>
      </section>

      <KontaktSection />

      <StoryBridge bridges={STORY_BRIDGES.strategie} />
    </>
  );
}
