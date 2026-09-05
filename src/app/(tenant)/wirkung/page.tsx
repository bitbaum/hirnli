import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import WirkungClient from './WirkungClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { ownsCodeContent } from '@/lib/content/page-content';

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

export default async function WirkungPage() {
  const tenant = await getTenant();

  // Every tile here is derived from this organisation's device sales times its
  // own refurbishment constants, and the roadmap below them is its own. Served
  // to another tenant it reported that organisation's CO2 savings as theirs.
  if (!(await ownsCodeContent('wirkung'))) {
    return (
      <>
        <PageHeader title="Wirkung" subtitle={`Wirkung von ${tenant.name}`} />
        <ContentNotPublished
          page="Wirkung"
          tenantName={tenant.name}
          describes="Hier erscheinen Umwelt- und Sozialkennzahlen, sobald die Organisation ihre Wirkungsdaten hinterlegt hat."
        />
      </>
    );
  }

  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <WirkungClient />
    </Suspense>
  );
}
