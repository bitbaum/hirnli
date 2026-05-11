import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DEVICES_PER_YEAR_TARGET, PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';

export default function HubBildungSynergySection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Warum Hub + Bildung zusammen?</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-warning">
          <h3 className="heading-card mb-3">❌ Bildung ohne Hub = Begrenzte Kapazität</h3>
          <p className="text-sm text-text-light mb-4">
            Ohne grösseren Raum fehlen Werkstattplätze, Schulungsräume und Equipment für mehr Teilnehmende.
            Trainings bleiben theoretisch, weil die Praxis-Infrastruktur fehlt.
          </p>
          <Badge variant="warning">Limitiert durch Raumkapazität</Badge>
        </Card>

        <Card className="border-l-4 border-l-success gradient-card-success">
          <h3 className="heading-card text-success mb-3">✅ Hub + Bildung = Exponentielles Wachstum</h3>
          <p className="text-sm text-success mb-4">
            Hub bietet <strong>Infrastruktur</strong> (Werkstatt, Schulungsräume, Equipment).
            Bildungsprogrammleiter:innen bieten <strong>Know-how-Multiplikation</strong> (Train-the-Trainer).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-success">{DEVICES_PER_YEAR_TARGET}</div>
              <div className="text-sm text-success">Geräte/Jahr (Hub)</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-success">{PEOPLE_REACHED_PER_YEAR}</div>
              <div className="text-sm text-success">Menschen/Jahr (Bildung)</div>
            </div>
          </div>
          <Badge variant="success">Beide Dimensionen skalieren</Badge>
        </Card>
      </div>
    </section>
  );
}
