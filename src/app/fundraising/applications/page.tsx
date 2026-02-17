/**
 * Applications Page - Kanban Board View
 *
 * Main interface for managing foundation applications.
 * Drag-and-drop cards between status columns.
 */

import { ApplicationBoard } from '@/components/fundraising/ApplicationBoard';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Gesuch-Pipeline | Revamp-IT Fundraising',
  description: 'Stiftungsgesuche verwalten und nachverfolgen',
};

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Gesuch-Pipeline"
        subtitle="Stiftungsgesuche verwalten und nachverfolgen"
      />
      <ApplicationBoard />
    </div>
  );
}
