import { Suspense } from 'react';
import type { Metadata } from 'next';
import FinanzenClient from './FinanzenClient';

export const metadata: Metadata = {
  title: 'Finanzen',
  description: 'Detaillierte Einnahmenanalyse nach Kivitendo-Konten',
};

export default function FinanzenPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <FinanzenClient />
    </Suspense>
  );
}
