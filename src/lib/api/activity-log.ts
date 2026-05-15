import type { ActivityLogEntryJSON } from '@/lib/db/schema';

export interface ActivityLogApiResponse {
  success: boolean;
  data?: ActivityLogEntryJSON[];
  error?: string;
}

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
  return fetch(`/api/activity-log?${params}`)
    .then((r) => r.json() as Promise<ActivityLogApiResponse>)
    .catch((): ActivityLogApiResponse => ({ success: false, error: 'Netzwerkfehler' }));
}
