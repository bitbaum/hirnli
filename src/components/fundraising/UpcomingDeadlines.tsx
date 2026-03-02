/**
 * Upcoming Deadlines Widget - Shows applications with upcoming decision dates
 *
 * Highlights deadlines in the next 30 days with urgency indicators.
 */

'use client';

import Link from 'next/link';

interface Deadline {
  id: string;
  foundationName: string;
  decisionExpected: string;
  requestedAmount: number | null;
  daysUntilDeadline: number;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const formatCHF = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'bg-red-100 border-red-300 text-red-700';
    if (days <= 14) return 'bg-orange-100 border-orange-300 text-orange-700';
    return 'bg-yellow-100 border-yellow-300 text-yellow-700';
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 7) return '🔴';
    if (days <= 14) return '🟠';
    return '🟡';
  };

  if (deadlines.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        Keine anstehenden Fristen in den nächsten 30 Tagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deadlines.map((deadline) => (
        <Link
          key={deadline.id}
          href={`/fundraising/applications/${deadline.id}`}
          className={`block border rounded-lg p-4 hover:shadow-md transition-shadow ${getUrgencyColor(deadline.daysUntilDeadline)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getUrgencyIcon(deadline.daysUntilDeadline)}</span>
                <h3 className="font-medium">{deadline.foundationName}</h3>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  Entscheidung: <strong>{formatDate(deadline.decisionExpected)}</strong>
                </div>
                {deadline.requestedAmount && (
                  <div>
                    Betrag: <strong>{formatCHF(deadline.requestedAmount)}</strong>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">
                {deadline.daysUntilDeadline}
              </div>
              <div className="text-xs">
                {deadline.daysUntilDeadline === 1 ? 'Tag' : 'Tage'}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
