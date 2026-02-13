import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import DocumentCard from '@/components/documents/DocumentCard';
import Card from '@/components/ui/Card';
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
        subtitle="Gesuche, Vorlagen und Datenexporte — alle Dokumente zum Download"
        badge={`${DOCUMENT_STATS.totalCount} Dokumente`}
      />

      <WhyThisMatters
        purpose="Zentraler Zugang zu allen herunterladbaren Dokumenten: Stiftungsgesuche, Vorlagen und Datenexporte."
        connection="Gesuche basieren auf Stiftungsdaten (siehe Fundraising). Exporte liefern Rohdaten für eigene Analysen."
      />

      {/* Print Instructions Banner */}
      <Card className="mb-8 bg-blue-50 border-l-4 border-l-blue-500">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">PDF erstellen (Gesuche & Vorlagen)</h3>
            <p className="text-sm text-blue-800 mb-2">
              Für Gesuche und Vorlagen: Klicken Sie auf das Dokument, dann <strong>Cmd+P (Mac)</strong> oder{' '}
              <strong>Ctrl+P (Windows/Linux)</strong> und wählen Sie "Als PDF speichern".
            </p>
            <p className="text-xs text-blue-700">
              CSV-Exporte werden direkt heruntergeladen (keine Print-Funktion nötig).
            </p>
          </div>
        </div>
      </Card>

      {/* Foundation Gesuche */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-grey-dark mb-2">
            Stiftungsgesuche
          </h2>
          <p className="text-sm text-text-light">
            Personalisierte Gesuche für {DOCUMENT_STATS.gesucheCount} recherchierte Stiftungen.
            Jedes Gesuch folgt dem WHY/HOW/WHAT/Budget-Aufbau nach Robert Schmuki.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.gesuche.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-grey-dark mb-2">
            Gesuch-Vorlagen
          </h2>
          <p className="text-sm text-text-light">
            {DOCUMENT_STATS.vorlagenCount} Referenz-Vorlagen nach Stiftungstyp (A/B/C/D/Netzwerk).
            Zeigen Struktur und Ton für jeden Foundation-Typ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.vorlagen.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      {/* Data Exports */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-grey-dark mb-2">
            Generierte Exporte
          </h2>
          <p className="text-sm text-text-light">
            Live generierte CSV-Exporte aus aktuellen Daten. Diese Dateien werden bei jedem Download neu erstellt und sind immer aktuell.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.exports.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      {/* Source Files */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-grey-dark mb-2">
            Quelldateien (Kivitendo)
          </h2>
          <p className="text-sm text-text-light">
            Original-Datenquellen aus Kivitendo (anonymisiert). Diese Dateien bilden die Grundlage für alle Finanzdaten auf dieser Seite.
            <strong className="text-primary ml-1">Empfohlen: Lesen Sie zuerst das README!</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.quellen.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      <StoryBridge bridges={STORY_BRIDGES.dokumente} />
    </>
  );
}
