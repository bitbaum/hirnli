import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import BottleneckSection from './sections/BottleneckSection';
import TrainTheTrainerVisionSection from './sections/TrainTheTrainerVisionSection';
import BPLRolesSection from './sections/BPLRolesSection';
import TrainTheTrainerMechanismSection from './sections/TrainTheTrainerMechanismSection';
import BildungBudgetSection from './sections/BildungBudgetSection';
import FinanzierungsstrategieSection from './sections/FinanzierungsstrategieSection';
import HubBildungSynergySection from './sections/HubBildungSynergySection';
import BildungCTASection from './sections/BildungCTASection';

export const metadata: Metadata = {
  title: 'Bildungsprogramm — Train-the-Trainer',
  description: `2× Bildungsprogrammleiter:innen ermöglichen Train-the-Trainer und erreichen ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr`,
};

export default async function BildungPage() {
  const tenant = await getTenant();

  // A project page: one organisation's premises plan / programme. There is
  // no meaningful partial — an empty version of it says nothing.
  if (!(await ownsCodeContent('bildung'))) {
    return (
      <>
        <PageHeader title="Bildungsprogramm" subtitle={`Bildungsprogramm von ${tenant.name}`} />
        <ContentNotPublished
          page="Bildungsprogramm"
          tenantName={tenant.name}
          describes="Hier erscheint das Bildungsprogramm der Organisation, sobald es beschrieben ist."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Bildungsprogramm"
        subtitle={`Train-the-Trainer: 2× Bildungsprogrammleiter:innen, ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreichen`}
        badge="Bildung"
      />
      <WhyThisMatters
        purpose={`Das Bildungsprogramm zeigt, wie wir durch strukturiertes Train-the-Trainer ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreichen — ohne das ganze Team zu vervielfachen.`}
        connection="Kombiniert mit dem Hub (Infrastruktur) skalieren wir sowohl Geräte-Kapazität als auch Bildungswirkung."
      />
      <BottleneckSection />
      <TrainTheTrainerVisionSection />
      <BPLRolesSection />
      <TrainTheTrainerMechanismSection />
      <BildungBudgetSection />
      <FinanzierungsstrategieSection />
      <HubBildungSynergySection />
      <BildungCTASection />
    </>
  );
}
