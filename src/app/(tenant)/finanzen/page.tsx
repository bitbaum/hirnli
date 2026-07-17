import { Suspense } from 'react';
import type { Metadata } from 'next';
import FinanzenClient from './FinanzenClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';

export const metadata: Metadata = {
  title: 'Finanzen',
  description: 'Detaillierte Einnahmenanalyse nach Kivitendo-Konten',
};

export default function FinanzenPage() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <FinanzenClient />
    </Suspense>
  );
}
