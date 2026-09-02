/**
 * Typed client for /api/gesuch-overrides — eliminates raw fetch() boilerplate.
 * All functions return { success, data?, error? }.
 */

import type { GesuchOverridesData } from '@/lib/db/schema';
import { apiFetch, type BaseApiResponse } from './client-fetch';

export type GesuchOverridesApiResponse<T = unknown> = BaseApiResponse<T>;

export function listGesuchOverrides(): Promise<GesuchOverridesApiResponse> {
  return apiFetch('/api/gesuch-overrides');
}

export function getGesuchOverrideVariants(
  slug: string,
): Promise<GesuchOverridesApiResponse<string[]>> {
  return apiFetch<string[]>(`/api/gesuch-overrides/${slug}/variants`);
}

export function getGesuchOverride(
  slug: string,
  variantKey: string,
): Promise<GesuchOverridesApiResponse<{ overrides: GesuchOverridesData } | null>> {
  return apiFetch<{ overrides: GesuchOverridesData } | null>(
    `/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`,
  );
}

export function putGesuchOverride(
  slug: string,
  variantKey: string,
  data: GesuchOverridesData,
): Promise<GesuchOverridesApiResponse> {
  return apiFetch(`/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function restoreGesuchOverride(
  slug: string,
  data: GesuchOverridesData,
): Promise<GesuchOverridesApiResponse> {
  return apiFetch(`/api/gesuch-overrides/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteGesuchOverride(
  slug: string,
  variantKey: string,
): Promise<GesuchOverridesApiResponse> {
  return apiFetch(`/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`, {
    method: 'DELETE',
  });
}
