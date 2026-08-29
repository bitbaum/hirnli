import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BILDUNGSPROGRAMMLEITER, MULTIPLICATION_EFFECT } from '@/lib/config/team';

export default function BPLRolesSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">
        Zwei Bildungsprogrammleiter:innen — Zwei Fokusgebiete
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BILDUNGSPROGRAMMLEITER.map((bpl) => (
          <Card key={bpl.name} className="border-l-4 border-l-pillar-vision">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl flex-shrink-0">
                {bpl.name.includes('Hardware') ? '🔧' : '💻'}
              </span>
              <div className="flex-1">
                <h3 className="heading-card mb-1">{bpl.role}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="info">{bpl.vza} VZÄ</Badge>
                  <Badge variant={bpl.status === 'aktiv' ? 'success' : 'warning'}>
                    {bpl.status === 'aktiv' ? 'Aktiv' : 'Geplant'}
                  </Badge>
                  <Badge variant="default">{bpl.bereich}</Badge>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="heading-detail mb-2">Fachgebiete:</h4>
              <div className="flex flex-wrap gap-2">
                {bpl.fachgebiete?.map((fg) => (
                  <Badge key={fg} variant="outline" className="text-xs">
                    {fg}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="bg-pillar-vision/10 rounded-lg p-4">
              <h4 className="heading-detail text-pillar-vision mb-2">Multiplikationseffekt:</h4>
              {bpl.name.includes('Hardware') ? (
                <div className="text-sm text-pillar-vision space-y-1">
                  <p>
                    <strong>
                      {MULTIPLICATION_EFFECT.hardware_bpl.direct_training} Techniker/Jahr
                    </strong>{' '}
                    direkt trainiert
                  </p>
                  <p>Strukturierte Refurbishment-Ausbildung mit Curricula und Qualitätssicherung</p>
                </div>
              ) : (
                <div className="text-sm text-pillar-vision space-y-1">
                  <p>
                    <strong>
                      {MULTIPLICATION_EFFECT.software_bpl.direct_training} Menschen/Jahr
                    </strong>{' '}
                    direkt trainiert
                  </p>
                  <p>AI Literacy, Coding, Open-Source-Workshops für verschiedene Niveaus</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
