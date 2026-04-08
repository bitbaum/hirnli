'use client';

import { useState } from 'react';
import { BUDGET_SCENARIOS } from '@/lib/config/budget-scenarios';

/**
 * ScenarioSelector Component
 *
 * Tab switcher for budget scenarios (Minimal, Moderate, Maximum).
 * Triggers onChange callback when user switches scenarios.
 */

interface ScenarioSelectorProps {
  onChange: (scenarioId: string) => void;
  initialScenario?: string;
  className?: string;
}

export default function ScenarioSelector({
  onChange,
  initialScenario = 'moderate',
  className = '',
}: ScenarioSelectorProps) {
  const [activeScenario, setActiveScenario] = useState(initialScenario);

  const handleChange = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    onChange(scenarioId);
  };

  const scenarioIcons = {
    minimal: '🎯',
    moderate: '⭐',
    maximum: '🚀',
  };

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border">
        {BUDGET_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleChange(scenario.id)}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeScenario === scenario.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-light hover:text-grey-dark'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{scenarioIcons[scenario.id]}</span>
              <span>{scenario.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Active scenario tagline */}
      <div className="mt-3 px-1">
        <p className="text-sm text-text-light italic">
          {BUDGET_SCENARIOS.find((s) => s.id === activeScenario)?.tagline}
        </p>
      </div>
    </div>
  );
}
