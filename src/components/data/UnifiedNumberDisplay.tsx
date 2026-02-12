'use client';

import { NUMBERS_REGISTRY } from '@/lib/config/numbers';
import { NumberSources } from '@/lib/config/metrics';
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
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);

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
      // Convert legacy metric to InspectorData format
      const data: InspectorData = {
        type: 'number' as const,
        number: {
          id: legacyMetric.id,
          name: legacyMetric.name,
          category: legacyMetric.category,
          dimension: legacyMetric.dimension,
          format: legacyMetric.format,
          formula: legacyMetric.formula,
          validation: legacyMetric.validation,
          documentation: legacyMetric.documentation,
        },
        source: {
          type: legacyMetric.source.type,
          confidence: legacyMetric.source.confidence,
          path: legacyMetric.source.path || '',
          account: legacyMetric.source.account,
          lastUpdated: legacyMetric.source.lastUpdated || undefined,
        },
      };
      setInspectorData(data);
    };

    // Extract value from metric name (workaround - in real usage, value would be passed)
    // For now, show the metric exists and is clickable
    return (
      <div className={className}>
        <MetricCard
          label={legacyMetric.name}
          value="—" // Placeholder - actual value would come from data source
          sourceType={legacyMetric.source.type}
          onClick={handleClick}
        />
        {/* Inspector modal would go here - for now, legacy system handles it */}
      </div>
    );
  }

  // 3. Not found - log error and show placeholder
  console.error(`UnifiedNumberDisplay: Unknown key "${numberKey}"`);

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 ${className}`}>
      <div className="text-sm text-red-700 dark:text-red-300">
        <div className="font-medium">Zahl nicht gefunden</div>
        <div className="mt-1 text-xs">Key: <code>{numberKey}</code></div>
      </div>
    </div>
  );
}
