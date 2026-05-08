import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  PEOPLE_REACHED_DISPLAY,
  REVENUE_GROWTH_DISPLAY,
} from '@/lib/config/projections';

export default function TwoAsks() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Wir sammeln für 2 Dinge: Hub + Menschen</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Hub */}
        <Card className="border-l-4 border-l-primary">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">🏢</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-grey-dark">1. Community Tech Hub (Raum)</h3>
              <p className="mt-2 text-sm text-text-light">
                <strong>{HUB_SPACE_DISPLAY}:</strong> Werkstatt, AI Lab, Event Space, Shop, Offices — alles unter einem Dach
              </p>
              <p className="mt-2 text-sm text-text-light">
                <strong>Ergebnis:</strong> Effizientere Prozesse, mehr parallele Arbeitsplätze, neue Einnahmequellen
              </p>
              <Link
                href="/fundraising/hub"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                📊 Hub-Details & Budget ansehen →
              </Link>
            </div>
          </div>
        </Card>

        {/* Menschen */}
        <Card className="border-l-4 border-l-pillar-vision">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">👥</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-grey-dark">2. Bildungsprogrammleiter (Team)</h3>
              <p className="mt-2 text-sm text-text-light">
                <strong>2× neue Stellen:</strong> Hardware-BPL + Software/AI-BPL
              </p>
              <p className="mt-2 text-sm text-text-light">
                <strong>Train-the-Trainer:</strong> Strukturierte Ausbildung statt informellem Wissenstransfer
              </p>
              <p className="mt-2 text-sm text-text-light">
                <strong>Ergebnis:</strong> {PEOPLE_REACHED_DISPLAY} erreicht (Techniker + Entwickler + Workshop-Teilnehmer)
              </p>
              <Link
                href="/fundraising/bildung"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pillar-vision hover:text-pillar-vision transition-colors"
              >
                📊 Bildung-Details & Multiplikationseffekt →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Combined Effect */}
      <div className="mt-6 rounded-lg border-2 border-dashed border-border bg-white/50 p-6 text-center">
        <div className="text-sm font-medium uppercase tracking-wider text-text-muted">
          Kombinierter Effekt: Hub + Menschen
        </div>
        <div className="mt-2 text-lg text-grey-dark">
          Bessere Prozesse + strukturierte Bildung + diversifizierte Einnahmen
        </div>
        <div className="mt-2 text-3xl font-bold text-primary">
          {DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr + {PEOPLE_REACHED_DISPLAY} trainiert
        </div>
        <div className="mt-3 text-sm text-text-light">
          {REVENUE_GROWTH_DISPLAY}
        </div>
        <div className="mt-1 text-sm font-semibold text-pillar-vision">
          + {PEOPLE_REACHED_DISPLAY} in Tech-Bildung & Integration
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Button href="/fundraising/hub" size="md">
            <span>📖</span>
            <span>Detaillierte Hub-Planung ansehen</span>
            <span>→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
