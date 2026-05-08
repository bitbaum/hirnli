'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { ScenarioSelector, BudgetTable, BudgetSummary } from '@/components/budget';
import { getScenario } from '@/lib/domain/budget-calculations';
import { formatNumber } from '@/lib/utils/format';

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
      <h2 className="mb-4 heading-subsection">💰 Budget: Was kostet der Hub?</h2>

      {/* Scenario Selector */}
      <div className="mb-6">
        <ScenarioSelector
          onChange={(scenarioId) => setActiveScenario(scenarioId)}
          initialScenario="moderate"
        />
      </div>

      {/* Active Scenario Description */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <div className="mb-4">
          <h3 className="heading-card mb-2">{scenario.label}</h3>
          <p className="text-sm text-text-light">{scenario.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-sm font-semibold text-primary mb-1">Raumbedarf</p>
            <p className="text-lg font-bold text-primary">
              {scenario.spaceRequirement.min_sqm}–{scenario.spaceRequirement.max_sqm} m²
            </p>
          </div>
          <div className="bg-chart-5/10 p-3 rounded-lg">
            <p className="text-sm font-semibold text-chart-5 mb-1">Zielstiftungen</p>
            <p className="text-lg font-bold text-chart-5">
              Typ {scenario.targetFoundations.join(', ')}
            </p>
          </div>
          <div className="bg-success/10 p-3 rounded-lg">
            <p className="text-sm font-semibold text-success mb-1">Jahr 1 Total</p>
            <p className="text-lg font-bold text-success">
              CHF {formatNumber(
                scenario.threeYearModel.year1.einmalig + scenario.threeYearModel.year1.jaehrlich
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Budget Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Items (2/3 width) */}
        <div className="lg:col-span-2">
          <h3 className="heading-card mb-4">
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
      <Card className="bg-primary/10 border-l-4 border-l-primary">
        <p className="text-sm text-primary mb-2">
          <strong>💡 Transparenz:</strong> Jede Zahl ist klickbar und zeigt Quelle, Methodik und
          Konfidenz-Level.
        </p>
        <p className="text-sm text-primary">
          Alle Beträge basieren auf Marktforschung (Homegate, ImmoScout24, Industriepreise) und
          wurden am letzten Verifizierungsdatum überprüft. Klicken Sie auf eine Budget-Zeile, um
          Details zu sehen.
        </p>
      </Card>
    </section>
  );
}
