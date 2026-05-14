import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import { DEVICES_PER_YEAR_TARGET_DISPLAY, DEVICES_PER_YEAR_CURRENT_DISPLAY } from '@/lib/config/projections';
import {
  SPACE_PLAN,
  SPACE_PLAN_TOTAL,
  SPACE_TOTAL_WITH_CIRCULATION,
} from '../data';

export default function SpaceConcept() {
  return (
    <section className="mb-8">
      <Card className="prose prose-sm max-w-none">
        <h2>Raumkonzept: Von 250 m² auf {SPACE_TOTAL_WITH_CIRCULATION} m²</h2>

        <p>
          <strong>Heute haben wir:</strong> 250 m² verteilt auf zwei getrennte Standorte (Laden + Lager).
          Das ist ineffizient, teuer, und hemmt unser Wachstum.
        </p>

        <p>
          <strong>Der Hub bringt alles unter ein Dach:</strong> ~{SPACE_TOTAL_WITH_CIRCULATION} m² Gesamtfläche
          (inkl. Verkehrsfläche) mit {SPACE_PLAN_TOTAL} m² Nutzfläche für {SPACE_PLAN.length} Bereiche.
        </p>

        <h3>Die {SPACE_PLAN.length} Bereiche:</h3>

        <div className="space-y-3 not-prose">
          {SPACE_PLAN.map((space) => (
            <div key={space.area} className="border-l-4 border-primary/20 pl-4 py-2">
              <div className="flex items-baseline justify-between mb-1">
                <strong className="text-base text-grey-dark">{space.area}</strong>
                <span className="heading-detail tabular-nums">{space.sqm} m²</span>
              </div>
              <p className="text-sm text-text-muted m-0">{space.description}</p>
            </div>
          ))}
        </div>

        <Callout color="success" className="my-4">
          <p className="heading-detail text-success mb-2">Warum so viel Raum?</p>
          <p className="text-success">
            Unser Ziel ist <strong>{DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr bis Ende Jahr 3</strong> (von aktuell {DEVICES_PER_YEAR_CURRENT_DISPLAY}/Jahr geschätzt).
            Dafür brauchen wir effizientere Infrastruktur und strukturierte Prozesse.
          </p>
          <p className="text-success mt-2">
            Plus: Workshops, Trainings, Events, und Community-Treffpunkt generieren neue Einnahmequellen,
            die langfristig unsere Unabhängigkeit sichern.
          </p>
        </Callout>

        <p className="text-sm text-text-light">
          <strong>Gesamtfläche:</strong> {SPACE_PLAN_TOTAL} m² Nutzfläche + ~{SPACE_TOTAL_WITH_CIRCULATION - SPACE_PLAN_TOTAL} m² Verkehrsfläche (Flure, Treppen, Toiletten)
          = ~{SPACE_TOTAL_WITH_CIRCULATION} m² Total.
        </p>
      </Card>
    </section>
  );
}
