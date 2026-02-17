/**
 * Fundraising Dashboard - KPI overview and statistics
 *
 * Displays key metrics, status distribution, and upcoming deadlines.
 */

'use client';

import { useState, useEffect } from 'react';
import { KPICard } from './KPICard';
import { StatusDistributionChart } from './StatusDistributionChart';
import { UpcomingDeadlines } from './UpcomingDeadlines';

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
    status: string;
    count: number;
  }>;
  byPriority: Array<{
    priority: number;
    count: number;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    foundationName: string;
    decisionExpected: string;
    requestedAmount: number | null;
    daysUntilDeadline: number;
  }>;
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
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCHF = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Lade Dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fehler: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const isEmpty = data.totals.totalApplications === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fundraising Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        >
          Aktualisieren
        </button>
      </div>

      {isEmpty ? (
        /* Empty state — pipeline has no applications yet */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-24 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-1">Pipeline ist leer</p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Sobald du Stiftungsgesuche startest, siehst du hier Kennzahlen,
            Fristen und den Überblick über den Fundraising-Fortschritt.
          </p>
          <div className="flex gap-3">
            <a
              href="/fundraising/stiftungen"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-semibold"
            >
              Stiftungen durchsuchen →
            </a>
            <a
              href="/fundraising/applications"
              className="inline-block px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold"
            >
              Pipeline öffnen
            </a>
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
              color={data.totals.successRate >= 30 ? 'green' : data.totals.successRate >= 15 ? 'orange' : 'red'}
              subtitle={`${data.totals.accepted} angenommen, ${data.totals.rejected} abgelehnt`}
            />
          </div>

          {/* Charts and Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Verteilung nach Status
              </h2>
              <StatusDistributionChart data={data.byStatus} />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Anstehende Fristen (30 Tage)
              </h2>
              <div className="max-h-80 overflow-y-auto">
                <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Zusammenfassung
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {data.totals.totalApplications}
                </div>
                <div className="text-sm text-gray-600">Gesamt Gesuche</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {data.totals.submitted}
                </div>
                <div className="text-sm text-gray-600">Eingereicht</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {data.totals.accepted}
                </div>
                <div className="text-sm text-gray-600">Angenommen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {data.totals.pending}
                </div>
                <div className="text-sm text-gray-600">Ausstehend</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
