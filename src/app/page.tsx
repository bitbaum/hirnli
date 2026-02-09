import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
