'use client';

import { useState, useEffect } from 'react';
import { createApplication, getApplicationsByFoundation } from '@/lib/api/applications';
import { isActiveApplication, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { Button } from '@/components/ui/Button';

interface Props {
  foundationId: string;
  foundationName: string;
  priorityLevel?: number;
  onConflict?: () => void;
}

const STEPS = ['Hinzugefügt', 'Gesuch schreiben', 'PDF generieren', 'Einreichen'];

export default function AddToPipelineButton({ foundationId, foundationName, priorityLevel, onConflict }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'conflict' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Pre-check: if an active application already exists, show conflict state immediately
  useEffect(() => {
    getApplicationsByFoundation(foundationId).then((res) => {
      if (!res.success) return;
      const active = (res.data as Array<{ application: { id: string; status: ApplicationStatusId } }> ?? [])
        .find((row) => isActiveApplication(row.application.status));
      if (active) {
        setExistingId(active.application.id);
        setState('conflict');
        onConflict?.();
      }
    });
  }, [foundationId]);

  async function handleClick() {
    setState('loading');
    setError(null);

    try {
      const res = await createApplication(foundationId, 'prospect', priorityLevel);
      if (res.httpStatus === 409) {
        setExistingId(res.existingId ?? null);
        setState('conflict');
        onConflict?.();
        return;
      }
      if (!res.success) {
        throw new Error(res.error || `Fehler ${res.httpStatus}`);
      }
      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  if (state === 'conflict') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-warning-text">
          {foundationName} ist bereits in der Pipeline.
        </p>
        <div className="flex flex-col gap-2">
          {existingId && (
            <Button href={`/fundraising/applications/${existingId}`} fullWidth>
              Gesuch öffnen →
            </Button>
          )}
          <Button href="/fundraising/applications" variant="secondary" fullWidth>
            Pipeline ansehen
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="space-y-3">
        <p className="heading-detail text-success-text">
          ✓ {foundationName} zur Pipeline hinzugefügt
        </p>

        {/* Step trail — shows where the fundraiser is in the process */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className={i === 0
                ? 'rounded bg-success-bg px-2 py-0.5 font-semibold text-success-text'
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
        <p className="text-sm text-danger-text">{error}</p>
      )}
    </div>
  );
}
