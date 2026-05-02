'use client';

/**
 * GesuchStatusWidget — Pipeline status + "Als gesendet markieren" for Step 3
 *
 * States:
 * - Loading: spinner
 * - No app: "+ Zu Pipeline hinzufügen" button
 * - Has app: status badge + optional "Als gesendet markieren" CTA
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStatusConfig, isActiveApplication, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { computeFollowUpDate, formatFollowUpDate } from '@/lib/utils/parse-response-time';

interface GesuchStatusWidgetProps {
  slug: string;
  responseTime?: string;
  shareToken?: string;
}

interface ApplicationRow {
  application: {
    id: string;
    status: ApplicationStatusId;
    submissionDate?: string | null;
  };
}

export default function GesuchStatusWidget({ slug, responseTime, shareToken }: GesuchStatusWidgetProps) {
  const [appId, setAppId] = useState<string | null | undefined>(undefined);
  const [status, setStatus] = useState<ApplicationStatusId | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/applications?foundationId=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const active = (d.data ?? []).find(
          (row: ApplicationRow) =>
            isActiveApplication(row.application.status),
        );
        if (active) {
          setAppId(active.application.id);
          setStatus(active.application.status);
        } else {
          setAppId(null);
        }
      })
      .catch(() => setAppId(null));
  }, [slug]);

  async function addToPipeline() {
    setAdding(true);
    setAddError(null);
    try {
      const r = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundationId: slug, status: 'draft' }),
      });
      const d = await r.json();
      if (d.success) {
        setAppId(d.data.id);
        setStatus('draft');
      } else {
        setAddError(d.error ?? 'Konnte nicht zur Pipeline hinzugefügt werden');
      }
    } catch {
      setAddError('Netzwerkfehler — bitte versuche es erneut');
    } finally {
      setAdding(false);
    }
  }

  async function markAsSubmitted() {
    if (!appId) return;
    setMarking(true);
    setMarkError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const decisionExpected = computeFollowUpDate(today, responseTime);
      const r = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          submissionDate: today,
          decisionExpected,
          documentsSent: ['gesuch-pdf', shareToken ? 'share-link' : null].filter(Boolean),
        }),
      });
      const d = await r.json();
      if (d.success) {
        setStatus('submitted');
        setFollowUpDate(decisionExpected);
      } else {
        setMarkError(d.error ?? 'Fehler beim Markieren als gesendet');
      }
    } catch {
      setMarkError('Netzwerkfehler — bitte versuche es erneut');
    } finally {
      setMarking(false);
    }
  }

  const statusConfig = status ? getStatusConfig(status) : null;
  const canMarkSubmitted = status && ['draft', 'review'].includes(status);

  // Loading
  if (appId === undefined) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        Pipeline wird geladen…
      </div>
    );
  }

  // No application yet
  if (!appId) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={addToPipeline}
          disabled={adding}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors self-start"
        >
          {adding ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            '+'
          )}
          Zu Pipeline hinzufügen
        </button>
        {addError && <p className="text-sm text-danger">{addError}</p>}
      </div>
    );
  }

  // Has application
  return (
    <div className="flex flex-col gap-3">
      {/* Status badge + link */}
      <div className="flex items-center gap-2">
        {statusConfig && (
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        )}
        <Link
          href={`/fundraising/applications/${appId}`}
          className="text-sm text-primary hover:underline"
        >
          In Pipeline ansehen →
        </Link>
      </div>

      {/* Mark as submitted CTA */}
      {canMarkSubmitted && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={markAsSubmitted}
            disabled={marking}
            className="flex items-center gap-2 self-start rounded-lg bg-pillar-digital px-4 py-2 text-sm font-semibold text-white hover:bg-pillar-digital/85 disabled:opacity-50 transition-colors"
          >
            {marking ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              '✓'
            )}
            Als gesendet markieren
          </button>
          {markError && <p className="text-sm text-danger">{markError}</p>}
        </div>
      )}

      {status === 'submitted' && (
        <div className="space-y-1">
          <p className="text-sm text-pillar-digital">Gesuch wurde als eingereicht markiert.</p>
          {followUpDate && (
            <p className="text-sm text-text-muted">
              Antwort erwartet: ~<span className="font-medium">{formatFollowUpDate(followUpDate)}</span>
              {' · '}
              Nachfassen ab: <span className="font-medium">{formatFollowUpDate(followUpDate)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
