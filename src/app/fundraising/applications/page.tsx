/**
 * Applications Page - Kanban Board View
 *
 * Main interface for managing foundation applications.
 * Drag-and-drop cards between status columns.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { ApplicationBoard } from '@/components/fundraising/ApplicationBoard';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: `Gesuch-Pipeline | ${ORG_PROFILE.name} Fundraising`,
  description: 'Stiftungsgesuche verwalten und nachverfolgen',
};

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-surface-raised p-6">
      <PageHeader
        title="Gesuch-Pipeline"
        subtitle="Stiftungsgesuche verwalten und nachverfolgen"
      />
      <ApplicationBoard />
    </div>
  );
}
