import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { GESUCH_SECTIONS, ONLINE_REPORTS, NEXTCLOUD_FILES } from './data';

export const metadata: Metadata = {
  title: 'Dokumente',
  description: 'Gesuche, Berichte und Downloads — alles an einem Ort',
};

export default function DokumentePage() {
  return (
    <>
      <PageHeader
        title="Dokumente"
        subtitle="Gesuche, Berichte und Downloads — alles an einem Ort"
      />

      {/* 1. Gesuche & Vorlagen — the crown jewels */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Gesuche & Vorlagen</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GESUCH_SECTIONS.map((section) => (
            <Card key={section.title}>
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold">{section.title}</h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {section.stats}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-muted">{section.description}</p>
              <Link
                href={section.href}
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                {section.linkLabel}
              </Link>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Jedes Gesuch folgt dem WHY / HOW / WHAT / Budget-Aufbau nach Robert Schmuki.
          Stiftungs-Gesuche sind personalisiert nach Themen und Stiftungstyp.
        </p>
      </section>

      {/* 2. Online-Berichte */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Online-Berichte</h2>
        <p className="mb-4 text-sm text-text-muted">
          Alle Berichte sind Webseiten mit Live-Daten. Als PDF speichern: Strg/Cmd + P.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ONLINE_REPORTS.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <span className="block font-semibold text-primary">{report.label}</span>
              <span className="text-xs text-text-muted">{report.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Downloads */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Downloads</h2>
        <Card>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="pb-2">Dokument</th>
                  <th className="pb-2">Pfad</th>
                  <th className="pb-2">Format</th>
                </tr>
              </thead>
              <tbody>
                {NEXTCLOUD_FILES.map((file) => (
                  <tr key={file.name} className="border-b border-border last:border-0">
                    <td className="py-2 font-semibold">{file.name}</td>
                    <td className="py-2 text-text-muted">
                      <code className="text-xs">{file.path}</code>
                    </td>
                    <td className="py-2">{file.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="https://cloud.revamp-it.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Nextcloud öffnen
          </a>
        </Card>
      </section>
    </>
  );
}
