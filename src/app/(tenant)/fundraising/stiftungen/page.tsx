import { Suspense } from 'react';
import type { Metadata } from 'next';
import FoundationListClient from './FoundationListClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';
import { getAllFoundations } from '@/lib/db/foundations-repo';

export const metadata: Metadata = {
  title: 'Stiftungen-Übersicht',
  description: 'Alle Förderstiftungen mit Deadlines und Fit-Analyse',
};

export default async function StiftungenPage() {
  const foundations = await getAllFoundations();
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <FoundationListClient foundations={foundations} />
    </Suspense>
  );
}
