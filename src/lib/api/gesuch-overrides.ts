/**
 * Typed client for /api/gesuch-overrides — eliminates raw fetch() boilerplate.
 * All functions return { success, data?, error? }.
 */

import type { GesuchOverridesData } from '@/lib/db/schema';
import { NET_ERR_LOAD } from '@/lib/utils/errors';

export interface GesuchOverridesApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<GesuchOverridesApiResponse<T>> {
  try {
    const res = await fetch(url, init);
    return await res.json();
  } catch {
    return { success: false, error: NET_ERR_LOAD };
  }
}

export function listGesuchOverrides(): Promise<GesuchOverridesApiResponse> {
  return request('/api/gesuch-overrides');
}

export function getGesuchOverrideVariants(slug: string): Promise<GesuchOverridesApiResponse<string[]>> {
  return request(`/api/gesuch-overrides/${slug}/variants`);
}

export function getGesuchOverride(
  slug: string,
  variantKey: string,
): Promise<GesuchOverridesApiResponse<{ overrides: GesuchOverridesData } | null>> {
  return request(`/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`);
}

export function putGesuchOverride(
  slug: string,
  variantKey: string,
  data: GesuchOverridesData,
): Promise<GesuchOverridesApiResponse> {
  return request(`/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function restoreGesuchOverride(
  slug: string,
  data: GesuchOverridesData,
): Promise<GesuchOverridesApiResponse> {
  return request(`/api/gesuch-overrides/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteGesuchOverride(
  slug: string,
  variantKey: string,
): Promise<GesuchOverridesApiResponse> {
  return request(`/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`, {
    method: 'DELETE',
  });
}
