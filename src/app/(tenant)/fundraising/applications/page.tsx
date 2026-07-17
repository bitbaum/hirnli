/**
 * Applications Page - Kanban Board View
 *
 * Main interface for managing foundation applications.
 * Drag-and-drop cards between status columns.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { ApplicationBoard } from '@/components/fundraising/ApplicationBoard';
import PageHeader from '@/components/layout/PageHeader';
import { getAllFoundations } from '@/lib/db/foundations-repo';

export const metadata = {
  title: `Gesuch-Pipeline | ${ORG_PROFILE.name} Fundraising`,
  description: 'Stiftungsgesuche verwalten und nachverfolgen',
};

export default async function ApplicationsPage() {
  const foundations = await getAllFoundations();
  const p1Foundations = foundations.filter((f) => f.priority === 1);

  return (
    <div className="min-h-screen bg-surface-raised p-6">
      <PageHeader
        title="Gesuch-Pipeline"
        subtitle="Stiftungsgesuche verwalten und nachverfolgen"
      />
      <ApplicationBoard p1Foundations={p1Foundations} />
    </div>
  );
}
