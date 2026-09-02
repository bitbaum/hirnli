'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import DocumentCard from '@/components/documents/DocumentCard';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Document } from '@/lib/config/documents';

interface DocumentsClientProps {
  documents: {
    berichte: Document[];
    gesuche: Document[];
    vorlagen: Document[];
    exports: Document[];
    quellen: Document[];
  };
  stats: {
    berichteCount: number;
    gesucheCount: number;
    vorlagenCount: number;
    exportsCount: number;
    quellenCount: number;
    totalCount: number;
  };
}

type TabId = 'berichte' | 'gesuche' | 'vorlagen' | 'daten';

function DocumentSection({
  title,
  subtitle,
  docs,
  query,
  type,
}: {
  title: string;
  subtitle: ReactNode;
  docs: Document[];
  query: string;
  type: string;
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="heading-section mb-2">
          {title} {query && `(${docs.length} Ergebnisse)`}
        </h2>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>
      {docs.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-4xl mb-4 block" aria-hidden="true">
            🔍
          </span>
          <p className="text-text-muted">
            Keine {type} gefunden für &bdquo;{query}&ldquo;
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsClient({ documents, stats }: DocumentsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('berichte');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'berichte', label: `Berichte (${stats.berichteCount})`, icon: '📋' },
    { id: 'gesuche', label: `Gesuche (${stats.gesucheCount})`, icon: '📄' },
    { id: 'vorlagen', label: `Vorlagen (${stats.vorlagenCount})`, icon: '📝' },
    { id: 'daten', label: `Daten (${stats.exportsCount + stats.quellenCount})`, icon: '📊' },
  ];

  const filterDocuments = (docs: Document[]) => {
    if (!searchQuery) return docs;
    const query = searchQuery.toLowerCase();
    return docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.badge?.toLowerCase().includes(query),
    );
  };

  const filteredBerichte = filterDocuments(documents.berichte);
  const filteredGesuche = filterDocuments(documents.gesuche);
  const filteredVorlagen = filterDocuments(documents.vorlagen);
  const filteredExports = filterDocuments(documents.exports);
  const filteredQuellen = filterDocuments(documents.quellen);

  return (
    <div className="space-y-8">
      <p className="text-sm text-text-muted">
        <strong>PDF-Gesuche</strong> öffnen im Browser. <strong>CSV/Excel</strong> werden direkt
        heruntergeladen.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-default">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            size="sm"
            className={`rounded-none ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary'
            }`}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          aria-label="Dokumente durchsuchen"
          placeholder="Dokumente durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {activeTab === 'berichte' && (
        <DocumentSection
          title="Wirkungsberichte"
          subtitle="Jährliche Impact-Reports aus Live-Daten generiert — Finanzen, Umweltwirkung, Sozialintegration, Stiftungspipeline."
          docs={filteredBerichte}
          query={searchQuery}
          type="Berichte"
        />
      )}

      {activeTab === 'gesuche' && (
        <DocumentSection
          title="Stiftungsgesuche"
          subtitle="Personalisierte Gesuche für analysierte Stiftungen. Klicken Sie auf ein Gesuch, dann Cmd/Ctrl+P um als PDF zu speichern."
          docs={filteredGesuche}
          query={searchQuery}
          type="Gesuche"
        />
      )}

      {activeTab === 'vorlagen' && (
        <DocumentSection
          title="Gesuch-Vorlagen"
          subtitle="Referenz-Vorlagen nach Stiftungstyp. Zeigen Struktur und Ton für jeden Foundation-Typ (A/B/C/D/Netzwerk/Generisch)."
          docs={filteredVorlagen}
          query={searchQuery}
          type="Vorlagen"
        />
      )}

      {activeTab === 'daten' && (
        <div className="space-y-12">
          <DocumentSection
            title="Generierte Exporte"
            subtitle="Live generierte CSV-Dateien aus aktuellen Daten. Diese werden bei jedem Download neu erstellt und sind immer aktuell."
            docs={filteredExports}
            query={searchQuery}
            type="Exporte"
          />
          <DocumentSection
            title="Quelldateien (Kivitendo)"
            subtitle={
              <>
                Original-Datenquellen aus Kivitendo (anonymisiert). Diese Dateien bilden die
                Grundlage für alle Finanzdaten auf dieser Seite.
                <strong className="text-primary ml-1">
                  Empfohlen: Lesen Sie zuerst das README!
                </strong>
              </>
            }
            docs={filteredQuellen}
            query={searchQuery}
            type="Quelldateien"
          />
        </div>
      )}
    </div>
  );
}
