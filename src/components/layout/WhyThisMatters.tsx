'use client';

import { useState } from 'react';

interface WhyThisMattersProps {
  purpose: string;
  connection: string;
}

/**
 * WhyThisMatters - Banner explaining page purpose
 *
 * Ground Truth #1 (Serve humans): Every page should explain WHY it exists
 *
 * Shows at top of each page to orient the reader
 */
export default function WhyThisMatters({ purpose, connection }: WhyThisMattersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-blue-100"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Zweck verbergen' : 'Zweck anzeigen'}
      >
        <div className="flex-shrink-0 text-2xl" aria-hidden="true">
          💡
        </div>
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium uppercase tracking-wider text-blue-700">
            Warum diese Seite?
          </div>
          {isExpanded ? (
            <div className="space-y-2">
              <p className="text-base text-blue-900">
                {purpose}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Zusammenhang:</span> {connection}
              </p>
            </div>
          ) : (
            <p className="text-sm text-blue-700">
              Klicken um zu sehen, warum diese Seite existiert
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-blue-600">
          {isExpanded ? '−' : '+'}
        </div>
      </button>
    </div>
  );
}
