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
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { getAllFoundations, getFoundationBySlug } from '@/lib/db/foundations-repo';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { SCHWERPUNKT_IDS, SCHWERPUNKTE, isSchwerpunktId } from '@/lib/config/schwerpunkte';
import { DEFAULT_THEME_COLOR } from '@/lib/config/chart-colors';
import { resolveShareToken } from '@/lib/utils/share-token';

import GesuchShareView from '@/components/gesuch/GesuchShareView';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ s?: string }>;
}

/** All gesuch-eligible foundation slugs — used for token resolution */
async function gesuchSlugs(): Promise<string[]> {
  const all = await getAllFoundations();
  return all.filter(hasGesuchPage).map((f) => f.slug);
}

// Must be dynamic: the root layout reads the locale cookie (next-intl) and
// this page reads searchParams, so it can't be statically prerendered — an
// SSG attempt 500s at request time with DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const slug = resolveShareToken(token, await gesuchSlugs());
  if (!slug) return { title: 'Nicht gefunden' };

  const foundation = await getFoundationBySlug(slug);
  if (!foundation) return { title: 'Nicht gefunden' };

  const title = `${ORG_PROFILE.name} × ${foundation.name}`;
  const description = `Partnerschaftsvorschlag von ${ORG_PROFILE.name} für ${foundation.name}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    // Program officers receive this link directly — the preview must look
    // deliberate, not like a bare URL.
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function GesuchSharePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { s: schwerpunktParam } = await searchParams;

  // Resolve token → slug (404 on invalid token)
  const slug = resolveShareToken(token, await gesuchSlugs());
  if (!slug) notFound();

  const foundation = await getFoundationBySlug(slug);
  if (!foundation || !hasGesuchPage(foundation)) notFound();

  // If a specific schwerpunkt is requested via ?s= param, try it first
  let gesuch = composeGesuch(foundation);
  let primaryColor = gesuch.themes.all[0]?.color ?? DEFAULT_THEME_COLOR;
  let selectedSchwerpunkt: string = 'auto';

  if (schwerpunktParam && isSchwerpunktId(schwerpunktParam)) {
    const spId = schwerpunktParam;
    const variant = composeGesuch(foundation, spId);
    if (variant.ready) {
      gesuch = variant;
      primaryColor = SCHWERPUNKTE[spId].color;
      selectedSchwerpunkt = spId;
    }
  }

  // If no specific schwerpunkt matched, fall back to auto-selection
  if (!gesuch.ready || !schwerpunktParam) {
    for (const spId of SCHWERPUNKT_IDS) {
      const variant = composeGesuch(foundation, spId);
      if (variant.ready) {
        gesuch = variant;
        primaryColor = SCHWERPUNKTE[spId].color;
        selectedSchwerpunkt = spId;
        break;
      }
    }
  }

  if (!gesuch.ready) notFound();

  // Merge any saved overrides (same pipeline as the full gesuch page)
  const { loadGesuchOverrides, applyGesuchOverrides } =
    await import('@/lib/domain/apply-overrides');
  const overrides = await loadGesuchOverrides(slug, selectedSchwerpunkt);
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
