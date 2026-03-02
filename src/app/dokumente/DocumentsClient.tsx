'use client';

import { useState } from 'react';
import DocumentCard from '@/components/documents/DocumentCard';
import Card from '@/components/ui/Card';
import type { Document } from '@/lib/config/documents';

interface DocumentsClientProps {
  documents: {
    gesuche: Document[];
    vorlagen: Document[];
    exports: Document[];
    quellen: Document[];
  };
  stats: {
    gesucheCount: number;
    vorlagenCount: number;
    exportsCount: number;
    quellenCount: number;
    totalCount: number;
  };
}

type TabId = 'gesuche' | 'vorlagen' | 'daten';

export default function DocumentsClient({ documents, stats }: DocumentsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('gesuche');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'gesuche' as TabId, label: `Gesuche (${stats.gesucheCount})`, icon: '📄' },
    { id: 'vorlagen' as TabId, label: `Vorlagen (${stats.vorlagenCount})`, icon: '📝' },
    { id: 'daten' as TabId, label: `Daten (${stats.exportsCount + stats.quellenCount})`, icon: '📊' },
  ];

  // Filter documents based on search query
  const filterDocuments = (docs: Document[]) => {
    if (!searchQuery) return docs;
    const query = searchQuery.toLowerCase();
    return docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.badge?.toLowerCase().includes(query)
    );
  };

  const filteredGesuche = filterDocuments(documents.gesuche);
  const filteredVorlagen = filterDocuments(documents.vorlagen);
  const filteredExports = filterDocuments(documents.exports);
  const filteredQuellen = filterDocuments(documents.quellen);

  return (
    <div className="space-y-8">
      {/* Usage tip */}
      <p className="text-sm text-text-muted">
        <strong>PDF-Gesuche</strong> öffnen im Browser.{' '}
        <strong>CSV/Excel</strong> werden direkt heruntergeladen.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-light hover:text-grey-dark'
            }`}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Dokumente durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Gesuche Tab */}
      {activeTab === 'gesuche' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-grey-dark mb-2">
              Stiftungsgesuche {searchQuery && `(${filteredGesuche.length} Ergebnisse)`}
            </h2>
            <p className="text-sm text-text-light">
              Personalisierte Gesuche für recherchierte Stiftungen. Klicken Sie auf ein Gesuch, dann Cmd/Ctrl+P um als PDF zu speichern.
            </p>
          </div>

          {filteredGesuche.length === 0 ? (
            <Card className="text-center py-12">
              <span className="text-4xl mb-4 block" aria-hidden="true">🔍</span>
              <p className="text-text-muted">Keine Gesuche gefunden für &bdquo;{searchQuery}&ldquo;</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGesuche.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vorlagen Tab */}
      {activeTab === 'vorlagen' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-grey-dark mb-2">
              Gesuch-Vorlagen {searchQuery && `(${filteredVorlagen.length} Ergebnisse)`}
            </h2>
            <p className="text-sm text-text-light">
              Referenz-Vorlagen nach Stiftungstyp. Zeigen Struktur und Ton für jeden Foundation-Typ (A/B/C/D/Netzwerk/Generisch).
            </p>
          </div>

          {filteredVorlagen.length === 0 ? (
            <Card className="text-center py-12">
              <span className="text-4xl mb-4 block" aria-hidden="true">🔍</span>
              <p className="text-text-muted">Keine Vorlagen gefunden für &bdquo;{searchQuery}&ldquo;</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVorlagen.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daten Tab */}
      {activeTab === 'daten' && (
        <div className="space-y-12">
          {/* Generated Exports */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-grey-dark mb-2">
                Generierte Exporte {searchQuery && `(${filteredExports.length} Ergebnisse)`}
              </h2>
              <p className="text-sm text-text-light">
                Live generierte CSV-Dateien aus aktuellen Daten. Diese werden bei jedem Download neu erstellt und sind immer aktuell.
              </p>
            </div>

            {filteredExports.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-text-muted">Keine Exporte gefunden für &bdquo;{searchQuery}&ldquo;</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExports.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </section>

          {/* Source Files */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-grey-dark mb-2">
                Quelldateien (Kivitendo) {searchQuery && `(${filteredQuellen.length} Ergebnisse)`}
              </h2>
              <p className="text-sm text-text-light">
                Original-Datenquellen aus Kivitendo (anonymisiert). Diese Dateien bilden die Grundlage für alle Finanzdaten auf dieser Seite.
                <strong className="text-primary ml-1">Empfohlen: Lesen Sie zuerst das README!</strong>
              </p>
            </div>

            {filteredQuellen.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-text-muted">Keine Quelldateien gefunden für &bdquo;{searchQuery}&ldquo;</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuellen.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
