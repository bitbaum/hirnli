import Link from 'next/link';
import Card from '@/components/ui/Card';
import { HUB_SPACE_DISPLAY } from '@/lib/config/projections';

export default function SolutionGrid() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Die Lösung: Hub (Infrastruktur) + Menschen (Organisation)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-primary">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">🏢</span>
            <div className="flex-1">
              <h3 className="heading-card mb-2">1. Revamp Hub — Infrastruktur & Raum</h3>
              <p className="text-sm text-text-light mb-3">
                <strong>Was wir heute haben:</strong> Laden + Lager (genaue Quadratmeter werden im Rahmen unserer Data-Strategie dokumentiert).
                Verteilt auf 2 Standorte, suboptimal organisiert.
              </p>
              <p className="text-sm text-text-light mb-3">
                <strong>Was wir brauchen:</strong> {HUB_SPACE_DISPLAY} zentraler Hub mit:
              </p>
              <ul className="text-sm text-text-light space-y-1 list-disc list-inside mb-4">
                <li>Professionelle Werkstatt (mehr Tische, Testinfrastruktur, bessere Organisation)</li>
                <li>Schulungsräume für strukturierte Trainings</li>
                <li>Event-/Kulturraum (Kunst, Musik, Community)</li>
                <li>Makerspace & AI Lab</li>
                <li>Besser organisiertes Lager</li>
              </ul>
              <div className="bg-primary/10 rounded-lg p-3 mb-3">
                <p className="text-sm text-primary">
                  <strong>Warum das hilft:</strong> Mehr Raum bedeutet mehr parallele Arbeitsstationen, bessere Trennung
                  (Verkauf/Werkstatt/Schulung), weniger Chaos. <strong>Aber:</strong> Raum allein reicht nicht — siehe Punkt 2.
                </p>
              </div>
              <Link
                href="/wie-wir-arbeiten"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                🔧 Wie wir arbeiten →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-pillar-vision">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">🎓</span>
            <div className="flex-1">
              <h3 className="heading-card mb-2">2. Bildungsprogrammleiter:innen — Organisation & Multiplikation</h3>
              <p className="text-sm text-text-light mb-3">
                <strong>Das ist der eigentliche Game-Changer:</strong> Zwei <strong>bezahlte Fachleute</strong>, die
                professionell organisieren, trainieren und Programme leiten.
              </p>
              <div className="space-y-3 mb-4">
                <div className="bg-pillar-vision/10 rounded-lg p-3">
                  <p className="text-sm font-semibold text-pillar-vision mb-1">Hardware-Bildungsprogrammleiter:in</p>
                  <ul className="text-sm text-pillar-vision space-y-1 list-disc list-inside">
                    <li>Organisiert Reparatur-Tische: Zeitpläne, Qualitätssicherung, Prozesse</li>
                    <li>Bildet Techniker aus (nicht nur reparieren, sondern auch trainieren lernen)</li>
                    <li>Strukturierte Programme statt &bdquo;komm, wenn du willst&ldquo;</li>
                    <li>Train-the-Trainer: Trainierte geben ihr Wissen an andere weiter</li>
                  </ul>
                </div>
                <div className="bg-pillar-vision/10 rounded-lg p-3">
                  <p className="text-sm font-semibold text-pillar-vision mb-1">Software/AI-Bildungsprogrammleiter:in</p>
                  <ul className="text-sm text-pillar-vision space-y-1 list-disc list-inside">
                    <li>Organisiert Workshops: AI Literacy, Coding, Open Source</li>
                    <li>Bildet Entwickler aus, die dann selbst trainieren</li>
                    <li>Strukturierte Curricula für verschiedene Niveaus</li>
                    <li>Entlastet das Team von Bildungsarbeit</li>
                  </ul>
                </div>
              </div>
              <Link
                href="/wirkung"
                className="inline-flex items-center gap-2 text-sm font-semibold text-pillar-vision hover:text-pillar-vision transition-colors"
              >
                🌱 Wirkung & Impact ansehen →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
