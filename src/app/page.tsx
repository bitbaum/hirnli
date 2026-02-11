import { Suspense } from 'react';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Übersicht über Finanzen, Wirkung und Fundraising-Pipeline von Revamp-IT',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
