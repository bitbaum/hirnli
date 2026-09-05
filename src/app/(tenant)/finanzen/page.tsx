import { Suspense } from 'react';
import type { Metadata } from 'next';
import FinanzenClient from './FinanzenClient';
import { PageLoadingSpinner } from '@/components/ui/LoadingState';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  return {
    title: 'Finanzen',
    // Named the reference tenant's accounting system for every tenant.
    description: `Einnahmen und Aufwand von ${tenant.name}`,
  };
}

export default async function FinanzenPage() {
  const tenant = await getTenant();

  // This page is one organisation's ledger — an eight-year profit-and-loss
  // with per-account detail. It read no tenant data at all, so every tenant
  // was served the same books.
  if (!(await ownsCodeContent('finanzen'))) {
    return (
      <>
        <PageHeader title="Finanzen" subtitle={`Einnahmen und Aufwand von ${tenant.name}`} />
        <ContentNotPublished
          page="Finanzen"
          tenantName={tenant.name}
          describes="Hier erscheinen Jahresrechnung, Einnahmenstruktur und Monatsverlauf, sobald die Buchhaltungsdaten der Organisation hinterlegt sind."
        />
      </>
    );
  }

  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <FinanzenClient />
    </Suspense>
  );
}
