/**
 * Application Board - Kanban-style board for managing applications
 *
 * Drag-and-drop interface for changing application status.
 * Optimistic updates with automatic API sync.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import { APPLICATION_STATUSES, KANBAN_COLUMNS } from '@/lib/config/application-statuses';
import { formatCHF } from '@/lib/utils/format';
import type { Application, FoundationRow } from '@/lib/db/schema';

interface ApplicationWithFoundation {
  application: Application;
  foundation: FoundationRow | null;
}

export function ApplicationBoard() {
  const [applications, setApplications] = useState<ApplicationWithFoundation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const newStatus = over.id as string;

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
        // Revert
        setApplications((prev) =>
          prev.map((item) =>
            item.application.id === applicationId
              ? { ...item, application: { ...item.application, status: oldStatus } }
              : item,
          ),
        );
        alert(`Fehler: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? { ...item, application: { ...item.application, status: oldStatus } }
            : item,
        ),
      );
      alert('Netzwerkfehler beim Aktualisieren');
    }
  }

  const activeApplication = activeId
    ? applications.find((a) => a.application.id === activeId)
    : null;

  const applicationsByStatus = KANBAN_COLUMNS.map((statusId) => {
    const statusConfig = APPLICATION_STATUSES.find((s) => s.id === statusId)!;
    return {
      status: statusConfig,
      applications: applications.filter((a) => a.application.status === statusId),
    };
  });

  const totalRequested = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0,
  );
  const submittedCount = applications.filter(
    ({ application }) => application.status === 'submitted',
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Lade Gesuche...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Fehler: {error}</p>
        <button
          onClick={fetchApplications}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
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
            <span>
              <span className="font-semibold text-grey-dark">{formatCHF(totalRequested)}</span> beantragt
            </span>
            <span>
              <span className="font-semibold text-grey-dark">{submittedCount}</span> eingereicht
            </span>
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
    </div>
  );
}
