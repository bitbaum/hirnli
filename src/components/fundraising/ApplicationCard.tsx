/**
 * Application Card - Draggable card for Kanban board
 *
 * Displays application info with drag handle and quick actions.
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { Application, Foundation } from '@/lib/db/schema';

interface ApplicationCardProps {
  application: Application;
  foundation: Foundation | null;
}

export function ApplicationCard({ application, foundation }: ApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Format currency
  const formatCHF = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Priority badge color
  const priorityColor = (level: number | null) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-700';
      case 2: return 'bg-orange-100 text-orange-700';
      case 3: return 'bg-yellow-100 text-yellow-700';
      case 4: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* Foundation name */}
      <Link
        href={`/fundraising/applications/${application.id}`}
        className="block mb-2"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
          {foundation?.name || 'Unknown Foundation'}
        </h3>
      </Link>

      {/* Amount */}
      {application.requestedAmount && (
        <div className="text-lg font-semibold text-gray-700 mb-2">
          {formatCHF(application.requestedAmount)}
        </div>
      )}

      {/* Project focus */}
      {application.projectFocus && (
        <div className="text-sm text-gray-600 mb-2">
          {application.projectFocus}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {application.contactDate && (
          <span title="Kontaktdatum">
            📅 {formatDate(application.contactDate)}
          </span>
        )}
        {application.decisionExpected && (
          <span title="Entscheidung erwartet">
            ⏰ {formatDate(application.decisionExpected)}
          </span>
        )}
      </div>

      {/* Footer: Priority + Assigned */}
      <div className="flex items-center justify-between">
        {application.priorityLevel && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor(application.priorityLevel)}`}>
            P{application.priorityLevel}
          </span>
        )}
        {application.assignedTo && (
          <span className="text-xs text-gray-500">
            {application.assignedTo}
          </span>
        )}
      </div>
    </div>
  );
}
