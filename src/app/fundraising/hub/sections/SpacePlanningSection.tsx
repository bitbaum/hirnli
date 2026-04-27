import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  ZURICH_MARKET_DATA,
  SPACE_SUMMARY,
  MULTI_PURPOSE_STRATEGY,
} from '@/lib/config/hub-space-plan';
import { formatNumber } from '@/lib/utils/format';

export default function SpacePlanningSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">📐 Raumplanung: Wie gross? Warum? Was kostet es?</h2>
      <p className="text-sm text-text-light mb-6">
        Detaillierte Begründung für jede Fläche — basierend auf Industrie-Standards, Zürich-Marktforschung und Multi-Purpose-Strategie.
      </p>

      {/* Total Space Summary */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark mb-2">Gesamt-Raumkonzept</h3>
            <p className="text-2xl font-bold text-primary">{SPACE_SUMMARY.total_with_circulation} m²</p>
          </div>
          <Badge color="blue">Realistisch</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-xs font-semibold text-primary mb-1">Kerngeschäft</p>
            <p className="text-lg font-bold text-primary">{SPACE_SUMMARY.by_category.core_business.total_sqm} m²</p>
            <p className="text-xs text-primary">Shop + Werkstatt + Lager</p>
          </div>
          <div className="bg-chart-5/10 p-3 rounded-lg">
            <p className="text-xs font-semibold text-chart-5 mb-1">Innovation & Bildung</p>
            <p className="text-lg font-bold text-chart-5">{SPACE_SUMMARY.by_category.innovation.total_sqm} m²</p>
            <p className="text-xs text-chart-5">Makerspace + AI Lab + Schulung</p>
          </div>
          <div className="bg-danger/10 p-3 rounded-lg">
            <p className="text-xs font-semibold text-danger mb-1">Kultur & Community</p>
            <p className="text-lg font-bold text-danger">{SPACE_SUMMARY.by_category.culture_community.total_sqm} m²</p>
            <p className="text-xs text-danger">Events + Café + Repair Café</p>
          </div>
        </div>

        <div className="bg-warning/10 border-l-4 border-warning p-4 text-sm">
          <p className="font-semibold text-warning mb-2">Warum diese Grösse?</p>
          <p className="text-sm text-warning">
            Basiert auf Industrie-Standards: Auto-Werkstatt mit 2 Hebebühnen = 140-185m² (Baseline für Werkstatt-Dimensionierung).
            Professionelle Reparatur-Arbeitsplätze benötigen <strong>12-18m²</strong> (Werkbank + Lagerfläche + Bewegungsraum).
            Workshop-Räume optimal bei <strong>2,4-3,6m Deckenhöhe</strong> (Belüftung + Beleuchtung). Unsere Planung:
            <strong> ~{SPACE_SUMMARY.total_with_circulation}m² effizient genutzter Raum</strong>, nicht 1000m² ineffizient.
          </p>
        </div>
      </Card>

      {/* Zürich Market Research */}
      <Card className="mb-6 border-l-4 border-l-success">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark mb-2">Zürich Marktforschung: Was kostet {SPACE_SUMMARY.total_with_circulation}m²?</h3>
          </div>
          <Badge color="green">Marktdaten 2026</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-xs font-semibold text-success mb-2">Agglomeration (empfohlen)</p>
            <p className="text-sm text-success mb-2">
              <strong>{ZURICH_MARKET_DATA.agglomeration.commercial_space_per_year}</strong> pro m²/Jahr
            </p>
            <p className="text-xs text-success mb-3">
              Standorte: {ZURICH_MARKET_DATA.agglomeration.locations.join(', ')}
            </p>
            <div className="pt-3 border-t border-success/20">
              <p className="text-xs text-success mb-1">Für {SPACE_SUMMARY.total_with_circulation}m²:</p>
              <p className="text-lg font-bold text-success">
                CHF {formatNumber(ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.min)} - {formatNumber(ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.max)} /Jahr
              </p>
              <p className="text-xs text-success mt-1">
                (Realistisch: CHF {formatNumber(ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.realistic)} für gute Lage)
              </p>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-xs font-semibold text-primary mb-2">Stadt Zürich (teurer)</p>
            <p className="text-sm text-primary mb-2">
              <strong>{ZURICH_MARKET_DATA.city_zurich.office_space_per_year}</strong> pro m²/Jahr
            </p>
            <p className="text-xs text-primary mb-3">
              Zentrale Lagen (Kreis 4/5, Zürich West)
            </p>
            <div className="pt-3 border-t border-primary/20">
              <p className="text-xs text-primary mb-1">Für {SPACE_SUMMARY.total_with_circulation}m²:</p>
              <p className="text-lg font-bold text-primary">
                CHF {formatNumber(ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.min)} - {formatNumber(ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.max)} /Jahr
              </p>
              <p className="text-xs text-primary mt-1">
                ({ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.note})
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border-l-4 border-primary p-4 text-sm">
          <p className="font-semibold text-primary mb-1">Quelle & Methodik:</p>
          <p className="text-primary">
            Marktforschung basiert auf Homegate.ch, ImmoScout24, Comparis (Februar 2026). Kategorisierung:
            <strong> Agglomeration</strong> ({ZURICH_MARKET_DATA.agglomeration.locations.join(', ')}) vs. <strong>Stadt Zürich</strong> (Zentrale Lagen).
            Für detaillierte Quellenangaben siehe Methodik-Seite.
          </p>
        </div>
      </Card>

      {/* Multi-Purpose Efficiency Strategy */}
      <Card className="mb-6 border-l-4 border-l-purple-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark mb-2">Multi-Purpose-Strategie: Effizienz durch Zeit-Sharing</h3>
          </div>
          <Badge color="purple">Platzsparend</Badge>
        </div>

        <p className="text-sm text-text-light mb-4">
          Nicht jede Funktion braucht einen eigenen Raum 24/7. Durch intelligente Zeit-Nutzung sparen wir <strong>{MULTI_PURPOSE_STRATEGY.event_space_cafe.sqm_saved}m²</strong>.
        </p>

        <div className="bg-chart-5/10 p-4 rounded-lg mb-4">
          <p className="font-semibold text-chart-5 mb-3">Event-Raum + Café (kombiniert 100m²)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-3 rounded border border-chart-5/20">
              <p className="font-semibold text-chart-5 mb-1">Werktag (9-17 Uhr)</p>
              <p className="text-chart-5">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.weekday_day}</p>
            </div>
            <div className="bg-white p-3 rounded border border-chart-5/20">
              <p className="font-semibold text-chart-5 mb-1">Abends (18-22 Uhr)</p>
              <p className="text-chart-5">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.weekday_evening}</p>
            </div>
            <div className="bg-white p-3 rounded border border-chart-5/20">
              <p className="font-semibold text-chart-5 mb-1">1./3. Samstag</p>
              <p className="text-chart-5">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.saturday_1st_3rd}</p>
            </div>
          </div>
          <p className="text-sm text-chart-5 mt-3">
            <strong>Ersparnis:</strong> Statt 140m² (60m² Café + 80m² Event-Raum separat) nutzen wir 100m² kombiniert.
            Das spart <strong>{MULTI_PURPOSE_STRATEGY.event_space_cafe.sqm_saved}m²</strong> und damit CHF {formatNumber(MULTI_PURPOSE_STRATEGY.event_space_cafe.sqm_saved * 200)}/Jahr Miete.
          </p>
        </div>

        <div className="text-sm text-text-light">
          <p className="font-semibold text-grey-dark mb-2">Weitere Multi-Purpose-Konzepte:</p>
          <ul className="space-y-1">
            <li>• <strong>Schulungsraum + Repair Café:</strong> Werktags Kurse, 1./3. Samstag öffentliche Reparaturen</li>
            <li>• <strong>Makerspace + Synth-Labor:</strong> Geteilte Werkbänke, unterschiedliche Nutzungszeiten</li>
            <li>• <strong>AI Lab + Schulungsraum:</strong> GPUs für Training (nachts) + Workshops (tags)</li>
          </ul>
        </div>
      </Card>
    </section>
  );
}
