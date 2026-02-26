import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils/format';
import { CO2_PER_LAPTOP } from '@/lib/config/numbers';
import { ORG_PROFILE } from '@/lib/config/org-profile';

// ---------------------------------------------------------------------------
// Theory of Change column component
// ---------------------------------------------------------------------------

export type ToCItemStatus = 'measured' | 'estimated' | 'missing';

export interface ToCItem {
  label: string;
  status: ToCItemStatus;
}

const STATUS_INDICATOR: Record<ToCItemStatus, string> = {
  measured: 'bg-success',
  estimated: 'bg-warning',
  missing: 'bg-gray-400',
};

export function ToCColumn({
  title,
  color,
  titleColor,
  items,
}: {
  title: string;
  color: string;
  titleColor: string;
  items: ToCItem[];
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <h4 className={`mb-3 border-b pb-2 text-sm font-semibold ${titleColor}`}>{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded bg-white/70 px-2 py-1.5 text-xs">
            <span>{item.label}</span>
            <span className={`h-2 w-2 rounded-full ${STATUS_INDICATOR[item.status]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Impact story cards (ecological, resource conservation, social)
// ---------------------------------------------------------------------------

export function ImpactStoryCards({
  co2Avoided,
  eWaste,
  carsKm,
  flightsZurichBerlin,
}: {
  co2Avoided: number;
  eWaste: number;
  carsKm: number;
  flightsZurichBerlin: number;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-grey-dark">Wirkung im Detail</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Ecological impact */}
        <Card padding={false}>
          <div className="rounded-t-lg bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white">
            <h3 className="font-semibold">Ökologische Wirkung</h3>
          </div>
          <div className="p-4">
            <div className="mb-2 text-3xl font-bold">~{co2Avoided} t</div>
            <p className="mb-2 text-sm text-text-muted">CO₂ vermieden durch Wiederverwendung</p>
            <Badge variant="estimated">Schätzung</Badge>
            <p className="mt-3 text-xs text-text-muted">
              <strong>Berechnung:</strong> {CO2_PER_LAPTOP} kg CO₂ pro Laptop (300 kg Produktion - 15 kg Refurbishment)
            </p>
            <div className="mt-3 rounded-lg bg-bg-light p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Das entspricht etwa:</h4>
              <ul className="space-y-1 text-xs text-text-light">
                <li>🚗 {formatNumber(carsKm)} km Autofahrt</li>
                <li>✈️ {flightsZurichBerlin} Flüge Zürich-Berlin</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Resource conservation */}
        <Card padding={false}>
          <div className="rounded-t-lg bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white">
            <h3 className="font-semibold">Ressourcenschonung</h3>
          </div>
          <div className="p-4">
            <div className="mb-2 text-3xl font-bold">~{formatNumber(eWaste)} kg</div>
            <p className="mb-2 text-sm text-text-muted">Elektroschrott vermieden</p>
            <Badge variant="estimated">Schätzung</Badge>
            <p className="mt-3 text-xs text-text-muted">
              <strong>Berechnung:</strong> ~5 kg Durchschnittsgewicht pro Gerät
            </p>
            <div className="mt-3 rounded-lg bg-bg-light p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Enthält wertvolle Rohstoffe:</h4>
              <ul className="space-y-1 text-xs text-text-light">
                <li>⚡ Seltene Erden</li>
                <li>🪨 Kobalt & Lithium</li>
                <li>🔧 Kupfer & Aluminium</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Social impact */}
        <Card padding={false}>
          <div className="rounded-t-lg bg-gradient-to-r from-purple-500 to-purple-700 p-4 text-white">
            <h3 className="font-semibold">Soziale Integration</h3>
          </div>
          <div className="p-4">
            <div className="mb-2 text-3xl font-bold text-gray-400">?</div>
            <p className="mb-2 text-sm text-text-muted">Praktikant:innen & Teilnehmende</p>
            <Badge variant="none">Nicht erfasst</Badge>
            <div className="mt-3 rounded-lg bg-red-50 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">{`Historisch (seit ${ORG_PROFILE.milestones.integrationProgram}):`}</h4>
              <ul className="space-y-1 text-xs text-text-light">
                <li>👥 <strong>100+</strong> Praktikant:innen</li>
                <li>✓ <strong>~40%</strong> Erfolgsquote</li>
                <li>🏠 <strong>8-10</strong> Plätze verfügbar</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
