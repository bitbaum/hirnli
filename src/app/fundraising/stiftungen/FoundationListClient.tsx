'use client';

import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/ui/FilterBar';
import FoundationCard from '@/components/foundation/FoundationCard';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { useFoundationFilters } from '@/hooks/useFoundationFilters';
import type { SortField } from '@/lib/domain/foundation-filter';
import {
  THEME_CHIPS,
  STATUS_CHIPS,
  TYPE_CHIPS,
  SORT_OPTIONS,
  FIT_OPTIONS,
} from './data';

export default function FoundationListClient() {
  const {
    filters,
    sort,
    filtered,
    hasActiveFilters,
    totalCount,
    filteredCount,
    toggleTheme,
    toggleType,
    toggleStatus,
    setSearch,
    setSort,
    setFit,
    toggleHideNoApplication,
    toggleHideOperative,
    toggleHideNetworks,
    resetFilters,
  } = useFoundationFilters(STIFTUNGEN_DATA);

  const highFitCount = filtered.filter((f) => f.fit === 3).length;
  const openCount = filtered.filter(
    (f) => f.status === 'open' || f.status === 'rolling',
  ).length;

  return (
    <div>
      <PageHeader
        title="Stiftungen-Uebersicht"
        subtitle="Alle recherchierten Foerderstiftungen mit Deadlines und Fit-Analyse"
        badge={`${filteredCount}/${totalCount}`}
      />

      {/* Search + Sort row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-96"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
          className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter rows */}
      <div className="mb-4 space-y-3">
        <FilterBar
          label="Themen"
          chips={THEME_CHIPS}
          selected={filters.themes}
          onToggle={toggleTheme}
        />
        <FilterBar
          label="Status"
          chips={STATUS_CHIPS}
          selected={filters.statuses}
          onToggle={toggleStatus}
        />
        <FilterBar
          label="Typ"
          chips={TYPE_CHIPS}
          selected={filters.types}
          onToggle={toggleType}
        />

        {/* Fit filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Fit:
          </span>
          {FIT_OPTIONS.map((opt) => {
            const isActive = filters.fit === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setFit(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-grey-light text-grey-dark hover:bg-border'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Checkbox toggles */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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

      {/* Results summary */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text-muted">
          {filteredCount} von {totalCount} Stiftungen
          {highFitCount > 0 && ` | ${highFitCount} mit hohem Fit`}
          {openCount > 0 && ` | ${openCount} offen`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-primary hover:underline"
          >
            Filter zuruecksetzen
          </button>
        )}
      </div>

      {/* Foundation list */}
      <div className="space-y-3">
        {filtered.map((f) => (
          <FoundationCard key={f.slug} foundation={f} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-bg-light p-8 text-center text-text-muted">
            Keine Stiftungen gefunden. Versuche andere Filter.
          </div>
        )}
      </div>
    </div>
  );
}
