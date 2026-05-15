'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getStatusConfig } from '@/lib/config/application-statuses';
import { formatCHF, formatDateCH } from '@/lib/utils/format';
import type { ApplicationWithFoundation } from '@/lib/db/schema';

interface ClosedApplicationsListProps {
  applications: ApplicationWithFoundation[];
}

export function ClosedApplicationsList({ applications }: ClosedApplicationsListProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (applications.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border pt-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-sm font-medium text-text-muted hover:text-grey-dark transition-colors"
        aria-expanded={isOpen}
      >
        <span>Abgeschlossene Gesuche ({applications.length})</span>
        <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {applications.map(({ application, foundation }) => {
            const status = getStatusConfig(application.status);
            return (
              <div
                key={application.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-light px-4 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border ${status.color}`}>
                    {status.label}
                  </span>
                  <Link
                    href={`/fundraising/applications/${application.id}`}
                    className="truncate text-sm font-medium hover:text-primary transition-colors"
                  >
                    {foundation?.name ?? 'Unbekannte Stiftung'}
                  </Link>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm text-text-muted">
                  {application.requestedAmount != null && (
                    <span>{formatCHF(application.requestedAmount)}</span>
                  )}
                  {application.decisionDate && (
                    <span>{formatDateCH(application.decisionDate)}</span>
                  )}
                  {application.rejectionReason && (
                    <span
                      className="max-w-xs truncate text-danger-text"
                      title={application.rejectionReason}
                    >
                      {application.rejectionReason}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
