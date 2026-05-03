'use client';

/**
 * RequiredFieldsModal — Collects missing required fields when a status transition
 * is rejected by the API (422). Re-submits the PATCH with the collected values.
 */

import { useState } from 'react';
import type { RequiredField, ApplicationStatusId } from '@/lib/config/application-statuses';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '@/lib/utils/form-classes';
import { NET_ERR_RETRY, API_ERR_SAVE } from '@/lib/utils/errors';

interface RequiredFieldsModalProps {
  applicationId: string;
  targetStatus: ApplicationStatusId;
  missingFields: RequiredField[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RequiredFieldsModal({
  applicationId,
  targetStatus,
  missingFields,
  onSuccess,
  onCancel,
}: RequiredFieldsModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Build the payload with status + all required fields
    const payload: Record<string, unknown> = { status: targetStatus };
    for (const field of missingFields) {
      const raw = values[field.field] ?? '';
      if (!raw) {
        setError(`${field.label} ist erforderlich.`);
        setSubmitting(false);
        return;
      }
      payload[field.field] = field.type === 'number' ? Number(raw) : raw;
    }

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || API_ERR_SAVE);
      }
    } catch {
      setError(NET_ERR_RETRY);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4"
        >
          <h3 className="text-base font-semibold text-grey-dark">Pflichtfelder ergänzen</h3>
          <p className="text-sm text-text-muted">
            Für diesen Statuswechsel werden zusätzliche Angaben benötigt.
          </p>

          {missingFields.map((field) => (
            <div key={field.field}>
              <label className={FORM_LABEL_CLASS}>
                {field.label}
              </label>
              <input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                value={values[field.field] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.field]: e.target.value }))}
                className={FORM_INPUT_CLASS}
                required
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm text-text-muted hover:bg-bg-light"
              disabled={submitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white hover:bg-grey-dark/85 disabled:opacity-50"
            >
              {submitting ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
