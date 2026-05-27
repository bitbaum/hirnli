/**
 * Typed client for /api/applications — eliminates raw fetch() boilerplate.
 * All functions return { success, data?, error?, missingFields?, httpStatus }.
 */

import { isActiveApplication, type ApplicationStatusId, type RequiredField } from '@/lib/config/application-statuses';
import { NET_ERR_LOAD } from '@/lib/utils/errors';

/** Minimal shape returned by /api/applications?foundationId=... — every consumer needs id+status */
export interface FoundationApplicationRow {
  application: {
    id: string;
    status: ApplicationStatusId;
    submissionDate?: string | null;
  };
}

export interface ApplicationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  missingFields?: RequiredField[];
  existingId?: string;
  httpStatus: number;
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApplicationApiResponse<T>> {
  try {
    const res = await fetch(url, init);
    const json = await res.json();
    return { ...json, httpStatus: res.status };
  } catch {
    return { success: false, error: NET_ERR_LOAD, httpStatus: 0 };
  }
}

export function createApplication(
  foundationId: string,
  status: string,
  priorityLevel?: number,
): Promise<ApplicationApiResponse> {
  return request('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foundationId, status, ...(priorityLevel != null ? { priorityLevel } : {}) }),
  });
}

export function patchApplication(
  id: string,
  payload: Record<string, unknown>,
): Promise<ApplicationApiResponse> {
  return request(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteApplication(id: string): Promise<ApplicationApiResponse> {
  return request(`/api/applications/${id}`, { method: 'DELETE' });
}

export function getApplicationsByFoundation(
  foundationId: string,
): Promise<ApplicationApiResponse> {
  return request(`/api/applications?foundationId=${encodeURIComponent(foundationId)}`);
}

/**
 * Fetch the active (non-terminal, non-onhold) application for a foundation, if any.
 * Centralizes the type assertion + filter that 3+ components otherwise duplicate.
 */
export async function findActiveApplication(
  foundationId: string,
): Promise<FoundationApplicationRow | null> {
  const result = await getApplicationsByFoundation(foundationId);
  if (!result.success) return null;
  const rows = (result.data as FoundationApplicationRow[] | undefined) ?? [];
  return rows.find((row) => isActiveApplication(row.application.status)) ?? null;
}

export function getApplication(id: string): Promise<ApplicationApiResponse> {
  return request(`/api/applications/${id}`);
}

export function getApplications(): Promise<ApplicationApiResponse> {
  return request('/api/applications');
}

export function getApplicationsDashboard(): Promise<ApplicationApiResponse> {
  return request('/api/applications/dashboard');
}
