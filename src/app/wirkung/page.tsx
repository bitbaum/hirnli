import { Suspense } from 'react';
import type { Metadata } from 'next';
import WirkungClient from './WirkungClient';

export const metadata: Metadata = {
  title: 'Wirkung',
  description: 'Ökologische, soziale und digitale Wirkung von Revamp-IT',
};

export default function WirkungPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <WirkungClient />
    </Suspense>
  );
}
