import { Suspense } from 'react';
import type { Metadata } from 'next';
import FundraisingClient from './FundraisingClient';

export const metadata: Metadata = {
  title: 'Fundraising Plan 2026–2028',
  description: '3-Jahres-Fundraising-Plan zur Realisierung der Vision 2030',
};

export default function FundraisingPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <FundraisingClient />
    </Suspense>
  );
}
