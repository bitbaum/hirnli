'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ThemeId, FoundationType, FoundationStatus } from '@/lib/schemas/foundation';
import type { FoundationFilters, SortField } from '@/lib/domain/foundation-filter';
import { DEFAULT_FILTERS, filterFoundations, sortFoundations } from '@/lib/domain/foundation-filter';
import type { Foundation } from '@/lib/schemas/foundation';

export function useFoundationFilters(foundations: Foundation[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse filters from URL
  const filters: FoundationFilters = useMemo(() => ({
    themes: (searchParams.get('themes')?.split(',').filter(Boolean) || []) as ThemeId[],
    types: (searchParams.get('types')?.split(',').filter(Boolean) || []) as FoundationType[],
    statuses: (searchParams.get('statuses')?.split(',').filter(Boolean) || []) as FoundationStatus[],
    fit: searchParams.get('fit') ? Number(searchParams.get('fit')) : null,
    search: searchParams.get('q') || '',
    hideOperative: searchParams.get('hideOp') === '1',
    hideNetworks: searchParams.get('hideNet') === '1',
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

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Apply filters and sort
  const filtered = useMemo(() => {
    const result = filterFoundations(foundations, filters);
    return sortFoundations(result, sort);
  }, [foundations, filters, sort]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.themes.length > 0 ||
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      filters.fit !== null ||
      filters.search !== '' ||
      filters.hideOperative ||
      filters.hideNetworks
    );
  }, [filters]);

  return {
    filters,
    sort,
    filtered,
    hasActiveFilters,
    totalCount: foundations.length,
    filteredCount: filtered.length,
    toggleTheme,
    toggleType,
    toggleStatus,
    setSearch,
    setSort,
    resetFilters,
  };
}
