/**
 * Application Detail Page
 *
 * View and edit individual application details.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStatusColor } from '@/lib/config/application-statuses';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import type { Application, Foundation } from '@/lib/db/schema';

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

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  async function fetchApplication() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Application not found');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch application:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCHF = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-500">Lade Gesuch...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Fehler: {error}</p>
            <Link href="/fundraising/applications" className="text-blue-600 hover:underline">
              ← Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { application, foundation } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/fundraising/applications"
              className="text-blue-600 hover:underline text-sm mb-2 inline-block"
            >
              ← Zurück zur Übersicht
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {foundation?.name || 'Unknown Foundation'}
            </h1>
          </div>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(application.status as ApplicationStatusId)}`}>
            {application.status}
          </span>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gesuchsinformationen</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Beantragt</label>
              <div className="text-xl font-semibold text-gray-900">
                {formatCHF(application.requestedAmount)}
              </div>
            </div>

            {application.awardedAmount && (
              <div>
                <label className="text-sm font-medium text-gray-600">Zugesagt</label>
                <div className="text-xl font-semibold text-green-600">
                  {formatCHF(application.awardedAmount)}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Projektfokus</label>
              <div className="text-gray-900">{application.projectFocus || '—'}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Priorität</label>
              <div className="text-gray-900">
                {application.priorityLevel ? `P${application.priorityLevel}` : '—'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Zuständig</label>
              <div className="text-gray-900">{application.assignedTo || '—'}</div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium text-gray-600">Kontakt</span>
              <span className="text-gray-900">{formatDate(application.contactDate)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium text-gray-600">Eingereicht</span>
              <span className="text-gray-900">{formatDate(application.submissionDate)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium text-gray-600">Entscheidung erwartet</span>
              <span className="text-gray-900">{formatDate(application.decisionExpected)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Entscheidung</span>
              <span className="text-gray-900">{formatDate(application.decisionDate)}</span>
            </div>
          </div>
        </div>

        {/* Foundation Info Card */}
        {foundation && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stiftung</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Website</label>
                <div>
                  <a
                    href={foundation.websiteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {foundation.websiteUrl || '—'}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Kontakt Email</label>
                <div className="text-gray-900">{foundation.contactEmail || '—'}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Fit Score</label>
                <div className="text-gray-900">{foundation.fitScore || '—'} / 10</div>
              </div>

              <div>
                <Link
                  href={`/fundraising/stiftungen/${foundation.id}`}
                  className="inline-block rounded-lg bg-grey-dark px-4 py-2 text-sm font-medium text-white hover:bg-grey-dark/85"
                >
                  Stiftungsprofil anzeigen →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Notes Card */}
        {application.customizationNotes && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notizen</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.customizationNotes}</p>
          </div>
        )}

        {/* Outcomes Card */}
        {(application.successFactors || application.rejectionReason) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ergebnis</h2>

            {application.successFactors && (
              <div className="mb-4">
                <label className="text-sm font-medium text-green-600">Erfolgsfaktoren</label>
                <p className="text-gray-700 whitespace-pre-wrap">{application.successFactors}</p>
              </div>
            )}

            {application.rejectionReason && (
              <div>
                <label className="text-sm font-medium text-red-600">Ablehnungsgrund</label>
                <p className="text-gray-700 whitespace-pre-wrap">{application.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
