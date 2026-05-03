import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { getSchwerpunktTemplate, getSchwerpunktStaticParams } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';

interface Props {
  params: Promise<{ vorlage: string; type: string }>;
}

export async function generateStaticParams() {
  return getSchwerpunktStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vorlage: schwerpunkt, type } = await params;
  const sp = SCHWERPUNKTE[schwerpunkt as SchwerpunktId];
  const typeLabel = resolveTypeLabel(type);
  if (!sp || !typeLabel) return { title: 'Vorlage nicht gefunden' };

  return {
    title: `Gesuch-Vorlage: ${sp.shortLabel} \u00D7 Typ ${typeLabel.short} \u2014 ${ORG_PROFILE.name}`,
    description: `${sp.label} \u2014 Gesuch-Vorlage f\u00FCr ${typeLabel.long}`,
  };
}

export default async function SchwerpunktGesuchPage({ params }: Props) {
  const { vorlage: schwerpunkt, type } = await params;
  const foundation = getSchwerpunktTemplate(schwerpunkt, type);

  if (!foundation) {
    notFound();
  }

  const sp = SCHWERPUNKTE[schwerpunkt as SchwerpunktId];
  const typeLabel = resolveTypeLabel(type);
  if (!typeLabel) notFound();
  const gesuch = composeGesuch(foundation, schwerpunkt as SchwerpunktId);
  const primaryColor = sp.color;

  const bannerTitle = `VORLAGE \u2014 ${sp.shortLabel} \u00D7 Typ ${typeLabel.short}: ${typeLabel.long}`;

  return (
    <div className="gesuch-page">
      {/* VORLAGE banner */}
      <div className="mb-4 rounded-lg border-2 border-warning bg-warning-bg p-4 text-center print:hidden">
        <p className="text-sm font-semibold text-warning">
          {bannerTitle}
        </p>
        <p className="mt-1 text-sm text-text-light">
          Schwerpunkt: <strong>{sp.label}</strong> |
          Felder wie <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">[Name der Stiftung]</span> vor dem Versand ersetzen.
        </p>
      </div>

      <GesuchHeroSection
        subtitle={`Partnerschaftsvorschlag \u2014 ${sp.shortLabel} (Typ ${typeLabel.short})`}
        foundationName={gesuch.foundation.name}
        description={typeLabel.approach}
        themes={gesuch.themes.all}
        primaryColor={primaryColor}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-0">
        {gesuch.story.why && <GesuchWhySection why={gesuch.story.why} />}

        <GesuchHowSection
          trackRecord={gesuch.story.how.track_record}
          competencies={gesuch.story.how.competencies}
        />

        <GesuchProjectsSection projects={gesuch.story.projects} />

        <GesuchEvidenceSection evidence={gesuch.story.evidence} />

        <GesuchContactSection
          foundationName="Ihre Stiftung"
          organization={gesuch.organization}
        />

        {/* Navigation links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
          <Link
            href={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}/dokument`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-grey-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-grey-dark/85"
          >
            Formelles Gesuch-Dokument (PDF)
          </Link>
          <Link
            href="/fundraising/gesuch-vorlagen"
            className="py-3 text-sm text-primary hover:underline"
          >
            &larr; Alle Vorlagen
          </Link>
        </div>
      </div>
    </div>
  );
}
