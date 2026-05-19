'use client';

import FieldRow from './FieldRow';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { AnschreibenText } from '@/lib/domain/gesuch-composer';
import type { FoundationAIContext } from '@/lib/domain/ai-context';

interface GesuchAnschreibenFieldsProps {
  overrideAnschreiben: GesuchOverridesData['anschreiben'];
  generatedAnschreiben: AnschreibenText;
  fieldShared: { foundationContext?: FoundationAIContext; schwerpunktLabel?: string };
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
  onSaveIfDirty?: () => Promise<void>;
  onPatch: (partial: NonNullable<GesuchOverridesData['anschreiben']>) => void;
}

export default function GesuchAnschreibenFields({
  overrideAnschreiben,
  generatedAnschreiben,
  fieldShared,
  onAiRewrite,
  onSaveIfDirty,
  onPatch,
}: GesuchAnschreibenFieldsProps) {
  const subject = overrideAnschreiben?.subject ?? generatedAnschreiben.subject;
  const opening = overrideAnschreiben?.opening ?? generatedAnschreiben.opening;
  const themeAlignment = overrideAnschreiben?.themeAlignment ?? generatedAnschreiben.themeAlignment;
  const closing = overrideAnschreiben?.closing ?? generatedAnschreiben.closing;

  return (
    <div className="border-t border-border-default pt-4">
      <p className="mb-4 heading-xs-label">Anschreiben (Begleitbrief)</p>
      <div className="space-y-4">
        <FieldRow
          {...fieldShared}
          label="Betreff"
          fieldDescription="Betreffzeile des Anschreibens — erscheint als Titel im Begleitbrief."
          value={subject}
          originalValue={generatedAnschreiben.subject}
          placeholder={generatedAnschreiben.subject}
          fieldPath="anschreiben.subject"
          onAiRewrite={onAiRewrite}
          onChange={(v) => onPatch({ subject: v })}
          onBlur={onSaveIfDirty}
        />
        <FieldRow
          {...fieldShared}
          label="Einstieg"
          fieldDescription="Erster Absatz des Anschreibens — erklärt, warum wir diese Stiftung kontaktieren."
          value={opening}
          originalValue={generatedAnschreiben.opening}
          placeholder={generatedAnschreiben.opening}
          fieldPath="anschreiben.opening"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => onPatch({ opening: v })}
          onBlur={onSaveIfDirty}
        />
        <FieldRow
          {...fieldShared}
          label="Thematische Passung"
          fieldDescription="Absatz im Anschreiben, der die inhaltliche Übereinstimmung mit dem Stiftungszweck aufzeigt."
          value={themeAlignment}
          originalValue={generatedAnschreiben.themeAlignment}
          placeholder={generatedAnschreiben.themeAlignment}
          fieldPath="anschreiben.themeAlignment"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => onPatch({ themeAlignment: v })}
          onBlur={onSaveIfDirty}
        />
        <FieldRow
          {...fieldShared}
          label="Schluss"
          fieldDescription="Abschlussabsatz des Anschreibens — Dank und Ausblick."
          value={closing}
          originalValue={generatedAnschreiben.closing}
          placeholder={generatedAnschreiben.closing}
          fieldPath="anschreiben.closing"
          multiline
          onAiRewrite={onAiRewrite}
          onChange={(v) => onPatch({ closing: v })}
          onBlur={onSaveIfDirty}
        />
      </div>
    </div>
  );
}
