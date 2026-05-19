import { useState } from 'react';
import Link from 'next/link';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import GesuchStatusWidget from '@/components/gesuch/GesuchStatusWidget';
import GesuchSubmitSection from '@/components/gesuch/GesuchSubmitSection';
import type { SubmissionInfo } from '@/components/gesuch/GesuchSubmitSection';
import ActivityTimeline from '@/components/ui/ActivityTimeline';
import SubmissionChecklist from '@/components/gesuch/SubmissionChecklist';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    const schwerpunktQuery = activeSchwerpunkt ? `?s=${activeSchwerpunkt}` : '';
    const url = `${window.location.origin}/gesuch/share/${shareToken}${schwerpunktQuery}`;
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
          <h3 className="heading-item">Dokument erstellen</h3>

          {/* Full PDF */}
          <Card variant="muted" padding={false} className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="heading-detail">Vollständiges Gesuch (PDF)</p>
                <p className="mt-0.5 text-sm text-text-muted">4 Seiten — Anschreiben, Projektbeschrieb, Budget, Kurzportrait</p>
              </div>
              <span className="text-xl">📄</span>
            </div>
            <Button
              href={`/api/pdf/gesuch/${slug}${schwerpunktParam}`}
              target="_blank"
              variant="primary"
              fullWidth
              className="mt-3"
            >
              PDF öffnen
            </Button>
          </Card>

          {/* One-pager PDF */}
          <Card variant="muted" padding={false} className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="heading-detail">Kurzübersicht (1 Seite)</p>
                <p className="mt-0.5 text-sm text-text-muted">Concept Note — häufig als Ersteinreichung gefordert</p>
              </div>
              <span className="text-xl">📋</span>
            </div>
            <Button
              href={`/api/pdf/gesuch/${slug}/onepager${schwerpunktParam}`}
              target="_blank"
              variant="secondary"
              fullWidth
              className="mt-3"
            >
              PDF öffnen
            </Button>
          </Card>

          {/* Shareable link */}
          <Card variant="muted" padding={false} className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="heading-detail">Öffentlicher Link</p>
                <p className="mt-0.5 text-sm text-text-muted">Lesbare Landing Page — direkt an Stiftungs-Programme schicken</p>
              </div>
              <span className="text-xl">🔗</span>
            </div>
            {shareToken ? (
              <Button
                onClick={copyShareLink}
                variant="secondary"
                fullWidth
                className="mt-3"
              >
                {copied ? '✓ Link kopiert!' : 'Link kopieren'}
              </Button>
            ) : (
              <p className="mt-3 text-sm text-text-muted">
                Setze <code className="rounded bg-bg px-1 py-0.5 font-mono">SHARE_SECRET</code> in den Umgebungsvariablen, um Links zu aktivieren.
              </p>
            )}
          </Card>

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
          {/* Pre-submit checklist */}
          <SubmissionChecklist />

          {/* Pipeline widget */}
          <div>
            <h3 className="mb-3 heading-item">Pipeline-Status</h3>
            <GesuchStatusWidget slug={slug} responseTime={responseTime} shareToken={shareToken} />
          </div>

          {/* Submit info */}
          <div>
            <h3 className="mb-3 heading-item">Einreichung</h3>
            <GesuchSubmitSection info={{ ...submissionInfo, emailBody }} />
          </div>

          {/* Activity timeline */}
          <div>
            <h3 className="mb-3 heading-item">Verlauf</h3>
            <ActivityTimeline entityId={slug} entityType="gesuch_override" limit={5} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 border-t border-border-default pt-6 print:hidden">
        <Button
          onClick={onPrev}
          variant="ghost"
          size="sm"
        >
          ← Entwurf bearbeiten
        </Button>
        <Button
          href={`/fundraising/stiftungen/${slug}`}
          variant="ghost"
          size="sm"
          className="ml-auto text-primary"
        >
          ← Zurück zur Stiftungsseite
        </Button>
      </div>
    </div>
  );
}
