'use client';

/**
 * The editor for one content block.
 *
 * One long form rather than a wizard: the people filling this in are writing
 * about their own organisation, mostly in one sitting, and a wizard would hide
 * how much is left. The unfinished count at the top is the progress indicator
 * instead, and it is honest because it counts the marker the starter text
 * actually contains.
 */

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldLabel, SECTION_LABELS } from '@/lib/content/field-labels';
import { saveBlock, type SaveState } from './actions';

export const TODO_MARKER = '[Bitte ergänzen]';

export interface EditorField {
  path: string;
  value: string;
  kind: 'string' | 'number';
}

const FIELD =
  'mt-1 w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary';

/** Long prose gets a textarea; a label or a year does not. */
function rows(value: string): number {
  if (value.length > 400) return 8;
  if (value.length > 160) return 5;
  if (value.length > 80) return 3;
  return 0;
}

export function BlockEditorForm({
  orgSlug,
  blockKey,
  version,
  fields,
}: {
  orgSlug: string;
  blockKey: string;
  version: number;
  fields: EditorField[];
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveBlock, {});
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.path, f.value])),
  );

  const unfinished = Object.values(values).filter((v) => v.includes(TODO_MARKER)).length;

  const sections = new Map<string, EditorField[]>();
  for (const f of fields) {
    const section = f.path.split('.')[0];
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(f);
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="block" value={blockKey} />
      <input type="hidden" name="version" value={version} />

      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-surface-base px-4 py-3">
        <p className="text-sm text-text-secondary">
          {unfinished === 0
            ? 'Alle Felder ausgefüllt.'
            : `Noch ${unfinished} ${unfinished === 1 ? 'Feld' : 'Felder'} mit „${TODO_MARKER}“.`}
        </p>
        <div className="flex items-center gap-3">
          {state.error && <span className="text-sm text-status-error">{state.error}</span>}
          {state.saved && !state.error && (
            <span className="text-sm text-text-muted">Gespeichert.</span>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Speichert …' : 'Speichern'}
          </Button>
        </div>
      </div>

      {[...sections].map(([section, sectionFields]) => {
        const meta = SECTION_LABELS[section];
        return (
          <section key={section} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{meta?.title ?? section}</h2>
              {meta?.hint && <p className="mt-1 text-sm text-text-muted">{meta.hint}</p>}
            </div>

            {sectionFields.map((f) => {
              const value = values[f.path] ?? '';
              const isTodo = value.includes(TODO_MARKER);
              const r = rows(value);
              return (
                <label key={f.path} className="text-sm font-medium text-text-primary">
                  <span className="flex items-center gap-2">
                    {fieldLabel(f.path)}
                    {isTodo && (
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-xs font-normal text-text-muted">
                        offen
                      </span>
                    )}
                  </span>
                  {f.kind === 'number' ? (
                    <input
                      name={`f:${f.path}`}
                      inputMode="decimal"
                      className={FIELD}
                      value={value}
                      onChange={(e) => setValues((v) => ({ ...v, [f.path]: e.target.value }))}
                    />
                  ) : r > 0 ? (
                    <textarea
                      name={`f:${f.path}`}
                      rows={r}
                      className={FIELD}
                      value={value}
                      onChange={(e) => setValues((v) => ({ ...v, [f.path]: e.target.value }))}
                    />
                  ) : (
                    <input
                      name={`f:${f.path}`}
                      className={FIELD}
                      value={value}
                      onChange={(e) => setValues((v) => ({ ...v, [f.path]: e.target.value }))}
                    />
                  )}
                </label>
              );
            })}
          </section>
        );
      })}
    </form>
  );
}
