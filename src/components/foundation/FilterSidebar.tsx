'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { FoundationFilters, SortField } from '@/lib/domain/foundation-filter';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';
import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import CheckboxFilterGroup from './filters/CheckboxFilterGroup';
import SchwerpunkteFilter from './filters/SchwerpunkteFilter';
import TierFilter from './filters/TierFilter';
import ResearchStatsGrid from './filters/ResearchStatsGrid';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface SortOption {
  value: SortField;
  label: string;
}

interface FilterSidebarProps {
  filters: FoundationFilters;
  sort: SortField;
  hasActiveFilters: boolean;
  tierCounts: Record<QualityTier, number>;
  researchStats: ResearchStats;
  foundations: Foundation[];

  themeChips: FilterChip[];
  statusChips: FilterChip[];
  typeChips: FilterChip[];
  sortOptions: SortOption[];

  // Handlers
  setSearch: (q: string) => void;
  setSort: (field: SortField) => void;
  toggleTheme: (id: string) => void;
  toggleStatus: (id: string) => void;
  toggleType: (id: string) => void;
  toggleFit: (value: number) => void;
  toggleThemeLogic: () => void;
  setSchwerpunkt: (id: SchwerpunktId | null) => void;
  toggleHideNoApplication: () => void;
  toggleHideOperative: () => void;
  toggleHideNetworks: () => void;
  setMinTier: (tier: QualityTier) => void;
  resetFilters: () => void;
}

export default function FilterSidebar({
  filters,
  sort,
  hasActiveFilters,
  tierCounts,
  researchStats,
  foundations,
  themeChips,
  statusChips,
  typeChips,
  sortOptions,
  setSearch,
  setSort,
  toggleTheme,
  toggleStatus,
  toggleType,
  toggleFit,
  toggleThemeLogic,
  setSchwerpunkt,
  toggleHideNoApplication,
  toggleHideOperative,
  toggleHideNetworks,
  setMinTier,
  resetFilters,
}: FilterSidebarProps) {
  return (
    <div className="space-y-1">
      {/* Search */}
      <div className="pb-3">
        <input
          type="text"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Sort */}
      <div className="border-b border-border pb-3">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <SchwerpunkteFilter
        activeSchwerpunkt={filters.schwerpunkt}
        foundations={foundations}
        onSelect={setSchwerpunkt}
      />

      {/* Themen — needs theme logic toggle, so inline */}
      <CollapsibleSection title="Themen" defaultOpen count={filters.themes.length || undefined}>
        <div className="space-y-1.5">
          {themeChips.map((chip) => {
            const isSelected = (filters.themes as string[]).includes(chip.id);
            return (
              <label key={chip.id} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTheme(chip.id)}
                  className="rounded border-border"
                />
                <span className={isSelected ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                  {chip.icon && <span className="mr-1">{chip.icon}</span>}
                  {chip.label}
                </span>
              </label>
            );
          })}
          {filters.themes.length > 1 && (
            <button
              onClick={toggleThemeLogic}
              className="mt-1 min-h-11 rounded-full bg-grey-light px-2.5 py-1 text-[11px] font-medium text-grey-dark hover:bg-border"
            >
              {filters.themeLogic === 'or' ? 'ODER (mind. eines)' : 'UND (alle)'}
            </button>
          )}
        </div>
      </CollapsibleSection>

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

      {/* Fit */}
      <CollapsibleSection title="Fit" count={filters.fit.length || undefined}>
        <div className="space-y-1.5">
          {[3, 2, 1, 0].map((value) => {
            const isActive = filters.fit.includes(value);
            const label =
              value === 3
                ? '★★★'
                : value === 2
                  ? '★★☆'
                  : value === 1
                    ? '★☆☆'
                    : '○○○ Nicht geprüft';
            return (
              <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleFit(value)}
                  className="rounded border-border"
                />
                <span className={isActive ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                  {value > 0 ? `${label} (${value})` : label}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Boolean toggles */}
      <div className="border-b border-border py-3">
        <div className="space-y-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideNoApplication}
              onChange={toggleHideNoApplication}
              className="rounded border-border"
            />
            Nur mit Bewerbungsweg
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideOperative}
              onChange={toggleHideOperative}
              className="rounded border-border"
            />
            Operative ausblenden
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideNetworks}
              onChange={toggleHideNetworks}
              className="rounded border-border"
            />
            Netzwerke ausblenden
          </label>
        </div>
      </div>

      <TierFilter
        activeTier={filters.minTier}
        tierCounts={tierCounts}
        onSelect={setMinTier}
      />

      <ResearchStatsGrid stats={researchStats} />

      {/* Reset */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={resetFilters}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-muted hover:bg-bg-light hover:text-grey-dark"
          >
            Alle Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
