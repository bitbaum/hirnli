'use client';

import { useState } from 'react';
import { AI_PRESETS } from '@/lib/config/ai-presets';

export interface FieldRowProps {
  label: string;
  fieldDescription: string;
  value: string;
  originalValue: string;
  placeholder: string;
  fieldPath: string;
  multiline?: boolean;
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
  onAiRewrite,
  onChange,
  onBlur,
}: FieldRowProps) {
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const isModified = value !== originalValue;

  const runAi = async (instruction: string) => {
    if (!instruction.trim() || !value.trim()) return;
    setAiLoading(true);
    setAiError('');
    const result = await onAiRewrite({ instruction, currentText: value, fieldPath, fieldDescription });
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
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </label>
          {isModified && (
            <button
              type="button"
              onClick={() => onChange(originalValue)}
              className="text-xs text-text-muted hover:text-red-500"
              title="Auf Original zurücksetzen"
            >
              ↩ zurücksetzen
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setShowAi((v) => !v); setAiError(''); }}
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition ${
            showAi ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-primary'
          }`}
          title="KI-Überarbeitung"
        >
          <span>✦</span> KI
        </button>
      </div>

      {/* Text input */}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className="block w-full resize-y rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="block w-full rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
      )}
      {/* Field location hint */}
      <p className="text-xs text-text-muted">{fieldDescription}</p>

      {/* AI panel */}
      {showAi && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {AI_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={aiLoading}
                onClick={() => runAi(preset.instruction)}
                className="min-h-[44px] rounded-full border border-primary/30 bg-white px-2.5 py-1 text-xs text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
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
              className="min-w-0 flex-1 rounded bg-white px-2.5 py-1.5 text-xs text-text-light outline-none ring-1 ring-border focus-visible:ring-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={() => runAi(aiInstruction)}
              disabled={aiLoading || !aiInstruction.trim()}
              className="shrink-0 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
            >
              {aiLoading ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Wird überarbeitet…
                </span>
              ) : (
                'Umschreiben'
              )}
            </button>
          </div>

          {aiError && (
            <p className="text-xs text-red-500">{aiError}</p>
          )}
        </div>
      )}
    </div>
  );
}
