import { Suspense } from 'react';
import type { Metadata } from 'next';
import FoundationListClient from './FoundationListClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';

export const metadata: Metadata = {
  title: 'Stiftungen-Übersicht',
  description: 'Alle Förderstiftungen mit Deadlines und Fit-Analyse',
};

export default function StiftungenPage() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <FoundationListClient />
    </Suspense>
  );
}
