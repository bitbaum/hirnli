import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Dokumente & Berichte',
  description: 'Alle Unterlagen fuer Funder, Team und Partner',
};

// -- Document category config --------------------------------------------------

interface DocumentEntry {
  title: string;
  description: string;
  href?: string;
  status: 'ready' | 'wip' | 'planned';
  formats: string[];
  audiences: ('Funder' | 'Intern' | 'Oeffentlich')[];
}

interface DocumentCategory {
  title: string;
  documents: DocumentEntry[];
}

const STATUS_MAP = {
  ready: { label: 'Verfuegbar', variant: 'success' as const },
  wip: { label: 'In Entwicklung', variant: 'warning' as const },
  planned: { label: 'Geplant', variant: 'default' as const },
};

const AUDIENCE_MAP = {
  Funder: 'success' as const,
  Intern: 'primary' as const,
  Oeffentlich: 'warning' as const,
};

const QUICK_LINKS = [
  { href: '/fundraising', label: 'Fundraising Hub', description: 'Vision, Budget, Pakete' },
  { href: '/fundraising/stiftungen', label: 'Stiftungen-Liste', description: '45+ Foerderer mit Deadlines' },
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'Impact-Zahlen mit Quellen' },
  { href: '/strategie', label: 'Mission & Vision', description: 'Seit 2003, SDG-Alignment' },
];

const NEXTCLOUD_FILES = [
  { name: 'Pitch Deck 2026', path: 'B_Finanzen/Fundraising/', format: 'PDF, PPTX' },
  { name: 'Gesuch-Vorlage', path: 'B_Finanzen/Fundraising/', format: 'Markdown' },
  { name: 'Einnahmen-Daten', path: 'B_Finanzen/', format: 'Excel' },
  { name: 'Wirkungsbericht PDF', path: 'B_Finanzen/', format: 'PDF' },
];

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    title: 'Fuer Funder & Stiftungen',
    documents: [
      {
        title: 'Wirkungsbericht',
        description: 'Vollstaendiger Impact-Report mit CO2-Ersparnis, Geraeten gerettet und sozialer Wirkung',
        href: '/wirkung',
        status: 'ready',
        formats: ['HTML', 'PDF (Print)'],
        audiences: ['Funder', 'Oeffentlich'],
      },
      {
        title: 'Fundraising-Pitch',
        description: 'Foerdermoeglichkeiten, Verwendungszwecke und konkrete Bedarfe',
        href: '/fundraising',
        status: 'ready',
        formats: ['HTML', 'PDF (Print)'],
        audiences: ['Funder'],
      },
      {
        title: 'One-Pager',
        description: 'Kompakte Zusammenfassung auf einer Seite - ideal fuer Erstkontakte',
        status: 'wip',
        formats: ['PDF'],
        audiences: ['Funder'],
      },
    ],
  },
  {
    title: 'Finanzberichte',
    documents: [
      {
        title: 'Einnahmen-Dashboard',
        description: 'Monatliche Einnahmen nach Kategorie mit Quellennachweis',
        href: '/',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Funder'],
      },
      {
        title: 'Finanzuebersicht',
        description: 'Detaillierte Finanzanalyse mit Trends und Vergleichen',
        href: '/finanzen',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Jahresabschluss',
        description: 'Vollstaendiger Jahresfinanzbericht fuer Steuern und GV',
        status: 'planned',
        formats: ['PDF'],
        audiences: ['Intern'],
      },
    ],
  },
  {
    title: 'Operations & Prozesse',
    documents: [
      {
        title: 'Refurbishment SOP',
        description: 'Standard Operating Procedures fuer den Refurbishment-Prozess',
        href: '/operations',
        status: 'ready',
        formats: ['HTML', 'Markdown'],
        audiences: ['Intern'],
      },
      {
        title: 'KPI-Dashboard',
        description: '28 KPIs ueber 6 Dimensionen mit Zielen und Status',
        href: '/kennzahlen',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Preismodell',
        description: 'Solidarisches 4-Stufen-Preismodell mit Beispielen',
        href: '/preismodell',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Oeffentlich'],
      },
    ],
  },
  {
    title: 'Strategie & Team',
    documents: [
      {
        title: 'Mission & Vision',
        description: 'Mission Statement, Vision 2030, Werte und SDG-Alignment',
        href: '/strategie',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Oeffentlich', 'Funder'],
      },
      {
        title: 'Team-Uebersicht',
        description: 'Organisationsstruktur, Team-Mitglieder und Kapazitaeten',
        href: '/team',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Pitch Deck',
        description: 'Praesentationsfolien fuer Vorstellungen und Pitches',
        status: 'planned',
        formats: ['PPTX', 'PDF'],
        audiences: ['Funder'],
      },
    ],
  },
  {
    title: 'Methodik & Dokumentation',
    documents: [
      {
        title: 'Methodikdokumentation',
        description: 'Berechnungsgrundlagen fuer alle Metriken und Schaetzungen',
        href: '/methodik',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Funder'],
      },
      {
        title: 'Datenarchitektur',
        description: 'Dokumentation des Datenflusses und der Systemarchitektur',
        status: 'wip',
        formats: ['Markdown'],
        audiences: ['Intern'],
      },
      {
        title: 'API-Dokumentation',
        description: 'Technische Dokumentation fuer Daten-Exports und Integrationen',
        status: 'planned',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
    ],
  },
];

const SOURCE_DOCUMENTS = [
  { name: 'Mission & Vision', path: 'A_Strategie/Mission_Vision_Statement.md', usedIn: 'Strategie-Seite' },
  { name: 'Finanzstrategie', path: 'B_Finanzen/Finanzstrategie_2025.md', usedIn: 'Finanzen, Preismodell' },
  { name: 'HR-Uebersicht', path: 'E_Personal/HR_Uebersicht.md', usedIn: 'Team-Seite' },
  { name: 'Refurbishment SOP', path: 'G_Operations/Refurbishment/Standard_Operating_Procedure.md', usedIn: 'Operations-Seite' },
  { name: 'Preismodell', path: 'B_Finanzen/Preismodell_Solidaritaet.md', usedIn: 'Preismodell-Seite' },
];

const ROADMAP = [
  { phase: 'Phase 1 (Aktuell)', description: 'Statische HTML-Seiten, druckbar als PDF' },
  { phase: 'Phase 2', description: 'One-Click PDF-Export mit korrektem Layout' },
  { phase: 'Phase 3', description: 'Automatische Befuellung von Templates (One-Pager, Pitch Deck)' },
  { phase: 'Phase 4', description: 'Zeitraum-Filter (Q1, Q2, Jahresbericht)' },
  { phase: 'Phase 5', description: 'Multi-Format Export (DOCX, PPTX, Markdown)' },
];

// -- Page Component ------------------------------------------------------------

export default function DokumentePage() {
  return (
    <>
      <PageHeader
        title="Dokumente & Berichte"
        subtitle="Alle Unterlagen fuer Funder, Team und Partner - online und zum Download"
      />

      {/* Quick Access for Fundraising */}
      <Card className="mb-6 border-emerald-500 bg-emerald-50">
        <h2 className="mb-4 text-lg font-semibold text-emerald-800">
          Fuer Fundraising & Gesuche
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="block font-semibold text-emerald-700">{link.label}</span>
              <span className="text-sm text-text-muted">{link.description}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Nextcloud Downloads */}
      <Card className="mb-6 border-orange-300 bg-orange-50">
        <h2 className="mb-3 text-lg font-semibold text-orange-800">
          Download-Dateien (Nextcloud)
        </h2>
        <p className="mb-4 text-sm text-orange-900">
          Pitch Deck, Gesuch-Vorlagen, Excel-Dateien und PDFs sind im{' '}
          <strong>Nextcloud</strong> verfuegbar:
        </p>
        <div className="mb-4 overflow-x-auto rounded-lg bg-white p-4">
          <table className="w-full text-sm">
            <tbody>
              {NEXTCLOUD_FILES.map((file) => (
                <tr key={file.name} className="border-b border-orange-200 last:border-0">
                  <td className="py-2 font-semibold">{file.name}</td>
                  <td className="py-2 text-text-muted">
                    <code className="text-xs">{file.path}</code>
                  </td>
                  <td className="py-2 text-orange-800">{file.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a
          href="https://cloud.revamp-it.ch"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          Nextcloud oeffnen
        </a>
        <span className="ml-2 text-xs text-orange-800">Pfad: 01_Management/</span>
      </Card>

      {/* Print as PDF hint */}
      <Card className="mb-8 bg-sky-50">
        <h2 className="mb-3 text-lg font-semibold text-sky-800">
          Seiten als PDF speichern
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          Alle Online-Berichte koennen direkt als PDF gedruckt werden (Strg/Cmd + P):
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/wirkung', label: 'Wirkungsbericht' },
            { href: '/fundraising', label: 'Fundraising-Pitch' },
            { href: '/finanzen', label: 'Finanzuebersicht' },
            { href: '/strategie', label: 'Strategie' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Card>

      {/* Document Categories */}
      <div className="space-y-8">
        {DOCUMENT_CATEGORIES.map((category) => (
          <section key={category.title}>
            <h2 className="mb-4 text-xl font-semibold text-grey-dark">{category.title}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.documents.map((doc) => {
                const statusInfo = STATUS_MAP[doc.status];
                const isAvailable = doc.status === 'ready' && doc.href;

                const cardContent = (
                  <Card
                    className={`transition-shadow ${
                      isAvailable ? 'hover:shadow-md' : 'opacity-70'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold text-grey-dark">{doc.title}</h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="mb-3 text-sm text-text-muted">{doc.description}</p>
                    <div className="mb-3 flex flex-wrap gap-1">
                      {doc.audiences.map((audience) => (
                        <Badge key={audience} variant={AUDIENCE_MAP[audience]} className="text-[0.65rem]">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.formats.map((format) => (
                        <span
                          key={format}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </Card>
                );

                if (isAvailable) {
                  return (
                    <Link key={doc.title} href={doc.href!} className="block">
                      {cardContent}
                    </Link>
                  );
                }

                return <div key={doc.title}>{cardContent}</div>;
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Source Documents */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Quelldokumente (Markdown)</h2>
        <Card>
          <p className="mb-4 text-sm text-text-muted">
            Alle Dashboard-Inhalte basieren auf strukturierten Markdown-Dokumenten im{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">Revamp-Hirn</code> Repository.
            Diese koennen direkt bearbeitet werden.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-semibold">Dokument</th>
                  <th className="py-2 text-left font-semibold">Pfad</th>
                  <th className="py-2 text-left font-semibold">Verwendet in</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_DOCUMENTS.map((doc) => (
                  <tr key={doc.name} className="border-b border-border last:border-0">
                    <td className="py-2">{doc.name}</td>
                    <td className="py-2">
                      <code className="rounded bg-gray-100 px-1 text-xs">{doc.path}</code>
                    </td>
                    <td className="py-2 text-text-muted">{doc.usedIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Roadmap */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Geplante Features</h2>
        <Card>
          <CardHeader>
            <CardTitle>Dokumenten-Generator Roadmap</CardTitle>
          </CardHeader>
          <ul className="space-y-3 pl-5">
            {ROADMAP.map((item) => (
              <li key={item.phase} className="text-sm text-text-muted">
                <strong className="text-grey-dark">{item.phase}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
