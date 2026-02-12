/**
 * Fundraising Dashboard Page
 *
 * Overview of all fundraising activities, KPIs, and metrics.
 */

import { FundraisingDashboard } from '@/components/fundraising/FundraisingDashboard';

export const metadata = {
  title: 'Fundraising Dashboard | Revamp-IT',
  description: 'Übersicht über alle Fundraising-Aktivitäten und Kennzahlen',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <FundraisingDashboard />
    </div>
  );
}
