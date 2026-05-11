'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@/components/ui/Card';
import { FORM_INPUT_CLASS } from '@/lib/utils/form-classes';
import PageHeader from '@/components/layout/PageHeader';
import FoundationCard from '@/components/foundation/FoundationCard';
import FilterSidebar from '@/components/foundation/FilterSidebar';
import FilterDrawer from '@/components/foundation/FilterDrawer';
import FilterPill from '@/components/ui/FilterPill';
import PipelineOverviewCard from '@/components/foundation/PipelineOverviewCard';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import CsvExportModal from '@/components/foundation/CsvExportModal';
import { useFoundationFilters } from '@/hooks/useFoundationFilters';
import { usePipelineEntries } from '@/hooks/usePipelineEntries';
import { computeResearchStats } from '@/lib/domain/foundation-research-stats';
import { computeTierCounts, hasGesuchPage, hasGesuchDataGaps } from '@/lib/domain/foundation-helpers';
import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import type { SortField } from '@/lib/domain/foundation-filter';
import { DEFAULT_FILTERS } from '@/lib/domain/foundation-filter';
import { STATUS_CHIPS, TYPE_CHIPS, SORT_OPTIONS } from './data';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { TRUST_CONFIG } from '@/lib/config/trust-levels';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

const LOAD_MORE_COUNT = 50;

export default function FoundationListClient() {
  const {
    filters,
    sort,
    filtered,
    scoreMap,
    hasActiveFilters,
    activeFilterCount,
    totalCount,
    filteredCount,
    toggleTheme,
    toggleType,
    toggleStatus,
    setSearch,
    setSort,
    toggleFit,
    setSchwerpunkt,
    toggleHideNoApplication,
    toggleHideOperative,
    toggleHideNetworks,
    toggleRequireEmail,
    toggleRequirePhone,
    toggleRequireAddress,
    toggleRequireDataGaps,
    toggleTrustLevel,
    setMinTier,
    togglePriorityLevel,
    applyPreset,
    resetFilters,
  } = useFoundationFilters(STIFTUNGEN_DATA);

  const [visibleCount, setVisibleCount] = useState(LOAD_MORE_COUNT);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets pagination when filters/sort change
    setVisibleCount(LOAD_MORE_COUNT);
  }, [filters, sort]);

  const showMore = useCallback(() => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const { pipelineSlugs, pipelineLoading, pipelineError } = usePipelineEntries();

  const researchStats = useMemo(() => computeResearchStats(STIFTUNGEN_DATA), []);
  const tierCounts = useMemo(() => computeTierCounts(STIFTUNGEN_DATA), []);
  const gesuchCount = useMemo(() => STIFTUNGEN_DATA.filter(hasGesuchPage).length, []);
  const gesuchGapCount = useMemo(() => STIFTUNGEN_DATA.filter(f => hasGesuchPage(f) && hasGesuchDataGaps(f)).length, []);
  const priorityDist = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const f of STIFTUNGEN_DATA) counts[f.priority]++;
    return counts;
  }, []);

  const highFitCount = filtered.filter((f) => fitScoreToDisplay(f.fitScore, false) === 3).length;
  const openCount = filtered.filter((f) => f.status === 'open' || f.status === 'rolling').length;

  const sidebarProps = {
    filters,
    sort,
    hasActiveFilters,
    tierCounts,
    foundations: STIFTUNGEN_DATA,
    statusChips: STATUS_CHIPS,
    typeChips: TYPE_CHIPS,
    sortOptions: SORT_OPTIONS,
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
  };

  return (
    <div>
      <PageHeader
        title="Stiftungen-Übersicht"
        subtitle={`${totalCount} Stiftungen · ${tierCounts.anwendungsbereit} bewerbungsbereit`}
        badge={`${filteredCount}/${totalCount}`}
      />

      <PipelineOverviewCard
        researchStats={researchStats}
        totalCount={totalCount}
        gesuchCount={gesuchCount}
        gesuchGapCount={gesuchGapCount}
        tierCounts={tierCounts}
        priorityDist={priorityDist}
        onApplyPreset={applyPreset}
      />

      {/* Mobile: search row + sort/filter row */}
      <div className="mb-4 space-y-2 md:hidden">
        <input
          type="text"
          aria-label="Stiftung suchen"
          placeholder="Stiftung suchen..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
        <div className="flex items-center gap-2">
          <select
            aria-label="Sortierung"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="min-w-0 flex-1 rounded-lg border border-border px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...sidebarProps} />

      {/* Two-column layout: sidebar + results */}
      <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6">
        <aside className="hidden md:block">
          <Card padding={false} className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto p-4">
            <FilterSidebar {...sidebarProps} />
          </Card>
        </aside>

        <div>
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {filters.schwerpunkt && (
                <FilterPill label={`SP: ${filters.schwerpunkt}`} onRemove={() => setSchwerpunkt(null)} />
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
                <FilterPill key={f} label={`Fit ${f}`} onRemove={() => toggleFit(f)} />
              ))}
              {filters.priorityLevels.map((pl) => (
                <FilterPill key={`pl-${pl}`} label={`P${pl}`} onRemove={() => togglePriorityLevel(pl)} />
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
              {filters.requireEmail && (
                <FilterPill label="E-Mail" onRemove={toggleRequireEmail} />
              )}
              {filters.requirePhone && (
                <FilterPill label="Telefon" onRemove={toggleRequirePhone} />
              )}
              {filters.requireAddress && (
                <FilterPill label="Adresse" onRemove={toggleRequireAddress} />
              )}
              {filters.requireDataGaps && (
                <FilterPill label="Lücken füllen" onRemove={toggleRequireDataGaps} />
              )}
              {filters.trustLevels.map((level) => (
                <FilterPill key={level} label={TRUST_CONFIG[level].label} onRemove={() => toggleTrustLevel(level)} />
              ))}
              {filters.minTier !== DEFAULT_FILTERS.minTier && (
                <FilterPill label={`Min: ${filters.minTier}`} onRemove={() => setMinTier(DEFAULT_FILTERS.minTier)} />
              )}
              <button onClick={resetFilters} className="text-sm text-text-muted hover:text-primary">
                Alle zurücksetzen
              </button>
            </div>
          )}

          {/* Results summary + CSV export */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-text-muted">
              {visibleCount < filteredCount
                ? `${Math.min(visibleCount, filteredCount)} von ${filteredCount} angezeigt`
                : `${filteredCount} von ${totalCount} Stiftungen`}
              {highFitCount > 0 && ` | ${highFitCount} mit hohem Fit`}
              {openCount > 0 && ` | ${openCount} offen`}
            </span>
            <button
              onClick={() => setCsvModalOpen(true)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-grey-dark hover:bg-bg-light disabled:cursor-not-allowed disabled:opacity-40"
              title={`${filteredCount} Stiftungen als CSV exportieren`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV Export
            </button>
          </div>

          {pipelineError && (
            <ErrorAlert className="mb-4">
              Pipeline-Daten konnten nicht geladen werden — «Im Pipeline» wird nicht angezeigt.
            </ErrorAlert>
          )}

          <div className="space-y-3">
            {filtered.slice(0, visibleCount).map((f) => (
              <FoundationCard
                key={f.slug}
                foundation={f}
                inPipeline={!pipelineLoading && pipelineSlugs.has(f.slug)}
                score={scoreMap.get(f.slug)}
              />
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

      <CsvExportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        foundations={filtered}
      />
    </div>
  );
}
