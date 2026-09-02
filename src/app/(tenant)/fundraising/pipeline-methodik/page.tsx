import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import { computeFunnelStats } from '@/lib/domain/pipeline-stats';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';
import FunnelSection from './sections/FunnelSection';
import DataSourcesSection from './sections/DataSourcesSection';
import TierDistributionSection from './sections/TierDistributionSection';
import StageDescriptionsSection from './sections/StageDescriptionsSection';
import DarkPoolSection from './sections/DarkPoolSection';
import PrinciplesSection from './sections/PrinciplesSection';

export const metadata: Metadata = {
  title: 'Pipeline-Methodik',
  description: `Wie wir aus ${SWISS_FOUNDATIONS_DISPLAY} Schweizer Stiftungen die richtigen finden`,
};

export default async function PipelineMethodikPage() {
  const s = computeFunnelStats(await getAllFoundations());

  return (
    <>
      <PageHeader
        title="Pipeline-Methodik"
        subtitle="Wie wir aus tausenden Schweizer Stiftungen die richtigen finden"
      />
      <p className="mb-8 text-sm text-text-secondary">
        Die Schweiz hat über {SWISS_FOUNDATIONS_DISPLAY} eingetragene Stiftungen. Wir können nicht
        alle recherchieren — das wäre Jahre an Arbeit. Stattdessen nutzen wir einen mehrstufigen
        Trichter: jede Stufe ist günstiger als die nächste und eliminiert Stiftungen, die eine klare
        Frage nicht bestehen.
      </p>
      <FunnelSection s={s} />
      <DataSourcesSection />
      <TierDistributionSection s={s} />
      <StageDescriptionsSection />
      <DarkPoolSection s={s} />
      <PrinciplesSection />
    </>
  );
}
