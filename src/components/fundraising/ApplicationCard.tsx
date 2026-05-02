/**
 * ApplicationCard — Draggable Kanban card with edit and delete actions
 *
 * Drag handle is separated from content so action buttons don't
 * accidentally trigger drag events.
 */

'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { EditApplicationModal } from './EditApplicationModal';
import { getPriorityColor } from '@/lib/config/application-statuses';
import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import { formatCHF } from '@/lib/utils/format';
import type { Application, FoundationRow } from '@/lib/db/schema';

interface ApplicationCardProps {
  application: Application;
  foundation: FoundationRow | null;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Application) => void;
}

export function ApplicationCard({
  application,
  foundation,
  onDeleted,
  onUpdated,
}: ApplicationCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    opacity: isDragging ? 0.4 : 1,
  };

  // Format date to DD.MM.YY
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  // Deadline urgency colour
  const deadlineColor = () => {
    if (!application.decisionExpected) return 'text-text-muted';
    const days = Math.ceil(
      (new Date(application.decisionExpected).getTime() - Date.now()) / 86400000,
    );
    if (days <= 7) return 'text-danger font-semibold';
    if (days <= 14) return 'text-warning';
    return 'text-text-muted';
  };

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/applications/${application.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        onDeleted(application.id);
      } else {
        setDeleteError(result.error ?? 'Unbekannter Fehler');
      }
    } catch {
      setDeleteError('Netzwerkfehler beim Löschen');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="group relative mb-3 rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {/* Top bar: drag handle + foundation name + actions */}
        <div className="flex items-start gap-2 p-3 pb-0">
          {/* Drag handle — only this element triggers drag */}
          <div
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab text-text-muted hover:text-text-muted active:cursor-grabbing select-none"
            title="Ziehen"
          >
            ⠿
          </div>

          {/* Foundation name */}
          <Link
            href={`/fundraising/applications/${application.id}`}
            className="min-w-0 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold leading-snug text-grey-dark hover:text-primary transition-colors line-clamp-2">
              {foundation?.name ?? 'Unbekannte Stiftung'}
            </h3>
          </Link>

          {/* Action buttons — always visible */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded p-1 text-text-muted hover:bg-bg-light hover:text-grey-dark"
              title="Bearbeiten"
              aria-label="Gesuch bearbeiten"
            >
              ✏️
            </button>
            <button
              onClick={() => setDeleteConfirm(!deleteConfirm)}
              className="rounded p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
              title="Löschen"
              aria-label="Gesuch löschen"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="px-3 pb-3 pt-2">
          {/* Amount */}
          {application.requestedAmount && (
            <div className="mb-1.5 text-base font-semibold text-grey-dark">
              {formatCHF(application.requestedAmount)}
            </div>
          )}

          {/* Project focus */}
          {application.projectFocus && (
            <div className="mb-2 text-sm text-text-muted line-clamp-1">
              {application.projectFocus}
            </div>
          )}

          {/* Dates row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            {application.contactDate && (
              <span className="text-text-muted" title="Kontaktdatum">
                📅 {formatDate(application.contactDate)}
              </span>
            )}
            {application.decisionExpected && (
              <span className={deadlineColor()} title="Entscheidung erwartet">
                ⏰ {formatDate(application.decisionExpected)}
              </span>
            )}
          </div>

          {/* Footer: priority + fit score + assignee */}
          {(application.priorityLevel || application.assignedTo || (foundation?.fitScore != null && foundation.fitScore > 0)) && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {application.priorityLevel && (
                  <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${getPriorityColor(application.priorityLevel)}`}>
                    P{application.priorityLevel}
                  </span>
                )}
                {foundation?.fitScore != null && foundation.fitScore > 0 && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      fitScoreToDisplay(foundation.fitScore, false) === 3
                        ? 'bg-success/10 text-success'
                        : fitScoreToDisplay(foundation.fitScore, false) >= 2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-bg-light text-text-muted'
                    }`}
                    title={`Fit-Score: ${foundation.fitScore}/10`}
                  >
                    Fit {foundation.fitScore}/10
                  </span>
                )}
              </div>
              {application.assignedTo && (
                <span className="text-sm text-text-muted">{application.assignedTo}</span>
              )}
            </div>
          )}

          {/* Delete confirmation + inline error */}
          {deleteConfirm && (
            <div className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm">
              {deleteError ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-danger">{deleteError}</span>
                  <button
                    onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                    className="rounded px-2 py-0.5 text-xs text-text-light hover:bg-bg-light"
                  >
                    Schliessen
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-danger">Wirklich löschen?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded px-2 py-0.5 text-xs text-text-light hover:bg-bg-light"
                      disabled={isDeleting}
                    >
                      Nein
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="rounded bg-danger px-2 py-0.5 text-xs font-semibold text-white hover:bg-danger/80 disabled:opacity-50"
                    >
                      {isDeleting ? '...' : 'Ja, löschen'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal — rendered outside card to avoid z-index issues */}
      {showEdit && (
        <EditApplicationModal
          application={application}
          foundation={foundation}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            onUpdated(updated);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
