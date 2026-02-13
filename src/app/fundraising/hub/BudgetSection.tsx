'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { ScenarioSelector, BudgetTable, BudgetSummary } from '@/components/budget';
import { getScenario } from '@/lib/config/budget-scenarios';

/**
 * Interactive Budget Section for Hub Page
 *
 * Features:
 * - Scenario switcher (Minimal, Moderate, Maximum)
 * - Expandable line items with source attribution
 * - 3-year financial model
 */

export default function BudgetSection() {
  const [activeScenario, setActiveScenario] = useState('moderate');
  const scenario = getScenario(activeScenario);

  if (!scenario) {
    return <div>Error: Scenario not found</div>;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">💰 Budget: Was kostet der Hub?</h2>

      {/* Scenario Selector */}
      <div className="mb-6">
        <ScenarioSelector
          onChange={(scenarioId) => setActiveScenario(scenarioId)}
          initialScenario="moderate"
        />
      </div>

      {/* Active Scenario Description */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-grey-dark mb-2">{scenario.label}</h3>
          <p className="text-sm text-text-light">{scenario.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Raumbedarf</p>
            <p className="text-lg font-bold text-blue-900">
              {scenario.spaceRequirement.min_sqm}–{scenario.spaceRequirement.max_sqm} m²
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-purple-900 mb-1">Zielstiftungen</p>
            <p className="text-lg font-bold text-purple-900">
              Typ {scenario.targetFoundations.join(', ')}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-green-900 mb-1">Jahr 1 Total</p>
            <p className="text-lg font-bold text-green-900">
              CHF {(
                scenario.threeYearModel.year1.einmalig + scenario.threeYearModel.year1.jaehrlich
              ).toLocaleString('de-CH')}
            </p>
          </div>
        </div>
      </Card>

      {/* Budget Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Items (2/3 width) */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-grey-dark mb-4">
            Budget-Details (klicken für Quellen)
          </h3>
          <BudgetTable scenarioId={activeScenario} />
        </div>

        {/* 3-Year Summary (1/3 width) */}
        <div>
          <BudgetSummary scenario={scenario} />
        </div>
      </div>

      {/* Transparency Note */}
      <Card className="bg-blue-50 border-l-4 border-l-blue-500">
        <p className="text-sm text-blue-900 mb-2">
          <strong>💡 Transparenz:</strong> Jede Zahl ist klickbar und zeigt Quelle, Methodik und
          Konfidenz-Level.
        </p>
        <p className="text-xs text-blue-800">
          Alle Beträge basieren auf Marktforschung (Homegate, ImmoScout24, Industriepreise) und
          wurden am letzten Verifizierungsdatum überprüft. Klicken Sie auf eine Budget-Zeile, um
          Details zu sehen.
        </p>
      </Card>
    </section>
  );
}
