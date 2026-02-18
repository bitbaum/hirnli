/**
 * Fundraising Dashboard Page
 *
 * Overview of all fundraising activities, KPIs, and metrics.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { FundraisingDashboard } from '@/components/fundraising/FundraisingDashboard';

export const metadata = {
  title: `Fundraising Dashboard | ${ORG_PROFILE.name}`,
  description: 'Übersicht über alle Fundraising-Aktivitäten und Kennzahlen',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <FundraisingDashboard />
    </div>
  );
}
