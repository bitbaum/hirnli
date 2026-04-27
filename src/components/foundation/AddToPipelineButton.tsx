'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
        <p className="text-sm font-semibold text-success">
          ✓ {foundationName} zur Pipeline hinzugefügt
        </p>

        {/* Step trail — shows where the fundraiser is in the process */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className={i === 0
                ? 'rounded bg-success-bg px-2 py-0.5 font-semibold text-success'
                : 'rounded bg-bg-light px-2 py-0.5 text-text-muted'
              }>
                {i === 0 ? `✓ ${step}` : step}
              </span>
              {i < STEPS.length - 1 && <span className="text-text-muted">→</span>}
            </span>
          ))}
        </div>

        <Button
          href={`/fundraising/stiftungen/${foundationId}/gesuch`}
          fullWidth
        >
          Gesuch schreiben →
        </Button>
        <Button
          href="/fundraising/applications"
          variant="secondary"
          fullWidth
        >
          Pipeline ansehen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={handleClick}
        disabled={state === 'loading'}
        fullWidth
      >
        {state === 'loading' ? 'Wird hinzugefügt...' : 'Gesuch starten'}
      </Button>
      {state === 'error' && error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
