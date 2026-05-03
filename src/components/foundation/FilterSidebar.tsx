'use client';

import { FORM_INPUT_CLASS } from '@/lib/utils/form-classes';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { FoundationFilters, SortField, FilterPresetId } from '@/lib/domain/foundation-filter';
import { TRUST_CONFIG, TRUST_LEVELS, type TrustLevel } from '@/lib/config/trust-levels';
import { DEFAULT_FILTERS, FILTER_PRESETS } from '@/lib/domain/foundation-filter';
import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import type { FilterChip } from '@/lib/types/filter';
import { FIT_CONFIG } from '@/lib/config/foundations';
import { SCORING_ENGINE } from '@/lib/config/fit-scoring';
import CheckboxFilterGroup from './filters/CheckboxFilterGroup';
import SchwerpunkteFilter from './filters/SchwerpunkteFilter';
import TierFilter from './filters/TierFilter';

interface SortOption {
  value: SortField;
  label: string;
}

export interface FilterSidebarProps {
  filters: FoundationFilters;
  sort: SortField;
  hasActiveFilters: boolean;
  tierCounts: Record<QualityTier, number>;
  foundations: Foundation[];

  statusChips: FilterChip[];
  typeChips: FilterChip[];
  sortOptions: SortOption[];

  // Handlers
  setSearch: (q: string) => void;
  setSort: (field: SortField) => void;
  toggleStatus: (id: string) => void;
  toggleType: (id: string) => void;
  toggleFit: (value: number) => void;
  setSchwerpunkt: (id: SchwerpunktId | null) => void;
  toggleHideNoApplication: () => void;
  toggleHideOperative: () => void;
  toggleHideNetworks: () => void;
  toggleRequireEmail: () => void;
  toggleRequirePhone: () => void;
  toggleRequireAddress: () => void;
  toggleTrustLevel: (level: TrustLevel) => void;
  setMinTier: (tier: QualityTier) => void;
  togglePriorityLevel: (level: number) => void;
  applyPreset: (presetId: FilterPresetId) => void;
  resetFilters: () => void;
}

/** Build fit level label from SSOT config */
function fitLabel(level: 0 | 1 | 2 | 3): string {
  const fd = FIT_CONFIG[level];
  const threshold = SCORING_ENGINE.display.thresholds.find(t => t.level === level);
  const nextThreshold = SCORING_ENGINE.display.thresholds.find(t => t.level === level + 1);
  if (threshold) {
    const max = nextThreshold ? nextThreshold.minScore - 1 : 10;
    return `${fd.stars} ${fd.label} (${threshold.minScore}-${max})`;
  }
  return `${fd.stars} ${fd.label}`;
}

export default function FilterSidebar({
  filters,
  sort,
  hasActiveFilters,
  tierCounts,
  foundations,
  statusChips,
  typeChips,
  sortOptions,
  setSearch,
  setSort,
  toggleStatus,
  toggleType,
  toggleFit,
  setSchwerpunkt,
  toggleHideNoApplication,
  toggleHideOperative,
  toggleHideNetworks,
  toggleRequireEmail,
  toggleRequirePhone,
  toggleRequireAddress,
  toggleTrustLevel,
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

  const isTopPriority = filters.priorityLevels.length === 2
    && filters.priorityLevels.includes(1)
    && filters.priorityLevels.includes(2);

  return (
    <div className="space-y-1">
      {/* ─── Quick Filters (always visible) ─── */}

      {/* Presets */}
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
          aria-label="Stiftung suchen"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>

      {/* Sort */}
      <div className="border-b border-border pb-3">
        <select
          aria-label="Sortierung"
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

      {/* ─── Relevanz ─── */}

      <SchwerpunkteFilter
        activeSchwerpunkt={filters.schwerpunkt}
        foundations={foundations}
        onSelect={setSchwerpunkt}
      />

      {/* Fit — labels from FIT_DISPLAY config (SSOT) */}
      <CollapsibleSection title="Fit" count={filters.fit.length || undefined}>
        <div className="space-y-1.5">
          {([3, 2, 1, 0] as const).map((value) => {
            const isActive = filters.fit.includes(value);
            return (
              <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleFit(value)}
                  className="rounded border-border"
                />
                <span className={isActive ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                  {fitLabel(value)}
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

      {/* Datenqualität — trust level filter */}
      <CollapsibleSection title="Datenqualität" count={filters.trustLevels.length || undefined}>
        <div className="flex flex-wrap gap-1.5">
          {TRUST_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleTrustLevel(level)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.trustLevels.includes(level)
                  ? 'bg-primary text-white'
                  : 'bg-grey-light text-grey-dark hover:bg-border'
              }`}
            >
              <span className={filters.trustLevels.includes(level) ? 'text-white' : TRUST_CONFIG[level].dotColor}>●</span>
              {TRUST_CONFIG[level].label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* ─── Erweitert (collapsed by default) ─── */}

      <CollapsibleSection title="Erweitert" defaultOpen={false} count={
        (filters.statuses.length > 0 ? 1 : 0) +
        (filters.types.length > 0 ? 1 : 0) +
        (filters.priorityLevels.length > 0 ? 1 : 0) +
        (filters.hideNoApplication ? 1 : 0) +
        (filters.hideOperative ? 1 : 0) +
        (filters.hideNetworks ? 1 : 0) +
        (filters.minTier !== DEFAULT_FILTERS.minTier ? 1 : 0) || undefined
      }>
        <div className="space-y-4">
          {/* Top-Priorität toggle */}
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={isTopPriority}
              onChange={() => {
                if (isTopPriority) {
                  // Clear both
                  togglePriorityLevel(1);
                  togglePriorityLevel(2);
                } else {
                  // Set P1+P2
                  if (!filters.priorityLevels.includes(1)) togglePriorityLevel(1);
                  if (!filters.priorityLevels.includes(2)) togglePriorityLevel(2);
                  // Clear P3+P4 if set
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

          {/* Boolean toggles */}
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
