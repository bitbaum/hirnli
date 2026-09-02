/**
 * EditApplicationModal — Inline edit form for pipeline applications
 *
 * Opens over the board, patches the application via API on save.
 * All fields from the updateApplicationSchema are exposed.
 */

'use client';

import { useState, useRef, useId } from 'react';
import {
  APPLICATION_STATUSES,
  isTerminalStatus,
  type ApplicationStatusId,
} from '@/lib/config/application-statuses';
import { PRIORITY_CONFIG } from '@/lib/config/foundations';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS, FORM_GRID_2COL_CLASS } from '@/lib/utils/form-classes';
import { patchApplication } from '@/lib/api/applications';
import { NET_ERR_SAVE, API_ERR_SAVE } from '@/lib/utils/errors';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import type { Application, FoundationRow } from '@/lib/db/schema';
import {
  buildPatchPayload,
  initFieldsFromApplication,
  type ApplicationFormFields,
} from '@/hooks/useApplicationForm';
import { ApplicationDateFields, ApplicationOutcomeFields } from './ApplicationFormSections';

import { useFocusTrap } from '@/lib/utils/a11y';
import { CloseButton } from '@/components/ui/CloseButton';
import Backdrop from '@/components/ui/Backdrop';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const id = useId();

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

  useFocusTrap(modalRef, onClose);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const fields: ApplicationFormFields = {
        status,
        requestedAmount,
        awardedAmount,
        priorityLevel,
        assignedTo,
        projectFocus,
        customizationNotes,
        contactDate,
        submissionDate,
        decisionExpected,
        decisionDate,
        rejectionReason,
        successFactors,
      };
      const payload = buildPatchPayload(fields);

      const result = await patchApplication(application.id, payload);
      if (!result.success) {
        setError(result.error || API_ERR_SAVE);
        return;
      }

      onSaved((result.data as { application: Application }).application);
      onClose();
    } catch (err) {
      console.error('Failed to save application:', err);
      setError(NET_ERR_SAVE);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Backdrop onClose={onClose} tone="darker" layer="modal" centered>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Gesuch bearbeiten"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface-base shadow-lg sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="heading-card">Gesuch bearbeiten</h2>
            <p className="truncate text-sm text-text-muted">
              {foundation?.name ?? application.foundationId}
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 sm:px-6 sm:py-5">
          <ErrorAlert>{error}</ErrorAlert>

          {/* Status + Priority row */}
          <div className={FORM_GRID_2COL_CLASS}>
            <div>
              <label htmlFor={`${id}-status`} className={FORM_LABEL_CLASS}>
                Status
              </label>
              <select
                id={`${id}-status`}
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
              <label htmlFor={`${id}-priority`} className={FORM_LABEL_CLASS}>
                Priorität
              </label>
              <select
                id={`${id}-priority`}
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value)}
                className={FORM_INPUT_CLASS}
              >
                <option value="">—</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>
                    {cfg.label} — {cfg.shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts row */}
          <div className={FORM_GRID_2COL_CLASS}>
            <div>
              <label htmlFor={`${id}-requested`} className={FORM_LABEL_CLASS}>
                Beantragt (CHF)
              </label>
              <input
                id={`${id}-requested`}
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="z.B. 50000"
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor={`${id}-awarded`} className={FORM_LABEL_CLASS}>
                Zugesagt (CHF)
              </label>
              <input
                id={`${id}-awarded`}
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
              <label htmlFor={`${id}-assigned-to`} className={FORM_LABEL_CLASS}>
                Zuständig
              </label>
              <input
                id={`${id}-assigned-to`}
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Name"
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor={`${id}-project-focus`} className={FORM_LABEL_CLASS}>
                Projektfokus
              </label>
              <input
                id={`${id}-project-focus`}
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
              const map = {
                contactDate: setContactDate,
                submissionDate: setSubmissionDate,
                decisionExpected: setDecisionExpected,
                decisionDate: setDecisionDate,
              };
              map[field](value);
            }}
          />

          {/* Notes */}
          <div>
            <label htmlFor={`${id}-notes`} className={FORM_LABEL_CLASS}>
              Notizen
            </label>
            <textarea
              id={`${id}-notes`}
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              rows={3}
              placeholder="Interne Notizen, Anpassungen, Besonderheiten..."
              className={FORM_INPUT_CLASS}
            />
          </div>

          {/* Outcome fields — only visible when relevant */}
          {isTerminalStatus(status) && (
            <div className="rounded-lg border border-border-default bg-surface-raised p-4 space-y-4">
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
        <div className="flex items-center justify-end gap-2 border-t border-border-default px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </Backdrop>
  );
}
