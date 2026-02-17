'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  foundationId: string;
  foundationName: string;
}

export default function AddToPipelineButton({ foundationId, foundationName }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      router.push('/fundraising/applications');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  if (state === 'success') {
    return (
      <p className="text-sm font-medium text-green-600">
        ✓ {foundationName} zur Pipeline hinzugefügt
      </p>
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
