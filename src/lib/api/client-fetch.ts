/**
 * Client-side fetch wrapper for typed API clients. Single source for the
 * `fetch(url, init).then(r => r.json()).catch(networkError)` pattern that
 * was reproduced in five api-client files (applications, gesuch-overrides,
 * activity-log, ai-gesuch-section, foundations).
 *
 * Lives in its own module — separate from `route-helpers.ts` — so client
 * code doesn't accidentally pull `NextResponse` into the browser bundle.
 */

import { NET_ERR_LOAD } from '@/lib/utils/errors';

/** Base shape every typed API client returns. */
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ApiFetchOptions {
  /**
   * When true, the resolved response includes `httpStatus: res.status` so the
   * caller can branch on 409/404 etc. Defaults to false because most callers
   * only need success+data+error.
   */
  trackStatus?: boolean;
}

/**
 * Network/parse failures resolve to `{ success: false, error: NET_ERR_LOAD }`
 * — `apiFetch` never throws — so callers can branch on `result.success`
 * without a surrounding try/catch.
 *
 * The return type intersects `BaseApiResponse<T>` with whatever extra fields
 * the server returned: api/applications.ts adds `missingFields` + `existingId`
 * + `httpStatus`; api/gesuch-overrides.ts adds nothing. Each typed client
 * widens the response interface to claim the extras it cares about.
 *
 * Two overloads: `trackStatus: true` guarantees `httpStatus` in the result so
 * callers like applications.ts get the typed status code without re-asserting.
 */
export async function apiFetch<T = unknown>(
  url: string,
  init: RequestInit | undefined,
  options: { trackStatus: true },
): Promise<BaseApiResponse<T> & { httpStatus: number } & Record<string, unknown>>;
export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit,
  options?: { trackStatus?: false },
): Promise<BaseApiResponse<T> & Record<string, unknown>>;
export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<BaseApiResponse<T> & Record<string, unknown>> {
  try {
    const res = await fetch(url, init);
    const json = (await res.json()) as BaseApiResponse<T> & Record<string, unknown>;
    return options.trackStatus ? { ...json, httpStatus: res.status } : json;
  } catch {
    return options.trackStatus
      ? { success: false, error: NET_ERR_LOAD, httpStatus: 0 }
      : { success: false, error: NET_ERR_LOAD };
  }
}
