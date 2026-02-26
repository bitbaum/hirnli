'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { FoundationFilters, SortField } from '@/lib/domain/foundation-filter';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';
import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import { QUALITY_TIERS, TIER_LABELS, TIER_COLORS } from '@/lib/domain/foundation-helpers';

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

      {/* Schwerpunkte */}
      <CollapsibleSection title="Schwerpunkte" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          {SCHWERPUNKT_IDS.map((id) => {
            const sp = SCHWERPUNKTE[id];
            const themeIdSet = new Set(sp.themeIds);
            const matchingCount = foundations.filter((f) =>
              f.themes.some((t) => themeIdSet.has(t)),
            ).length;
            const isActive = filters.schwerpunkt === id;

            return (
              <button
                key={id}
                onClick={() => setSchwerpunkt(isActive ? null : id)}
                className={`rounded-lg border p-2.5 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{sp.icon}</span>
                  <span className="text-xs font-semibold text-grey-dark">{sp.shortLabel}</span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: sp.color }}>
                  {matchingCount}
                </div>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Themen */}
      <CollapsibleSection title="Themen" defaultOpen count={filters.themes.length || undefined}>
        <div className="space-y-1.5">
          {themeChips.map((chip) => {
            const isSelected = (filters.themes as string[]).includes(chip.id);
            return (
              <label key={chip.id} className="flex cursor-pointer items-center gap-2 text-sm">
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
              className="mt-1 rounded-full bg-grey-light px-2.5 py-1 text-[11px] font-medium text-grey-dark hover:bg-border"
            >
              {filters.themeLogic === 'or' ? 'ODER (mind. eines)' : 'UND (alle)'}
            </button>
          )}
        </div>
      </CollapsibleSection>

      {/* Status */}
      <CollapsibleSection title="Status" count={filters.statuses.length || undefined}>
        <div className="space-y-1.5">
          {statusChips.map((chip) => {
            const isSelected = (filters.statuses as string[]).includes(chip.id);
            return (
              <label key={chip.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStatus(chip.id)}
                  className="rounded border-border"
                />
                <span className={isSelected ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                  {chip.label}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Typ */}
      <CollapsibleSection title="Typ" count={filters.types.length || undefined}>
        <div className="space-y-1.5">
          {typeChips.map((chip) => {
            const isSelected = (filters.types as string[]).includes(chip.id);
            return (
              <label key={chip.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleType(chip.id)}
                  className="rounded border-border"
                />
                <span className={isSelected ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                  {chip.label}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

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
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideNoApplication}
              onChange={toggleHideNoApplication}
              className="rounded border-border"
            />
            Nur mit Bewerbungsweg
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideOperative}
              onChange={toggleHideOperative}
              className="rounded border-border"
            />
            Operative ausblenden
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
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

      {/* Quality Tier */}
      <CollapsibleSection title="Datenqualität" defaultOpen>
        <div className="space-y-1">
          {([...QUALITY_TIERS].reverse()).map((tier) => {
            const isActive = filters.minTier === tier;
            const count = tierCounts[tier];
            return (
              <button
                key={tier}
                onClick={() => setMinTier(tier)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary ring-1 ring-primary/30'
                    : 'text-text-muted hover:bg-bg-light'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${TIER_COLORS[tier].split(' ')[0]}`} />
                  {TIER_LABELS[tier]}
                </span>
                <span className="text-xs tabular-nums">{count.toLocaleString('de-CH')}</span>
              </button>
            );
          })}
          <p className="mt-1 text-[10px] text-text-muted">
            Zeigt alle Stiftungen ab gewählter Stufe.
          </p>
        </div>
      </CollapsibleSection>

      {/* Recherche-Status */}
      <CollapsibleSection title="Recherche-Status">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-white p-2.5 text-center">
            <p className="text-lg font-bold text-grey-dark">{researchStats.total.toLocaleString('de-CH')}</p>
            <p className="text-[10px] text-text-muted">Total</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-2.5 text-center">
            <p className="text-lg font-bold text-success">{researchStats.researchedPercent}%</p>
            <p className="text-[10px] text-text-muted">Recherchiert</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-2.5 text-center">
            <p className={`text-lg font-bold ${researchStats.stale > 10 ? 'text-warning' : 'text-text-light'}`}>
              {researchStats.stale}
            </p>
            <p className="text-[10px] text-text-muted">Veraltet</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{researchStats.avgCompleteness}%</p>
            <p className="text-[10px] text-text-muted">Vollst.</p>
          </div>
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
