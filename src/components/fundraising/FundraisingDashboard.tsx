/**
 * Fundraising Dashboard - KPI overview and statistics
 *
 * Displays key metrics, status distribution, and upcoming deadlines.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { formatCHF } from '@/lib/utils/format';
import { KPICard } from './KPICard';
import { StatusDistributionChart } from './StatusDistributionChart';
import { UpcomingDeadlines, type Deadline } from './UpcomingDeadlines';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { getApplicationsDashboard } from '@/lib/api/applications';
import { NET_ERR_LOAD } from '@/lib/utils/errors';
import { DEADLINE_UPCOMING_DAYS } from '@/lib/utils/time';

const SUCCESS_RATE_GREEN = 30;
const SUCCESS_RATE_WARN = 15;

interface DashboardData {
  totals: {
    totalRequested: number;
    totalAwarded: number;
    submitted: number;
    accepted: number;
    rejected: number;
    pending: number;
    followup: number;
    successRate: number;
    totalApplications: number;
  };
  byStatus: Array<{
    status: ApplicationStatusId;
    count: number;
  }>;
  byPriority: Array<{
    priority: number;
    count: number;
  }>;
  upcomingDeadlines: Deadline[];
}

export function FundraisingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getApplicationsDashboard();
      if (result.success) {
        setData(result.data as DashboardData);
      } else {
        setError(result.error || NET_ERR_LOAD);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return <LoadingState label="Lade Dashboard..." />;
  }

  if (error || !data) {
    return <ErrorAlert error={error} onRetry={fetchDashboardData} />;
  }

  const isEmpty = data.totals.totalApplications === 0;
  const inDecision = data.totals.submitted + data.totals.pending + data.totals.followup;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="heading-section">Fundraising Dashboard</h1>
        <Button variant="secondary" size="sm" onClick={fetchDashboardData}>
          Aktualisieren
        </Button>
      </div>

      {isEmpty ? (
        /* Empty state — pipeline has no applications yet */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default bg-surface-raised py-24 text-center">
          <p className="heading-card mb-1">Pipeline ist leer</p>
          <p className="mb-6 max-w-sm text-sm text-text-muted">
            Sobald du Stiftungsgesuche startest, siehst du hier Kennzahlen,
            Fristen und den Überblick über den Fundraising-Fortschritt.
          </p>
          <div className="flex gap-3">
            <Button href="/fundraising/stiftungen" size="lg">Stiftungen durchsuchen →</Button>
            <Button href="/fundraising/applications" variant="secondary" size="lg">Pipeline öffnen</Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Total beantragt"
              value={formatCHF(data.totals.totalRequested)}
              icon="💰"
              color="blue"
            />
            <KPICard
              label="Total zugesagt"
              value={formatCHF(data.totals.totalAwarded)}
              icon="✅"
              color="green"
            />
            <KPICard
              label="In Entscheidung"
              value={inDecision}
              icon={data.totals.followup > 0 ? '⚠️' : '📤'}
              color={data.totals.followup > 0 ? 'orange' : 'blue'}
              subtitle={
                data.totals.followup > 0
                  ? `${data.totals.followup} Nachfassen erforderlich`
                  : 'bei Stiftungen in Prüfung'
              }
            />
            <KPICard
              label="Erfolgsquote"
              value={`${data.totals.successRate}%`}
              icon="📊"
              color={data.totals.successRate >= SUCCESS_RATE_GREEN ? 'green' : data.totals.successRate >= SUCCESS_RATE_WARN ? 'orange' : 'red'}
              subtitle={`${data.totals.accepted} angenommen, ${data.totals.rejected} abgelehnt`}
            />
          </div>

          {/* Charts and Deadlines */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="heading-card mb-4">Verteilung nach Status</h2>
              <StatusDistributionChart data={data.byStatus} />
            </Card>

            <Card>
              <h2 className="heading-card mb-4">
                Anstehende Fristen ({DEADLINE_UPCOMING_DAYS} Tage)
              </h2>
              <div className="max-h-80 overflow-y-auto">
                <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
              </div>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card>
            <h2 className="heading-card mb-4">Zusammenfassung</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="heading-page">{data.totals.totalApplications}</div>
                <div className="text-sm text-text-muted">Gesamt Gesuche</div>
              </div>
              <div className="text-center">
                <div className="heading-page text-primary-text">
                  {data.totals.submitted + data.totals.pending + data.totals.followup}
                </div>
                <div className="text-sm text-text-muted">In Entscheidung</div>
              </div>
              <div className="text-center">
                <div className="heading-page text-success-text">{data.totals.accepted}</div>
                <div className="text-sm text-text-muted">Angenommen</div>
              </div>
              <div className="text-center">
                <div className={`heading-page ${data.totals.followup > 0 ? 'text-warning-text' : 'text-text-muted'}`}>
                  {data.totals.followup}
                </div>
                <div className="text-sm text-text-muted">Nachfassen</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
