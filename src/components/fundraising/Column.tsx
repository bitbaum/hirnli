/**
 * Kanban Column - Container for application cards
 *
 * Displays a status column with droppable area and card count.
 */

'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ApplicationCard } from './ApplicationCard';
import { formatCHF } from '@/lib/utils/format';
import type { Application, FoundationRow } from '@/lib/db/schema';

interface ColumnProps {
  status: {
    id: string;
    label: string;
    description: string;
    color: string;
  };
  applications: Array<{
    application: Application;
    foundation: FoundationRow | null;
  }>;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Application) => void;
}

export function Column({ status, applications, onDeleted, onUpdated }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  const totalAmount = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0,
  );

  return (
    <div className="flex min-w-[200px] flex-col">
      {/* Column header */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-grey-dark">{status.label}</h2>
          <span className="rounded bg-bg-light px-1.5 py-0.5 text-xs font-medium text-text-light">
            {applications.length}
          </span>
        </div>
        {totalAmount > 0 && (
          <div className="text-xs font-medium text-text-muted">{formatCHF(totalAmount)}</div>
        )}
        <p className="mt-0.5 text-xs text-text-muted">{status.description}</p>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-2 transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-bg-light ring-2 ring-border'
        }`}
      >
        <SortableContext
          items={applications.map((a) => a.application.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex h-16 items-center justify-center text-xs text-text-muted select-none">
              Hierher ziehen
            </div>
          ) : (
            applications.map(({ application, foundation }) => (
              <ApplicationCard
                key={application.id}
                application={application}
                foundation={foundation}
                onDeleted={onDeleted}
                onUpdated={onUpdated}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
