'use client';

import { Button } from '@/components/ui/Button';
import { formatCHF } from '@/lib/utils/format';
import type { ApplicationWithFoundation } from '@/lib/db/schema';

interface BoardHeaderStatsProps {
  applications: ApplicationWithFoundation[];
  onRefresh: () => void;
}

export default function BoardHeaderStats({ applications, onRefresh }: BoardHeaderStatsProps) {
  const totalRequested = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0,
  );
  const totalAwarded = applications.reduce(
    (sum, { application }) => sum + (application.awardedAmount || 0),
    0,
  );
  const atFoundationsCount = applications.filter(
    ({ application }) => ['submitted', 'pending', 'followup'].includes(application.status),
  ).length;
  const followupCount = applications.filter(
    ({ application }) => application.status === 'followup',
  ).length;

  return (
    <div className="flex items-center justify-between gap-4">
      {applications.length > 0 ? (
        <div className="flex flex-wrap gap-6 text-sm text-grey-dark">
          <span>
            <span className="font-semibold text-grey-dark">{applications.length}</span> Gesuche
          </span>
          {totalAwarded > 0 && (
            <span className="font-semibold text-success">
              {formatCHF(totalAwarded)} zugesagt
            </span>
          )}
          {totalRequested > 0 && (
            <span>
              <span className="font-semibold text-grey-dark">{formatCHF(totalRequested)}</span> beantragt
            </span>
          )}
          {atFoundationsCount > 0 && (
            <span>
              <span className="font-semibold text-grey-dark">{atFoundationsCount}</span> bei Stiftungen
            </span>
          )}
          {followupCount > 0 && (
            <span className="font-semibold text-warning-text">
              {followupCount} Nachfassen
            </span>
          )}
        </div>
      ) : (
        <div />
      )}
      <div className="flex gap-2 shrink-0">
        <Button href="/fundraising/stiftungen?pl=1,2">
          + Gesuch hinzufügen
        </Button>
        <Button variant="secondary" onClick={onRefresh}>↺</Button>
      </div>
    </div>
  );
}
