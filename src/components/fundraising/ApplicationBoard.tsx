/**
 * Application Board - Kanban-style board for managing applications
 *
 * Drag-and-drop interface for changing application status.
 * Optimistic updates with automatic API sync.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
import BoardHeaderStats from './BoardHeaderStats';
import { KANBAN_COLUMNS, getStatusConfig, type ApplicationStatusId, type RequiredField } from '@/lib/config/application-statuses';
import { NET_ERR_LOAD, NET_ERR_SAVE, API_ERR_LOAD } from '@/lib/utils/errors';
import type { Application, ApplicationWithFoundation } from '@/lib/db/schema';
import RequiredFieldsModal from './RequiredFieldsModal';
import EmptyState from '@/components/ui/EmptyState';

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
        setError(result.error || API_ERR_LOAD);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(NET_ERR_LOAD);
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

    const revert = () =>
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? { ...item, application: { ...item.application, status: oldStatus } }
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
        revert();
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
      revert();
      setDragError(NET_ERR_SAVE);
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

  if (isLoading) {
    return <LoadingState label="Lade Gesuche..." className="h-64" />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={fetchApplications} />;
  }

  return (
    <div className="space-y-4">
      {/* Header row: stats + actions */}
      <BoardHeaderStats applications={applications} onRefresh={fetchApplications} />

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
        <EmptyState
          title="Noch keine Gesuche"
          description="Wähle eine Stiftung aus der Liste und klicke auf «Gesuch starten», um sie in die Pipeline aufzunehmen."
          action={{ label: 'Stiftungen durchsuchen →', href: '/fundraising/stiftungen' }}
          size="lg"
        />
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
