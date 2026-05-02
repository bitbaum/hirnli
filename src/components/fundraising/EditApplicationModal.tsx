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
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { Application, FoundationRow } from '@/lib/db/schema';

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

  // Form state — initialised from application
  const [status, setStatus] = useState(application.status);
  const [requestedAmount, setRequestedAmount] = useState(
    application.requestedAmount?.toString() ?? '',
  );
  const [awardedAmount, setAwardedAmount] = useState(
    application.awardedAmount?.toString() ?? '',
  );
  const [priorityLevel, setPriorityLevel] = useState(
    application.priorityLevel?.toString() ?? '',
  );
  const [assignedTo, setAssignedTo] = useState(application.assignedTo ?? '');
  const [projectFocus, setProjectFocus] = useState(application.projectFocus ?? '');
  const [customizationNotes, setCustomizationNotes] = useState(
    application.customizationNotes ?? '',
  );
  const [contactDate, setContactDate] = useState(
    application.contactDate ? application.contactDate.split('T')[0] : '',
  );
  const [submissionDate, setSubmissionDate] = useState(
    application.submissionDate ? application.submissionDate.split('T')[0] : '',
  );
  const [decisionExpected, setDecisionExpected] = useState(
    application.decisionExpected ? application.decisionExpected.split('T')[0] : '',
  );
  const [decisionDate, setDecisionDate] = useState(
    application.decisionDate ? application.decisionDate.split('T')[0] : '',
  );
  const [rejectionReason, setRejectionReason] = useState(application.rejectionReason ?? '');
  const [successFactors, setSuccessFactors] = useState(application.successFactors ?? '');

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        status,
        requestedAmount: requestedAmount ? Number(requestedAmount) : null,
        awardedAmount: awardedAmount ? Number(awardedAmount) : null,
        priorityLevel: priorityLevel ? Number(priorityLevel) : null,
        assignedTo: assignedTo || null,
        projectFocus: projectFocus || null,
        customizationNotes: customizationNotes || null,
        contactDate: contactDate || null,
        submissionDate: submissionDate || null,
        decisionExpected: decisionExpected || null,
        decisionDate: decisionDate || null,
        rejectionReason: rejectionReason || null,
        successFactors: successFactors || null,
      };

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || 'Speichern fehlgeschlagen');
        return;
      }

      onSaved(result.data.application);
      onClose();
    } catch (err) {
      console.error('Failed to save application:', err);
      setError('Netzwerkfehler beim Speichern');
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
