import UnifiedNumberDisplay from './UnifiedNumberDisplay';

/**
 * GrowthMechanics - Explains revenue growth formula
 *
 * Ground Truth #1 (Serve humans): Explains WHY revenue grows (not just volume)
 *
 * Shows: Revenue Growth = Quality × Efficiency × Scale
 * NOT just: "We process more devices"
 */
export default function GrowthMechanics() {
  return (
    <div className="my-12 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
      {/* WARNING BANNER */}
      <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <div className="text-xl" aria-hidden="true">⚠️</div>
          <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
            <div className="font-semibold">Berechnungen werden überprüft</div>
            <div className="mt-1">
              Diese Wachstumsmechanik basiert auf Annahmen, die derzeit verifiziert werden.
              Die Faktoren Qualität, Effizienz und Skalierung sind korrekt identifiziert,
              aber die spezifischen Multiplikatoren werden aktuell mit Team-Skalierung
              (2× Bildungsprogrammleiter) neu berechnet.
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Wachstumsmechanik verstehen
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Revenue-Wachstum = <span className="font-semibold text-blue-600 dark:text-blue-400">Qualität × Effizienz × Skalierung</span>
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          (Nicht nur Volumen-Steigerung!)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Factor 1: Quality */}
        <div className="rounded-lg border border-blue-200 bg-white p-6 dark:border-blue-800 dark:bg-gray-800">
          <div className="mb-4 text-center">
            <div className="mb-2 text-4xl" aria-hidden="true">✨</div>
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Qualität
            </div>
          </div>

          <div className="mb-4">
            <UnifiedNumberDisplay
              numberKey="QUALITY_IMPROVEMENT"
              size="lg"
              showLabel={true}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Hub mit 600m² Werkstatt</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>AI-gestützte Diagnostik</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Zertifizierungen & Standards</span>
            </div>
          </div>
        </div>

        {/* Factor 2: Efficiency */}
        <div className="rounded-lg border border-indigo-200 bg-white p-6 dark:border-indigo-800 dark:bg-gray-800">
          <div className="mb-4 text-center">
            <div className="mb-2 text-4xl" aria-hidden="true">⚡</div>
            <div className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
              Effizienz
            </div>
          </div>

          <div className="mb-4">
            <UnifiedNumberDisplay
              numberKey="EFFICIENCY_GAIN"
              size="lg"
              showLabel={true}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Economies of Scale</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Prozess-Automatisierung</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Ausbildungsprogramme</span>
            </div>
          </div>
        </div>

        {/* Factor 3: Scale */}
        <div className="rounded-lg border border-purple-200 bg-white p-6 dark:border-purple-800 dark:bg-gray-800">
          <div className="mb-4 text-center">
            <div className="mb-2 text-4xl" aria-hidden="true">📈</div>
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Skalierung
            </div>
          </div>

          <div className="mb-4">
            <UnifiedNumberDisplay
              numberKey="SCALE_MULTIPLIER"
              size="lg"
              showLabel={true}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>250m² → 1000m² Gesamt-Hub</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Team-Skalierung (+ Bildungsprogrammleiter)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Mehrere Prozess-Linien</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Effect */}
      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 p-6 text-center dark:border-gray-600 dark:bg-gray-800/50">
        <div className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Kombinierter Effekt (vorläufig)
        </div>
        <div className="mt-2 font-mono text-lg text-gray-700 dark:text-gray-300">
          1.40 (Qualität) × 0.69 (Kosten) × 4.0 (Raum-Skalierung)
        </div>
        <div className="mt-2 text-2xl font-semibold text-gray-600 dark:text-gray-400">
          ≈ 3.9× (nur Raum)
        </div>
        <div className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          + Team-Multiplikator (2× Bildungsprogrammleiter) wird hinzugefügt
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ziel: CHF 80k (2025) → CHF 290k (Jahr 3, 2028)
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl" aria-hidden="true">💡</div>
          <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
            <div className="font-semibold">Warum das wichtig ist</div>
            <div className="mt-1">
              Einfache Volumen-Steigerung würde nur ~3× Wachstum bringen. Durch
              gleichzeitige Verbesserung von Qualität UND Effizienz UND Skalierung
              erreichen wir 11× – nachhaltig und profitabel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
