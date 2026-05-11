/**
 * Application Detail Page
 *
 * View and edit individual application details.
 * All fields are inline-editable. Saves via PATCH API on blur or explicit save.
 */

'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { APPLICATION_STATUSES, getStatusConfig, isTerminalStatus, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { PRIORITY_CONFIG } from '@/lib/config/foundations';
import { useApplicationForm } from '@/hooks/useApplicationForm';
import ActivityTimeline from '@/components/ui/ActivityTimeline';
import { getFoundationBySlug } from '@/lib/domain/foundation-helpers';

interface ApplicationDetailProps {
  params: {
    id: string;
  };
}

import { FORM_INPUT_CLASS as inputClass, FORM_LABEL_CLASS as labelClass } from '@/lib/utils/form-classes';

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
    deleteError,
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

  const statusConfig = getStatusConfig(fields.status);
  const foundationDetail = foundation ? getFoundationBySlug(foundation.id) : null;

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
            <h1 className="heading-section">
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
        <ErrorAlert>{saveError}</ErrorAlert>

        {/* Main edit form */}
        <Card className="space-y-5">
          <h2 className="heading-item">Gesuchsinformationen</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Status</label>
              <select value={fields.status} onChange={(e) => updateField('status', e.target.value as ApplicationStatusId)} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priorität</label>
              <select value={fields.priorityLevel} onChange={(e) => updateField('priorityLevel', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label} — {cfg.shortLabel}</option>
                ))}
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
        </Card>

        {/* Timeline */}
        <Card className="space-y-5">
          <h2 className="heading-item">Timeline</h2>
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
        </Card>

        {/* Outcome fields — only when relevant */}
        {isTerminalStatus(fields.status) && (
          <Card className="space-y-4">
            <h2 className="heading-item">Ergebnis</h2>
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
          </Card>
        )}

        {/* Foundation info (read-only) */}
        {foundation && (
          <Card className="space-y-3">
            <h2 className="heading-item">Stiftung</h2>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="heading-xs-label">Website</p>
                {foundationDetail?.websiteUrl ? (
                  <a href={foundationDetail.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {foundationDetail.websiteUrl}
                  </a>
                ) : '—'}
              </div>
              <div>
                <p className="heading-xs-label">E-Mail</p>
                <p className="text-grey-dark">{foundationDetail?.contact?.email ?? '—'}</p>
              </div>
              <div>
                <p className="heading-xs-label">Fit Score</p>
                <p className="text-grey-dark">{foundation.fitScore != null ? `${foundation.fitScore} / 10` : '—'}</p>
              </div>
              <div>
                <p className="heading-xs-label">Gesuch</p>
                <Link href={`/fundraising/stiftungen/${foundation.id}/gesuch`} className="text-primary hover:underline">
                  Gesuch öffnen →
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Activity log */}
        <Card className="space-y-3">
          <h2 className="heading-item">Aktivitäten</h2>
          <ActivityTimeline entityId={params.id} entityType="application" />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pb-8">
          {/* Delete */}
          <div>
            {deleteConfirm ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-2">
                {deleteError ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-danger">{deleteError}</span>
                    <Button onClick={cancelDelete} variant="ghost" size="sm">Schliessen</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-danger">Wirklich löschen?</span>
                    <Button onClick={cancelDelete} variant="ghost" size="sm" disabled={isDeleting}>Nein</Button>
                    <Button onClick={executeDelete} disabled={isDeleting} variant="danger" size="sm">
                      {isDeleting ? '...' : 'Ja, löschen'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={confirmDelete}
                variant="secondary"
                className="border-danger/20 text-danger hover:bg-danger/10"
              >
                Gesuch löschen
              </Button>
            )}
          </div>

          {/* Save */}
          <Button
            onClick={save}
            disabled={isSaving}
            variant="primary"
            size="lg"
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}
