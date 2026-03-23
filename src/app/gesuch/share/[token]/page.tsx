/**
 * Shareable Gesuch Landing Page
 *
 * Route: /gesuch/share/[token]
 *
 * Public but unforgeable — token is HMAC-SHA256(slug, SHARE_SECRET).
 * Designed to be sent directly to foundation program officers.
 *
 * What it shows:  clean read-only gesuch presentation
 * What it omits:  toolbar, edit controls, pipeline, internal badges
 *
 * robots.txt disallows this path to prevent search indexing.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { getFoundationBySlug, hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { SCHWERPUNKT_IDS, SCHWERPUNKTE } from '@/lib/config/schwerpunkte';
import { resolveShareToken } from '@/lib/utils/share-token';

import GesuchShareView from '@/components/gesuch/GesuchShareView';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ s?: string }>;
}

/** All gesuch-eligible foundation slugs — used for token resolution */
function gesuchSlugs(): string[] {
  return STIFTUNGEN_DATA.filter(hasGesuchPage).map((f) => f.slug);
}

export async function generateStaticParams() {
  // Only generate share pages for foundations that also have gesuch pages.
  // SHARE_SECRET may not be set at build time — handle gracefully.
  const secret = process.env.SHARE_SECRET;
  if (!secret) return [];

  const { computeShareToken } = await import('@/lib/utils/share-token');
  return gesuchSlugs()
    .map((slug) => ({ token: computeShareToken(slug) }))
    .filter((p): p is { token: string } => p.token !== null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const slug = resolveShareToken(token, gesuchSlugs());
  if (!slug) return { title: 'Nicht gefunden' };

  const foundation = getFoundationBySlug(slug);
  if (!foundation) return { title: 'Nicht gefunden' };

  return {
    title: `${ORG_PROFILE.name} × ${foundation.name}`,
    description: `Partnerschaftsvorschlag von ${ORG_PROFILE.name} für ${foundation.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GesuchSharePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { s: schwerpunktParam } = await searchParams;

  // Resolve token → slug (404 on invalid token)
  const slug = resolveShareToken(token, gesuchSlugs());
  if (!slug) notFound();

  const foundation = getFoundationBySlug(slug);
  if (!foundation || !hasGesuchPage(foundation)) notFound();

  // If a specific schwerpunkt is requested via ?s= param, try it first
  let gesuch = composeGesuch(foundation);
  let primaryColor = gesuch.themes.all[0]?.color ?? '#3498DB';

  if (schwerpunktParam && SCHWERPUNKT_IDS.includes(schwerpunktParam as typeof SCHWERPUNKT_IDS[number])) {
    const spId = schwerpunktParam as typeof SCHWERPUNKT_IDS[number];
    const variant = composeGesuch(foundation, spId);
    if (variant.ready) {
      gesuch = variant;
      primaryColor = SCHWERPUNKTE[spId].color;
    }
  }

  // If no specific schwerpunkt matched, fall back to auto-selection
  if (!gesuch.ready || !schwerpunktParam) {
    for (const spId of SCHWERPUNKT_IDS) {
      const variant = composeGesuch(foundation, spId);
      if (variant.ready) {
        gesuch = variant;
        primaryColor = SCHWERPUNKTE[spId].color;
        break;
      }
    }
  }

  if (!gesuch.ready) notFound();

  // Merge any saved overrides (same pipeline as the full gesuch page)
  const { loadGesuchOverrides, applyGesuchOverrides } = await import('@/lib/domain/apply-overrides');
  const overrides = await loadGesuchOverrides(slug);
  const merged = applyGesuchOverrides(gesuch, overrides);

  return (
    <GesuchShareView
      gesuch={merged}
      foundationBridge={merged.foundationBridge}
      trackRecord={merged.story.how.track_record}
      why={merged.story.why}
      primaryColor={primaryColor}
    />
  );
}
