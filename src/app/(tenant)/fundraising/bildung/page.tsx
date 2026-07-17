import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
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

export default function BildungPage() {
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
