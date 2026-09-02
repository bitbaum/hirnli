import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import {
  getQualityTier,
  tierAtLeast,
  computeTierCounts,
  hasGesuchPage,
} from '@/lib/domain/foundation-helpers';
import type { Foundation, QualityTier } from '@/lib/schemas/foundation';

export interface FunnelStats {
  total: number;
  withPurpose: number;
  withThemes: number;
  withFitScore: number;
  highFit: number;
  mediumFit: number;
  withContact: number;
  withWebsite: number;
  rapid: number;
  standard: number;
  deep: number;
  tierCounts: Record<QualityTier, number>;
  profiliert: number;
  recherchiert: number;
  gesuchReady: number;
  pCounts: Record<number, number>;
}

export function computeFunnelStats(foundations: Foundation[]): FunnelStats {
  const total = foundations.length;
  const tierCounts = computeTierCounts(foundations);

  const withPurpose = foundations.filter(
    (f) => f.purposeSummary && f.purposeSummary.length > 30,
  ).length;

  const withThemes = foundations.filter((f) => f.themes.length > 0).length;

  const withFitScore = foundations.filter((f) => f.fitScore > 0).length;
  const highFit = foundations.filter((f) => fitScoreToDisplay(f.fitScore, false) === 3).length;
  const mediumFit = foundations.filter((f) => fitScoreToDisplay(f.fitScore, false) === 2).length;

  const withContact = foundations.filter((f) => f.contact?.email || f.contact?.phone).length;

  const withWebsite = foundations.filter(
    (f) =>
      f.websiteUrl && !f.websiteUrl.includes('zefix.ch') && !f.websiteUrl.includes('uid.admin.ch'),
  ).length;

  const rapid = foundations.filter((f) => f.researchDepth === 'rapid').length;
  const standard = foundations.filter((f) => f.researchDepth === 'standard').length;
  const deep = foundations.filter((f) => f.researchDepth === 'deep').length;

  const profiliert = foundations.filter((f) => tierAtLeast(getQualityTier(f), 'profiliert')).length;
  const recherchiert = foundations.filter((f) =>
    tierAtLeast(getQualityTier(f), 'recherchiert'),
  ).length;
  const gesuchReady = foundations.filter(hasGesuchPage).length;

  const recherchiertFoundations = foundations.filter((f) =>
    tierAtLeast(getQualityTier(f), 'recherchiert'),
  );
  const pCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const f of recherchiertFoundations) {
    pCounts[f.priority]++;
  }

  return {
    total,
    withPurpose,
    withThemes,
    withFitScore,
    highFit,
    mediumFit,
    withContact,
    withWebsite,
    rapid,
    standard,
    deep,
    tierCounts,
    profiliert,
    recherchiert,
    gesuchReady,
    pCounts,
  };
}
