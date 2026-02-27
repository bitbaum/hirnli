/**
 * Application Board - Kanban-style board for managing applications
 *
 * Drag-and-drop interface for changing application status.
 * Optimistic updates with automatic API sync.
 */

'use client';

import { useState, useEffect } from 'react';
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
import type { Application, Foundation } from '@/lib/db/schema';

interface ApplicationWithFoundation {
  application: Application;
  foundation: Foundation | null;
}

export function ApplicationBoard() {
  const [applications, setApplications] = useState<ApplicationWithFoundation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications');
      const result = await response.json();

      if (result.success) {
        setApplications(result.data);
      } else {
        setError(result.error || 'Failed to fetch applications');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as string;

    // Find the application being moved
    const appIndex = applications.findIndex(a => a.application.id === applicationId);
    if (appIndex === -1) return;

    const oldStatus = applications[appIndex].application.status;

    // Don't update if status didn't change
    if (oldStatus === newStatus) return;

    // Optimistic update
    setApplications(prev =>
      prev.map(item =>
        item.application.id === applicationId
          ? { ...item, application: { ...item.application, status: newStatus } }
          : item
      )
    );

    // API call
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on error
        setApplications(prev =>
          prev.map(item =>
            item.application.id === applicationId
              ? { ...item, application: { ...item.application, status: oldStatus } }
              : item
          )
        );
        alert(`Fehler: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
      setApplications(prev =>
        prev.map(item =>
          item.application.id === applicationId
            ? { ...item, application: { ...item.application, status: oldStatus } }
            : item
        )
      );
      alert('Netzwerkfehler beim Aktualisieren');
    }
  }

  // Get active application for drag overlay
  const activeApplication = activeId
    ? applications.find(a => a.application.id === activeId)
    : null;

  // Group applications by status
  const applicationsByStatus = KANBAN_COLUMNS.map(statusId => {
    const statusConfig = APPLICATION_STATUSES.find(s => s.id === statusId)!;
    const statusApplications = applications.filter(
      a => a.application.status === statusId
    );

    return {
      status: statusConfig,
      applications: statusApplications,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Lade Gesuche...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fehler: {error}</p>
        <button
          onClick={fetchApplications}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Stats derived from applications state — no extra API call
  const totalRequested = applications.reduce(
    (sum, { application }) => sum + (application.requestedAmount || 0),
    0
  )
  const submittedCount = applications.filter(
    ({ application }) => application.status === 'submitted'
  ).length

  return (
    <div className="space-y-4">
      {/* Header row: stats + actions */}
      <div className="flex items-center justify-between gap-4">
        {applications.length > 0 ? (
          <div className="flex flex-wrap gap-6 text-sm text-gray-700">
            <span>
              <span className="font-semibold text-gray-900">{applications.length}</span> Gesuche
            </span>
            <span>
              <span className="font-semibold text-gray-900">{formatCHF(totalRequested)}</span> beantragt
            </span>
            <span>
              <span className="font-semibold text-gray-900">{submittedCount}</span> eingereicht
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
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Empty state — shown instead of the board when no applications exist */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-1">Noch keine Gesuche</p>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Wähle eine Stiftung aus der Liste und klicke auf &ldquo;Gesuch starten&rdquo;,
            um sie in die Pipeline aufzunehmen.
          </p>
          <Link
            href="/fundraising/stiftungen"
            className="inline-block rounded-lg bg-grey-dark px-6 py-3 text-sm font-semibold text-white hover:bg-grey-dark/85"
          >
            Stiftungen durchsuchen →
          </Link>
        </div>
      ) : (
        /* Kanban board */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]">
            {applicationsByStatus.map(({ status, applications }) => (
              <Column
                key={status.id}
                status={status}
                applications={applications}
              />
            ))}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeApplication ? (
              <div className="rotate-3 opacity-90">
                <ApplicationCard
                  application={activeApplication.application}
                  foundation={activeApplication.foundation}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
