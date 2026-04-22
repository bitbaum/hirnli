import { Suspense } from 'react';
import type { Metadata } from 'next';
import FundraisingClient from './FundraisingClient';
import { PROJECT_YEAR_RANGE } from './data';

export const metadata: Metadata = {
  title: `Fundraising Plan ${PROJECT_YEAR_RANGE}`,
  description: '3-Jahres-Fundraising-Plan zur Realisierung der Vision 2030',
};

export default function FundraisingPage() {
  return (
    <Suspense fallback={<div className="text-text-muted">Laden...</div>}>
      <FundraisingClient />
    </Suspense>
  );
}
