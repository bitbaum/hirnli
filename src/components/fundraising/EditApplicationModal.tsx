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
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS, FORM_GRID_2COL_CLASS } from '@/lib/utils/form-classes';
import { NET_ERR_SAVE, API_ERR_SAVE } from '@/lib/utils/errors';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import type { Application, FoundationRow } from '@/lib/db/schema';
import { buildPatchPayload, initFieldsFromApplication, type ApplicationFormFields } from '@/hooks/useApplicationForm';
import { ApplicationDateFields, ApplicationOutcomeFields } from './ApplicationFormSections';

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
            <h2 className="heading-card">Gesuch bearbeiten</h2>
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
          <div className={FORM_GRID_2COL_CLASS}>
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
          <div className={FORM_GRID_2COL_CLASS}>
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
          <div className={FORM_GRID_2COL_CLASS}>
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
          <ApplicationDateFields
            contactDate={contactDate}
            submissionDate={submissionDate}
            decisionExpected={decisionExpected}
            decisionDate={decisionDate}
            onChange={(field, value) => {
              const map = { contactDate: setContactDate, submissionDate: setSubmissionDate, decisionExpected: setDecisionExpected, decisionDate: setDecisionDate };
              map[field](value);
            }}
          />

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
              <p className="heading-xs-label">Ergebnis</p>
              <ApplicationOutcomeFields
                status={status}
                successFactors={successFactors}
                rejectionReason={rejectionReason}
                onChange={(field, value) => {
                  if (field === 'successFactors') setSuccessFactors(value);
                  else setRejectionReason(value);
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}
