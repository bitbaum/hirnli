/**
 * Fundraising Dashboard Page
 *
 * Overview of all fundraising activities, KPIs, and metrics.
 */

import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import { FundraisingDashboard } from '@/components/fundraising/FundraisingDashboard';

export async function generateMetadata(): Promise<Metadata> {
  // Titles name the organisation the request is for. As a static
  // export this was evaluated once at build time, so every tenant's
  // browser tab and link preview carried the first tenant's name.
  const tenant = await getTenant();
  return {
    title: `Fundraising Dashboard | ${tenant.name}`,
    description: 'Übersicht über alle Fundraising-Aktivitäten und Kennzahlen',
  };
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface-raised p-6">
      <FundraisingDashboard />
    </div>
  );
}
