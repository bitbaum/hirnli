/**
 * Fundraising Dashboard - KPI overview and statistics
 *
 * Displays key metrics, status distribution, and upcoming deadlines.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { formatCHF } from '@/lib/utils/format';
import { KPICard } from './KPICard';
import { StatusDistributionChart } from './StatusDistributionChart';
import { UpcomingDeadlines, type Deadline } from './UpcomingDeadlines';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications/dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || NET_ERR_LOAD);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(NET_ERR_LOAD);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Lade Dashboard..." />;
  }

  if (error || !data) {
    return <ErrorAlert error={error} onRetry={fetchDashboardData} />;
  }

  const isEmpty = data.totals.totalApplications === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="heading-section">Fundraising Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-bg-light text-grey-dark rounded hover:bg-grey-light text-sm"
        >
          Aktualisieren
        </button>
      </div>

      {isEmpty ? (
        /* Empty state — pipeline has no applications yet */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-light py-24 text-center">
          <p className="heading-card mb-1">Pipeline ist leer</p>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              label="Eingereicht"
              value={data.totals.submitted}
              icon="📤"
              color="orange"
              subtitle={`${data.totals.pending} ausstehend`}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="heading-card mb-4">
                Verteilung nach Status
              </h2>
              <StatusDistributionChart data={data.byStatus} />
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="heading-card mb-4">
                Anstehende Fristen ({DEADLINE_UPCOMING_DAYS} Tage)
              </h2>
              <div className="max-h-80 overflow-y-auto">
                <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="heading-card mb-4">
              Zusammenfassung
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="heading-page">
                  {data.totals.totalApplications}
                </div>
                <div className="text-sm text-text-light">Gesamt Gesuche</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {data.totals.submitted}
                </div>
                <div className="text-sm text-text-light">Eingereicht</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {data.totals.accepted}
                </div>
                <div className="text-sm text-text-light">Angenommen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">
                  {data.totals.pending}
                </div>
                <div className="text-sm text-text-light">Ausstehend</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
