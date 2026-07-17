import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import DocumentsClient from './DocumentsClient';
import { DOCUMENTS, DOCUMENT_STATS } from '@/lib/config/documents';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Dokumente',
  description: 'Gesuche, Vorlagen und Datenexporte — alle Dokumente zum Download',
};

export default function DokumentePage() {
  return (
    <>
      <PageHeader
        title="Dokumente"
        subtitle="Stiftungsgesuche, Vorlagen und Datenexporte"
        badge={`${DOCUMENT_STATS.totalCount} Dokumente`}
      />

      <WhyThisMatters
        purpose="Zentraler Zugang zu allen herunterladbaren Dokumenten: Stiftungsgesuche (personalisiert), Vorlagen (nach Typ), und Datenexporte."
        connection="Gesuche basieren auf Stiftungsdaten. Exporte liefern Rohdaten für eigene Analysen. Quelldateien zeigen Datenherkunft."
      />

      <DocumentsClient documents={DOCUMENTS} stats={DOCUMENT_STATS} />

      <StoryBridge bridges={STORY_BRIDGES.dokumente} />
    </>
  );
}
