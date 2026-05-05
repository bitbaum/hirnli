'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@/components/ui/Card';
import { FORM_INPUT_CLASS } from '@/lib/utils/form-classes';
import PageHeader from '@/components/layout/PageHeader';
import FoundationCard from '@/components/foundation/FoundationCard';
import FilterSidebar from '@/components/foundation/FilterSidebar';
import FilterDrawer from '@/components/foundation/FilterDrawer';
import { STIFTUNGEN_DATA, PRIORITY_CONFIG } from '@/lib/config/foundations';
import CsvExportModal from '@/components/foundation/CsvExportModal';
import { useFoundationFilters } from '@/hooks/useFoundationFilters';
import { computeResearchStats } from '@/lib/domain/foundation-research-stats';
import { computeTierCounts, hasGesuchPage, hasGesuchDataGaps } from '@/lib/domain/foundation-helpers';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import type { SortField } from '@/lib/domain/foundation-filter';
import { DEFAULT_FILTERS } from '@/lib/domain/foundation-filter';
import {
  STATUS_CHIPS,
  TYPE_CHIPS,
  SORT_OPTIONS,
} from './data';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import ProgressBar from '@/components/ui/ProgressBar';
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
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Foundation slugs that already have a pipeline entry
  const [pipelineSlugs, setPipelineSlugs] = useState<Set<string>>(new Set());
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState(false);
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
        } else {
          setPipelineError(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load pipeline data:', err);
        setPipelineError(true);
      })
      .finally(() => setPipelineLoading(false));
  }, []);

  // Research stats — computed once from the full dataset (static data)
  const researchStats = useMemo(() => computeResearchStats(STIFTUNGEN_DATA), []);
  const tierCounts = useMemo(() => computeTierCounts(STIFTUNGEN_DATA), []);

  const highFitCount = filtered.filter((f) => fitScoreToDisplay(f.fitScore, false) === 3).length;
  const openCount = filtered.filter(
    (f) => f.status === 'open' || f.status === 'rolling',
  ).length;

  // Pipeline stats — computed once from full dataset (SSOT: hasGesuchPage)
  const gesuchCount = useMemo(
    () => STIFTUNGEN_DATA.filter(hasGesuchPage).length,
    [],
  );

  // Data quality gaps: Gesuch-page foundations with thin research data
  const gesuchGapCount = useMemo(
    () => STIFTUNGEN_DATA.filter(f => hasGesuchPage(f) && hasGesuchDataGaps(f)).length,
    [],
  );

  // Priority distribution — use stored priority (SSOT: DB → sync → generated file)
  // computePriorityScore is not re-run here; sync script already recomputes and persists.
  const priorityDist = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const f of STIFTUNGEN_DATA) {
      counts[f.priority]++;
    }
    return counts;
  }, []);

  // Shared sidebar props
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
    toggleRequireDataGaps,
    toggleTrustLevel,
    setMinTier,
    togglePriorityLevel,
    applyPreset,
    resetFilters,
  };

  return (
    <div>
      {/* Full-width header */}
      <PageHeader
        title="Stiftungen-Übersicht"
        subtitle={`${totalCount} Stiftungen · ${tierCounts.anwendungsbereit} bewerbungsbereit`}
        badge={`${filteredCount}/${totalCount}`}
      />

      {/* Pipeline Overview — independent metrics, NOT sequential stages */}
      <Card padding={false} className="mb-6 space-y-4 p-4">
        <h2 className="text-sm font-semibold text-grey-dark">Pipeline-Übersicht</h2>

        {/* Research progress — the one true completion metric */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-grey-dark">Analyse-Fortschritt</span>
            <span className="text-sm tabular-nums text-grey-dark">
              <span className="font-semibold">{researchStats.researched}</span>
              <span className="text-text-muted"> / {totalCount}</span>
            </span>
          </div>
          <ProgressBar percent={researchStats.researchedPercent} size="md" color="bg-primary" label={`Analyse-Fortschritt: ${researchStats.researchedPercent}% abgeschlossen`} />
          <p className="mt-1.5 text-sm text-text-muted">
            Stiftungszweck und Fit manuell bewertet — {researchStats.researchedPercent}% abgeschlossen
          </p>
        </div>

        {/* Priority distribution — computed from fit × readiness */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([1, 2, 3, 4] as const).map((level) => {
            const pc = PRIORITY_CONFIG[level];
            return (
              <div key={level} className={`rounded-lg border ${pc.cardColor} px-3 py-2 text-center`}>
                <div className={`text-lg font-bold tabular-nums ${pc.textColor}`}>{priorityDist[level]}</div>
                <div className="text-sm font-semibold text-grey-dark">{pc.label}</div>
              </div>
            );
          })}
        </div>

        {/* Actionability metrics */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="text-2xl font-bold tabular-nums text-primary">{gesuchCount}</div>
            <div className="text-sm font-medium text-grey-dark">Mit Gesuch</div>
            <p className="mt-0.5 text-sm text-text-muted">
              Gesuch-Seite generiert (P1–P3)
            </p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success-bg px-4 py-3">
            <div className="text-2xl font-bold tabular-nums text-success">{tierCounts.anwendungsbereit}</div>
            <div className="text-sm font-medium text-grey-dark">Bewerbungsbereit</div>
            <p className="mt-0.5 text-sm text-text-muted">
              Höchste Datenvollständigkeit (Bereitschafts-Score ≥{READINESS_ENGINE.display.thresholds[0].minScore})
            </p>
          </div>
        </div>

        {gesuchGapCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm">
            <span>
              <span className="font-semibold text-warning">{gesuchGapCount}</span>
              {' '}von {gesuchCount} Gesuch-Seiten haben dünne Quelldaten —{' '}
              researchNotes oder purposeSummary vervollständigen.
            </span>
            <button
              onClick={() => applyPreset('mit-luecken')}
              className="ml-3 shrink-0 rounded-md bg-warning/20 px-2.5 py-1 text-xs font-medium text-warning hover:bg-warning/30"
            >
              Zeigen →
            </button>
          </div>
        )}

        <p className="text-sm text-text-muted">
          Priorität = Fit × Bereitschaft. Scores algorithmisch berechnet.{' '}
          <a href="/fundraising/scoring-methodik" className="text-primary hover:underline">Methodik</a>
        </p>
      </Card>

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
          <Card padding={false} className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto p-4">
            <FilterSidebar {...sidebarProps} />
          </Card>
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
              {filters.priorityLevels.map((pl) => (
                <FilterPill
                  key={`pl-${pl}`}
                  label={`P${pl}`}
                  onRemove={() => togglePriorityLevel(pl)}
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
              <button
                onClick={resetFilters}
                className="text-sm text-text-muted hover:text-primary"
              >
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

          {/* Foundation list */}
          <div className="space-y-3">
            {filtered.slice(0, visibleCount).map((f) => (
              <FoundationCard key={f.slug} foundation={f} inPipeline={!pipelineLoading && pipelineSlugs.has(f.slug)} score={scoreMap.get(f.slug)} />
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

/** Removable filter pill */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-grey-light px-2.5 py-1 text-xs font-medium text-grey-dark">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-border"
        aria-label={`Filter ${label} entfernen`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
