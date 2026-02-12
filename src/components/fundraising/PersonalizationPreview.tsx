/**
 * Personalization Preview - Shows customized Gesuch
 *
 * Displays which rules were applied and resulting customizations.
 */

'use client';

import { useState, useEffect } from 'react';

interface PersonalizationPreviewProps {
  foundationId: string;
}

interface PersonalizedGesuch {
  foundation: any;
  appliedRules: Array<{
    ruleId: string;
    type: string;
    value: string;
    rationale: string;
    priority: number;
  }>;
  customizations: {
    emphasizedNarratives: string[];
    visibleBudgetModules: string[];
    hiddenBudgetModules: string[];
    toneAdjustments: string[];
    additionalSections: Array<{ section: string; content: string }>;
    sectionOrder: string[];
  };
  summary: string;
}

export function PersonalizationPreview({ foundationId }: PersonalizationPreviewProps) {
  const [data, setData] = useState<PersonalizedGesuch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePreview() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/customizations/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundationId }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to generate preview:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    generatePreview();
  }, [foundationId]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-gray-500">Generiere Vorschau...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fehler: {error}</p>
        <button
          onClick={generatePreview}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500">Keine Personalisierung verfügbar</p>
      </div>
    );
  }

  const { appliedRules, customizations, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Personalisierung Zusammenfassung
        </h3>
        <div className="text-sm text-blue-800 whitespace-pre-wrap">{summary}</div>
      </div>

      {/* Applied Rules */}
      {appliedRules.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Angewendete Regeln ({appliedRules.length})
          </h3>
          <div className="space-y-3">
            {appliedRules.map((rule, index) => (
              <div
                key={rule.ruleId}
                className="border-l-4 border-blue-400 pl-4 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    P{rule.priority}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {rule.type}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-1">{rule.value}</div>
                {rule.rationale && (
                  <div className="text-xs text-gray-500 italic">
                    → {rule.rationale}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emphasized Narratives */}
      {customizations.emphasizedNarratives.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            ✨ Hervorgehobene Narrative
          </h3>
          <ul className="space-y-2">
            {customizations.emphasizedNarratives.map((narrative, index) => (
              <li key={index} className="text-sm text-green-800">
                • {narrative}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Budget Modules */}
      {(customizations.visibleBudgetModules.length > 0 ||
        customizations.hiddenBudgetModules.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💰 Budget Module
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {customizations.visibleBudgetModules.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">
                  Angezeigt:
                </h4>
                <ul className="space-y-1">
                  {customizations.visibleBudgetModules.map((module, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      ✓ {module}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {customizations.hiddenBudgetModules.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">
                  Ausgeblendet:
                </h4>
                <ul className="space-y-1">
                  {customizations.hiddenBudgetModules.map((module, index) => (
                    <li key={index} className="text-sm text-gray-500">
                      ✗ {module}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Sections */}
      {customizations.additionalSections.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            ➕ Zusätzliche Abschnitte
          </h3>
          <div className="space-y-3">
            {customizations.additionalSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-sm font-medium text-purple-800 mb-1">
                  {section.section}
                </h4>
                <p className="text-sm text-purple-700">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={generatePreview}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Vorschau aktualisieren
        </button>
      </div>
    </div>
  );
}
