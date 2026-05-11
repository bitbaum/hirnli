'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import CheckboxFilterGroup from './filters/CheckboxFilterGroup';
import TierFilter from './filters/TierFilter';
import type { FoundationFilters } from '@/lib/domain/foundation-filter';
import { DEFAULT_FILTERS } from '@/lib/domain/foundation-filter';
import type { QualityTier } from '@/lib/schemas/foundation';
import type { FilterChip } from '@/lib/types/filter';
import { FORM_CHECKBOX_LABEL_CLASS } from '@/lib/utils/form-classes';

interface FilterSidebarAdvancedProps {
  filters: FoundationFilters;
  tierCounts: Record<QualityTier, number>;
  statusChips: FilterChip[];
  typeChips: FilterChip[];
  toggleStatus: (id: string) => void;
  toggleType: (id: string) => void;
  togglePriorityLevel: (level: number) => void;
  toggleHideNoApplication: () => void;
  toggleHideOperative: () => void;
  toggleHideNetworks: () => void;
  setMinTier: (tier: QualityTier) => void;
}

export default function FilterSidebarAdvanced({
  filters,
  tierCounts,
  statusChips,
  typeChips,
  toggleStatus,
  toggleType,
  togglePriorityLevel,
  toggleHideNoApplication,
  toggleHideOperative,
  toggleHideNetworks,
  setMinTier,
}: FilterSidebarAdvancedProps) {
  const isTopPriority =
    filters.priorityLevels.length === 2 &&
    filters.priorityLevels.includes(1) &&
    filters.priorityLevels.includes(2);

  const activeCount =
    (filters.statuses.length > 0 ? 1 : 0) +
    (filters.types.length > 0 ? 1 : 0) +
    (filters.priorityLevels.length > 0 ? 1 : 0) +
    (filters.hideNoApplication ? 1 : 0) +
    (filters.hideOperative ? 1 : 0) +
    (filters.hideNetworks ? 1 : 0) +
    (filters.minTier !== DEFAULT_FILTERS.minTier ? 1 : 0);

  return (
    <CollapsibleSection title="Erweitert" defaultOpen={false} count={activeCount || undefined}>
      <div className="space-y-4">
        {/* Top-Priorität toggle */}
        <label className={`${FORM_CHECKBOX_LABEL_CLASS} text-text-muted`}>
          <input
            type="checkbox"
            checked={isTopPriority}
            onChange={() => {
              if (isTopPriority) {
                togglePriorityLevel(1);
                togglePriorityLevel(2);
              } else {
                if (!filters.priorityLevels.includes(1)) togglePriorityLevel(1);
                if (!filters.priorityLevels.includes(2)) togglePriorityLevel(2);
                if (filters.priorityLevels.includes(3)) togglePriorityLevel(3);
                if (filters.priorityLevels.includes(4)) togglePriorityLevel(4);
              }
            }}
            className="rounded border-border"
          />
          Top-Priorität (P1 + P2)
        </label>

        <CheckboxFilterGroup
          title="Status"
          chips={statusChips}
          selected={filters.statuses}
          onToggle={toggleStatus}
        />

        <CheckboxFilterGroup
          title="Typ"
          chips={typeChips}
          selected={filters.types}
          onToggle={toggleType}
        />

        <div className="space-y-2">
          <label className={`${FORM_CHECKBOX_LABEL_CLASS} text-text-muted`}>
            <input
              type="checkbox"
              checked={filters.hideNoApplication}
              onChange={toggleHideNoApplication}
              className="rounded border-border"
            />
            Mit Bewerbungsweg
          </label>
          <label className={`${FORM_CHECKBOX_LABEL_CLASS} text-text-muted`}>
            <input
              type="checkbox"
              checked={filters.hideOperative}
              onChange={toggleHideOperative}
              className="rounded border-border"
            />
            Operative ausblenden
          </label>
          <label className={`${FORM_CHECKBOX_LABEL_CLASS} text-text-muted`}>
            <input
              type="checkbox"
              checked={filters.hideNetworks}
              onChange={toggleHideNetworks}
              className="rounded border-border"
            />
            Netzwerke ausblenden
          </label>
        </div>

        <TierFilter
          activeTier={filters.minTier}
          tierCounts={tierCounts}
          onSelect={setMinTier}
        />

        <a
          href="/fundraising/scoring-methodik"
          className="block text-sm text-text-muted hover:text-primary"
        >
          Scoring-Methodik verstehen →
        </a>
      </div>
    </CollapsibleSection>
  );
}
