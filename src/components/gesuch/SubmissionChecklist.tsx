'use client';

/**
 * SubmissionChecklist — Pre-submit checklist for Step 3.
 * Local state only — not persisted. Helps the user track manual steps.
 */

import { useState } from 'react';

const ITEMS = [
  { id: 'pdf', label: 'PDF heruntergeladen und geprüft' },
  { id: 'onepager', label: 'One-Pager beigefügt (falls gefordert)' },
  { id: 'anschreiben', label: 'Anschreiben personalisiert' },
  { id: 'prepared', label: 'E-Mail / Formular vorbereitet' },
] as const;

export default function SubmissionChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const allChecked = ITEMS.every((item) => checked[item.id]);

  return (
    <div className="rounded-xl border border-border bg-bg-light p-4 print:hidden">
      <p className="mb-3 text-sm font-semibold text-grey-dark">Checkliste vor Einreichung</p>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className={`text-sm ${checked[item.id] ? 'text-grey-dark line-through' : 'text-text'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
      {allChecked && (
        <p className="mt-3 text-xs font-medium text-green-600">
          Alles bereit — Gesuch kann eingereicht werden.
        </p>
      )}
    </div>
  );
}
