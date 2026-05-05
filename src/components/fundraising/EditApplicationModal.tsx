/**
 * EditApplicationModal — Inline edit form for pipeline applications
 *
 * Opens over the board, patches the application via API on save.
 * All fields from the updateApplicationSchema are exposed.
 */

'use client';

import { useState } from 'react';
import { APPLICATION_STATUSES, isTerminalStatus, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { PRIORITY_CONFIG } from '@/lib/config/foundations';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '@/lib/utils/form-classes';
import { NET_ERR_SAVE, API_ERR_SAVE } from '@/lib/utils/errors';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { Application, FoundationRow } from '@/lib/db/schema';
import { buildPatchPayload, initFieldsFromApplication, type ApplicationFormFields } from '@/hooks/useApplicationForm';

interface EditApplicationModalProps {
  application: Application;
  foundation: FoundationRow | null;
  onClose: () => void;
  onSaved: (updated: Application) => void;
}

export function EditApplicationModal({
  application,
  foundation,
  onClose,
  onSaved,
}: EditApplicationModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state — initialised from application via shared utility
  const init = initFieldsFromApplication(application);
  const [status, setStatus] = useState(init.status);
  const [requestedAmount, setRequestedAmount] = useState(init.requestedAmount);
  const [awardedAmount, setAwardedAmount] = useState(init.awardedAmount);
  const [priorityLevel, setPriorityLevel] = useState(init.priorityLevel);
  const [assignedTo, setAssignedTo] = useState(init.assignedTo);
  const [projectFocus, setProjectFocus] = useState(init.projectFocus);
  const [customizationNotes, setCustomizationNotes] = useState(init.customizationNotes);
  const [contactDate, setContactDate] = useState(init.contactDate);
  const [submissionDate, setSubmissionDate] = useState(init.submissionDate);
  const [decisionExpected, setDecisionExpected] = useState(init.decisionExpected);
  const [decisionDate, setDecisionDate] = useState(init.decisionDate);
  const [rejectionReason, setRejectionReason] = useState(init.rejectionReason);
  const [successFactors, setSuccessFactors] = useState(init.successFactors);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const fields: ApplicationFormFields = {
        status, requestedAmount, awardedAmount, priorityLevel, assignedTo,
        projectFocus, customizationNotes, contactDate, submissionDate,
        decisionExpected, decisionDate, rejectionReason, successFactors,
      };
      const payload = buildPatchPayload(fields);

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || API_ERR_SAVE);
        return;
      }

      onSaved(result.data.application);
      onClose();
    } catch (err) {
      console.error('Failed to save application:', err);
      setError(NET_ERR_SAVE);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-grey-dark">Gesuch bearbeiten</h2>
            <p className="text-sm text-text-muted">{foundation?.name ?? application.foundationId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-light hover:text-grey-dark"
            aria-label="Schliessen"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <ErrorAlert>{error}</ErrorAlert>

          {/* Status + Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={FORM_LABEL_CLASS}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatusId)}
                className={FORM_INPUT_CLASS}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Priorität
              </label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value)}
                className={FORM_INPUT_CLASS}
              >
                <option value="">—</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label} — {cfg.shortLabel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={FORM_LABEL_CLASS}>
                Beantragt (CHF)
              </label>
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="z.B. 50000"
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Zugesagt (CHF)
              </label>
              <input
                type="number"
                value={awardedAmount}
                onChange={(e) => setAwardedAmount(e.target.value)}
                placeholder="—"
                className={FORM_INPUT_CLASS}
              />
            </div>
          </div>

          {/* Assigned + Focus row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={FORM_LABEL_CLASS}>
                Zuständig
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Name"
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Projektfokus
              </label>
              <input
                type="text"
                value={projectFocus}
                onChange={(e) => setProjectFocus(e.target.value)}
                placeholder="z.B. Hub-Einrichtung"
                className={FORM_INPUT_CLASS}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={FORM_LABEL_CLASS}>
                Kontaktdatum
              </label>
              <input
                type="date"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Eingereicht am
              </label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Entscheidung erwartet
              </label>
              <input
                type="date"
                value={decisionExpected}
                onChange={(e) => setDecisionExpected(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={FORM_LABEL_CLASS}>
                Entscheidung erhalten
              </label>
              <input
                type="date"
                value={decisionDate}
                onChange={(e) => setDecisionDate(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={FORM_LABEL_CLASS}>
              Notizen
            </label>
            <textarea
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              rows={3}
              placeholder="Interne Notizen, Anpassungen, Besonderheiten..."
              className={FORM_INPUT_CLASS}
            />
          </div>

          {/* Outcome fields — only visible when relevant */}
          {isTerminalStatus(status) && (
            <div className="rounded-lg border border-border bg-bg-light p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Ergebnis
              </p>
              {status === 'accepted' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-muted">
                    Erfolgsfaktoren
                  </label>
                  <textarea
                    value={successFactors}
                    onChange={(e) => setSuccessFactors(e.target.value)}
                    rows={2}
                    placeholder="Was hat zum Erfolg beigetragen?"
                    className={FORM_INPUT_CLASS}
                  />
                </div>
              )}
              {status === 'rejected' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-muted">
                    Ablehnungsgrund
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    placeholder="Warum wurde das Gesuch abgelehnt?"
                    className={FORM_INPUT_CLASS}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-muted hover:bg-bg-light disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-grey-dark px-5 py-2 text-sm font-semibold text-white hover:bg-grey-dark/85 disabled:opacity-50"
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
