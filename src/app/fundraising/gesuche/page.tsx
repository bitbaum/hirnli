'use client';

/**
 * Meine Gesuche — Dashboard showing all foundations with gesuch overrides.
 *
 * Lists foundations where the user has customized gesuch text,
 * with pipeline status and quick links to continue editing.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getStatusConfig, type ApplicationStatusId } from '@/lib/config/application-statuses';
import { formatDateCH } from '@/lib/utils/format';
import { NET_ERR_LOAD, API_ERR_LOAD } from '@/lib/utils/errors';
import EmptyState from '@/components/ui/EmptyState';

interface GesuchOverviewRow {
  foundationId: string;
  foundationName: string;
  overrideUpdatedAt: string;
  overrideFieldCount: number;
  applicationId: string | null;
  applicationStatus: ApplicationStatusId | null;
}


export default function MeineGesuchePage() {
  const [rows, setRows] = useState<GesuchOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gesuch-overrides')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRows(d.data);
        else setError(d.error ?? API_ERR_LOAD);
      })
      .catch(() => setError(NET_ERR_LOAD))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-0">
      <PageHeader
        title="Meine Gesuche"
        subtitle="Alle Stiftungen, für die du Gesuch-Texte angepasst hast."
      />

      {loading ? (
        <LoadingState label="Lade Gesuche…" className="py-20" />
      ) : error ? (
        <ErrorAlert>{error}</ErrorAlert>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Noch keine Gesuche bearbeitet"
          description="Wähle eine Stiftung und starte den Gesuch-Workflow, um hier deine Entwürfe zu sehen."
          action={{ label: 'Stiftungen durchsuchen →', href: '/fundraising/stiftungen' }}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-light text-left">
                <th className="px-4 py-3 font-semibold text-text-muted">Stiftung</th>
                <th className="px-4 py-3 font-semibold text-text-muted">Status</th>
                <th className="px-4 py-3 font-semibold text-text-muted hidden sm:table-cell">Felder</th>
                <th className="px-4 py-3 font-semibold text-text-muted hidden sm:table-cell">Zuletzt</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const statusConfig = row.applicationStatus
                  ? getStatusConfig(row.applicationStatus)
                  : null;

                return (
                  <tr key={row.foundationId} className="border-b border-border last:border-0 hover:bg-bg-light/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/fundraising/stiftungen/${row.foundationId}/gesuch`}
                        className="font-medium text-grey-dark hover:text-primary"
                      >
                        {row.foundationName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {statusConfig ? (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      ) : (
                        <span className="text-sm text-text-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                      {row.overrideFieldCount} Felder
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                      {row.overrideUpdatedAt ? formatDateCH(row.overrideUpdatedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/fundraising/stiftungen/${row.foundationId}/gesuch?step=2`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Weiter bearbeiten →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
