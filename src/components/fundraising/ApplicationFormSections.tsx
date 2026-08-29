import { useId } from 'react';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS, FORM_GRID_2COL_CLASS } from '@/lib/utils/form-classes';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';

type ApplicationDateField = 'contactDate' | 'submissionDate' | 'decisionExpected' | 'decisionDate';
type ApplicationOutcomeField = 'successFactors' | 'rejectionReason';

interface ApplicationDateFieldsProps {
  contactDate: string;
  submissionDate: string;
  decisionExpected: string;
  decisionDate: string;
  onChange: (field: ApplicationDateField, value: string) => void;
}

export function ApplicationDateFields({
  contactDate,
  submissionDate,
  decisionExpected,
  decisionDate,
  onChange,
}: ApplicationDateFieldsProps) {
  const id = useId();
  return (
    <div className={FORM_GRID_2COL_CLASS}>
      <div>
        <label htmlFor={`${id}-contact-date`} className={FORM_LABEL_CLASS}>
          Kontaktdatum
        </label>
        <input
          id={`${id}-contact-date`}
          type="date"
          value={contactDate}
          onChange={(e) => onChange('contactDate', e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor={`${id}-submission-date`} className={FORM_LABEL_CLASS}>
          Eingereicht am
        </label>
        <input
          id={`${id}-submission-date`}
          type="date"
          value={submissionDate}
          onChange={(e) => onChange('submissionDate', e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor={`${id}-decision-expected`} className={FORM_LABEL_CLASS}>
          Entscheidung erwartet
        </label>
        <input
          id={`${id}-decision-expected`}
          type="date"
          value={decisionExpected}
          onChange={(e) => onChange('decisionExpected', e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor={`${id}-decision-date`} className={FORM_LABEL_CLASS}>
          Entscheidung erhalten
        </label>
        <input
          id={`${id}-decision-date`}
          type="date"
          value={decisionDate}
          onChange={(e) => onChange('decisionDate', e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </div>
    </div>
  );
}

interface ApplicationOutcomeFieldsProps {
  status: ApplicationStatusId;
  successFactors: string;
  rejectionReason: string;
  onChange: (field: ApplicationOutcomeField, value: string) => void;
  rows?: number;
}

export function ApplicationOutcomeFields({
  status,
  successFactors,
  rejectionReason,
  onChange,
  rows = 2,
}: ApplicationOutcomeFieldsProps) {
  const id = useId();
  return (
    <>
      {status === 'accepted' && (
        <div>
          <label htmlFor={`${id}-success-factors`} className={FORM_LABEL_CLASS}>
            Erfolgsfaktoren
          </label>
          <textarea
            id={`${id}-success-factors`}
            value={successFactors}
            onChange={(e) => onChange('successFactors', e.target.value)}
            rows={rows}
            placeholder="Was hat zum Erfolg beigetragen?"
            className={FORM_INPUT_CLASS}
          />
        </div>
      )}
      {status === 'rejected' && (
        <div>
          <label htmlFor={`${id}-rejection-reason`} className={FORM_LABEL_CLASS}>
            Ablehnungsgrund
          </label>
          <textarea
            id={`${id}-rejection-reason`}
            value={rejectionReason}
            onChange={(e) => onChange('rejectionReason', e.target.value)}
            rows={rows}
            placeholder="Warum wurde das Gesuch abgelehnt?"
            className={FORM_INPUT_CLASS}
          />
        </div>
      )}
    </>
  );
}
