import { useState } from 'react';
import Link from 'next/link';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import GesuchStatusWidget from '@/components/gesuch/GesuchStatusWidget';
import GesuchSubmitSection from '@/components/gesuch/GesuchSubmitSection';
import type { SubmissionInfo } from '@/components/gesuch/GesuchSubmitSection';

interface StepSubmitProps {
  slug: string;
  activeSchwerpunkt: SchwerpunktId | null;
  submissionInfo: SubmissionInfo;
  emailBody: string;
  responseTime?: string;
  shareToken?: string;
  onPrev: () => void;
}

export default function StepSubmit({
  slug,
  activeSchwerpunkt,
  submissionInfo,
  emailBody,
  responseTime,
  shareToken,
  onPrev,
}: StepSubmitProps) {
  const [copied, setCopied] = useState(false);

  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/gesuch/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const schwerpunktParam = activeSchwerpunkt ? `?schwerpunkt=${activeSchwerpunkt}` : '';

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Output formats */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-grey-dark">Dokument erstellen</h3>

          {/* Full PDF */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Vollständiges Gesuch (PDF)</p>
                <p className="mt-0.5 text-xs text-text-muted">4 Seiten — Anschreiben, Projektbeschrieb, Budget, Kurzportrait</p>
              </div>
              <span className="text-xl">📄</span>
            </div>
            <a
              href={`/api/pdf/gesuch/${slug}${schwerpunktParam}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-grey-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-grey-dark/90 transition-colors"
            >
              PDF öffnen
            </a>
          </div>

          {/* One-pager PDF */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Kurzübersicht (1 Seite)</p>
                <p className="mt-0.5 text-xs text-text-muted">Concept Note — häufig als Ersteinreichung gefordert</p>
              </div>
              <span className="text-xl">📋</span>
            </div>
            <a
              href={`/api/pdf/gesuch/${slug}/onepager${schwerpunktParam}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:border-primary/40 hover:text-primary transition-colors"
            >
              PDF öffnen
            </a>
          </div>

          {/* Shareable link */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Öffentlicher Link</p>
                <p className="mt-0.5 text-xs text-text-muted">Lesbare Landing Page — direkt an Stiftungs-Programme schicken</p>
              </div>
              <span className="text-xl">🔗</span>
            </div>
            {shareToken ? (
              <button
                type="button"
                onClick={copyShareLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:border-primary/40 hover:text-primary transition-colors"
              >
                {copied ? '✓ Link kopiert!' : 'Link kopieren'}
              </button>
            ) : (
              <p className="mt-3 text-xs text-text-muted">
                Setze <code className="rounded bg-bg px-1 py-0.5 font-mono">SHARE_SECRET</code> in den Umgebungsvariablen, um Links zu aktivieren.
              </p>
            )}
          </div>

          {/* Secondary: HTML preview */}
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="block text-center text-sm text-text-muted hover:text-primary hover:underline"
          >
            HTML-Vorschau öffnen →
          </Link>
        </div>

        {/* Right: Pipeline + Submission */}
        <div className="space-y-6">
          {/* Pipeline widget */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-grey-dark">Pipeline-Status</h3>
            <GesuchStatusWidget slug={slug} responseTime={responseTime} />
          </div>

          {/* Submit info */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-grey-dark">Einreichung</h3>
            <GesuchSubmitSection info={{ ...submissionInfo, emailBody }} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-text-muted hover:text-primary"
        >
          ← Entwurf bearbeiten
        </button>
        <Link
          href={`/fundraising/stiftungen/${slug}`}
          className="ml-auto text-sm text-primary hover:underline"
        >
          ← Zurück zur Stiftungsseite
        </Link>
      </div>
    </div>
  );
}
