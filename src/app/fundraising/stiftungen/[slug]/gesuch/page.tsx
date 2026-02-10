import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { THEMES } from '@/lib/config/foundations';
import { getFoundationBySlug, generateFoundationParams } from '@/lib/domain/foundation-helpers';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import Card from '@/components/ui/Card';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateFoundationParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Gesuch — Revamp-IT × ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name}`,
  };
}

export default async function GesuchPage({ params }: Props) {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const gesuch = composeGesuch(foundation);

  // Not-ready fallback
  if (!gesuch.ready) {
    return (
      <div className="gesuch-page mx-auto max-w-4xl px-4 py-12">
        <Card className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-grey-dark">
            Gesuch für {gesuch.foundation.name}
          </h1>
          <p className="mb-6 text-text-light">{gesuch.readyReason}</p>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            Zurück zur Stiftungsseite
          </Link>
        </Card>
      </div>
    );
  }

  const primaryThemeId = foundation.themes[0];
  const primaryColor = primaryThemeId ? THEMES[primaryThemeId]?.color ?? '#3498DB' : '#3498DB';

  return (
    <div className="gesuch-page">
      <GesuchHeroSection
        subtitle="Partnerschaftsvorschlag"
        foundationName={gesuch.foundation.name}
        description={gesuch.foundation.purposeSummary ?? ''}
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
          foundationName={gesuch.foundation.name}
          organization={gesuch.organization}
        />

        {/* Navigation links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="rounded-lg bg-grey-dark px-5 py-3 text-sm font-semibold text-white hover:bg-grey-dark/90"
          >
            Formelles Gesuch-Dokument (PDF)
          </Link>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="py-3 text-sm text-primary hover:underline"
          >
            &larr; Zurück zur Stiftungsseite
          </Link>
        </div>
      </div>
    </div>
  );
}
