import { Suspense } from 'react';
import type { Metadata } from 'next';
import FundraisingClient from './FundraisingClient';
import { PROJECT_YEAR_RANGE } from './data';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';
import { getAllFoundations } from '@/lib/db/foundations-repo';

export const metadata: Metadata = {
  title: `Fundraising Plan ${PROJECT_YEAR_RANGE}`,
  description: '3-Jahres-Fundraising-Plan zur Realisierung der Vision 2030',
};

export default async function FundraisingPage() {
  const foundations = await getAllFoundations();
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <FundraisingClient foundations={foundations} />
    </Suspense>
  );
}
