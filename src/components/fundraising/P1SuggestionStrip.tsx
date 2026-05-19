'use client';

import { useState } from 'react';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { createApplication } from '@/lib/api/applications';

interface Props {
  trackedIds: Set<string>;
  onAdded: () => void;
}

export function P1SuggestionStrip({ trackedIds, onAdded }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const untracked = STIFTUNGEN_DATA
    .filter((f) => f.priority === 1 && !trackedIds.has(f.slug))
    .sort((a, b) => b.fitScore - a.fitScore);

  if (untracked.length === 0) return null;

  async function handleAdd(slug: string) {
    setAdding(slug);
    setErrors((prev) => { const next = { ...prev }; delete next[slug]; return next; });
    const result = await createApplication(slug, 'prospect');
    setAdding(null);
    if (result.success) {
      onAdded();
    } else {
      setErrors((prev) => ({ ...prev, [slug]: result.error ?? 'Fehler' }));
    }
  }

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-1 rounded"
      >
        <span className="text-sm font-medium text-warning-text">
          {untracked.length} P1-Stiftung{untracked.length !== 1 ? 'en' : ''} noch nicht in Pipeline
        </span>
        <span className="text-xs text-text-muted">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-1">
          {untracked.map((f) => (
            <div
              key={f.slug}
              className="flex items-center justify-between gap-3 rounded px-2 py-1.5 hover:bg-warning/10"
            >
              <div className="flex min-w-0 items-center gap-3">
                <a
                  href={`/fundraising/stiftungen/${f.slug}`}
                  className="truncate text-sm font-medium text-text-primary hover:underline"
                >
                  {f.name}
                </a>
                <span className="shrink-0 text-xs text-text-muted">Fit {f.fitScore}/10</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {errors[f.slug] && (
                  <span className="text-xs text-danger-text">{errors[f.slug]}</span>
                )}
                <button
                  onClick={() => handleAdd(f.slug)}
                  disabled={adding === f.slug}
                  className="rounded bg-warning/15 px-2 py-1 text-xs font-medium text-warning-text hover:bg-warning/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-1"
                >
                  {adding === f.slug ? '…' : '+ Hinzufügen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
