import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { DEFAULT_THEME_COLOR } from '@/lib/config/chart-colors';
import { THEMES, resolveTypeLabel } from '@/lib/config/foundations';
import { TEMPLATE_TYPES, TEMPLATE_LABELS, getTemplateFoundation } from '@/lib/config/gesuch-templates';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';

interface Props {
  params: Promise<{ vorlage: string }>;
}

export async function generateStaticParams() {
  return TEMPLATE_TYPES.map((type) => ({ vorlage: type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vorlage: type } = await params;
  const typeLabel = resolveTypeLabel(type);
  if (typeLabel) {
    return {
      title: `Gesuch-Vorlage Typ ${typeLabel.short} — ${typeLabel.long}`,
      description: `Gesuch-Vorlage für ${typeLabel.long} (Robert Schmuki Typ ${typeLabel.short})`,
    };
  }
  const tplLabel = TEMPLATE_LABELS[type];
  if (tplLabel) {
    return {
      title: `Gesuch-Vorlage: ${tplLabel.long} — ${ORG_PROFILE.name}`,
      description: tplLabel.desc,
    };
  }
  return { title: 'Vorlage nicht gefunden' };
}

export default async function GesuchVorlagePage({ params }: Props) {
  const { vorlage: type } = await params;
  const foundation = getTemplateFoundation(type);

  if (!foundation) {
    notFound();
  }

  const gesuch = composeGesuch(foundation);
  const typeLabel = resolveTypeLabel(type);
  const tplLabel = TEMPLATE_LABELS[type];
  const primaryThemeId = foundation.themes[0];
  const primaryColor = primaryThemeId ? THEMES[primaryThemeId].color : DEFAULT_THEME_COLOR;

  const bannerTitle = typeLabel
    ? `VORLAGE — Typ ${typeLabel.short}: ${typeLabel.long}`
    : `VORLAGE — ${tplLabel?.long ?? type}`;
  const heroSubtitle = typeLabel
    ? `Partnerschaftsvorschlag — Vorlage Typ ${typeLabel.short}`
    : `Partnerschaftsvorschlag — ${tplLabel?.long ?? type}`;
  const heroText = typeLabel?.approach ?? tplLabel?.desc ?? '';

  return (
    <div className="gesuch-page">
      {/* VORLAGE banner */}
      <div className="mb-4 rounded-lg border-2 border-warning bg-warning-bg p-4 text-center print:hidden">
        <p className="text-sm font-semibold text-warning">
          {bannerTitle}
        </p>
        <p className="mt-1 text-sm text-text-light">
          Dies ist eine generische Vorlage. Felder wie <span className="font-mono">[Name der Stiftung]</span> müssen
          vor dem Versand durch die tatsächlichen Angaben ersetzt werden.
        </p>
      </div>

      <GesuchHeroSection
        subtitle={heroSubtitle}
        foundationName={gesuch.foundation.name}
        description={heroText}
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
          <Button href={`/fundraising/gesuch-vorlagen/${type}/dokument`} size="lg">
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
