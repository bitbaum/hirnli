import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  STATUS_MAP,
  AUDIENCE_MAP,
  QUICK_LINKS,
  NEXTCLOUD_FILES,
  DOCUMENT_CATEGORIES,
  SOURCE_DOCUMENTS,
  ROADMAP,
} from './data';

export const metadata: Metadata = {
  title: 'Dokumente & Berichte',
  description: 'Alle Unterlagen fuer Funder, Team und Partner',
};

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
