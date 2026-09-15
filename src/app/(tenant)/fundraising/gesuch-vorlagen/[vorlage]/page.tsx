import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import { DEFAULT_THEME_COLOR } from '@/lib/config/chart-colors';
import { THEMES, resolveTypeLabel } from '@/lib/config/foundations';
import {
  TEMPLATE_TYPES,
  resolveTemplateLabels,
  resolveTemplateFoundation,
} from '@/lib/config/gesuch-templates';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { loadTenantStory } from '@/lib/content/story-engine';
import StoryMissing from '@/components/gesuch/StoryMissing';
import GesuchNotReady from '@/components/gesuch/GesuchNotReady';
import VorlagePresentation from '@/components/gesuch/VorlagePresentation';

interface Props {
  params: Promise<{ vorlage: string }>;
}

export async function generateStaticParams() {
  return TEMPLATE_TYPES.map((type) => ({ vorlage: type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant();
  const { vorlage: type } = await params;
  const typeLabel = resolveTypeLabel(type);
  if (typeLabel) {
    return {
      title: `Gesuch-Vorlage Typ ${typeLabel.short} — ${typeLabel.long}`,
      description: `Gesuch-Vorlage für ${typeLabel.long} (Robert Schmuki Typ ${typeLabel.short})`,
    };
  }
  const tplLabel = resolveTemplateLabels(tenant)[type];
  if (tplLabel) {
    return {
      title: `Gesuch-Vorlage: ${tplLabel.long} — ${tenant.name}`,
      description: tplLabel.desc,
    };
  }
  return { title: 'Vorlage nicht gefunden' };
}

export default async function GesuchVorlagePage({ params }: Props) {
  const tenant = await getTenant();
  const { vorlage: type } = await params;
  const foundation = resolveTemplateFoundation(type, tenant);

  if (!foundation) {
    notFound();
  }

  const story = await loadTenantStory(tenant);
  if (!story) {
    return <StoryMissing tenant={tenant} />;
  }

  const gesuch = composeGesuch(story, foundation);

  // `ready` is false when the applicant has not written the theme this
  // template argues from, or the funder is too thinly researched. Rendering
  // anyway produced a formal document with a blank argument.
  if (!gesuch.ready) {
    return (
      <GesuchNotReady
        gesuch={gesuch}
        tenant={tenant}
        backHref={'/fundraising/gesuch-vorlagen'}
        backLabel="Zu den Vorlagen"
      />
    );
  }
  const typeLabel = resolveTypeLabel(type);
  const tplLabel = resolveTemplateLabels(tenant)[type];
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
    <VorlagePresentation
      tenant={tenant}
      gesuch={gesuch}
      primaryColor={primaryColor}
      bannerTitle={bannerTitle}
      bannerNote={
        <>
          Dies ist eine generische Vorlage. Felder wie{' '}
          <span className="font-mono">[Name der Stiftung]</span> müssen vor dem Versand durch die
          tatsächlichen Angaben ersetzt werden.
        </>
      }
      heroSubtitle={heroSubtitle}
      heroDescription={heroText}
      dokumentHref={`/fundraising/gesuch-vorlagen/${type}/dokument`}
    />
  );
}
