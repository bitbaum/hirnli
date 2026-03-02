'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FORM_INPUT_CLASS } from '@/lib/utils/form-classes';
import PageHeader from '@/components/layout/PageHeader';
import FoundationCard from '@/components/foundation/FoundationCard';
import FilterSidebar from '@/components/foundation/FilterSidebar';
import FilterDrawer from '@/components/foundation/FilterDrawer';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { useFoundationFilters } from '@/hooks/useFoundationFilters';
import { computeResearchStats } from '@/lib/domain/foundation-research-stats';
import { computeTierCounts } from '@/lib/domain/foundation-helpers';
import type { SortField } from '@/lib/domain/foundation-filter';
import {
  THEME_CHIPS,
  STATUS_CHIPS,
  TYPE_CHIPS,
  SORT_OPTIONS,
  SWISS_FOUNDATION_UNIVERSE,
  REGISTRY_COUNT,
  FUNNEL_STAGES,
} from './data';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

const LOAD_MORE_COUNT = 50;

/** Count of active non-default filters (for mobile badge) */
function countActiveFilters(
  filters: ReturnType<typeof useFoundationFilters>['filters'],
): number {
  let count = 0;
  if (filters.themes.length > 0) count++;
  if (filters.types.length > 0) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.fit.length > 0) count++;
  if (filters.schwerpunkt) count++;
  if (filters.hideNoApplication) count++;
  if (filters.hideOperative) count++;
  if (filters.hideNetworks) count++;
  if (filters.minTier !== 'profiliert') count++;
  return count;
}

export default function FoundationListClient() {
  const {
    filters,
    sort,
    filtered,
    scoreMap,
    hasActiveFilters,
    totalCount,
    filteredCount,
    toggleTheme,
    toggleType,
    toggleStatus,
    setSearch,
    setSort,
    toggleFit,
    toggleThemeLogic,
    setSchwerpunkt,
    toggleHideNoApplication,
    toggleHideOperative,
    toggleHideNetworks,
    setMinTier,
    resetFilters,
  } = useFoundationFilters(STIFTUNGEN_DATA);

  // Progressive loading — reset to initial count when filters change
  const [visibleCount, setVisibleCount] = useState(LOAD_MORE_COUNT);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets pagination when filters/sort change
    setVisibleCount(LOAD_MORE_COUNT);
  }, [filters, sort]);

  const showMore = useCallback(() => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  }, []);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Foundation slugs that already have a pipeline entry
  const [pipelineSlugs, setPipelineSlugs] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const slugs = new Set<string>(
            result.data
              .map((item: { application: { foundationId: string } }) => item.application.foundationId)
              .filter(Boolean),
          );
          setPipelineSlugs(slugs);
        }
      })
      .catch((err) => console.error('Failed to load pipeline data:', err));
  }, []);

  // Research stats — computed once from the full dataset (static data)
  const researchStats = useMemo(() => computeResearchStats(STIFTUNGEN_DATA), []);
  const tierCounts = useMemo(() => computeTierCounts(STIFTUNGEN_DATA), []);

  const highFitCount = filtered.filter((f) => f.fit === 3).length;
  const openCount = filtered.filter(
    (f) => f.status === 'open' || f.status === 'rolling',
  ).length;

  // Gesuch-ready count (priority ≤ 2, tier >= recherchiert)
  const gesuchReadyCount = useMemo(
    () =>
      STIFTUNGEN_DATA.filter(
        (f) => f.priority <= 2 && !f.needsResearch,
      ).length,
    [],
  );

  // Funnel numbers — mix of static approximations and computed values
  const funnelNumbers: Record<string, number> = useMemo(
    () => ({
      universe: SWISS_FOUNDATION_UNIVERSE,
      registry: REGISTRY_COUNT,
      pipeline: totalCount,
      recherchiert: tierCounts.recherchiert + tierCounts.anwendungsbereit,
      gesuchReady: gesuchReadyCount,
    }),
    [totalCount, tierCounts, gesuchReadyCount],
  );

  const activeFilterCount = countActiveFilters(filters);

  // Shared sidebar props
  const sidebarProps = {
    filters,
    sort,
    hasActiveFilters,
    tierCounts,
    researchStats,
    foundations: STIFTUNGEN_DATA,
    themeChips: THEME_CHIPS,
    statusChips: STATUS_CHIPS,
    typeChips: TYPE_CHIPS,
    sortOptions: SORT_OPTIONS,
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
  };

  return (
    <div>
      {/* Full-width header */}
      <PageHeader
        title="Stiftungen-Übersicht"
        subtitle={`${filteredCount.toLocaleString('de-CH')} von ${totalCount.toLocaleString('de-CH')} in Pipeline · ${(tierCounts.anwendungsbereit + tierCounts.recherchiert).toLocaleString('de-CH')} recherchiert · ${gesuchReadyCount} gesuch-bereit`}
        badge={`${filteredCount}/${totalCount}`}
      />

      {/* Research Funnel */}
      <div className="mb-6 rounded-lg border border-border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-grey-dark">Recherche-Pipeline</h2>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-0">
          {FUNNEL_STAGES.map((stage, i) => {
            const count = funnelNumbers[stage.key];
            return (
              <div key={stage.key} className="flex items-center gap-1.5 sm:flex-1">
                {i > 0 && (
                  <span className="hidden text-text-muted sm:inline" aria-hidden="true">→</span>
                )}
                <div className={`flex-1 rounded-lg px-3 py-2 text-center ${stage.color}`}>
                  <div className="text-lg font-bold tabular-nums">
                    {count >= 1000
                      ? `~${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
                      : count.toLocaleString('de-CH')}
                  </div>
                  <div className="text-xs leading-tight">{stage.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Stufen werden automatisch aus Datensignalen berechnet (Website, Kontakt, Bewerbungsweg, Fördersumme).
          Jede Stiftung hat eine eigene Detailseite mit Fit-Analyse und massgeschneidertem Gesuch.
        </p>
      </div>

      {/* Mobile: search row + sort/filter row */}
      <div className="mb-4 space-y-2 md:hidden">
        <input
          type="text"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="min-w-0 flex-1 rounded-lg border border-border px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-grey-dark hover:bg-bg-light"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        {...sidebarProps}
      />

      {/* Two-column layout: sidebar + results */}
      <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-white p-4 shadow-sm">
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Results column */}
        <div>
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {filters.schwerpunkt && (
                <FilterPill
                  label={`SP: ${filters.schwerpunkt}`}
                  onRemove={() => setSchwerpunkt(null)}
                />
              )}
              {filters.themes.map((t) => (
                <FilterPill key={t} label={t} onRemove={() => toggleTheme(t)} />
              ))}
              {filters.statuses.map((s) => (
                <FilterPill key={s} label={s} onRemove={() => toggleStatus(s)} />
              ))}
              {filters.types.map((t) => (
                <FilterPill key={t} label={t} onRemove={() => toggleType(t)} />
              ))}
              {filters.fit.map((f) => (
                <FilterPill
                  key={f}
                  label={`Fit ${f}`}
                  onRemove={() => toggleFit(f)}
                />
              ))}
              {filters.hideNoApplication && (
                <FilterPill label="Nur mit Bewerbungsweg" onRemove={toggleHideNoApplication} />
              )}
              {filters.hideOperative && (
                <FilterPill label="Ohne Operative" onRemove={toggleHideOperative} />
              )}
              {filters.hideNetworks && (
                <FilterPill label="Ohne Netzwerke" onRemove={toggleHideNetworks} />
              )}
              {filters.minTier !== 'profiliert' && (
                <FilterPill label={`Min: ${filters.minTier}`} onRemove={() => setMinTier('profiliert')} />
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-text-muted hover:text-primary"
              >
                Alle zurücksetzen
              </button>
            </div>
          )}

          {/* Results summary */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-text-muted">
              {visibleCount < filteredCount
                ? `${Math.min(visibleCount, filteredCount)} von ${filteredCount} angezeigt`
                : `${filteredCount} von ${totalCount} Stiftungen`}
              {highFitCount > 0 && ` | ${highFitCount} mit hohem Fit`}
              {openCount > 0 && ` | ${openCount} offen`}
              {filters.minTier !== 'profiliert' && ` | ${tierCounts.recherchiert + tierCounts.anwendungsbereit} recherchiert+`}
            </span>
          </div>

          {/* Foundation list */}
          <div className="space-y-3">
            {filtered.slice(0, visibleCount).map((f) => (
              <FoundationCard key={f.slug} foundation={f} inPipeline={pipelineSlugs.has(f.slug)} score={scoreMap.get(f.slug)} />
            ))}
            {visibleCount < filteredCount && (
              <button
                onClick={showMore}
                className="w-full rounded-lg border border-border bg-bg-light py-3 text-sm font-medium text-text-muted hover:bg-border/50"
              >
                Mehr anzeigen ({Math.min(LOAD_MORE_COUNT, filteredCount - visibleCount)} weitere von {filteredCount})
              </button>
            )}
            {filtered.length === 0 && (
              <div className="rounded-lg border border-border bg-bg-light p-8 text-center">
                <p className="text-text-muted">
                  Keine Stiftungen gefunden für die aktuelle Filterauswahl.
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  {filters.themes.length > 0 && filters.fit.length > 0
                    ? `${totalCount} Stiftungen insgesamt, aber keine mit ${filters.themes.length > 1 ? 'allen gewählten Themen' : `Thema «${filters.themes[0]}»`} und Fit ${filters.fit.join('/')}.`
                    : filters.themes.length > 0
                      ? 'Versuche, ein Thema zu entfernen oder die Themen-Logik auf «ODER» zu stellen.'
                      : filters.fit.length > 0
                        ? 'Versuche, die Fit-Einschränkung zu lockern.'
                        : 'Versuche, einzelne Filter zu entfernen.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 rounded-lg bg-grey-dark px-4 py-2 text-sm font-medium text-white hover:bg-grey-dark/85"
                  >
                    Alle Filter zurücksetzen
                  </button>
                )}
              </div>
            )}
          </div>

          <StoryBridge bridges={STORY_BRIDGES.stiftungen || []} />
        </div>
      </div>
    </div>
  );
}

/** Removable filter pill */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-grey-light px-2.5 py-1 text-xs font-medium text-grey-dark">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-border"
        aria-label={`Filter ${label} entfernen`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
