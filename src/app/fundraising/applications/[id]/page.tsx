/**
 * Application Detail Page
 *
 * View and edit individual application details.
 * All fields are inline-editable. Saves via PATCH API on blur or explicit save.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { APPLICATION_STATUSES, getStatusConfig } from '@/lib/config/application-statuses';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import type { Application, Foundation } from '@/lib/db/schema';
import { formatCHF } from '@/lib/utils/format';

interface ApplicationDetailProps {
  params: {
    id: string;
  };
}

export default function ApplicationDetailPage({ params }: ApplicationDetailProps) {
  const router = useRouter();
  const [data, setData] = useState<{
    application: Application;
    foundation: Foundation | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Edit state
  const [status, setStatus] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [awardedAmount, setAwardedAmount] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectFocus, setProjectFocus] = useState('');
  const [customizationNotes, setCustomizationNotes] = useState('');
  const [contactDate, setContactDate] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [decisionExpected, setDecisionExpected] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [successFactors, setSuccessFactors] = useState('');

  useEffect(() => {
    async function fetchApplication() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/applications/${params.id}`);
        const result = await response.json();
        if (result.success) {
          const { application, foundation } = result.data;
          setData(result.data);
          // Init edit state
          setStatus(application.status);
          setRequestedAmount(application.requestedAmount?.toString() ?? '');
          setAwardedAmount(application.awardedAmount?.toString() ?? '');
          setPriorityLevel(application.priorityLevel?.toString() ?? '');
          setAssignedTo(application.assignedTo ?? '');
          setProjectFocus(application.projectFocus ?? '');
          setCustomizationNotes(application.customizationNotes ?? '');
          setContactDate(application.contactDate ? application.contactDate.split('T')[0] : '');
          setSubmissionDate(application.submissionDate ? application.submissionDate.split('T')[0] : '');
          setDecisionExpected(application.decisionExpected ? application.decisionExpected.split('T')[0] : '');
          setDecisionDate(application.decisionDate ? application.decisionDate.split('T')[0] : '');
          setRejectionReason(application.rejectionReason ?? '');
          setSuccessFactors(application.successFactors ?? '');
        } else {
          setError(result.error || 'Nicht gefunden');
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Netzwerkfehler beim Laden');
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplication();
  }, [params.id]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setSaveError(result.error || 'Speichern fehlgeschlagen');
      }
    } catch (err) {
      console.error('Failed to save application:', err);
      setSaveError('Netzwerkfehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${params.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        router.push('/fundraising/applications');
      } else {
        alert(`Fehler: ${result.error}`);
        setIsDeleting(false);
        setDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
      alert('Netzwerkfehler beim Löschen');
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-text-muted">Lade Gesuch...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">Fehler: {error}</p>
            <Link href="/fundraising/applications" className="text-primary hover:underline">
              ← Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { foundation } = data;
  const statusConfig = getStatusConfig(status as ApplicationStatusId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
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
            className={`shrink-0 rounded-lg border px-3 py-1 text-sm font-semibold ${statusConfig?.color ?? 'bg-gray-100 text-gray-700 border-gray-300'}`}
          >
            {statusConfig?.label ?? status}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priorität</label>
              <select value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="1">P1 — Jetzt</option>
                <option value="2">P2 — Bald</option>
                <option value="3">P3 — Später</option>
                <option value="4">P4 — Netzwerk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Beantragt (CHF)</label>
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="z.B. 50000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Zugesagt (CHF)</label>
              <input
                type="number"
                value={awardedAmount}
                onChange={(e) => setAwardedAmount(e.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Zuständig</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Projektfokus</label>
              <input
                type="text"
                value={projectFocus}
                onChange={(e) => setProjectFocus(e.target.value)}
                placeholder="z.B. Hub-Einrichtung"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notizen</label>
            <textarea
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              rows={4}
              placeholder="Interne Notizen, Anpassungen, Besonderheiten..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border bg-white p-6 space-y-5">
          <h2 className="font-semibold text-grey-dark">Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kontaktdatum</label>
              <input type="date" value={contactDate} onChange={(e) => setContactDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Eingereicht am</label>
              <input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entscheidung erwartet</label>
              <input type="date" value={decisionExpected} onChange={(e) => setDecisionExpected(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entscheidung erhalten</label>
              <input type="date" value={decisionDate} onChange={(e) => setDecisionDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Outcome fields — only when relevant */}
        {(status === 'accepted' || status === 'rejected') && (
          <div className="rounded-xl border border-border bg-white p-6 space-y-4">
            <h2 className="font-semibold text-grey-dark">Ergebnis</h2>
            {status === 'accepted' && (
              <div>
                <label className={labelClass}>Erfolgsfaktoren</label>
                <textarea
                  value={successFactors}
                  onChange={(e) => setSuccessFactors(e.target.value)}
                  rows={3}
                  placeholder="Was hat zum Erfolg beigetragen?"
                  className={inputClass}
                />
              </div>
            )}
            {status === 'rejected' && (
              <div>
                <label className={labelClass}>Ablehnungsgrund</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
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
            <div className="grid grid-cols-2 gap-3 text-sm">
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
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Nein
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Ja, löschen'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Gesuch löschen
              </button>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
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
