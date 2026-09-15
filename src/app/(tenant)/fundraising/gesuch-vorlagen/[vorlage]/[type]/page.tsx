import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { getSchwerpunktTemplate, getSchwerpunktStaticParams } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, isSchwerpunktId } from '@/lib/config/schwerpunkte';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { loadTenantStory } from '@/lib/content/story-engine';
import StoryMissing from '@/components/gesuch/StoryMissing';
import GesuchNotReady from '@/components/gesuch/GesuchNotReady';
import VorlagePresentation from '@/components/gesuch/VorlagePresentation';

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
  const story = await loadTenantStory(tenant);
  if (!story) {
    return <StoryMissing tenant={tenant} />;
  }

  const gesuch = composeGesuch(story, foundation, schwerpunkt);

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
  const primaryColor = sp.color;

  const bannerTitle = `VORLAGE \u2014 ${sp.shortLabel} \u00D7 Typ ${typeLabel.short}: ${typeLabel.long}`;

  return (
    <VorlagePresentation
      tenant={tenant}
      gesuch={gesuch}
      primaryColor={primaryColor}
      bannerTitle={bannerTitle}
      bannerNote={
        <>
          Schwerpunkt: <strong>{sp.label}</strong> | Felder wie{' '}
          <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">
            [Name der Stiftung]
          </span>{' '}
          vor dem Versand ersetzen.
        </>
      }
      heroSubtitle={`Partnerschaftsvorschlag \u2014 ${sp.shortLabel} (Typ ${typeLabel.short})`}
      heroDescription={typeLabel.approach}
      dokumentHref={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}/dokument`}
    />
  );
}
