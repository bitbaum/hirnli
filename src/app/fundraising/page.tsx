import { Suspense } from 'react';
import type { Metadata } from 'next';
import FundraisingClient from './FundraisingClient';

export const metadata: Metadata = {
  title: 'Fundraising & Vision 2026',
  description: 'Fundraising Hub - Vision, Budget, Pipeline und Fördermöglichkeiten',
};

export default function FundraisingPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <FundraisingClient />
    </Suspense>
  );
}
