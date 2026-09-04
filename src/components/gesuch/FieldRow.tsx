'use client';

import { useState } from 'react';
import { AI_PRESETS } from '@/lib/config/ai-presets';
import { buildExternalPrompt } from '@/lib/domain/prompt-builder';
import type { FoundationAIContext } from '@/lib/domain/ai-context';
import { UI_TIMINGS } from '@/lib/config/ui-timings';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import Spinner from '@/components/ui/Spinner';
import { useTenant } from '@/lib/tenant/TenantProvider';

interface FieldRowProps {
  label: string;
  fieldDescription: string;
  value: string;
  originalValue: string;
  placeholder: string;
  fieldPath: string;
  multiline?: boolean;
  foundationContext?: FoundationAIContext;
  schwerpunktLabel?: string;
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
  onChange: (val: string) => void;
  onBlur?: () => void;
}

export default function FieldRow({
  label,
  fieldDescription,
  value,
  originalValue,
  placeholder,
  fieldPath,
  multiline = false,
  foundationContext,
  schwerpunktLabel,
  onAiRewrite,
  onChange,
  onBlur,
}: FieldRowProps) {
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const { copied, copy } = useCopyToClipboard({ resetAfter: UI_TIMINGS.copySuccessShort });

  const isModified = value !== originalValue;

  // The prompt tells a frontier model who it is writing for. Read from the
  // provider, not imported: this text is pasted into ChatGPT and comes back as
  // Gesuch prose, so the wrong organisation here is invisible until it is sent.
  const tenant = useTenant();

  const copyPrompt = () => {
    if (!foundationContext || !value.trim()) return;
    const prompt = buildExternalPrompt({
      tenant,
      foundation: foundationContext,
      schwerpunktLabel,
      fieldDescription,
      currentText: value,
    });
    copy(prompt);
  };

  const runAi = async (instruction: string) => {
    if (!instruction.trim() || !value.trim()) return;
    setAiLoading(true);
    setAiError('');
    const result = await onAiRewrite({
      instruction,
      currentText: value,
      fieldPath,
      fieldDescription,
    });
    if (result) {
      onChange(result);
      setAiInstruction('');
      setShowAi(false);
    } else {
      setAiError('KI nicht verfügbar — bitte manuell bearbeiten.');
    }
    setAiLoading(false);
  };

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="heading-xs-label">{label}</label>
          {isModified && (
            <button
              type="button"
              onClick={() => onChange(originalValue)}
              className="inline-flex min-h-[44px] items-center rounded text-sm text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              title="Auf Original zurücksetzen"
            >
              ↩ zurücksetzen
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {foundationContext && (
            <button
              type="button"
              onClick={copyPrompt}
              className="flex min-h-[44px] items-center gap-1 rounded px-2 text-sm text-text-muted transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              title="Prompt für externes KI-Tool kopieren"
            >
              {copied ? '✓ Kopiert' : '📋 Prompt'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowAi((v) => !v);
              setAiError('');
            }}
            className={`flex min-h-[44px] items-center gap-1 rounded px-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              showAi ? 'bg-accent-muted text-primary-text' : 'text-text-muted hover:text-primary'
            }`}
            title="KI-Überarbeitung"
          >
            <span>✦</span> KI
          </button>
        </div>
      </div>

      {/* Text input */}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className="block w-full resize-y rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="block w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
      )}
      {/* Field location hint */}
      <p className="text-sm text-text-muted">{fieldDescription}</p>

      {/* AI panel */}
      {showAi && (
        <div className="rounded-md border border-accent-border bg-accent-soft p-3 space-y-2">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {AI_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={aiLoading}
                onClick={() => runAi(preset.instruction)}
                className="min-h-11 rounded-full border border-primary/30 bg-surface-base px-2.5 py-1 text-sm text-primary-text transition hover:bg-primary hover:text-white disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom instruction */}
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runAi(aiInstruction);
                if (e.key === 'Escape') setShowAi(false);
              }}
              placeholder="Eigene Anweisung, z.B. «Auf Winterthur-Fokus anpassen»"
              className="min-w-0 flex-1 rounded bg-surface-raised px-2.5 py-1.5 text-sm text-text-secondary outline-none ring-1 ring-border focus-visible:ring-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={() => runAi(aiInstruction)}
              disabled={aiLoading || !aiInstruction.trim()}
              className="shrink-0 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
            >
              {aiLoading ? (
                <span className="flex items-center gap-1">
                  <Spinner size="xs" tone="on-accent" label="Wird überarbeitet…" />
                  Wird überarbeitet…
                </span>
              ) : (
                'Umschreiben'
              )}
            </button>
          </div>

          {aiError && <p className="text-sm text-danger-text">{aiError}</p>}
        </div>
      )}
    </div>
  );
}
