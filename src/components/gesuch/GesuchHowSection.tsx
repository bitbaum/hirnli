import type { TrackRecord, CompetencySection } from '@/lib/schemas/story';
import Card from '@/components/ui/Card';

interface GesuchHowSectionProps {
  trackRecord: TrackRecord;
  competencies: CompetencySection[];
}

export default function GesuchHowSection({ trackRecord, competencies }: GesuchHowSectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-grey-dark md:text-3xl">
        {trackRecord.headline}
      </h2>
      <p className="mb-6 text-base leading-relaxed text-text-light md:text-lg">
        {trackRecord.text}
      </p>

      {/* Proof Points */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {trackRecord.proof_points.map((point) => (
          <Card key={point.label} className="text-center">
            <p className="text-xl font-bold text-primary md:text-2xl">{point.value}</p>
            <p className="text-sm text-text-muted">{point.label}</p>
          </Card>
        ))}
      </div>

      {/* Competencies */}
      <div className="grid gap-6 md:grid-cols-2">
        {competencies.map((comp) => (
          <Card key={comp.headline}>
            <h3 className="mb-3 text-lg font-semibold text-grey-dark">{comp.headline}</h3>
            <ul className="space-y-1">
              {comp.capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-2 text-sm text-text-light">
                  <span className="mt-0.5 text-secondary">&#10003;</span>
                  {cap}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
