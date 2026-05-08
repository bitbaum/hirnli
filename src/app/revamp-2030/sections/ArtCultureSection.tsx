import Card from '@/components/ui/Card';

export default function ArtCultureSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Kunst, Kultur & Musik: Elektroschrott neu denken</h2>
      <Card className="border-l-4 border-l-danger">
        <p className="text-sm text-text-light mb-4">
          Revamp 2030 ist nicht nur Technik — <strong>Kunst und Kultur sind zentral</strong>, um
          unsere Beziehung zu Elektronik zu verändern und weggeworfene Geräte neu zu bewerten.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-danger/10 rounded-lg p-4">
            <div className="text-2xl mb-2" aria-hidden="true">🎨</div>
            <h3 className="text-sm font-semibold text-danger mb-2">E-Waste-Kunst</h3>
            <p className="text-sm text-danger mb-2">
              Künstler:innen schaffen aus Platinen, Gehäusen und Komponenten Skulpturen und Installationen.
            </p>
            <ul className="text-sm text-danger space-y-1 list-disc list-inside">
              <li>Resident Artists (3-6 Monate Atelierplatz)</li>
              <li>Workshops für Schulen</li>
              <li>Ausstellungen im Hub</li>
            </ul>
          </div>

          <div className="bg-danger/10 rounded-lg p-4">
            <div className="text-2xl mb-2" aria-hidden="true">🎹</div>
            <h3 className="text-sm font-semibold text-danger mb-2">Elektronische Musik</h3>
            <p className="text-sm text-danger mb-2">
              Vintage-Synths restaurieren, Circuit-Bending, Modular-Synthese — alte Elektronik wird Musik.
            </p>
            <ul className="text-sm text-danger space-y-1 list-disc list-inside">
              <li>Synth-Restaurierung (Roland, Korg, Moog)</li>
              <li>Circuit-Bending-Workshops</li>
              <li>Live-Konzerte & DJ-Sets im Event-Raum</li>
            </ul>
          </div>

          <div className="bg-danger/10 rounded-lg p-4">
            <div className="text-2xl mb-2" aria-hidden="true">🏛️</div>
            <h3 className="text-sm font-semibold text-danger mb-2">Museum & Geschichte</h3>
            <p className="text-sm text-danger mb-2">
              Computergeschichte zum Anfassen: Von Commodore 64 bis zur ersten Cray.
            </p>
            <ul className="text-sm text-danger space-y-1 list-disc list-inside">
              <li>Permanent-Ausstellung (Commodore, Amiga, NeXT)</li>
              <li>Wechselausstellungen: E-Waste-Kunst, Tech-Fotografie</li>
              <li>Führungen für Schulklassen</li>
            </ul>
          </div>
        </div>
        <div className="gradient-card-art rounded-lg p-4">
          <p className="text-sm font-bold text-chart-5 mb-2">Warum Kunst & Kultur zentral sind:</p>
          <p className="text-sm text-chart-5 mb-3">
            Technik allein ändert kein Verhalten. <strong>Kunst macht Elektroschrott sichtbar, berührbar, wertvoll</strong>.
            Konzerte, Ausstellungen und Workshops erreichen Menschen, die nie zu einem Repair-Workshop kämen.
            Sie beeinflussen Kultur und Wahrnehmung: &bdquo;Elektroschrott ist nicht Müll — es ist Ressource, Geschichte, Potenzial.&ldquo;
          </p>
          <p className="text-sm text-chart-5">
            <strong>Das ist Impact auf einer anderen Ebene:</strong> Nicht nur Geräte retten, sondern
            <strong> wie Menschen über Technologie denken verändern</strong>.
          </p>
        </div>
      </Card>
    </section>
  );
}
