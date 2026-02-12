/**
 * Applications Page - Kanban Board View
 *
 * Main interface for managing foundation applications.
 * Drag-and-drop cards between status columns.
 */

import { ApplicationBoard } from '@/components/fundraising/ApplicationBoard';

export const metadata = {
  title: 'Gesuch-Verwaltung | Revamp-IT Fundraising',
  description: 'Verwalten Sie Stiftungsgesuche mit Kanban-Board',
};

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ApplicationBoard />
    </div>
  );
}
