/**
 * Server-side helpers for Next.js route handlers — consolidate the boilerplate
 * that every `} catch (error) { console.error(...); return NextResponse.json(
 * { success: false, error: API_ERR_X }, { status: 500 }); }` block was
 * reproducing across 15+ sites.
 *
 * Client-side `apiFetch` helper lives in `client-fetch.ts` (separate module
 * so route-handler-only imports don't accidentally pull `NextResponse` into
 * the client bundle).
 */

import { NextResponse } from 'next/server';

/**
 * Standard 500-style error response. Logs the error with the route tag and
 * returns a `{ success: false, error: message }` body at the given status
 * (default 500).
 *
 * @example
 *   } catch (error) {
 *     return apiError('GET /api/applications', error, API_ERR_LOAD);
 *   }
 */
export function apiError(tag: string, error: unknown, message: string, status = 500): NextResponse {
  console.error(`${tag} error:`, error);
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Standard validation/client-error response — used when the request body
 * fails Zod validation or a precondition (e.g. missing param). Does NOT
 * log because the failure is the caller's fault, not a server bug.
 *
 * @example
 *   const parsed = schema.safeParse(body);
 *   if (!parsed.success) return apiClientError(API_ERR_VALIDATION, 400, parsed.error.flatten());
 */
export function apiClientError(message: string, status = 400, details?: unknown): NextResponse {
  const body: Record<string, unknown> = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}
