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
import { getStatusConfig, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { computeFollowUpDate } from '@/lib/utils/parse-response-time';
import { formatDateCHLong, getTodayISO } from '@/lib/utils/format';
import { createApplication, patchApplication, findActiveApplication } from '@/lib/api/applications';
import Spinner from '@/components/ui/Spinner';

interface GesuchStatusWidgetProps {
  slug: string;
  responseTime?: string;
  shareToken?: string;
}

export default function GesuchStatusWidget({
  slug,
  responseTime,
  shareToken,
}: GesuchStatusWidgetProps) {
  const [appId, setAppId] = useState<string | null | undefined>(undefined);
  const [status, setStatus] = useState<ApplicationStatusId | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    findActiveApplication(slug)
      .then((active) => {
        if (cancelled) return;
        if (active) {
          setAppId(active.application.id);
          setStatus(active.application.status);
        } else {
          setAppId(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError(true);
        setAppId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function addToPipeline() {
    setAdding(true);
    setAddError(null);
    try {
      const d = await createApplication(slug, 'draft');
      if (d.success) {
        setAppId((d.data as { id: string }).id);
        setStatus('draft');
      } else {
        setAddError(d.error ?? 'Konnte nicht zur Pipeline hinzugefügt werden');
      }
    } finally {
      setAdding(false);
    }
  }

  async function markAsSubmitted() {
    if (!appId) return;
    setMarking(true);
    setMarkError(null);
    try {
      const today = getTodayISO();
      const decisionExpected = computeFollowUpDate(today, responseTime);
      const d = await patchApplication(appId, {
        status: 'submitted',
        submissionDate: today,
        decisionExpected,
        documentsSent: ['gesuch-pdf', shareToken ? 'share-link' : null].filter(Boolean),
      });
      if (d.success) {
        setStatus('submitted');
        setFollowUpDate(decisionExpected);
      } else {
        setMarkError(d.error ?? 'Fehler beim Markieren als gesendet');
      }
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
        <Spinner label="Pipeline wird geladen…" />
        Pipeline wird geladen…
      </div>
    );
  }

  // Fetch failed — don't show "add to pipeline" (could create duplicates)
  if (fetchError) {
    return <p className="text-sm text-danger-text">Pipeline-Status konnte nicht geladen werden.</p>;
  }

  // No application yet
  if (!appId) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={addToPipeline}
          disabled={adding}
          className="flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {adding ? <Spinner size="sm" tone="current" label="Wird hinzugefügt…" /> : '+'}
          Zu Pipeline hinzufügen
        </button>
        {addError && <p className="text-sm text-danger-text">{addError}</p>}
      </div>
    );
  }

  // Has application
  return (
    <div className="flex flex-col gap-3">
      {/* Status badge + link */}
      <div className="flex items-center gap-2">
        {statusConfig && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
          >
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
            className="flex items-center gap-2 self-start rounded-lg bg-pillar-digital px-4 py-2 text-sm font-semibold text-white hover:bg-pillar-digital/85 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pillar-digital focus-visible:ring-offset-2"
          >
            {marking ? <Spinner size="sm" tone="on-accent" label="Markierung läuft…" /> : '✓'}
            Als gesendet markieren
          </button>
          {markError && <p className="text-sm text-danger-text">{markError}</p>}
        </div>
      )}

      {status === 'submitted' && (
        <div className="space-y-1">
          <p className="text-sm text-pillar-digital">Gesuch wurde als eingereicht markiert.</p>
          {followUpDate && (
            <p className="text-sm text-text-muted">
              Antwort erwartet: ~
              <span className="font-medium">{formatDateCHLong(followUpDate)}</span>
              {' · '}
              Nachfassen ab: <span className="font-medium">{formatDateCHLong(followUpDate)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
