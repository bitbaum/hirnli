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

type TabId = 'overview' | 'gesuche' | 'vorlagen' | 'daten';

export default function DocumentsClient({ documents, stats }: DocumentsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'overview' as TabId, label: 'Übersicht', icon: '📋' },
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

      {/* Search (only show when not on overview) */}
      {activeTab !== 'overview' && (
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center bg-blue-50 border-l-4 border-l-blue-500">
              <div className="text-3xl font-bold text-blue-900">{stats.gesucheCount}</div>
              <div className="text-sm text-blue-700 mt-1">Stiftungsgesuche</div>
              <div className="text-xs text-blue-600 mt-1">Personalisiert für jede Stiftung</div>
            </Card>
            <Card className="text-center bg-violet-50 border-l-4 border-l-violet-500">
              <div className="text-3xl font-bold text-violet-900">{stats.vorlagenCount}</div>
              <div className="text-sm text-violet-700 mt-1">Gesuch-Vorlagen</div>
              <div className="text-xs text-violet-600 mt-1">Nach Stiftungstyp (A/B/C/D)</div>
            </Card>
            <Card className="text-center bg-emerald-50 border-l-4 border-l-emerald-500">
              <div className="text-3xl font-bold text-emerald-900">{stats.exportsCount}</div>
              <div className="text-sm text-emerald-700 mt-1">Generierte Exporte</div>
              <div className="text-xs text-emerald-600 mt-1">Live CSV-Daten</div>
            </Card>
            <Card className="text-center bg-amber-50 border-l-4 border-l-amber-500">
              <div className="text-3xl font-bold text-amber-900">{stats.quellenCount}</div>
              <div className="text-sm text-amber-700 mt-1">Quelldateien</div>
              <div className="text-xs text-amber-600 mt-1">Original-Kivitendo-Daten</div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📄</span>
                Stiftungsgesuche
              </h3>
              <p className="text-sm text-text-light mb-4">
                <strong>{stats.gesucheCount} personalisierte Gesuche</strong> für recherchierte Stiftungen.
                Jedes folgt dem WHY/HOW/WHAT-Aufbau nach Robert Schmuki.
              </p>
              <button
                onClick={() => setActiveTab('gesuche')}
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Gesuche ansehen →
              </button>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📊</span>
                Daten-Exporte
              </h3>
              <p className="text-sm text-text-light mb-4">
                <strong>{stats.exportsCount + stats.quellenCount} CSV/Excel-Dateien</strong> mit Finanzdaten,
                Stiftungsliste und Original-Quellen aus Kivitendo.
              </p>
              <button
                onClick={() => setActiveTab('daten')}
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Daten herunterladen →
              </button>
            </Card>
          </div>

          {/* How to Use */}
          <Card className="bg-blue-50 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">So verwenden Sie diese Dokumente</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    <strong>Gesuche & Vorlagen (PDF):</strong> Klicken Sie auf das Dokument, dann{' '}
                    <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Cmd+P</kbd> (Mac) oder{' '}
                    <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Ctrl+P</kbd> (Windows) → &bdquo;Als PDF speichern&ldquo;
                  </p>
                  <p>
                    <strong>CSV/Excel-Dateien:</strong> Direkter Download beim Klick. Öffnen Sie die Dateien in Excel, Google Sheets oder einem Texteditor.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

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
