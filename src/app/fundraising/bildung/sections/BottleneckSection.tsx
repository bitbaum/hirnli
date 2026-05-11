import Card from '@/components/ui/Card';
import { TEAM_MEMBERS } from '@/app/team/data';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';

export default function BottleneckSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Das Problem: Soziale Reichweite ist begrenzt</h2>
      <Card className="border-l-4 border-l-warning bg-warning/10">
        <div className="flex items-start gap-4">
          <span className="text-4xl flex-shrink-0" aria-hidden="true">⚠️</span>
          <div className="flex-1">
            <h3 className="heading-card font-bold text-warning mb-2">Aktueller Engpass</h3>
            <div className="space-y-2 text-sm text-warning">
              <p>
                <strong>{TEAM_MEMBERS.length} Personen im Team</strong> (Leitung, Techniker, Betrieb) — aber nur 3 in der Leitung (Vero, Dani, Andreas), keine dedizierte Bildungskapazität
              </p>
              <p>
                <strong>Aktuelle Reichweite:</strong> ~5 Menschen/Jahr direkt trainiert (Schätzung, nicht systematisch erfasst)
              </p>
              <p><strong>Was fehlt:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dedizierte Bildungsprogrammleiter:innen für systematisches Training</li>
                <li>Train-the-Trainer Ansatz: Trainer:innen ausbilden statt nur direkt trainieren</li>
                <li>Strukturierte Curricula für Hardware- und Software-/AI-Bildung</li>
                <li>Skalierbare Kapazität: Von informellem Training zu {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
