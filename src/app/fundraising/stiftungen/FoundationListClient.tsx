'use client';

import { useState, useEffect } from 'react';
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
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

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
    toggleOnlyResearched,
    resetFilters,
  } = useFoundationFilters(STIFTUNGEN_DATA);

  // Foundation slugs that already have a pipeline entry
  const [pipelineSlugs, setPipelineSlugs] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const slugs = new Set<string>(
            // foundationId stores the slug (set by AddToPipelineButton)
            result.data
              .map((item: { application: { foundationId: string } }) => item.application.foundationId)
              .filter(Boolean),
          );
          setPipelineSlugs(slugs);
        }
      })
      .catch(() => {}); // non-critical, silently ignore
  }, []);

  const highFitCount = filtered.filter((f) => f.fit === 3).length;
  const openCount = filtered.filter(
    (f) => f.status === 'open' || f.status === 'rolling',
  ).length;
  const researchedCount = filtered.filter((f) => f.purposeSummary && !f.needsResearch).length;

  return (
    <div>
      <PageHeader
        title="Stiftungen-Übersicht"
        subtitle="Alle recherchierten Förderstiftungen mit Deadlines und Fit-Analyse"
        badge={`${filteredCount}/${totalCount}`}
      />

      <WhyThisMatters
        purpose={`${totalCount} Förderstiftungen recherchiert, nach Fit analysiert, mit Deadlines und Kontaktdaten.`}
        connection="Jede Stiftung hat eine eigene Detailseite mit massgeschneidertem Gesuch (siehe einzelne Stiftung)."
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
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              checked={filters.onlyResearched}
              onChange={toggleOnlyResearched}
              className="rounded border-primary"
            />
            Nur recherchierte
          </label>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text-muted">
          {filteredCount} von {totalCount} Stiftungen
          {highFitCount > 0 && ` | ${highFitCount} mit hohem Fit`}
          {openCount > 0 && ` | ${openCount} offen`}
          {researchedCount > 0 && ` | ${researchedCount} recherchiert`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-primary hover:underline"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Foundation list */}
      <div className="space-y-3">
        {filtered.map((f) => (
          <FoundationCard key={f.slug} foundation={f} inPipeline={pipelineSlugs.has(f.slug)} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-bg-light p-8 text-center text-text-muted">
            Keine Stiftungen gefunden. Versuche andere Filter.
          </div>
        )}
      </div>

      <StoryBridge bridges={STORY_BRIDGES.stiftungen || []} />
    </div>
  );
}
