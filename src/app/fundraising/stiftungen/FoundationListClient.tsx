'use client';

import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/ui/FilterBar';
import FoundationCard from '@/components/foundation/FoundationCard';
import { STIFTUNGEN_DATA, THEMES, STATUS_LABELS } from '@/lib/config/foundations';
import { useFoundationFilters } from '@/hooks/useFoundationFilters';
import type { ThemeId, FoundationStatus } from '@/lib/schemas/foundation';

const THEME_CHIPS = Object.values(THEMES).map((t) => ({
  id: t.id,
  label: t.label,
  icon: t.icon,
  color: t.color,
}));

const STATUS_CHIPS = (Object.entries(STATUS_LABELS) as [FoundationStatus, { text: string }][]).map(
  ([id, label]) => ({
    id,
    label: label.text,
  }),
);

export default function FoundationListClient() {
  const {
    filters,
    filtered,
    hasActiveFilters,
    totalCount,
    filteredCount,
    toggleTheme,
    toggleStatus,
    setSearch,
    toggleHideNoApplication,
    resetFilters,
  } = useFoundationFilters(STIFTUNGEN_DATA);

  const highFitCount = filtered.filter((f) => f.fit === 3).length;

  return (
    <div>
      <PageHeader
        title="Stiftungen-Uebersicht"
        subtitle="Alle recherchierten Foerderstiftungen mit Deadlines und Fit-Analyse"
        badge={`${filteredCount}/${totalCount}`}
      />

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-96"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
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
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={filters.hideNoApplication}
              onChange={toggleHideNoApplication}
              className="rounded border-border"
            />
            Nur mit Bewerbungsweg
          </label>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text-muted">
          {filteredCount} Stiftungen gefunden (von {totalCount} total)
          {highFitCount > 0 && ` | ${highFitCount} mit hohem Fit`}
        </span>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-primary hover:underline">
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
