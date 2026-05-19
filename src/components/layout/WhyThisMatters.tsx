'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
    <div className="mb-8 rounded-lg border border-primary/20 bg-primary/10">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full items-start gap-3 p-4 text-left hover:bg-primary/15 font-normal"
      >
        <div className="flex-shrink-0 text-2xl" aria-hidden="true">
          💡
        </div>
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
            Warum diese Seite?
          </div>
          {isExpanded ? (
            <div className="space-y-2">
              <p className="text-base text-text-primary">
                {purpose}
              </p>
              <p className="text-sm text-primary">
                <span className="font-medium">Zusammenhang:</span> {connection}
              </p>
            </div>
          ) : (
            <p className="text-sm text-primary">
              Klicken um zu sehen, warum diese Seite existiert
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-primary">
          {isExpanded ? '−' : '+'}
        </div>
      </Button>
    </div>
  );
}
