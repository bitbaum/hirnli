'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  foundationId: string;
  foundationName: string;
}

const STEPS = ['Hinzugefügt', 'Gesuch schreiben', 'PDF generieren', 'Einreichen'];

export default function AddToPipelineButton({ foundationId, foundationName }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setState('loading');
    setError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundationId, status: 'prospect' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fehler ${res.status}`);
      }

      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  if (state === 'success') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-green-700">
          ✓ {foundationName} zur Pipeline hinzugefügt
        </p>

        {/* Step trail — shows where the fundraiser is in the process */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className={i === 0
                ? 'rounded bg-green-100 px-2 py-0.5 font-semibold text-green-700'
                : 'rounded bg-gray-100 px-2 py-0.5 text-gray-500'
              }>
                {i === 0 ? `✓ ${step}` : step}
              </span>
              {i < STEPS.length - 1 && <span className="text-gray-400">→</span>}
            </span>
          ))}
        </div>

        <Link
          href={`/fundraising/stiftungen/${foundationId}/gesuch`}
          className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary/90"
        >
          Gesuch schreiben →
        </Link>
        <Link
          href="/fundraising/applications"
          className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm text-text-muted hover:bg-bg-light"
        >
          Pipeline ansehen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleClick}
        disabled={state === 'loading'}
        className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {state === 'loading' ? 'Wird hinzugefügt...' : 'Gesuch starten'}
      </button>
      {state === 'error' && error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
