'use client';

import { useState } from 'react';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { WhySection, TrackRecord } from '@/lib/schemas/story';

interface GesuchEditPanelProps {
  slug: string;
  overrides: GesuchOverridesData;
  generated: {
    foundationBridge?: string;
    why?: WhySection;
    trackRecord: TrackRecord;
  };
  saving: boolean;
  dirty: boolean;
  onUpdate: (patch: GesuchOverridesData) => void;
  onSave: () => Promise<void>;
  onReset: () => Promise<void>;
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
  }) => Promise<string | null>;
}

interface FieldRowProps {
  label: string;
  value: string;
  originalValue: string;
  placeholder: string;
  fieldPath: string;
  multiline?: boolean;
  onAiRewrite: GesuchEditPanelProps['onAiRewrite'];
  onChange: (val: string) => void;
}

function FieldRow({
  label,
  value,
  originalValue,
  placeholder,
  fieldPath,
  multiline = false,
  onAiRewrite,
  onChange,
}: FieldRowProps) {
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const isModified = value !== originalValue;

  const handleAi = async () => {
    if (!aiInstruction.trim()) return;
    setAiLoading(true);
    const result = await onAiRewrite({ instruction: aiInstruction, currentText: value, fieldPath });
    if (result) {
      onChange(result);
      setAiInstruction('');
      setShowAi(false);
    }
    setAiLoading(false);
  };

  return (
    <div className="space-y-1">
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
              ↩
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAi((v) => !v)}
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition ${
            showAi ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-primary'
          }`}
          title="KI-Überarbeitung"
        >
          <span>✦</span> KI
        </button>
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="block w-full resize-y rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      )}

      {showAi && (
        <div className="flex gap-2 rounded-md border border-primary/20 bg-primary/5 p-2">
          <input
            type="text"
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAi();
              if (e.key === 'Escape') setShowAi(false);
            }}
            placeholder="z.B. «Kürzer», «Mehr Zahlen», «Auf Klimaschutz fokussieren»"
            className="min-w-0 flex-1 rounded bg-transparent px-2 py-1 text-xs text-text-light outline-none placeholder:text-text-muted"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAi}
            disabled={aiLoading || !aiInstruction.trim()}
            className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {aiLoading ? '...' : 'Umschreiben'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function GesuchEditPanel({
  overrides,
  generated,
  saving,
  dirty,
  onUpdate,
  onSave,
  onReset,
  onAiRewrite,
}: GesuchEditPanelProps) {
  // Local state for fields — initialized from overrides, fall back to generated
  const [bridge, setBridge] = useState(overrides.foundationBridge ?? generated.foundationBridge ?? '');
  const [whyHeadline, setWhyHeadline] = useState(overrides.why?.headline ?? generated.why?.headline ?? '');
  const [whyHook, setWhyHook] = useState(overrides.why?.hook ?? generated.why?.hook ?? '');
  const [whyProblem, setWhyProblem] = useState(overrides.why?.problem ?? generated.why?.problem ?? '');
  const [whySolution, setWhySolution] = useState(overrides.why?.solution ?? generated.why?.solution ?? '');
  const [howHeadline, setHowHeadline] = useState(overrides.how?.trackRecord?.headline ?? generated.trackRecord.headline ?? '');
  const [howText, setHowText] = useState(overrides.how?.trackRecord?.text ?? generated.trackRecord.text ?? '');
  const [saved, setSaved] = useState(false);

  function patch(updates: GesuchOverridesData) {
    onUpdate(updates);
  }

  const handleSave = async () => {
    await onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 print:hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-grey-dark">Gesuch anpassen</h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Änderungen werden gespeichert und beim nächsten Laden angezeigt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && !saved && (
            <span className="text-xs text-text-muted">Ungespeicherte Änderungen</span>
          )}
          {saved && (
            <span className="text-xs font-medium text-green-600">Gespeichert ✓</span>
          )}
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm text-text-muted transition hover:bg-bg-light hover:text-red-500 disabled:opacity-50"
          >
            Zurücksetzen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Foundation bridge */}
        <FieldRow
          label="Verbindungstext (Hero)"
          value={bridge}
          originalValue={generated.foundationBridge ?? ''}
          placeholder={generated.foundationBridge ?? 'Kurzer Brückentext zwischen unserer Mission und der Stiftung'}
          fieldPath="foundationBridge"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => {
            setBridge(v);
            patch({ foundationBridge: v });
          }}
        />

        {generated.why && (
          <>
            <hr className="border-border" />
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Warum-Abschnitt
            </p>

            <FieldRow
              label="Überschrift"
              value={whyHeadline}
              originalValue={generated.why.headline}
              placeholder={generated.why.headline}
              fieldPath="why.headline"
              onAiRewrite={onAiRewrite}
              onChange={(v) => {
                setWhyHeadline(v);
                patch({ why: { headline: v } });
              }}
            />
            <FieldRow
              label="Einleitung"
              value={whyHook}
              originalValue={generated.why.hook}
              placeholder={generated.why.hook}
              fieldPath="why.hook"
              multiline
              onAiRewrite={onAiRewrite}
              onChange={(v) => {
                setWhyHook(v);
                patch({ why: { hook: v } });
              }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldRow
                label="Problem"
                value={whyProblem}
                originalValue={generated.why.problem}
                placeholder={generated.why.problem}
                fieldPath="why.problem"
                multiline
                onAiRewrite={onAiRewrite}
                onChange={(v) => {
                  setWhyProblem(v);
                  patch({ why: { problem: v } });
                }}
              />
              <FieldRow
                label="Lösung"
                value={whySolution}
                originalValue={generated.why.solution}
                placeholder={generated.why.solution}
                fieldPath="why.solution"
                multiline
                onAiRewrite={onAiRewrite}
                onChange={(v) => {
                  setWhySolution(v);
                  patch({ why: { solution: v } });
                }}
              />
            </div>
          </>
        )}

        <hr className="border-border" />
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Wie-Abschnitt (Track Record)
        </p>

        <FieldRow
          label="Überschrift"
          value={howHeadline}
          originalValue={generated.trackRecord.headline}
          placeholder={generated.trackRecord.headline}
          fieldPath="how.trackRecord.headline"
          onAiRewrite={onAiRewrite}
          onChange={(v) => {
            setHowHeadline(v);
            patch({ how: { trackRecord: { headline: v } } });
          }}
        />
        <FieldRow
          label="Text"
          value={howText}
          originalValue={generated.trackRecord.text}
          placeholder={generated.trackRecord.text}
          fieldPath="how.trackRecord.text"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => {
            setHowText(v);
            patch({ how: { trackRecord: { text: v } } });
          }}
        />
      </div>
    </div>
  );
}
