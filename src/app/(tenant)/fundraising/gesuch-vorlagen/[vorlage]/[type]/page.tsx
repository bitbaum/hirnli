import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getTenant } from '@/lib/tenant/resolve';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { getSchwerpunktTemplate, getSchwerpunktStaticParams } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, isSchwerpunktId } from '@/lib/config/schwerpunkte';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import {
  GesuchHeroSection,
  GesuchWhySection,
  GesuchHowSection,
  GesuchProjectsSection,
  GesuchEvidenceSection,
  GesuchContactSection,
} from '@/components/gesuch/sections';
import { VorlageBanner } from '@/components/gesuch/GesuchDocumentBanners';

interface Props {
  params: Promise<{ vorlage: string; type: string }>;
}

export async function generateStaticParams() {
  return getSchwerpunktStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant();
  const { vorlage: schwerpunkt, type } = await params;
  const sp = isSchwerpunktId(schwerpunkt) ? SCHWERPUNKTE[schwerpunkt] : undefined;
  const typeLabel = resolveTypeLabel(type);
  if (!sp || !typeLabel) return { title: 'Vorlage nicht gefunden' };

  return {
    title: `Gesuch-Vorlage: ${sp.shortLabel} \u00D7 Typ ${typeLabel.short} \u2014 ${tenant.name}`,
    description: `${sp.label} \u2014 Gesuch-Vorlage f\u00FCr ${typeLabel.long}`,
  };
}

export default async function SchwerpunktGesuchPage({ params }: Props) {
  const tenant = await getTenant();
  const { vorlage: schwerpunkt, type } = await params;
  if (!isSchwerpunktId(schwerpunkt)) notFound();
  const foundation = getSchwerpunktTemplate(schwerpunkt, type);
  if (!foundation) notFound();

  const sp = SCHWERPUNKTE[schwerpunkt];
  const typeLabel = resolveTypeLabel(type);
  if (!typeLabel) notFound();
  const gesuch = composeGesuch(tenant, foundation, schwerpunkt);
  const primaryColor = sp.color;

  const bannerTitle = `VORLAGE \u2014 ${sp.shortLabel} \u00D7 Typ ${typeLabel.short}: ${typeLabel.long}`;

  return (
    <div className="gesuch-page">
      {/* VORLAGE banner */}
      <VorlageBanner title={bannerTitle} className="mb-4 print:hidden">
        Schwerpunkt: <strong>{sp.label}</strong> | Felder wie{' '}
        <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">
          [Name der Stiftung]
        </span>{' '}
        vor dem Versand ersetzen.
      </VorlageBanner>

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

        <GesuchContactSection foundationName="Ihre Stiftung" organization={gesuch.organization} />

        {/* Navigation links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
          <Button href={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}/dokument`} size="lg">
            Formelles Gesuch-Dokument (PDF)
          </Button>
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
