import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import WirkungClient from './WirkungClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';

export const metadata: Metadata = {
  title: 'Wirkung',
  description: `Ökologische, soziale und digitale Wirkung von ${ORG_PROFILE.name}`,
};

export default function WirkungPage() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <WirkungClient />
    </Suspense>
  );
}
