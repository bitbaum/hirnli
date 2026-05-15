/**
 * Typed client for /api/applications — eliminates raw fetch() boilerplate.
 * All functions return { success, data?, error?, missingFields?, httpStatus }.
 */

import type { RequiredField } from '@/lib/config/application-statuses';

export interface ApplicationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  missingFields?: RequiredField[];
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
    return { success: false, error: 'Netzwerkfehler', httpStatus: 0 };
  }
}

export function createApplication(
  foundationId: string,
  status: string,
): Promise<ApplicationApiResponse> {
  return request('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foundationId, status }),
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

export function getApplication(id: string): Promise<ApplicationApiResponse> {
  return request(`/api/applications/${id}`);
}

export function getApplications(): Promise<ApplicationApiResponse> {
  return request('/api/applications');
}

export function getApplicationsDashboard(): Promise<ApplicationApiResponse> {
  return request('/api/applications/dashboard');
}
