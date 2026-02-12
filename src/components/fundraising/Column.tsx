/**
 * Kanban Column - Container for application cards
 *
 * Displays a status column with droppable area and card count.
 */

'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ApplicationCard } from './ApplicationCard';
import type { Application, Foundation } from '@/lib/db/schema';

interface ColumnProps {
  status: {
    id: string;
    label: string;
    description: string;
    color: string;
  };
  applications: Array<{
    application: Application;
    foundation: Foundation | null;
  }>;
}

export function Column({ status, applications }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  // Calculate total requested amount for this column
  const totalAmount = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0
  );

  const formatCHF = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-900">{status.label}</h2>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            {applications.length}
          </span>
        </div>
        {totalAmount > 0 && (
          <div className="text-sm text-gray-600">
            {formatCHF(totalAmount)}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{status.description}</p>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-3 transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border-2 border-gray-200'
        }`}
      >
        <SortableContext
          items={applications.map(a => a.application.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              Keine Gesuche
            </div>
          ) : (
            applications.map(({ application, foundation }) => (
              <ApplicationCard
                key={application.id}
                application={application}
                foundation={foundation}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
