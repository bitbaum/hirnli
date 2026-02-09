import { Suspense } from 'react';
import type { Metadata } from 'next';
import FoundationListClient from './FoundationListClient';

export const metadata: Metadata = {
  title: 'Stiftungen-Übersicht',
  description: 'Alle Förderstiftungen mit Deadlines und Fit-Analyse',
};

export default function StiftungenPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <FoundationListClient />
    </Suspense>
  );
}
