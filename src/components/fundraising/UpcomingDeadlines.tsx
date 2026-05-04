/**
 * Upcoming Deadlines Widget - Shows applications with upcoming decision dates
 *
 * Highlights deadlines in the next 30 days with urgency indicators.
 */

'use client';

import Link from 'next/link';
import { formatCHF, formatDateCH } from '@/lib/utils/format';
import { DEADLINE_CRITICAL_DAYS, DEADLINE_WARNING_DAYS, DEADLINE_UPCOMING_DAYS } from '@/lib/utils/time';

export interface Deadline {
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

  const getUrgencyColor = (days: number) => {
    if (days <= DEADLINE_CRITICAL_DAYS) return 'bg-danger/10 border-danger/20 text-danger';
    if (days <= DEADLINE_WARNING_DAYS) return 'bg-warning/10 border-warning/20 text-warning';
    return 'bg-surface border-border text-text-muted';
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= DEADLINE_CRITICAL_DAYS) return '🔴';
    if (days <= DEADLINE_WARNING_DAYS) return '🟠';
    return '🟡';
  };

  if (deadlines.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        Keine anstehenden Fristen in den nächsten {DEADLINE_UPCOMING_DAYS} Tagen
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
                  Entscheidung: <strong>{formatDateCH(deadline.decisionExpected)}</strong>
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
