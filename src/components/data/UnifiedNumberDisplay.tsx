'use client';

import { NUMBERS_REGISTRY } from '@/lib/config/numbers';
import { NumberSources, SOURCE_TYPE_MAP } from '@/lib/config/metrics';
import { NumberWithSource } from '@/components/data/NumberWithSource';
import MetricCard from '@/components/metrics/MetricCard';
import { useState } from 'react';
import type { InspectorData } from '@/lib/schemas/inspector';

interface UnifiedNumberDisplayProps {
  numberKey: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

/**
 * UnifiedNumberDisplay - Universal interface for both number registries
 *
 * Ground Truth #2 (SSOT): Bridges NUMBERS_REGISTRY (new) + NumberSources (legacy)
 * Ground Truth #5 (Simplicity scales): Single interface, auto-detects source
 *
 * Strategy: Keep both registries (they serve different purposes)
 * - NUMBERS_REGISTRY: Projection metrics (3-year plan, fundraising targets)
 * - NumberSources: Operational metrics (historical data, live Kivitendo)
 *
 * Usage:
 *   <UnifiedNumberDisplay numberKey="CO2_SAVED_PER_LAPTOP" size="xl" />
 *   <UnifiedNumberDisplay numberKey="financial_total_2025" />
 */
export default function UnifiedNumberDisplay({
  numberKey,
  size = 'md',
  showLabel = true,
  className = '',
}: UnifiedNumberDisplayProps) {
  const [_inspectorData, setInspectorData] = useState<InspectorData | null>(null);

  // 1. Try NUMBERS_REGISTRY first (new system)
  if (numberKey in NUMBERS_REGISTRY) {
    return (
      <NumberWithSource
        numberKey={numberKey as keyof typeof NUMBERS_REGISTRY}
        size={size}
        showLabel={showLabel}
        className={className}
      />
    );
  }

  // 2. Fall back to NumberSources (legacy system)
  const legacyMetric = NumberSources[numberKey];
  if (legacyMetric) {
    const handleClick = () => {
      const data: InspectorData = {
        label: legacyMetric.name,
        value: '—',
        sourceType: SOURCE_TYPE_MAP[legacyMetric.source.type] ?? 'none',
        source: legacyMetric.source.path || '',
        account: legacyMetric.source.account,
        formula: legacyMetric.formula?.expression,
        confidence: legacyMetric.source.confidence,
      };
      setInspectorData(data);
    };

    return (
      <div className={className}>
        <MetricCard
          label={legacyMetric.name}
          value="—"
          sourceType={SOURCE_TYPE_MAP[legacyMetric.source.type] ?? 'none'}
          onClick={handleClick}
        />
        {/* Inspector modal would go here - for now, legacy system handles it */}
      </div>
    );
  }

  // 3. Not found - log error and show placeholder
  console.error(`UnifiedNumberDisplay: Unknown key "${numberKey}"`);

  return (
    <div className={`rounded-lg border border-danger/20 bg-danger/10 p-4 ${className}`}>
      <div className="text-sm text-danger">
        <div className="font-medium">Zahl nicht gefunden</div>
        <div className="mt-1 text-xs">Key: <code>{numberKey}</code></div>
      </div>
    </div>
  );
}
