import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import {
  getQualityTier, tierAtLeast, computeTierCounts, hasGesuchPage,
} from '@/lib/domain/foundation-helpers';
import type { QualityTier } from '@/lib/schemas/foundation';

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

export function computeFunnelStats(): FunnelStats {
  const total = STIFTUNGEN_DATA.length;
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);

  const withPurpose = STIFTUNGEN_DATA.filter(f =>
    f.purposeSummary && f.purposeSummary.length > 30
  ).length;

  const withThemes = STIFTUNGEN_DATA.filter(f => f.themes.length > 0).length;

  const withFitScore = STIFTUNGEN_DATA.filter(f => f.fitScore > 0).length;
  const highFit = STIFTUNGEN_DATA.filter(f => fitScoreToDisplay(f.fitScore, false) === 3).length;
  const mediumFit = STIFTUNGEN_DATA.filter(f => fitScoreToDisplay(f.fitScore, false) === 2).length;

  const withContact = STIFTUNGEN_DATA.filter(f =>
    f.contact?.email || f.contact?.phone
  ).length;

  const withWebsite = STIFTUNGEN_DATA.filter(f =>
    f.websiteUrl && !f.websiteUrl.includes('zefix.ch') && !f.websiteUrl.includes('uid.admin.ch')
  ).length;

  const rapid = STIFTUNGEN_DATA.filter(f => f.researchDepth === 'rapid').length;
  const standard = STIFTUNGEN_DATA.filter(f => f.researchDepth === 'standard').length;
  const deep = STIFTUNGEN_DATA.filter(f => f.researchDepth === 'deep').length;

  const profiliert = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'profiliert')).length;
  const recherchiert = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'recherchiert')).length;
  const gesuchReady = STIFTUNGEN_DATA.filter(hasGesuchPage).length;

  const recherchiertFoundations = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'recherchiert'));
  const pCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const f of recherchiertFoundations) {
    pCounts[f.priority]++;
  }

  return {
    total, withPurpose, withThemes, withFitScore, highFit, mediumFit,
    withContact, withWebsite, rapid, standard, deep,
    tierCounts, profiliert, recherchiert, gesuchReady, pCounts,
  };
}
