'use client';

/**
 * ActivityTimeline — Reusable vertical timeline showing activity log entries.
 *
 * Fetches from /api/activity-log and displays as a compact timeline.
 */

import { useState, useEffect } from 'react';
import { formatDateTimeCH } from '@/lib/utils/format';
import { APPLICATION_STATUSES } from '@/lib/config/application-statuses';
import { getActivityLog } from '@/lib/api/activity-log';
import type { ActivityLogEntryJSON } from '@/lib/db/schema';

const STATUS_LABEL = Object.fromEntries(APPLICATION_STATUSES.map(s => [s.id, s.label]));

const ACTION_LABELS: Record<string, string> = {
  created: 'Erstellt',
  updated: 'Aktualisiert',
  status_changed: 'Status geändert',
  override_saved: 'Gesuch-Text gespeichert',
  deleted: 'Gelöscht',
  document_generated: 'Dokument erstellt',
};


interface ActivityTimelineProps {
  entityId: string;
  entityType: string;
  limit?: number;
}


function parseDetails(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ActivityTimeline({ entityId, entityType, limit = 20 }: ActivityTimelineProps) {
  const [entries, setEntries] = useState<ActivityLogEntryJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets error state before new fetch
    setError(false);
    getActivityLog(entityId, entityType, limit)
      .then((d) => {
        if (d.success) setEntries(d.data ?? []);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [entityId, entityType, limit]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-2">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-border-default border-t-primary" />
        Lade Aktivitäten…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-text-muted py-2">Aktivitäten konnten nicht geladen werden.</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-text-muted py-2">Noch keine Aktivitäten.</p>;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, i) => {
        const details = parseDetails(entry.actionDetails);
        const oldStatus = details ? String(details.oldStatus ?? '') : '';
        const newStatus = details ? String(details.newStatus ?? '') : '';
        const hasStatusChange = oldStatus !== '' && newStatus !== '' && oldStatus !== newStatus;

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border" />
              {i < entries.length - 1 && <div className="w-px flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0">
              <p className="heading-detail">
                {ACTION_LABELS[entry.actionType] ?? entry.actionType}
              </p>
              {hasStatusChange && (
                <p className="text-sm text-text-muted">
                  {STATUS_LABEL[oldStatus] ?? oldStatus} → {STATUS_LABEL[newStatus] ?? newStatus}
                </p>
              )}
              <p className="text-sm text-text-secondary">
                {formatDateTimeCH(entry.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
