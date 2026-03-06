import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  ZURICH_MARKET_DATA,
  SPACE_SUMMARY,
  MULTI_PURPOSE_STRATEGY,
} from '@/lib/config/hub-space-plan';

export default function SpacePlanningSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">📐 Raumplanung: Wie gross? Warum? Was kostet es?</h2>
      <p className="text-sm text-text-light mb-6">
        Detaillierte Begründung für jede Fläche — basierend auf Industrie-Standards, Zürich-Marktforschung und Multi-Purpose-Strategie.
      </p>

      {/* Total Space Summary */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark mb-2">Gesamt-Raumkonzept</h3>
            <p className="text-2xl font-bold text-blue-900">{SPACE_SUMMARY.total_with_circulation} m²</p>
          </div>
          <Badge color="blue">Realistisch</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Kerngeschäft</p>
            <p className="text-lg font-bold text-blue-900">{SPACE_SUMMARY.by_category.core_business.total_sqm} m²</p>
            <p className="text-xs text-blue-800">Shop + Werkstatt + Lager</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-purple-900 mb-1">Innovation & Bildung</p>
            <p className="text-lg font-bold text-purple-900">{SPACE_SUMMARY.by_category.innovation.total_sqm} m²</p>
            <p className="text-xs text-purple-800">Makerspace + AI Lab + Schulung</p>
          </div>
          <div className="bg-pink-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-pink-900 mb-1">Kultur & Community</p>
            <p className="text-lg font-bold text-pink-900">{SPACE_SUMMARY.by_category.culture_community.total_sqm} m²</p>
            <p className="text-xs text-pink-800">Events + Café + Repair Café</p>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-sm">
          <p className="font-semibold text-amber-900 mb-2">Warum diese Grösse?</p>
          <p className="text-xs text-amber-800">
            Basiert auf Industrie-Standards: Auto-Werkstatt mit 2 Hebebühnen = 140-185m² (Baseline für Werkstatt-Dimensionierung).
            Professionelle Reparatur-Arbeitsplätze benötigen <strong>12-18m²</strong> (Werkbank + Lagerfläche + Bewegungsraum).
            Workshop-Räume optimal bei <strong>2,4-3,6m Deckenhöhe</strong> (Belüftung + Beleuchtung). Unsere Planung:
            <strong> ~{SPACE_SUMMARY.total_with_circulation}m² effizient genutzter Raum</strong>, nicht 1000m² ineffizient.
          </p>
        </div>
      </Card>

      {/* Zürich Market Research */}
      <Card className="mb-6 border-l-4 border-l-green-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-dark mb-2">Zürich Marktforschung: Was kostet {SPACE_SUMMARY.total_with_circulation}m²?</h3>
          </div>
          <Badge color="green">Marktdaten 2026</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-green-900 mb-2">Agglomeration (empfohlen)</p>
            <p className="text-sm text-green-800 mb-2">
              <strong>{ZURICH_MARKET_DATA.agglomeration.commercial_space_per_year}</strong> pro m²/Jahr
            </p>
            <p className="text-xs text-green-700 mb-3">
              Standorte: {ZURICH_MARKET_DATA.agglomeration.locations.join(', ')}
            </p>
            <div className="pt-3 border-t border-green-200">
              <p className="text-xs text-green-700 mb-1">Für {SPACE_SUMMARY.total_with_circulation}m²:</p>
              <p className="text-lg font-bold text-green-900">
                CHF {ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.min.toLocaleString('de-CH')} - {ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.max.toLocaleString('de-CH')} /Jahr
              </p>
              <p className="text-xs text-green-700 mt-1">
                (Realistisch: CHF {ZURICH_MARKET_DATA.estimate_for_600m2.agglomeration.realistic.toLocaleString('de-CH')} für gute Lage)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Stadt Zürich (teurer)</p>
            <p className="text-sm text-blue-800 mb-2">
              <strong>{ZURICH_MARKET_DATA.city_zurich.office_space_per_year}</strong> pro m²/Jahr
            </p>
            <p className="text-xs text-blue-700 mb-3">
              Zentrale Lagen (Kreis 4/5, Zürich West)
            </p>
            <div className="pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Für {SPACE_SUMMARY.total_with_circulation}m²:</p>
              <p className="text-lg font-bold text-blue-900">
                CHF {ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.min.toLocaleString('de-CH')} - {ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.max.toLocaleString('de-CH')} /Jahr
              </p>
              <p className="text-xs text-blue-700 mt-1">
                ({ZURICH_MARKET_DATA.estimate_for_600m2.city_zurich.note})
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-xs">
          <p className="font-semibold text-blue-900 mb-1">Quelle & Methodik:</p>
          <p className="text-blue-800">
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

        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <p className="font-semibold text-purple-900 mb-3">Event-Raum + Café (kombiniert 100m²)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Werktag (9-17 Uhr)</p>
              <p className="text-purple-800">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.weekday_day}</p>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Abends (18-22 Uhr)</p>
              <p className="text-purple-800">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.weekday_evening}</p>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">1./3. Samstag</p>
              <p className="text-purple-800">{MULTI_PURPOSE_STRATEGY.event_space_cafe.time_sharing.saturday_1st_3rd}</p>
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-3">
            <strong>Ersparnis:</strong> Statt 140m² (60m² Café + 80m² Event-Raum separat) nutzen wir 100m² kombiniert.
            Das spart <strong>{MULTI_PURPOSE_STRATEGY.event_space_cafe.sqm_saved}m²</strong> und damit CHF {(MULTI_PURPOSE_STRATEGY.event_space_cafe.sqm_saved * 200).toLocaleString('de-CH')}/Jahr Miete.
          </p>
        </div>

        <div className="text-xs text-text-light">
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
