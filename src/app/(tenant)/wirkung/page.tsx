import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import WirkungClient from './WirkungClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';

export async function generateMetadata(): Promise<Metadata> {
  // Titles name the organisation the request is for. As a static
  // export this was evaluated once at build time, so every tenant's
  // browser tab and link preview carried the first tenant's name.
  const tenant = await getTenant();
  return {
    title: 'Wirkung',
    description: `Ökologische, soziale und digitale Wirkung von ${tenant.name}`,
  };
}

export default function WirkungPage() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <WirkungClient />
    </Suspense>
  );
}
