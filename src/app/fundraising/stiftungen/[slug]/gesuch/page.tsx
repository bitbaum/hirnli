import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import { getFoundationBySlug, generateGesuchParams } from '@/lib/domain/foundation-helpers';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import GesuchPageClient from './GesuchPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateGesuchParams();  // Only priority 1-2 foundations
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Gesuch — ${ORG_PROFILE.name} × ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name}`,
  };
}

/** Get primary color from a composed gesuch's first theme */
function getPrimaryColor(gesuch: ComposedGesuch): string {
  return gesuch.themes.all[0]?.color ?? '#3498DB';
}

export default async function GesuchPage({ params }: Props) {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const autoGesuch = composeGesuch(foundation);

  // Not-ready fallback
  if (!autoGesuch.ready) {
    return (
      <div className="gesuch-page mx-auto max-w-4xl px-4 py-12">
        <Card className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-grey-dark">
            Gesuch für {autoGesuch.foundation.name}
          </h1>
          <p className="mb-6 text-text-light">{autoGesuch.readyReason}</p>
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

  return (
    <GesuchPageClient
      slug={slug}
      foundationThemes={foundation.themes}
      variants={variants}
      primaryColors={primaryColors}
    />
  );
}
