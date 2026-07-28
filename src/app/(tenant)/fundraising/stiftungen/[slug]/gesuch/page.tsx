import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import { getFoundationBySlug } from '@/lib/db/foundations-repo';
import { composeGesuch, composeAnschreibenText } from '@/lib/domain/gesuch-composer';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import { computeShareToken } from '@/lib/utils/share-token';
import { DEFAULT_THEME_COLOR } from '@/lib/config/chart-colors';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import GesuchPageClient from './GesuchPageClient';

// Must be dynamic: the root layout reads the locale cookie (next-intl), so no
// route can be statically prerendered — an SSG attempt here 500s at request
// time with DYNAMIC_SERVER_USAGE. Per-request cost is one cached DB read.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = await getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Gesuch — ${ORG_PROFILE.name} × ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name}`,
  };
}

/** Get primary color from a composed gesuch's first theme */
function getPrimaryColor(gesuch: ComposedGesuch): string {
  return gesuch.themes.all[0]?.color ?? DEFAULT_THEME_COLOR;
}

export default async function GesuchPage({ params }: Props) {
  const { slug } = await params;
  const foundation = await getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const autoGesuch = composeGesuch(foundation);

  // Not-ready fallback
  if (!autoGesuch.ready) {
    return (
      <div className="gesuch-page mx-auto max-w-4xl px-4 py-12">
        <Card className="text-center">
          <h1 className="mb-4 heading-section">
            Gesuch für {autoGesuch.foundation.name}
          </h1>
          <p className="mb-6 text-text-secondary">{autoGesuch.readyReason}</p>
          <Button href={`/fundraising/stiftungen/${slug}`} size="lg">
            Zurück zur Stiftungsseite
          </Button>
        </Card>
      </div>
    );
  }

  // Pre-compute all Schwerpunkt variants (pure functions, no I/O)
  const variants: Record<string, ComposedGesuch> = { auto: autoGesuch };
  const primaryColors: Record<string, string> = { auto: getPrimaryColor(autoGesuch) };

  for (const spId of SCHWERPUNKT_IDS) {
    const variant = composeGesuch(foundation, spId);
    if (variant.ready) {
      variants[spId] = variant;
      primaryColors[spId] = SCHWERPUNKTE[spId].color;
    }
  }

  const submissionInfo = {
    foundationName: foundation.name,
    email: foundation.contact?.email,
    applicationUrl: foundation.applicationUrl,
    applicationMethod: foundation.applicationMethod,
    deadline: foundation.deadline,
    deadlineText: foundation.deadlineText,
    websiteUrl: foundation.websiteUrl,
    responseTime: foundation.responseTime,
    contactAddress: foundation.contact?.address,
  };

  const shareToken = computeShareToken(slug) ?? undefined;
  const anschreibenText = composeAnschreibenText(foundation);

  return (
    <GesuchPageClient
      slug={slug}
      foundationThemes={foundation.themes}
      variants={variants}
      primaryColors={primaryColors}
      submissionInfo={submissionInfo}
      foundationData={foundation}
      shareToken={shareToken}
      generatedAnschreiben={anschreibenText}
    />
  );
}
