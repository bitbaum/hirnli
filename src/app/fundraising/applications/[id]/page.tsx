/**
 * Application Detail Page
 *
 * View and edit individual application details.
 * All fields are inline-editable. Saves via PATCH API on blur or explicit save.
 */

'use client';

import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { APPLICATION_STATUSES, getStatusConfig } from '@/lib/config/application-statuses';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { useApplicationForm } from '@/hooks/useApplicationForm';

interface ApplicationDetailProps {
  params: {
    id: string;
  };
}

const inputClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted';

export default function ApplicationDetailPage({ params }: ApplicationDetailProps) {
  const {
    foundation,
    fields,
    updateField,
    isLoading,
    error,
    isSaving,
    saveError,
    save,
    isDeleting,
    deleteConfirm,
    confirmDelete,
    cancelDelete,
    executeDelete,
  } = useApplicationForm(params.id);

  if (isLoading) {
    return <LoadingState label="Lade Gesuch..." className="min-h-screen bg-bg-light" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-light p-6">
        <div className="mx-auto max-w-3xl">
          <ErrorAlert
            error={error}
            backLink={{ href: '/fundraising/applications', label: '← Zurück zur Übersicht' }}
          />
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(fields.status as ApplicationStatusId);

  return (
    <div className="min-h-screen bg-bg-light p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/fundraising/applications"
              className="mb-2 inline-block text-sm text-primary hover:underline"
            >
              ← Pipeline
            </Link>
            <h1 className="text-2xl font-bold text-grey-dark">
              {foundation?.name ?? 'Unbekannte Stiftung'}
            </h1>
            {foundation && (
              <Link
                href={`/fundraising/stiftungen/${foundation.id}`}
                className="text-sm text-text-muted hover:text-primary hover:underline"
              >
                Stiftungsprofil →
              </Link>
            )}
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 rounded-lg border px-3 py-1 text-sm font-semibold ${statusConfig?.color ?? 'bg-bg-light text-grey-dark border-border'}`}
          >
            {statusConfig?.label ?? fields.status}
          </span>
        </div>

        {/* Save error */}
        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Main edit form */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-5">
          <h2 className="font-semibold text-grey-dark">Gesuchsinformationen</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Status</label>
              <select value={fields.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priorität</label>
              <select value={fields.priorityLevel} onChange={(e) => updateField('priorityLevel', e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="1">P1 — Jetzt</option>
                <option value="2">P2 — Bald</option>
                <option value="3">P3 — Später</option>
                <option value="4">P4 — Netzwerk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Beantragt (CHF)</label>
              <input
                type="number"
                value={fields.requestedAmount}
                onChange={(e) => updateField('requestedAmount', e.target.value)}
                placeholder="z.B. 50000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Zugesagt (CHF)</label>
              <input
                type="number"
                value={fields.awardedAmount}
                onChange={(e) => updateField('awardedAmount', e.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Zuständig</label>
              <input
                type="text"
                value={fields.assignedTo}
                onChange={(e) => updateField('assignedTo', e.target.value)}
                placeholder="Name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Projektfokus</label>
              <input
                type="text"
                value={fields.projectFocus}
                onChange={(e) => updateField('projectFocus', e.target.value)}
                placeholder="z.B. Hub-Einrichtung"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notizen</label>
            <textarea
              value={fields.customizationNotes}
              onChange={(e) => updateField('customizationNotes', e.target.value)}
              rows={4}
              placeholder="Interne Notizen, Anpassungen, Besonderheiten..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-5">
          <h2 className="font-semibold text-grey-dark">Timeline</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Kontaktdatum</label>
              <input type="date" value={fields.contactDate} onChange={(e) => updateField('contactDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Eingereicht am</label>
              <input type="date" value={fields.submissionDate} onChange={(e) => updateField('submissionDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entscheidung erwartet</label>
              <input type="date" value={fields.decisionExpected} onChange={(e) => updateField('decisionExpected', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entscheidung erhalten</label>
              <input type="date" value={fields.decisionDate} onChange={(e) => updateField('decisionDate', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Outcome fields — only when relevant */}
        {(fields.status === 'accepted' || fields.status === 'rejected') && (
          <div className="rounded-xl border border-border bg-white p-6 space-y-4">
            <h2 className="font-semibold text-grey-dark">Ergebnis</h2>
            {fields.status === 'accepted' && (
              <div>
                <label className={labelClass}>Erfolgsfaktoren</label>
                <textarea
                  value={fields.successFactors}
                  onChange={(e) => updateField('successFactors', e.target.value)}
                  rows={3}
                  placeholder="Was hat zum Erfolg beigetragen?"
                  className={inputClass}
                />
              </div>
            )}
            {fields.status === 'rejected' && (
              <div>
                <label className={labelClass}>Ablehnungsgrund</label>
                <textarea
                  value={fields.rejectionReason}
                  onChange={(e) => updateField('rejectionReason', e.target.value)}
                  rows={3}
                  placeholder="Warum wurde das Gesuch abgelehnt?"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}

        {/* Foundation info (read-only) */}
        {foundation && (
          <div className="rounded-xl border border-border bg-white p-6 space-y-3">
            <h2 className="font-semibold text-grey-dark">Stiftung</h2>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Website</p>
                {foundation.websiteUrl ? (
                  <a href={foundation.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {foundation.websiteUrl}
                  </a>
                ) : '—'}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">E-Mail</p>
                <p className="text-grey-dark">{foundation.contactEmail ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Fit Score</p>
                <p className="text-grey-dark">{foundation.fitScore != null ? `${foundation.fitScore} / 10` : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Gesuch</p>
                <Link href={`/fundraising/stiftungen/${foundation.id}/gesuch`} className="text-primary hover:underline">
                  Gesuch öffnen →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pb-8">
          {/* Delete */}
          <div>
            {deleteConfirm ? (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                <span className="text-sm font-medium text-red-700">Wirklich löschen?</span>
                <button
                  onClick={cancelDelete}
                  className="rounded px-3 py-1 text-sm text-text-light hover:bg-bg-light"
                  disabled={isDeleting}
                >
                  Nein
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Ja, löschen'}
                </button>
              </div>
            ) : (
              <button
                onClick={confirmDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Gesuch löschen
              </button>
            )}
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={isSaving}
            className="rounded-lg bg-grey-dark px-6 py-2 text-sm font-semibold text-white hover:bg-grey-dark/85 disabled:opacity-50"
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
