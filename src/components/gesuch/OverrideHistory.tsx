'use client';

/**
 * OverrideHistory — Drawer showing version history of gesuch overrides.
 *
 * Fetches activity log entries for gesuch_override, shows timeline of saves
 * with changed fields, and allows rollback to a previous version.
 */

import { useState, useEffect } from 'react';
import { formatDateTimeCH } from '@/lib/utils/format';
import type { GesuchOverridesData } from '@/lib/db/schema';

interface OverrideHistoryProps {
  slug: string;
  variantKey?: string;
  open: boolean;
  onClose: () => void;
  onRestore: (overrides: GesuchOverridesData) => void;
}

interface ActivityEntry {
  id: string;
  actionDetails: string | null;
  timestamp: string;
}


/** Extract override keys that have non-empty values */
function getFieldKeys(overrides: GesuchOverridesData): string[] {
  const keys: string[] = [];
  if (overrides.foundationBridge) keys.push('Verbindungssatz');
  if (overrides.why?.headline || overrides.why?.hook || overrides.why?.problem || overrides.why?.solution) {
    keys.push('Warum-Abschnitt');
  }
  if (overrides.how?.trackRecord?.headline || overrides.how?.trackRecord?.text) {
    keys.push('Track Record');
  }
  if (overrides.anschreiben?.subject || overrides.anschreiben?.opening || overrides.anschreiben?.themeAlignment || overrides.anschreiben?.closing) {
    keys.push('Anschreiben');
  }
  return keys;
}

export default function OverrideHistory({ slug, variantKey, open, onClose, onRestore }: OverrideHistoryProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(false);
    const entityId = variantKey && variantKey !== 'auto' ? `${slug}::${variantKey}` : slug;
    fetch(`/api/activity-log?entityId=${entityId}&entityType=gesuch_override&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEntries(d.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, open, variantKey]);

  if (!open) return null;

  async function handleRestore(entry: ActivityEntry) {
    if (!entry.actionDetails) return;
    setRestoreError(null);
    try {
      const details = JSON.parse(entry.actionDetails) as { overrides?: GesuchOverridesData };
      if (!details.overrides) return;

      setRestoring(entry.id);
      const res = await fetch(`/api/gesuch-overrides/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details.overrides),
      });
      const result = await res.json();
      if (result.success) {
        onRestore(details.overrides);
        onClose();
      } else {
        setRestoreError(result.error ?? 'Wiederherstellen fehlgeschlagen.');
      }
    } catch {
      setRestoreError('Netzwerkfehler — bitte erneut versuchen.');
    } finally {
      setRestoring(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-grey-dark">Versionshistorie</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-light hover:text-grey-dark"
          >
            ✕
          </button>
        </div>

        {restoreError && (
          <div className="border-b border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger">
            {restoreError}
          </div>
        )}

        <div className="p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted py-4">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              Lade Versionen…
            </div>
          ) : error ? (
            <p className="text-sm text-text-muted py-4">Versionshistorie konnte nicht geladen werden.</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-text-muted py-4">Noch keine gespeicherten Versionen.</p>
          ) : (
            <div className="space-y-0">
              {entries.map((entry, i) => {
                let overrides: GesuchOverridesData | null = null;
                try {
                  const details = JSON.parse(entry.actionDetails ?? '{}');
                  overrides = details.overrides ?? null;
                } catch { /* ignore */ }

                const fieldKeys = overrides ? getFieldKeys(overrides) : [];

                return (
                  <div key={entry.id} className="flex gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border'}`} />
                      {i < entries.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>

                    {/* Content */}
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-grey-dark">
                            {formatDateTimeCH(entry.timestamp)}
                          </p>
                          {fieldKeys.length > 0 && (
                            <p className="text-sm text-text-muted mt-0.5">
                              {fieldKeys.join(', ')}
                            </p>
                          )}
                        </div>
                        {overrides && i > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRestore(entry)}
                            disabled={restoring === entry.id}
                            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-text-muted hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
                          >
                            {restoring === entry.id ? '…' : 'Wiederherstellen'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
