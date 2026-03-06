import Link from 'next/link';
import Card from '@/components/ui/Card';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  PEOPLE_REACHED_DISPLAY,
  REVENUE_GROWTH_DISPLAY,
} from '@/lib/config/projections';

export default function TwoAsks() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wir sammeln für 2 Dinge: Hub + Menschen</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Hub */}
        <Card className="border-l-4 border-l-blue-500">
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
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
              >
                📊 Hub-Details & Budget ansehen →
              </Link>
            </div>
          </div>
        </Card>

        {/* Menschen */}
        <Card className="border-l-4 border-l-violet-500">
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
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
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
        <div className="mt-2 text-3xl font-bold text-blue-600">
          {DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr + {PEOPLE_REACHED_DISPLAY} trainiert
        </div>
        <div className="mt-3 text-sm text-text-light">
          {REVENUE_GROWTH_DISPLAY}
        </div>
        <div className="mt-1 text-sm font-semibold text-violet-600">
          + {PEOPLE_REACHED_DISPLAY} in Tech-Bildung & Integration
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/fundraising/hub"
            className="inline-flex items-center gap-2 rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-grey-dark/85"
          >
            <span>📖</span>
            <span>Detaillierte Hub-Planung ansehen</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
