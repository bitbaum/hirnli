'use client';

import { useState } from 'react';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { WhySection, TrackRecord } from '@/lib/schemas/story';

interface GesuchEditPanelProps {
  foundationName: string;
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
  onSaveIfDirty?: () => Promise<void>;
  onReset: () => Promise<void>;
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
}

// Most common AI editing tasks — one click sends directly
const AI_PRESETS = [
  { label: 'Kürzer', instruction: 'Kürze auf maximal 2 Sätze, behalte den Kern' },
  { label: 'Auf Stiftung fokussieren', instruction: 'Passe den Text noch besser auf den Stiftungszweck und die Förderbereiche dieser Stiftung an' },
  { label: 'Überzeugender', instruction: 'Mache den Text überzeugender — stärker, handlungsorientierter, mit klarem Nutzen für die Stiftung' },
  { label: 'Mehr Zahlen', instruction: 'Integriere konkrete Zahlen und messbare Fakten aus dem Kontext (z.B. 150 Geräte, 285 kg CO₂, 75% Reuse-Rate)' },
  { label: 'Formeller', instruction: 'Schreibe formeller — für ein offizielles Schweizer Fördergesuch' },
];

interface FieldRowProps {
  label: string;
  fieldDescription: string;
  value: string;
  originalValue: string;
  placeholder: string;
  fieldPath: string;
  multiline?: boolean;
  onAiRewrite: GesuchEditPanelProps['onAiRewrite'];
  onChange: (val: string) => void;
  onBlur?: () => void;
}

function FieldRow({
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
          className="block w-full resize-y rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="block w-full rounded-md border border-border bg-bg-light px-3 py-2 text-sm text-text-light outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="rounded-full border border-primary/30 bg-white px-2.5 py-0.5 text-xs text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
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
              className="min-w-0 flex-1 rounded bg-white px-2.5 py-1.5 text-xs text-text-light outline-none ring-1 ring-border focus:ring-primary"
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

export default function GesuchEditPanel({
  foundationName,
  overrides,
  generated,
  saving,
  dirty,
  onUpdate,
  onSave,
  onSaveIfDirty,
  onReset,
  onAiRewrite,
}: GesuchEditPanelProps) {
  const [bridge, setBridge] = useState(overrides.foundationBridge ?? generated.foundationBridge ?? '');
  const [whyHeadline, setWhyHeadline] = useState(overrides.why?.headline ?? generated.why?.headline ?? '');
  const [whyHook, setWhyHook] = useState(overrides.why?.hook ?? generated.why?.hook ?? '');
  const [whyProblem, setWhyProblem] = useState(overrides.why?.problem ?? generated.why?.problem ?? '');
  const [whySolution, setWhySolution] = useState(overrides.why?.solution ?? generated.why?.solution ?? '');
  const [howHeadline, setHowHeadline] = useState(overrides.how?.trackRecord?.headline ?? generated.trackRecord.headline ?? '');
  const [howText, setHowText] = useState(overrides.how?.trackRecord?.text ?? generated.trackRecord.text ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  function patch(updates: GesuchOverridesData) {
    onUpdate(updates);
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 print:hidden">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-grey-dark">
            ✏️ Gesuch anpassen
            <span className="ml-2 text-sm font-normal text-text-muted">→ {foundationName}</span>
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Änderungen überschreiben den generierten Text. PDF und HTML-Vorschau verwenden die gespeicherte Version.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saved && <span className="text-xs font-medium text-green-600">Gespeichert ✓</span>}
          {dirty && !saved && <span className="text-xs text-text-muted">Ungespeichert</span>}
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="rounded-lg px-3 py-1.5 text-xs text-text-muted transition hover:bg-bg-light hover:text-red-500 disabled:opacity-50"
            title="Alle Änderungen verwerfen und auf generierten Text zurücksetzen"
          >
            Alles zurücksetzen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Foundation bridge */}
        <FieldRow
          label="Verbindungssatz (Hero)"
          fieldDescription="Erscheint im Hero-Bereich des Gesuchs — erklärt, warum Stiftung und Revamp-IT zusammenpassen."
          value={bridge}
          originalValue={generated.foundationBridge ?? ''}
          placeholder={generated.foundationBridge ?? 'Verbindungssatz zwischen Stiftungszweck und unserer Mission'}
          fieldPath="foundationBridge"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => { setBridge(v); patch({ foundationBridge: v }); }}
          onBlur={onSaveIfDirty}
        />

        {/* 2. Why section */}
        {generated.why && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                Warum-Abschnitt
              </p>
              <div className="space-y-4">
                <FieldRow
                  label="Überschrift"
                  fieldDescription="Erscheint als Hauptüberschrift im «Warum»-Abschnitt — formuliert das Kernproblem als Hook."
                  value={whyHeadline}
                  originalValue={generated.why.headline}
                  placeholder={generated.why.headline}
                  fieldPath="why.headline"
                  onAiRewrite={onAiRewrite}
                  onChange={(v) => { setWhyHeadline(v); patch({ why: { headline: v } }); }}
                  onBlur={onSaveIfDirty}
                />
                <FieldRow
                  label="Einleitung"
                  fieldDescription="Erscheint als erster Absatz im «Warum»-Abschnitt — rahmt das Problem aus Stiftungsperspektive ein."
                  value={whyHook}
                  originalValue={generated.why.hook}
                  placeholder={generated.why.hook}
                  fieldPath="why.hook"
                  multiline
                  onAiRewrite={onAiRewrite}
                  onChange={(v) => { setWhyHook(v); patch({ why: { hook: v } }); }}
                  onBlur={onSaveIfDirty}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow
                    label="Problem"
                    fieldDescription="Erscheint in der linken Spalte im «Warum»-Abschnitt — beschreibt das gesellschaftliche Problem."
                    value={whyProblem}
                    originalValue={generated.why.problem}
                    placeholder={generated.why.problem}
                    fieldPath="why.problem"
                    multiline
                    onAiRewrite={onAiRewrite}
                    onChange={(v) => { setWhyProblem(v); patch({ why: { problem: v } }); }}
                    onBlur={onSaveIfDirty}
                  />
                  <FieldRow
                    label="Lösung"
                    fieldDescription="Erscheint in der rechten Spalte im «Warum»-Abschnitt — zeigt wie Revamp-IT das Problem löst."
                    value={whySolution}
                    originalValue={generated.why.solution}
                    placeholder={generated.why.solution}
                    fieldPath="why.solution"
                    multiline
                    onAiRewrite={onAiRewrite}
                    onChange={(v) => { setWhySolution(v); patch({ why: { solution: v } }); }}
                    onBlur={onSaveIfDirty}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. How / Track Record */}
        <div className="border-t border-border pt-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
            Wie-Abschnitt (Track Record)
          </p>
          <div className="space-y-4">
            <FieldRow
              label="Überschrift"
              fieldDescription="Erscheint als Überschrift im «Wie»-Abschnitt — benennt Erfahrung und Kompetenz."
              value={howHeadline}
              originalValue={generated.trackRecord.headline}
              placeholder={generated.trackRecord.headline}
              fieldPath="how.trackRecord.headline"
              onAiRewrite={onAiRewrite}
              onChange={(v) => { setHowHeadline(v); patch({ how: { trackRecord: { headline: v } } }); }}
              onBlur={onSaveIfDirty}
            />
            <FieldRow
              label="Text"
              fieldDescription="Erscheint als Haupttext im «Wie»-Abschnitt — belegt Erfahrung mit konkreten Fakten und Zahlen."
              value={howText}
              originalValue={generated.trackRecord.text}
              placeholder={generated.trackRecord.text}
              fieldPath="how.trackRecord.text"
              multiline
              onAiRewrite={onAiRewrite}
              onChange={(v) => { setHowText(v); patch({ how: { trackRecord: { text: v } } }); }}
              onBlur={onSaveIfDirty}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
