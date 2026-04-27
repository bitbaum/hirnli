import Card from '@/components/ui/Card';
import { TEAM_MEMBERS } from '@/app/team/data';

export default function OperationsSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">💼 Betrieb & Infrastruktur</h2>
      <p className="text-sm text-text-light mb-6">
        Was im Hintergrund läuft: Büros, Lager, Logistik. Nicht glamourös, aber essentiell.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">💼</div>
            <h3 className="text-md font-semibold text-grey-dark">Offices & Sozialräume</h3>
          </div>
          <p className="text-sm text-text-light mb-3">
            <strong>100 m²</strong> für Geschäftsleitung, Koordination, Meetings, Pausenraum, Sozialräume.
          </p>
          <ul className="text-sm text-text-light space-y-1 mb-3">
            <li>• 5× Büroarbeitsplätze (Kernteam + 2× BPL)</li>
            <li>• 1× Meetingraum (8 Personen)</li>
            <li>• Pausenraum & Küche</li>
            <li>• Sanitäranlagen</li>
          </ul>
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-text-light">
              <strong>Team:</strong> {TEAM_MEMBERS.length} Personen + 2 geplante BPL<br />
              <strong>Kosten:</strong> CHF 40&apos;000
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">📦</div>
            <h3 className="text-md font-semibold text-grey-dark">Lager & Logistik</h3>
          </div>
          <p className="text-sm text-text-light mb-3">
            <strong>150 m²</strong> für Eingang/Triage, Ersatzteile, Fertigware, Recycling-Staging.
          </p>
          <ul className="text-sm text-text-light space-y-1 mb-3">
            <li>• 60 m² Eingang & Triage (Geräte-Annahme)</li>
            <li>• 40 m² Fertigwaren-Lager (verkaufsfertig)</li>
            <li>• 30 m² Recycling-Staging (Elektroschrott)</li>
            <li>• 20 m² Versand & Verpackung</li>
          </ul>
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-text-light">
              <strong>Kapazität:</strong> 500+ Geräte gleichzeitig<br />
              <strong>Kosten:</strong> CHF 35&apos;000
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">🚚</div>
            <h3 className="text-md font-semibold text-grey-dark">Lade- & Anlieferzone</h3>
          </div>
          <p className="text-sm text-text-light mb-3">
            <strong>50 m²</strong> für Wareneingang, LKW-Zufahrt, Palette-Handling.
          </p>
          <ul className="text-sm text-text-light space-y-1 mb-3">
            <li>• Rampe für LKW-Anlieferung</li>
            <li>• Paletten-Handling (Hubwagen)</li>
            <li>• Temporäre Lagerung (24-48h)</li>
            <li>• Recycling-Abholung</li>
          </ul>
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-text-light">
              <strong>Nutzung:</strong> Täglich (Lieferungen)<br />
              <strong>Kosten:</strong> CHF 20&apos;000
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
