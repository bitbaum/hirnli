import Card from '@/components/ui/Card';
import HubCardFooter from './HubCardFooter';
import { TEAM_MEMBERS } from '@/app/team/data';
import { OFFICE_AREA, STORAGE_AREA, LOADING_AREA } from '@/lib/config/hub-space-plan';
import { formatCHF } from '@/lib/utils/format';

export default function OperationsSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">💼 Betrieb & Infrastruktur</h2>
      <p className="text-sm text-text-secondary mb-6">
        Was im Hintergrund läuft: Büros, Lager, Logistik. Nicht glamourös, aber essentiell.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">💼</div>
            <h3 className="heading-item">Offices & Sozialräume</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            <strong>{OFFICE_AREA.sqm_recommended} m²</strong> für Geschäftsleitung, Koordination, Meetings, Pausenraum, Sozialräume.
          </p>
          <ul className="text-sm text-text-secondary space-y-1 mb-3">
            <li>• 5× Büroarbeitsplätze (Kernteam + 2× BPL)</li>
            <li>• 1× Meetingraum (8 Personen)</li>
            <li>• Pausenraum & Küche</li>
            <li>• Sanitäranlagen</li>
          </ul>
          <HubCardFooter items={[
            { label: 'Team', value: `${TEAM_MEMBERS.length} Personen + 2 geplante BPL` },
            { label: 'Kosten', value: formatCHF(OFFICE_AREA.cost_estimate_chf) },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">📦</div>
            <h3 className="heading-item">Lager & Logistik</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            <strong>{STORAGE_AREA.sqm_recommended} m²</strong> für Eingang/Triage, Ersatzteile, Fertigware, Recycling-Staging.
          </p>
          <ul className="text-sm text-text-secondary space-y-1 mb-3">
            <li>• 60 m² Eingang & Triage (Geräte-Annahme)</li>
            <li>• 40 m² Fertigwaren-Lager (verkaufsfertig)</li>
            <li>• 30 m² Recycling-Staging (Elektroschrott)</li>
            <li>• 20 m² Versand & Verpackung</li>
          </ul>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '500+ Geräte gleichzeitig' },
            { label: 'Kosten', value: formatCHF(STORAGE_AREA.cost_estimate_chf) },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-grey-medium">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl" aria-hidden="true">🚚</div>
            <h3 className="heading-item">Lade- & Anlieferzone</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            <strong>{LOADING_AREA.sqm_recommended} m²</strong> für Wareneingang, LKW-Zufahrt, Palette-Handling.
          </p>
          <ul className="text-sm text-text-secondary space-y-1 mb-3">
            <li>• Rampe für LKW-Anlieferung</li>
            <li>• Paletten-Handling (Hubwagen)</li>
            <li>• Temporäre Lagerung (24-48h)</li>
            <li>• Recycling-Abholung</li>
          </ul>
          <HubCardFooter items={[
            { label: 'Nutzung', value: 'Täglich (Lieferungen)' },
            { label: 'Kosten', value: formatCHF(LOADING_AREA.cost_estimate_chf) },
          ]} />
        </Card>
      </div>
    </section>
  );
}
