'use client';

import { useState } from 'react';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { UI_TIMINGS } from '@/lib/config/ui-timings';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { WhySection, TrackRecord } from '@/lib/schemas/story';
import type { AnschreibenText } from '@/lib/domain/gesuch-composer';
import FieldRow from './FieldRow';
import GesuchAnschreibenFields from './GesuchAnschreibenFields';
import { Button } from '@/components/ui/Button';
import type { FoundationAIContext } from '@/lib/domain/ai-context';

interface GesuchEditPanelProps {
  foundationName: string;
  overrides: GesuchOverridesData;
  foundationContext?: FoundationAIContext;
  schwerpunktLabel?: string;
  generated: {
    foundationBridge?: string;
    why?: WhySection;
    trackRecord: TrackRecord;
    anschreiben: AnschreibenText;
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

export default function GesuchEditPanel({
  foundationName,
  overrides,
  foundationContext,
  schwerpunktLabel,
  generated,
  saving,
  dirty,
  onUpdate,
  onSave,
  onSaveIfDirty,
  onReset,
  onAiRewrite,
}: GesuchEditPanelProps) {
  // Derive all field values from props — no local state duplication.
  // The hook manages overrides (including async load from DB); local useState
  // would freeze at mount time and miss data that loads after render.
  const bridge = overrides.foundationBridge ?? generated.foundationBridge ?? '';
  const whyHeadline = overrides.why?.headline ?? generated.why?.headline ?? '';
  const whyHook = overrides.why?.hook ?? generated.why?.hook ?? '';
  const whyProblem = overrides.why?.problem ?? generated.why?.problem ?? '';
  const whySolution = overrides.why?.solution ?? generated.why?.solution ?? '';
  const howHeadline = overrides.how?.trackRecord?.headline ?? generated.trackRecord.headline ?? '';
  const howText = overrides.how?.trackRecord?.text ?? generated.trackRecord.text ?? '';
  // Shared props for all FieldRow instances (copy prompt support)
  const fieldShared = { foundationContext, schwerpunktLabel };

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = async () => {
    setSaveError('');
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), UI_TIMINGS.savedIndicator);
    } catch {
      setSaveError('Speichern fehlgeschlagen — bitte erneut versuchen.');
    }
  };

  const handleReset = async () => {
    setResetConfirm(false);
    await onReset();
  };

  function patch(updates: GesuchOverridesData) {
    onUpdate(updates);
  }

  return (
    <div className="rounded-2xl border border-accent-border bg-accent-soft p-6 print:hidden">
      {/* Header — stacks vertically on mobile */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="heading-item">
            ✏️ Gesuch anpassen
            <span className="ml-2 text-sm font-normal text-text-muted">→ {foundationName}</span>
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Änderungen überschreiben den generierten Text. PDF und HTML-Vorschau verwenden die
            gespeicherte Version.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saved && <span className="text-sm font-medium text-success-text">Gespeichert ✓</span>}
          {saveError && <span className="text-sm font-medium text-danger-text">{saveError}</span>}
          {dirty && !saved && !saveError && !resetConfirm && (
            <span className="text-sm text-text-muted">Ungespeichert</span>
          )}
          {resetConfirm ? (
            <>
              <span className="text-sm font-medium text-danger-text">Wirklich zurücksetzen?</span>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition hover:bg-surface-raised"
              >
                Nein
              </button>
              <Button variant="danger" size="sm" onClick={handleReset}>
                Ja, zurücksetzen
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                disabled={saving}
                className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition hover:bg-surface-raised hover:text-danger disabled:opacity-50"
                title="Alle Änderungen verwerfen und auf generierten Text zurücksetzen"
              >
                Alles zurücksetzen
              </button>
              <Button variant="soft" size="sm" disabled={saving || !dirty} onClick={handleSave}>
                {saving ? 'Speichern…' : 'Speichern'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Foundation bridge */}
        <FieldRow
          {...fieldShared}
          label="Verbindungssatz (Hero)"
          fieldDescription={`Erscheint im Hero-Bereich des Gesuchs — erklärt, warum Stiftung und ${ORG_PROFILE.name} zusammenpassen.`}
          value={bridge}
          originalValue={generated.foundationBridge ?? ''}
          placeholder={
            generated.foundationBridge ??
            'Verbindungssatz zwischen Stiftungszweck und unserer Mission'
          }
          fieldPath="foundationBridge"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => patch({ foundationBridge: v })}
          onBlur={onSaveIfDirty}
        />

        {/* 2. Why section */}
        {generated.why && (
          <>
            <div className="border-t border-border-default pt-4">
              <p className="mb-4 heading-xs-label">Warum-Abschnitt</p>
              <div className="space-y-4">
                <FieldRow
                  {...fieldShared}
                  label="Überschrift"
                  fieldDescription="Erscheint als Hauptüberschrift im «Warum»-Abschnitt — formuliert das Kernproblem als Hook."
                  value={whyHeadline}
                  originalValue={generated.why.headline}
                  placeholder={generated.why.headline}
                  fieldPath="why.headline"
                  onAiRewrite={onAiRewrite}
                  onChange={(v) => patch({ why: { headline: v } })}
                  onBlur={onSaveIfDirty}
                />
                <FieldRow
                  {...fieldShared}
                  label="Einleitung"
                  fieldDescription="Erscheint als erster Absatz im «Warum»-Abschnitt — rahmt das Problem aus Stiftungsperspektive ein."
                  value={whyHook}
                  originalValue={generated.why.hook}
                  placeholder={generated.why.hook}
                  fieldPath="why.hook"
                  multiline
                  onAiRewrite={onAiRewrite}
                  onChange={(v) => patch({ why: { hook: v } })}
                  onBlur={onSaveIfDirty}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRow
                    {...fieldShared}
                    label="Problem"
                    fieldDescription="Erscheint in der linken Spalte im «Warum»-Abschnitt — beschreibt das gesellschaftliche Problem."
                    value={whyProblem}
                    originalValue={generated.why.problem}
                    placeholder={generated.why.problem}
                    fieldPath="why.problem"
                    multiline
                    onAiRewrite={onAiRewrite}
                    onChange={(v) => patch({ why: { problem: v } })}
                    onBlur={onSaveIfDirty}
                  />
                  <FieldRow
                    {...fieldShared}
                    label="Lösung"
                    fieldDescription={`Erscheint in der rechten Spalte im «Warum»-Abschnitt — zeigt wie ${ORG_PROFILE.name} das Problem löst.`}
                    value={whySolution}
                    originalValue={generated.why.solution}
                    placeholder={generated.why.solution}
                    fieldPath="why.solution"
                    multiline
                    onAiRewrite={onAiRewrite}
                    onChange={(v) => patch({ why: { solution: v } })}
                    onBlur={onSaveIfDirty}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. How / Track Record */}
        <div className="border-t border-border-default pt-4">
          <p className="mb-4 heading-xs-label">Wie-Abschnitt (Track Record)</p>
          <div className="space-y-4">
            <FieldRow
              {...fieldShared}
              label="Überschrift"
              fieldDescription="Erscheint als Überschrift im «Wie»-Abschnitt — benennt Erfahrung und Kompetenz."
              value={howHeadline}
              originalValue={generated.trackRecord.headline}
              placeholder={generated.trackRecord.headline}
              fieldPath="how.trackRecord.headline"
              onAiRewrite={onAiRewrite}
              onChange={(v) => patch({ how: { trackRecord: { headline: v } } })}
              onBlur={onSaveIfDirty}
            />
            <FieldRow
              {...fieldShared}
              label="Text"
              fieldDescription="Erscheint als Haupttext im «Wie»-Abschnitt — belegt Erfahrung mit konkreten Fakten und Zahlen."
              value={howText}
              originalValue={generated.trackRecord.text}
              placeholder={generated.trackRecord.text}
              fieldPath="how.trackRecord.text"
              multiline
              onAiRewrite={onAiRewrite}
              onChange={(v) => patch({ how: { trackRecord: { text: v } } })}
              onBlur={onSaveIfDirty}
            />
          </div>
        </div>

        {/* 4. Anschreiben (Cover Letter) */}
        <GesuchAnschreibenFields
          overrideAnschreiben={overrides.anschreiben}
          generatedAnschreiben={generated.anschreiben}
          fieldShared={fieldShared}
          onAiRewrite={onAiRewrite}
          onSaveIfDirty={onSaveIfDirty}
          onPatch={(partial) => patch({ anschreiben: partial })}
        />
      </div>
    </div>
  );
}
