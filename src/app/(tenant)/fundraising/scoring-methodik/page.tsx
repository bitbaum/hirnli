import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import {
  computePriorityDistribution,
  computeReadinessDistribution,
} from '@/lib/domain/scoring-stats';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import ScoringArchitectureSection from './sections/ScoringArchitectureSection';
import FitScoreSection from './sections/FitScoreSection';
import ReadinessSection from './sections/ReadinessSection';
import PrioritySection from './sections/PrioritySection';
import GesuchGateSection from './sections/GesuchGateSection';
import DesignPrinciplesSection from './sections/DesignPrinciplesSection';

export const metadata: Metadata = {
  title: 'Scoring-Methodik',
  description: 'Wie Fit, Bereitschaft und Priorität algorithmisch berechnet werden',
};

export default async function ScoringMethodikPage() {
  const foundations = await getAllFoundations();
  const priorityDist = computePriorityDistribution(foundations);
  const readinessDist = computeReadinessDistribution(foundations);

  return (
    <>
      <PageHeader
        title="Scoring-Methodik"
        subtitle="Algorithmische Bewertung von Stiftungen — drei Ebenen, komplett inspizierbar"
      />
      <p className="mb-8 text-sm text-text-secondary">
        Jeder Score wird algorithmisch aus den vorhandenen Stiftungsdaten berechnet. Keine manuellen
        Noten, keine Black Boxes. Alle Gewichte und Schwellenwerte sind konfigurierbar und hier
        vollständig dokumentiert.
      </p>
      <ScoringArchitectureSection />
      <FitScoreSection />
      <ReadinessSection readinessAvg={readinessDist.avg} foundations={foundations} />
      <PrioritySection
        priorityCounts={priorityDist.counts}
        priorityAvg={priorityDist.avg}
        total={foundations.length}
      />
      <GesuchGateSection foundations={foundations} />
      <DesignPrinciplesSection />
    </>
  );
}
