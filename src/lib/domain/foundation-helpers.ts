import type { Foundation, QualityTier } from '@/lib/schemas/foundation';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';

// -- Quality Tiers (SSOT) -----------------------------------------------------
// 5-tier system computed deterministically from data signals — never manually assigned.
// See plan: verzeichnet < erfasst < profiliert < recherchiert < anwendungsbereit

/** Ordered tier ranks for comparisons */
const TIER_RANK: Record<QualityTier, number> = {
  verzeichnet: 1,
  erfasst: 2,
  profiliert: 3,
  recherchiert: 4,
  anwendungsbereit: 5,
};

/** All tiers in ascending order */
export const QUALITY_TIERS: QualityTier[] = [
  'verzeichnet',
  'erfasst',
  'profiliert',
  'recherchiert',
  'anwendungsbereit',
];

/** Check if a tier meets a minimum threshold */
export function tierAtLeast(tier: QualityTier, minimum: QualityTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

/** URLs pointing to registry sites, not the foundation's own website */
const REGISTRY_DOMAINS = ['zefix.ch', 'uid.admin.ch'];

function isRegistryUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return REGISTRY_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** Determine the quality tier for a foundation from its data signals */
export function getQualityTier(f: Foundation): QualityTier {
  const realWeb = !!f.websiteUrl && !isRegistryUrl(f.websiteUrl);
  const directContact = !!(f.contact?.email || f.contact?.phone);
  const hasAppUrl = !!f.applicationUrl;
  const hasGrantRange = !!(f.amount?.min || f.amount?.max);
  const hasThemes = f.themes.length > 0;
  const hasContactInfo = directContact || !!f.contact?.address;
  const hasRegistryData = !!f.officialPurpose || hasThemes || f.fit > 0;

  if (realWeb && directContact && hasAppUrl && hasGrantRange) return 'anwendungsbereit';
  if (realWeb && directContact) return 'recherchiert';
  if (hasThemes && hasContactInfo) return 'profiliert';
  if (hasRegistryData) return 'erfasst';
  return 'verzeichnet';
}

// -- Tier display config -------------------------------------------------------

export const TIER_LABELS: Record<QualityTier, string> = {
  anwendungsbereit: 'Anwendungsbereit',
  recherchiert: 'Recherchiert',
  profiliert: 'Profiliert',
  erfasst: 'Erfasst',
  verzeichnet: 'Verzeichnet',
};

export const TIER_COLORS: Record<QualityTier, string> = {
  anwendungsbereit: 'bg-success-bg text-success',
  recherchiert: 'bg-blue-100 text-blue-800',
  profiliert: 'bg-amber-100 text-amber-700',
  erfasst: 'bg-grey-light text-text-muted',
  verzeichnet: 'bg-gray-100 text-gray-400',
};

export const TIER_DESCRIPTIONS: Record<QualityTier, string> = {
  anwendungsbereit: 'Jetzt bewerben — Kontakt, Bewerbungsweg und Fördersumme bekannt.',
  recherchiert: 'Verifizierte Website und direkter Kontakt.',
  profiliert: 'Automatisch profiliert anhand von Registerdaten.',
  erfasst: 'Registerdaten verfügbar. Recherche ausstehend.',
  verzeichnet: 'Im Schweizer Register erfasst. Nur Name und UID.',
};

// -- Tier counts ---------------------------------------------------------------

/** Compute tier counts from a list of foundations */
export function computeTierCounts(foundations: Foundation[]): Record<QualityTier, number> {
  const counts: Record<QualityTier, number> = {
    verzeichnet: 0,
    erfasst: 0,
    profiliert: 0,
    recherchiert: 0,
    anwendungsbereit: 0,
  };
  for (const f of foundations) {
    counts[getQualityTier(f)]++;
  }
  return counts;
}

/** Count foundations at or above a minimum tier */
export function countAtLeast(foundations: Foundation[], minimum: QualityTier): number {
  return foundations.filter((f) => tierAtLeast(getQualityTier(f), minimum)).length;
}

// -- Promotion steps -----------------------------------------------------------

export interface TierPromotion {
  currentTier: QualityTier;
  nextTier: QualityTier | null;
  missingFields: string[];
}

/** Returns what fields are missing to reach the next tier */
export function getTierPromotionSteps(f: Foundation): TierPromotion {
  const currentTier = getQualityTier(f);
  const missing: string[] = [];

  const realWeb = !!f.websiteUrl && !isRegistryUrl(f.websiteUrl);
  const directContact = !!(f.contact?.email || f.contact?.phone);
  const hasAppUrl = !!f.applicationUrl;
  const hasGrantRange = !!(f.amount?.min || f.amount?.max);
  const hasThemes = f.themes.length > 0;
  const hasContactInfo = directContact || !!f.contact?.address;

  switch (currentTier) {
    case 'verzeichnet':
      // Need: officialPurpose OR themes OR fit > 0
      if (!f.officialPurpose) missing.push('Stiftungszweck (officialPurpose)');
      if (!hasThemes) missing.push('Themen zuweisen');
      return { currentTier, nextTier: 'erfasst', missingFields: missing };

    case 'erfasst':
      // Need: themes + some contact/address
      if (!hasThemes) missing.push('Themen zuweisen');
      if (!hasContactInfo) missing.push('Kontaktdaten (E-Mail, Telefon oder Adresse)');
      return { currentTier, nextTier: 'profiliert', missingFields: missing };

    case 'profiliert':
      // Need: real website + email/phone
      if (!realWeb) missing.push('Eigene Website (nicht Zefix/UID)');
      if (!directContact) missing.push('Direkte Kontaktdaten (E-Mail oder Telefon)');
      return { currentTier, nextTier: 'recherchiert', missingFields: missing };

    case 'recherchiert':
      // Need: applicationUrl + grant range
      if (!hasAppUrl) missing.push('Bewerbungs-URL');
      if (!hasGrantRange) missing.push('Förderbetrag (min/max)');
      return { currentTier, nextTier: 'anwendungsbereit', missingFields: missing };

    case 'anwendungsbereit':
      return { currentTier, nextTier: null, missingFields: [] };
  }
}

// -- Foundation lookup ---------------------------------------------------------

/** Look up a foundation by its URL slug */
export function getFoundationBySlug(slug: string): Foundation | undefined {
  return STIFTUNGEN_DATA.find((f) => f.slug === slug);
}

// -- Static param generation ---------------------------------------------------

/**
 * Generate static params for foundation detail pages.
 * Pre-generates profiliert+ tiers.
 * Lower tiers (verzeichnet, erfasst) are rendered dynamically (dynamicParams = true).
 */
export function generateFoundationParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter((f) => tierAtLeast(getQualityTier(f), 'profiliert'))
    .map((f) => ({ slug: f.slug }));
}

/**
 * Check if a foundation qualifies for a gesuch page.
 * SSOT for the gesuch gate — used by both generateGesuchParams() and FoundationSidebar.
 * Requires tier >= recherchiert AND priority <= 2.
 */
export function hasGesuchPage(f: Foundation): boolean {
  if (!tierAtLeast(getQualityTier(f), 'recherchiert')) return false;
  if (f.priority && f.priority > 2) return false;
  return true;
}

/** Generate static params for gesuch-ready foundations only */
export function generateGesuchParams(): { slug: string }[] {
  return STIFTUNGEN_DATA
    .filter(hasGesuchPage)
    .map((f) => ({ slug: f.slug }));
}

// -- Backward compat (deprecated) ---------------------------------------------
// Keep the old FoundationTier type temporarily so any missed consumers get a compile error
// rather than silently breaking. Remove once all consumers are updated.

/** @deprecated Use QualityTier instead */
export type FoundationTier = QualityTier;

/** @deprecated Use getQualityTier instead */
export function getFoundationTier(f: Foundation): QualityTier {
  return getQualityTier(f);
}
