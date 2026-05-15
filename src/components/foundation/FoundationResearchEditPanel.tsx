'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { patchFoundationResearch } from '@/lib/api/foundations';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '@/lib/utils/form-classes';

const PURPOSE_MIN = 150;
const NOTES_MIN = 250;

interface Props {
  foundationId: string;
  initialPurposeSummary: string;
  initialResearchNotes: string;
}

function CharCounter({ value, min }: { value: string; min: number }) {
  const len = value.trim().length;
  const ok = len >= min;
  const close = len >= min * 0.7 && !ok;
  return (
    <span className={`text-xs tabular-nums ${ok ? 'text-success-text' : close ? 'text-warning-text' : 'text-text-muted'}`}>
      {ok ? `✓ ${len}` : `${len} / ${min}`}
    </span>
  );
}

export default function FoundationResearchEditPanel({ foundationId, initialPurposeSummary, initialResearchNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [purpose, setPurpose] = useState(initialPurposeSummary);
  const [notes, setNotes] = useState(initialResearchNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await patchFoundationResearch(foundationId, {
      purposeSummary: purpose,
      researchNotes: notes,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? 'Fehler beim Speichern');
    }
  }

  function handleCancel() {
    setPurpose(initialPurposeSummary);
    setNotes(initialResearchNotes);
    setEditing(false);
    setError(null);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <CharCounter value={purpose} min={PURPOSE_MIN} />
          <span>Zweck</span>
          <span>·</span>
          <CharCounter value={notes} min={NOTES_MIN} />
          <span>Notizen</span>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-success-text">Gespeichert ✓</span>}
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
          >
            Bearbeiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={FORM_LABEL_CLASS}>Stiftungszweck</label>
          <CharCounter value={purpose} min={PURPOSE_MIN} />
        </div>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={4}
          placeholder="Was ist der Stiftungszweck? (aus Statuten, Website oder ESA-Register)"
          className={FORM_INPUT_CLASS}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={FORM_LABEL_CLASS}>Recherche-Notizen</label>
          <CharCounter value={notes} min={NOTES_MIN} />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Warum passt diese Stiftung? Besonderheiten, Förderhistorie, Hinweise zur Bewerbung..."
          className={FORM_INPUT_CLASS}
        />
      </div>

      {error && (
        <p className="text-sm text-danger-text">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
}
