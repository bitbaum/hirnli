import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import DocumentsClient from './DocumentsClient';
import { buildDocuments } from '@/lib/config/documents';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';

export const metadata: Metadata = {
  title: 'Dokumente',
  description: 'Gesuche, Vorlagen und Datenexporte — alle Dokumente zum Download',
};

export default async function DokumentePage() {
  const [foundations, tenant, ownsContent] = await Promise.all([
    getAllFoundations(),
    getTenant(),
    ownsCodeContent('fundraising'),
  ]);
  const { documents, stats } = buildDocuments(foundations, tenant, ownsContent);

  return (
    <>
      <PageHeader
        title="Dokumente"
        subtitle="Stiftungsgesuche, Vorlagen und Datenexporte"
        badge={`${stats.totalCount} Dokumente`}
      />

      <WhyThisMatters
        purpose="Zentraler Zugang zu allen herunterladbaren Dokumenten: Stiftungsgesuche (personalisiert), Vorlagen (nach Typ), und Datenexporte."
        connection="Gesuche basieren auf Stiftungsdaten. Exporte liefern Rohdaten für eigene Analysen. Quelldateien zeigen Datenherkunft."
      />

      <DocumentsClient documents={documents} stats={stats} />

      <StoryBridge bridges={STORY_BRIDGES.dokumente} />
    </>
  );
}
