import type { ActivityLogEntryJSON } from '@/lib/db/schema';
import { apiFetch, type BaseApiResponse } from './client-fetch';

export type ActivityLogApiResponse = BaseApiResponse<ActivityLogEntryJSON[]>;

export function getActivityLog(
  entityId: string,
  entityType: string,
  limit = 20,
): Promise<ActivityLogApiResponse> {
  const params = new URLSearchParams({
    entityId,
    entityType,
    limit: String(limit),
  });
  return apiFetch<ActivityLogEntryJSON[]>(`/api/activity-log?${params}`);
}
