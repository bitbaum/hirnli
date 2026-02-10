import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { QUICK_LINKS, NEXTCLOUD_FILES } from './data';

export const metadata: Metadata = {
  title: 'Dokumente & Downloads',
  description: 'Online-Seiten und Downloads für Funder, Team und Partner',
};

export default function DokumentePage() {
  return (
    <>
      <PageHeader
        title="Dokumente & Downloads"
        subtitle="Alles an einem Ort — online lesen oder herunterladen"
      />

      {/* Quick Access */}
      <Card className="mb-6 border-emerald-500 bg-emerald-50">
        <h2 className="mb-4 text-lg font-semibold text-emerald-800">
          Wichtigste Seiten
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

      {/* Print as PDF hint */}
      <Card className="mb-6 bg-sky-50">
        <h2 className="mb-3 text-lg font-semibold text-sky-800">
          Seiten als PDF speichern
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          Alle Online-Berichte können direkt als PDF gedruckt werden (Strg/Cmd + P):
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/wirkung', label: 'Wirkungsbericht' },
            { href: '/fundraising', label: 'Fundraising-Pitch' },
            { href: '/finanzen', label: 'Finanzübersicht' },
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

      {/* Nextcloud Downloads */}
      <Card className="border-orange-300 bg-orange-50">
        <h2 className="mb-3 text-lg font-semibold text-orange-800">
          Downloads (Nextcloud)
        </h2>
        <p className="mb-4 text-sm text-orange-900">
          Pitch Deck, Gesuch-Vorlagen, Excel-Dateien und PDFs:
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
          Nextcloud öffnen
        </a>
        <span className="ml-2 text-xs text-orange-800">Pfad: 01_Management/</span>
      </Card>
    </>
  );
}
