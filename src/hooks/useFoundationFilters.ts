'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ThemeId, FoundationType, FoundationStatus, QualityTier } from '@/lib/schemas/foundation';
import type { FoundationFilters, SortField, ThemeLogic, FilterPresetId } from '@/lib/domain/foundation-filter';
import type { TrustLevel } from '@/lib/config/trust-levels';
import { DEFAULT_FILTERS, FILTER_PRESETS, filterFoundations, sortFoundations } from '@/lib/domain/foundation-filter';
import type { Foundation } from '@/lib/schemas/foundation';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import { createSearchIndex, searchFoundations } from '@/lib/domain/foundation-search';
import { QUALITY_TIERS } from '@/lib/domain/foundation-helpers';

/** Map legacy `researched=0` URL param to new tier system */
function parseTierParam(searchParams: URLSearchParams): QualityTier {
  // Backward compat: ?researched=0 → show all (verzeichnet)
  if (searchParams.get('researched') === '0') return 'verzeichnet';
  // New param: ?tier=erfasst
  const tierParam = searchParams.get('tier') as QualityTier | null;
  if (tierParam && QUALITY_TIERS.includes(tierParam)) return tierParam;
  // Default
  return DEFAULT_FILTERS.minTier;
}

export function useFoundationFilters(foundations: Foundation[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Fuse.js index — computed once from static data
  const fuseIndex = useMemo(() => createSearchIndex(foundations), [foundations]);

  // Parse filters from URL
  const filters: FoundationFilters = useMemo(() => ({
    themes: (searchParams.get('themes')?.split(',').filter(Boolean) || []) as ThemeId[],
    themeLogic: (searchParams.get('tl') as ThemeLogic) || 'or',
    types: (searchParams.get('types')?.split(',').filter(Boolean) || []) as FoundationType[],
    statuses: (searchParams.get('statuses')?.split(',').filter(Boolean) || []) as FoundationStatus[],
    fit: searchParams.get('fit')?.split(',').map(Number).filter((n) => !isNaN(n)) || [],
    priorityLevels: searchParams.get('pl')?.split(',').map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 4) || [],
    search: searchParams.get('q') || '',
    schwerpunkt: (searchParams.get('sp') as SchwerpunktId) || null,
    hideOperative: searchParams.get('hideOp') === '1',
    hideNetworks: searchParams.get('hideNet') === '1',
    hideNoApplication: searchParams.get('hideNoApp') === '1',
    requireEmail: searchParams.get('email') === '1',
    requirePhone: searchParams.get('phone') === '1',
    requireAddress: searchParams.get('addr') === '1',
    trustLevels: (searchParams.get('trust')?.split(',').filter(Boolean) || []) as TrustLevel[],
    minTier: parseTierParam(searchParams),
  }), [searchParams]);

  const sort: SortField = (searchParams.get('sort') as SortField) || 'priority';

  // Update URL with new params
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const toggleTheme = useCallback((theme: string) => {
    const current = filters.themes;
    const next = current.includes(theme as ThemeId)
      ? current.filter((t) => t !== theme)
      : [...current, theme as ThemeId];
    updateParams({ themes: next.length > 0 ? next.join(',') : null });
  }, [filters.themes, updateParams]);

  const toggleType = useCallback((type: string) => {
    const current = filters.types;
    const next = current.includes(type as FoundationType)
      ? current.filter((t) => t !== type)
      : [...current, type as FoundationType];
    updateParams({ types: next.length > 0 ? next.join(',') : null });
  }, [filters.types, updateParams]);

  const toggleStatus = useCallback((status: string) => {
    const current = filters.statuses;
    const next = current.includes(status as FoundationStatus)
      ? current.filter((s) => s !== status)
      : [...current, status as FoundationStatus];
    updateParams({ statuses: next.length > 0 ? next.join(',') : null });
  }, [filters.statuses, updateParams]);

  const setSearch = useCallback((q: string) => {
    updateParams({ q: q || null });
  }, [updateParams]);

  const setSort = useCallback((field: SortField) => {
    updateParams({ sort: field === 'priority' ? null : field });
  }, [updateParams]);

  const setFit = useCallback((value: number[]) => {
    updateParams({ fit: value.length > 0 ? value.join(',') : null });
  }, [updateParams]);

  const toggleFit = useCallback((value: number) => {
    const current = filters.fit;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFit(next);
  }, [filters.fit, setFit]);

  const toggleThemeLogic = useCallback(() => {
    updateParams({ tl: filters.themeLogic === 'or' ? 'and' : null });
  }, [filters.themeLogic, updateParams]);

  const setSchwerpunkt = useCallback((sp: SchwerpunktId | null) => {
    updateParams({ sp: sp });
  }, [updateParams]);

  const toggleHideNoApplication = useCallback(() => {
    updateParams({ hideNoApp: filters.hideNoApplication ? null : '1' });
  }, [filters.hideNoApplication, updateParams]);

  const toggleHideOperative = useCallback(() => {
    updateParams({ hideOp: filters.hideOperative ? null : '1' });
  }, [filters.hideOperative, updateParams]);

  const toggleHideNetworks = useCallback(() => {
    updateParams({ hideNet: filters.hideNetworks ? null : '1' });
  }, [filters.hideNetworks, updateParams]);

  const toggleRequireEmail = useCallback(() => {
    updateParams({ email: filters.requireEmail ? null : '1' });
  }, [filters.requireEmail, updateParams]);

  const toggleRequirePhone = useCallback(() => {
    updateParams({ phone: filters.requirePhone ? null : '1' });
  }, [filters.requirePhone, updateParams]);

  const toggleRequireAddress = useCallback(() => {
    updateParams({ addr: filters.requireAddress ? null : '1' });
  }, [filters.requireAddress, updateParams]);

  const toggleTrustLevel = useCallback((level: TrustLevel) => {
    const current = filters.trustLevels;
    const next = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level];
    updateParams({ trust: next.length > 0 ? next.join(',') : null });
  }, [filters.trustLevels, updateParams]);

  const setMinTier = useCallback((tier: QualityTier) => {
    // Default tier is omitted from URL; also remove legacy param
    const isDefault = tier === DEFAULT_FILTERS.minTier;
    updateParams({
      tier: isDefault ? null : tier,
      researched: null, // clean up legacy param
    });
  }, [updateParams]);

  const togglePriorityLevel = useCallback((level: number) => {
    const current = filters.priorityLevels;
    const next = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    updateParams({ pl: next.length > 0 ? next.join(',') : null });
  }, [filters.priorityLevels, updateParams]);

  const applyPreset = useCallback((presetId: FilterPresetId) => {
    const preset = FILTER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // Reset to defaults, then apply preset overrides
    const params = new URLSearchParams();
    const pf = preset.filters;
    if (pf.minTier && pf.minTier !== DEFAULT_FILTERS.minTier) params.set('tier', pf.minTier);
    if (pf.fit && pf.fit.length > 0) params.set('fit', pf.fit.join(','));
    if (pf.priorityLevels && pf.priorityLevels.length > 0) params.set('pl', pf.priorityLevels.join(','));
    if (pf.themes && pf.themes.length > 0) params.set('themes', pf.themes.join(','));
    if (pf.requireEmail) params.set('email', '1');
    if (pf.requirePhone) params.set('phone', '1');
    if (pf.requireAddress) params.set('addr', '1');

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, pathname]);

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Apply filters and sort — use Fuse.js when searching (>=2 chars)
  const { filtered, scoreMap } = useMemo(() => {
    const isSearching = filters.search.length >= 2;

    if (isSearching) {
      // Fuse.js search first, then apply non-text filters
      const searchResults = searchFoundations(
        foundations,
        filters.search,
        filters.themes.length > 0 ? filters.themes : undefined,
        fuseIndex,
      );
      // Build slug→score map for display
      const scores = new Map<string, number>();
      for (const r of searchResults) {
        scores.set(r.foundation.slug, r.score);
      }
      // Apply structural filters on the Fuse results
      const filtersWithoutSearch = { ...filters, search: '' };
      const structuralFiltered = filterFoundations(
        searchResults.map((r) => r.foundation),
        filtersWithoutSearch,
      );
      // Already sorted by relevance — don't re-sort unless user picked a specific sort
      const result = sort === 'priority'
        ? structuralFiltered
        : sortFoundations(structuralFiltered, sort);
      return { filtered: result, scoreMap: scores };
    }

    const result = filterFoundations(foundations, filters);
    return { filtered: sortFoundations(result, sort), scoreMap: new Map<string, number>() };
  }, [foundations, filters, sort, fuseIndex]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.themes.length > 0 ||
      filters.themeLogic !== 'or' ||
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      filters.fit.length > 0 ||
      filters.priorityLevels.length > 0 ||
      filters.search !== '' ||
      filters.schwerpunkt !== null ||
      filters.hideOperative ||
      filters.hideNetworks ||
      filters.hideNoApplication ||
      filters.requireEmail ||
      filters.requirePhone ||
      filters.requireAddress ||
      filters.minTier !== DEFAULT_FILTERS.minTier
    );
  }, [filters]);

  return {
    filters,
    sort,
    filtered,
    scoreMap,
    hasActiveFilters,
    totalCount: foundations.length,
    filteredCount: filtered.length,
    toggleTheme,
    toggleType,
    toggleStatus,
    setSearch,
    setSort,
    setFit,
    toggleFit,
    toggleThemeLogic,
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
}
