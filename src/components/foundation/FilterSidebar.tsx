'use client';

import { FORM_INPUT_CLASS } from '@/lib/utils/form-classes';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { FoundationFilters, SortField, FilterPresetId } from '@/lib/domain/foundation-filter';
import { DEFAULT_FILTERS, FILTER_PRESETS } from '@/lib/domain/foundation-filter';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';
import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import type { FilterChip } from '@/lib/types/filter';
import { PRIORITY_CONFIG } from '@/lib/config/foundations';
import CheckboxFilterGroup from './filters/CheckboxFilterGroup';
import SchwerpunkteFilter from './filters/SchwerpunkteFilter';
import TierFilter from './filters/TierFilter';
import ResearchStatsGrid from './filters/ResearchStatsGrid';

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
  toggleRequireEmail: () => void;
  toggleRequirePhone: () => void;
  toggleRequireAddress: () => void;
  setMinTier: (tier: QualityTier) => void;
  togglePriorityLevel: (level: number) => void;
  applyPreset: (presetId: FilterPresetId) => void;
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
  toggleRequireEmail,
  toggleRequirePhone,
  toggleRequireAddress,
  setMinTier,
  togglePriorityLevel,
  applyPreset,
  resetFilters,
}: FilterSidebarProps) {
  // Check if current filters match a preset
  const activePreset = FILTER_PRESETS.find((preset) => {
    const pf = preset.filters;
    const matchesTier = pf.minTier ? filters.minTier === pf.minTier : filters.minTier === DEFAULT_FILTERS.minTier;
    const matchesFit = pf.fit ? JSON.stringify(filters.fit) === JSON.stringify(pf.fit) : filters.fit.length === 0;
    const matchesPriority = pf.priorityLevels
      ? JSON.stringify(filters.priorityLevels) === JSON.stringify(pf.priorityLevels)
      : filters.priorityLevels.length === 0;
    const matchesEmail = pf.requireEmail ? filters.requireEmail === pf.requireEmail : !filters.requireEmail;
    const matchesPhone = pf.requirePhone ? filters.requirePhone === pf.requirePhone : !filters.requirePhone;
    const matchesAddress = pf.requireAddress ? filters.requireAddress === pf.requireAddress : !filters.requireAddress;
    const noOtherFilters =
      filters.themes.length === 0 &&
      filters.types.length === 0 &&
      filters.statuses.length === 0 &&
      !filters.schwerpunkt &&
      !filters.hideOperative &&
      !filters.hideNetworks &&
      !filters.hideNoApplication &&
      !filters.search;
    return matchesTier && matchesFit && matchesPriority && matchesEmail && matchesPhone && matchesAddress && noOtherFilters;
  });

  return (
    <div className="space-y-1">
      {/* Quick-view presets */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {FILTER_PRESETS.map((preset) => {
          const isActive = activePreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-grey-light text-grey-dark hover:bg-border'
              }`}
              title={preset.description}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="pb-3">
        <input
          type="text"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>

      {/* Sort */}
      <div className="border-b border-border pb-3">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
          className={FORM_INPUT_CLASS}
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
              className="mt-1 min-h-11 rounded-full bg-grey-light px-2.5 py-1 text-xs font-medium text-grey-dark hover:bg-border"
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
                ? '★★★ Exzellent (7-10)'
                : value === 2
                  ? '★★☆ Gut (4-6)'
                  : value === 1
                    ? '★☆☆ Gering (1-3)'
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
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Priority level */}
      <CollapsibleSection title="Priorität" count={filters.priorityLevels.length || undefined}>
        <div className="space-y-1.5">
          {([1, 2, 3, 4] as const).map((level) => {
            const pc = PRIORITY_CONFIG[level];
            const filterLabel = `${pc.label} — ${pc.description.split(' — ')[0]}`;
            const isActive = filters.priorityLevels.includes(level);
            return (
              <label key={level} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => togglePriorityLevel(level)}
                  className="rounded border-border"
                />
                <span className={isActive ? `font-medium ${pc.textColor}` : 'text-text-muted'}>
                  {filterLabel}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Erreichbarkeit — compact toggle pills */}
      <CollapsibleSection title="Erreichbarkeit" count={
        (filters.requireEmail ? 1 : 0) + (filters.requirePhone ? 1 : 0) + (filters.requireAddress ? 1 : 0) || undefined
      }>
        <div className="flex flex-wrap gap-1.5">
          {([
            { active: filters.requireEmail, toggle: toggleRequireEmail, label: 'E-Mail' },
            { active: filters.requirePhone, toggle: toggleRequirePhone, label: 'Telefon' },
            { active: filters.requireAddress, toggle: toggleRequireAddress, label: 'Adresse' },
          ] as const).map(({ active, toggle, label }) => (
            <button
              key={label}
              onClick={toggle}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-grey-light text-grey-dark hover:bg-border'
              }`}
            >
              {label}
            </button>
          ))}
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
            Mit Bewerbungsweg
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
