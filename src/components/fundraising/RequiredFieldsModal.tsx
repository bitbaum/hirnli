'use client';

/**
 * RequiredFieldsModal — Collects missing required fields when a status transition
 * is rejected by the API (422). Re-submits the PATCH with the collected values.
 */

import { useState } from 'react';
import type { RequiredField, ApplicationStatusId } from '@/lib/config/application-statuses';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '@/lib/utils/form-classes';
import { NET_ERR_RETRY, API_ERR_SAVE } from '@/lib/utils/errors';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

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
    <Modal isOpen={true} onClose={onCancel} title="Pflichtfelder ergänzen" className="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-muted">
          Für diesen Statuswechsel werden zusätzliche Angaben benötigt.
        </p>

        {missingFields.map((field) => (
          <div key={field.field}>
            <label className={FORM_LABEL_CLASS} htmlFor={`required-field-${field.field}`}>
              {field.label}
            </label>
            <input
              id={`required-field-${field.field}`}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={values[field.field] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.field]: e.target.value }))}
              className={FORM_INPUT_CLASS}
              required
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-danger-text">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onCancel} disabled={submitting}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Speichern…' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
