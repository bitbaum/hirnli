/**
 * Applications Page - Kanban Board View
 *
 * Main interface for managing foundation applications.
 * Drag-and-drop cards between status columns.
 */

import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import { ApplicationBoard } from '@/components/fundraising/ApplicationBoard';
import PageHeader from '@/components/layout/PageHeader';
import { getAllFoundations } from '@/lib/db/foundations-repo';

export async function generateMetadata(): Promise<Metadata> {
  // Titles name the organisation the request is for. As a static
  // export this was evaluated once at build time, so every tenant's
  // browser tab and link preview carried the first tenant's name.
  const tenant = await getTenant();
  return {
    title: `Gesuch-Pipeline | ${tenant.name} Fundraising`,
    description: 'Stiftungsgesuche verwalten und nachverfolgen',
  };
}

export default async function ApplicationsPage() {
  const foundations = await getAllFoundations();
  const p1Foundations = foundations.filter((f) => f.priority === 1);

  return (
    <div className="min-h-screen bg-surface-raised p-6">
      <PageHeader title="Gesuch-Pipeline" subtitle="Stiftungsgesuche verwalten und nachverfolgen" />
      <ApplicationBoard p1Foundations={p1Foundations} />
    </div>
  );
}
