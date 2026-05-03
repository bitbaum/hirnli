/**
 * Application Board - Kanban-style board for managing applications
 *
 * Drag-and-drop interface for changing application status.
 * Optimistic updates with automatic API sync.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { ApplicationCard } from './ApplicationCard';
import { KANBAN_COLUMNS, getStatusConfig, type ApplicationStatusId, type RequiredField } from '@/lib/config/application-statuses';
import { formatCHF } from '@/lib/utils/format';
import type { Application, ApplicationWithFoundation } from '@/lib/db/schema';
import RequiredFieldsModal from './RequiredFieldsModal';

export function ApplicationBoard() {
  const [applications, setApplications] = useState<ApplicationWithFoundation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const [requiredFieldsModal, setRequiredFieldsModal] = useState<{
    applicationId: string;
    targetStatus: ApplicationStatusId;
    missingFields: RequiredField[];
  } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/applications');
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        setError(result.error || 'Fehler beim Laden');
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Netzwerkfehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Auto-clear drag errors after 5 seconds
  useEffect(() => {
    if (!dragError) return;
    const t = setTimeout(() => setDragError(null), 5000);
    return () => clearTimeout(t);
  }, [dragError]);

  // Called by ApplicationCard after successful delete
  function handleDeleted(id: string) {
    setApplications((prev) => prev.filter((a) => a.application.id !== id));
  }

  // Called by ApplicationCard after successful edit
  function handleUpdated(updated: Application) {
    setApplications((prev) =>
      prev.map((item) =>
        item.application.id === updated.id
          ? { ...item, application: updated }
          : item,
      ),
    );
  }

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as ApplicationStatusId; // drop targets are always KANBAN_COLUMNS entries

    const appIndex = applications.findIndex((a) => a.application.id === applicationId);
    if (appIndex === -1) return;

    const oldStatus = applications[appIndex].application.status;
    if (oldStatus === newStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((item) =>
        item.application.id === applicationId
          ? { ...item, application: { ...item.application, status: newStatus } }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) {
        // Revert optimistic update
        setApplications((prev) =>
          prev.map((item) =>
            item.application.id === applicationId
              ? { ...item, application: { ...item.application, status: oldStatus } }
              : item,
          ),
        );
        // Show required fields modal on 422, inline error for everything else
        if (response.status === 422 && result.missingFields) {
          setRequiredFieldsModal({
            applicationId,
            targetStatus: newStatus,
            missingFields: result.missingFields,
          });
        } else {
          setDragError(result.error ?? 'Status konnte nicht gespeichert werden.');
        }
      }
    } catch {
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? { ...item, application: { ...item.application, status: oldStatus } }
            : item,
        ),
      );
      setDragError('Netzwerkfehler — Status nicht gespeichert.');
    }
  }

  const activeApplication = activeId
    ? applications.find((a) => a.application.id === activeId)
    : null;

  const applicationsByStatus = KANBAN_COLUMNS.map((statusId) => {
    const statusConfig = getStatusConfig(statusId);
    return {
      status: statusConfig,
      applications: applications.filter((a) => a.application.status === statusId),
    };
  });

  const totalRequested = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0,
  );
  const totalAwarded = applications.reduce(
    (sum, { application }) => sum + (application.awardedAmount || 0),
    0,
  );
  const submittedCount = applications.filter(
    ({ application }) => application.status === 'submitted',
  ).length;
  const acceptedCount = applications.filter(
    ({ application }) => application.status === 'accepted',
  ).length;

  if (isLoading) {
    return <LoadingState label="Lade Gesuche..." className="h-64" />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={fetchApplications} />;
  }

  return (
    <div className="space-y-4">
      {/* Header row: stats + actions */}
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
            <span>
              <span className="font-semibold text-grey-dark">{formatCHF(totalRequested)}</span> beantragt
            </span>
            {submittedCount > 0 && (
              <span>
                <span className="font-semibold text-grey-dark">{submittedCount}</span> eingereicht
              </span>
            )}
            {acceptedCount > 0 && (
              <span>
                <span className="font-semibold text-success">{acceptedCount}</span> zugesagt
              </span>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex gap-2 shrink-0">
          <Link
            href="/fundraising/stiftungen"
            className="rounded-lg bg-grey-dark px-4 py-2 text-sm font-medium text-white hover:bg-grey-dark/85"
          >
            + Gesuch hinzufügen
          </Link>
          <button
            onClick={fetchApplications}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm text-grey-dark hover:bg-bg-light"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Drag error banner — auto-dismisses after 5 s */}
      {dragError && (
        <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          <span>{dragError}</span>
          <button
            onClick={() => setDragError(null)}
            className="ml-4 text-danger/70 hover:text-danger"
            aria-label="Schliessen"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-light py-20 text-center">
          <p className="mb-1 text-lg font-semibold text-grey-dark">Noch keine Gesuche</p>
          <p className="mb-6 max-w-xs text-sm text-text-muted">
            Wähle eine Stiftung aus der Liste und klicke auf &ldquo;Gesuch starten&rdquo;, um sie
            in die Pipeline aufzunehmen.
          </p>
          <Link
            href="/fundraising/stiftungen"
            className="inline-block rounded-lg bg-grey-dark px-6 py-3 text-sm font-semibold text-white hover:bg-grey-dark/85"
          >
            Stiftungen durchsuchen →
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Horizontally scrollable kanban */}
          <div className="overflow-x-auto pb-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(200px, 1fr))` }}
            >
              {applicationsByStatus.map(({ status, applications: colApps }) => (
                <Column
                  key={status.id}
                  status={status}
                  applications={colApps}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeApplication ? (
              <div className="rotate-2 opacity-90">
                <ApplicationCard
                  application={activeApplication.application}
                  foundation={activeApplication.foundation}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Required fields modal for status transitions */}
      {requiredFieldsModal && (
        <RequiredFieldsModal
          applicationId={requiredFieldsModal.applicationId}
          targetStatus={requiredFieldsModal.targetStatus}
          missingFields={requiredFieldsModal.missingFields}
          onSuccess={() => {
            setRequiredFieldsModal(null);
            fetchApplications();
          }}
          onCancel={() => setRequiredFieldsModal(null)}
        />
      )}
    </div>
  );
}
