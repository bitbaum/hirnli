/**
 * Gesuch Composer — Domain functions for composing personalized Gesuch content
 *
 * Two outputs from the same data:
 * 1. composeGesuch()    → Landing page content (marketing-oriented)
 * 2. composeGesuchDokument() → Formal 5-page Gesuch document (Swiss standard)
 *
 * Uses composeStory() from stories.ts (the self-contained version).
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { ThemeKey } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { formatDateDE } from '@/lib/utils/format';
import type { Evidence, WhySection, CompetencySection, Project, CoreFacts, TrackRecord, Anecdote, PhotoSlot } from '@/lib/schemas/story';
import {
  composeStory,
  THEME_ID_TO_STORY_KEY,
  THEME_PRIORITY,
  CORE_FACTS,
  SOCIAL_DISPLAY,
  ANSCHREIBEN_TEMPLATES,
  PARTNER_HIGHLIGHTS,
  WHY,
  getAnecdotes,
  getPhotoSlots,
} from '@/lib/config/stories';
import { TYPE_LABELS, THEMES } from '@/lib/config/foundations';
import {
  getScenario,
  getLineItemsForScenario,
} from '@/lib/config/budget-scenarios';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { BudgetLineItem, BudgetScenario } from '@/lib/schemas/budget';
import {
  THREE_YEAR_MODEL,
  STIFTUNGEN_3Y_TOTAL,
  EIGEN_3Y_TOTAL,
  PROJECT_3Y_TOTAL,
  PROJECT_DURATION_LABEL,
} from '@/app/fundraising/data';

interface ThemeMetadata {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ComposedGesuch {
  ready: boolean;
  readyReason?: string;
  foundation: {
    name: string;
    slug: string;
    type: string;
    typeLong: string;
    approach: string;
    purposeSummary?: string;
  };
  /** Bridge text connecting foundation's purpose to Revamp-IT's relevance */
  foundationBridge: string;
  themes: {
    primary: ThemeKey;
    secondary: ThemeKey[];
    all: ThemeMetadata[];
  };
  /** Secondary theme relevance — one-sentence connection per non-primary theme */
  secondaryThemeRelevance: { theme: ThemeKey; label: string; connection: string }[];
  story: {
    why: WhySection | undefined;
    how: {
      track_record: TrackRecord;
      competencies: CompetencySection[];
    };
    projects: Project[];
    evidence: Evidence[];
  };
  organization: CoreFacts;
  approach: {
    strategy: string;
    typeDescription: string;
  };
  anecdotes: {
    why: Anecdote[];
    how: Anecdote[];
  };
  photos: {
    why: PhotoSlot[];
    how: PhotoSlot[];
    projects: PhotoSlot[];
    kurzportrait: PhotoSlot[];
  };
  partnerHighlights: typeof PARTNER_HIGHLIGHTS;
}

export interface ComposedGesuchDokument extends ComposedGesuch {
  anschreiben: {
    date: string;
    foundationAddress: string;
    subject: string;
    opening: string;
    closing: string;
    themeAlignment: string;
  };
  budget: {
    scenario: BudgetScenario;
    lineItems: BudgetLineItem[];
    requestedAmount: number;
    projectDuration: string;
    threeYearModel: {
      year: string;
      einmalig: number;
      stiftungen: number;
      eigen: number;
      total: number;
      label: string;
    }[];
    stiftungen3yTotal: number;
    eigen3yTotal: number;
    project3yTotal: number;
    primaryThemeKey?: ThemeKey;
  };
  kurzportrait: {
    facts: { label: string; value: string }[];
    activities: string[];
    unique: string[];
  };
  landingPageUrl: string;
}

// ============================================================================
// Shared: Map foundation themes and pick primary
// ============================================================================

function mapFoundationThemes(foundation: Foundation) {
  const mappedThemes = [...new Set(
    foundation.themes
      .map((id) => THEME_ID_TO_STORY_KEY[id])
      .filter((k): k is ThemeKey => k !== undefined)
  )];

  const sorted = [...mappedThemes].sort(
    (a, b) => THEME_PRIORITY.indexOf(b) - THEME_PRIORITY.indexOf(a)
  );

  return { primary: sorted[0], secondary: sorted.slice(1), all: mappedThemes };
}

/** Map Schwerpunkt to story themes — overrides foundation's own theme list */
function mapSchwerpunktThemes(schwerpunktId: SchwerpunktId) {
  const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
  const primary = schwerpunkt.storyThemes[0];
  const secondary = schwerpunkt.storyThemes.slice(1);
  return { primary, secondary, all: schwerpunkt.storyThemes };
}

function collectThemeMetadata(foundation: Foundation): ThemeMetadata[] {
  return foundation.themes
    .map((id) => THEMES[id])
    .filter((t) => t !== undefined)
    .map((t) => ({ id: t.id, label: t.label, icon: t.icon, color: t.color }));
}

function buildFoundationInfo(foundation: Foundation) {
  const typeLabel = TYPE_LABELS[foundation.type];
  return {
    name: foundation.name,
    slug: foundation.slug,
    type: foundation.type,
    typeLong: typeLabel.long,
    approach: typeLabel.approach,
    purposeSummary: foundation.purposeSummary,
  };
}

// ============================================================================
// Foundation Bridge — connects foundation's purpose to Revamp-IT relevance
// ============================================================================

const TYPE_VERBS: Record<string, string> = {
  A: 'fördert',
  B: 'unterstützt',
  C: 'engagiert sich für',
  D: 'investiert in',
  network: 'vernetzt Akteure im Bereich',
};

/** Build a bridge sentence connecting foundation purpose to Revamp-IT */
function buildFoundationBridge(foundation: Foundation, primaryThemeLabel: string): string {
  const verb = TYPE_VERBS[foundation.type] || 'fördert';
  const purposeCore = foundation.purposeSummary
    ? foundation.purposeSummary.split('.')[0].trim()
    : '';

  if (purposeCore) {
    return `Die ${foundation.name} ${verb} ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} — ${ORG_PROFILE.name} bringt ${ORG_PROFILE.experienceLabel} in ${primaryThemeLabel} ein.`;
  }
  return `Die ${foundation.name} ${verb} Projekte im Bereich ${primaryThemeLabel} — genau dort, wo ${ORG_PROFILE.name} seit über ${ORG_PROFILE.yearsActive} Jahren wirkt.`;
}

// ============================================================================
// Secondary Theme Relevance — one-sentence connection per non-primary theme
// ============================================================================

function buildSecondaryRelevance(
  secondaryThemes: ThemeKey[],
): { theme: ThemeKey; label: string; connection: string }[] {
  return secondaryThemes
    .map((theme) => {
      const whySection = WHY[theme];
      if (!whySection) return null;

      // Use the first sentence of the WHY solution as the connection
      const solution = whySection.solution;
      const firstSentence = solution.split('.')[0].trim() + '.';

      // Get label from THEME_ID_TO_STORY_KEY reverse lookup
      const themeId = Object.entries(THEME_ID_TO_STORY_KEY).find(
        ([, key]) => key === theme,
      )?.[0];
      const label = themeId ? THEMES[themeId as keyof typeof THEMES]?.label ?? theme : theme;

      return { theme, label, connection: firstSentence };
    })
    .filter((r): r is { theme: ThemeKey; label: string; connection: string } => r !== null);
}

// ============================================================================
// Dynamic Opening — type-specific Anschreiben that references foundation purpose
// ============================================================================

function buildDynamicOpening(foundation: Foundation, primaryThemeLabel: string): string {
  const purposeCore = foundation.purposeSummary
    ? foundation.purposeSummary.split('.')[0].trim()
    : '';
  const isDeep = foundation.researchDepth === 'deep';
  const highFit = foundation.fitScore != null && foundation.fitScore >= 7;

  // Deep research + high fit → lead with specific overlap
  if (isDeep && highFit && purposeCore) {
    return `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${ORG_PROFILE.legalForm.toLowerCase()} mit ${ORG_PROFILE.experienceLabel} in der Verbindung von ${ORG_PROFILE.missionSummary} möchten wir Ihnen eine konkrete Zusammenarbeit vorschlagen.`;
  }

  // Standard research → broader mission alignment framing
  switch (foundation.type) {
    case 'A':
      return purposeCore
        ? `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${ORG_PROFILE.legalForm.toLowerCase()} mit ${ORG_PROFILE.experienceLabel} in der Verbindung von ${ORG_PROFILE.missionSummary} möchten wir Ihnen eine Zusammenarbeit vorschlagen.`
        : ANSCHREIBEN_TEMPLATES['A'].opening;
    case 'B':
      return purposeCore
        ? `Ihr Engagement für ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} hat uns angesprochen. ${ORG_PROFILE.name} verbindet seit über ${ORG_PROFILE.yearsActive} Jahren Umweltschutz mit sozialer Integration — ein Anliegen, das uns mit Ihrer Stiftung verbindet. Wir möchten Ihnen zeigen, wie eine Partnerschaft im Bereich ${primaryThemeLabel} konkret aussehen könnte.`
        : ANSCHREIBEN_TEMPLATES['B'].opening;
    case 'C':
      return purposeCore
        ? `Wir wissen, dass ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} Ihnen ein wichtiges Anliegen ist. In ${ORG_PROFILE.location} reparieren wir Computer, die sonst im Müll landen würden — und geben gleichzeitig Menschen eine zweite Chance auf dem Arbeitsmarkt. Dürfen wir Ihnen kurz erzählen, was wir im Bereich ${primaryThemeLabel} tun?`
        : ANSCHREIBEN_TEMPLATES['C'].opening;
    case 'D':
      return purposeCore
        ? `Ihr Fokus auf ${purposeCore.charAt(0).toLowerCase()}${purposeCore.slice(1)} zeigt, dass messbare Wirkung für Sie zählt. ${ORG_PROFILE.name} liefert genau das: transparente Impact-Daten zu ${ORG_PROFILE.missionSummary} im Bereich ${primaryThemeLabel}.`
        : ANSCHREIBEN_TEMPLATES['D'].opening;
    default:
      return ANSCHREIBEN_TEMPLATES['A'].opening;
  }
}

// ============================================================================
// composeGesuch — Landing page content
// ============================================================================

export function composeGesuch(foundation: Foundation, schwerpunktId?: SchwerpunktId): ComposedGesuch {
  const typeLabel = TYPE_LABELS[foundation.type];
  const mapped = schwerpunktId
    ? mapSchwerpunktThemes(schwerpunktId)
    : mapFoundationThemes(foundation);

  // Quality gate — tightened: researchDepth + fitScore + priority
  const isRapid = foundation.researchDepth === 'rapid';
  const lowFitScore = foundation.fitScore != null && foundation.fitScore < 4;
  const highPriority = foundation.priority != null && foundation.priority >= 3;

  if (foundation.needsResearch || mapped.all.length === 0 || highPriority || isRapid || lowFitScore) {
    let reason = '';
    if (foundation.needsResearch) {
      reason = 'Diese Stiftung benötigt noch weitere Recherche.';
    } else if (isRapid) {
      reason = 'Recherche-Tiefe zu gering für eine Gesuch-Generierung. Weitere Recherche empfohlen.';
    } else if (lowFitScore) {
      reason = `Fit-Score (${foundation.fitScore}/10) zu niedrig für eine gezielte Bewerbung.`;
    } else if (highPriority) {
      reason = foundation.priority === 3
        ? 'Priorität 3: Noch nicht bereit für die Bewerbung. Erst weitere Vorarbeiten nötig.'
        : 'Priorität 4: Netzwerk-Stiftung. Keine formelle Bewerbung geplant.';
    } else {
      reason = 'Keine passenden Themen für die Gesuch-Generierung gefunden.';
    }
    return {
      ready: false,
      readyReason: reason,
      foundation: buildFoundationInfo(foundation),
      foundationBridge: '',
      themes: { primary: 'klima', secondary: [], all: [] },
      secondaryThemeRelevance: [],
      story: { why: undefined, how: { track_record: { headline: '', text: '', proof_points: [] }, competencies: [] }, projects: [], evidence: [] },
      organization: CORE_FACTS,
      approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
      anecdotes: { why: [], how: [] },
      photos: { why: [], how: [], projects: [], kurzportrait: [] },
      partnerHighlights: [],
    };
  }

  const story = composeStory(mapped.primary, mapped.secondary);

  // Primary theme label for bridge text
  const primaryThemeId = Object.entries(THEME_ID_TO_STORY_KEY).find(
    ([, key]) => key === mapped.primary,
  )?.[0];
  const primaryThemeLabel = primaryThemeId
    ? THEMES[primaryThemeId as keyof typeof THEMES]?.label ?? mapped.primary
    : mapped.primary;

  // Anecdotes: max 2 for WHY, max 1 for HOW
  const whyAnecdotes = getAnecdotes(mapped.primary, 'why').slice(0, 2);
  const howAnecdotes = getAnecdotes(mapped.primary, 'how').slice(0, 1);

  return {
    ready: true,
    foundation: buildFoundationInfo(foundation),
    foundationBridge: buildFoundationBridge(foundation, primaryThemeLabel),
    themes: {
      primary: mapped.primary,
      secondary: mapped.secondary,
      all: collectThemeMetadata(foundation),
    },
    secondaryThemeRelevance: buildSecondaryRelevance(mapped.secondary),
    story,
    organization: CORE_FACTS,
    approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
    anecdotes: { why: whyAnecdotes, how: howAnecdotes },
    photos: {
      why: getPhotoSlots('why', mapped.primary),
      how: getPhotoSlots('how', mapped.primary),
      projects: getPhotoSlots('projects', mapped.primary),
      kurzportrait: getPhotoSlots('kurzportrait'),
    },
    partnerHighlights: PARTNER_HIGHLIGHTS,
  };
}

// ============================================================================
// composeGesuchDokument — Formal 5-page Swiss Gesuch
// ============================================================================

/** Generate theme alignment text for the cover letter */
function buildThemeAlignment(foundation: Foundation, themeMetadata: ThemeMetadata[]): string {
  const themeLabels = themeMetadata.map((t) => t.label).join(', ');
  return `Unser Projekt adressiert direkt Ihre Förderbereiche: ${themeLabels}. ${
    foundation.purposeSummary
      ? `Ihr Stiftungszweck — ${foundation.purposeSummary.split('.')[0]} — deckt sich eng mit unserer Mission.`
      : 'Wir sehen eine starke inhaltliche Übereinstimmung mit Ihrem Stiftungszweck.'
  }`;
}

/**
 * Map foundation to budget scenario — grant range first, type as fallback.
 *
 * Uses the foundation's known grant range to pick the right scenario,
 * preventing us from asking CHF 50k from a foundation that gives max CHF 15k.
 *
 * Grant range logic: <20k → minimal, 20-50k → moderate, >50k → maximum
 * Fallback (no range): Type A → maximum, Type B → moderate, C/D → minimal
 */
function getScenarioForFoundation(foundation: Foundation): BudgetScenario {
  let scenarioId: string;

  const maxGrant = foundation.amount.max;
  if (maxGrant !== null) {
    // Grant range known — use it
    if (maxGrant < 20_000) {
      scenarioId = 'minimal';
    } else if (maxGrant <= 50_000) {
      scenarioId = 'moderate';
    } else {
      scenarioId = 'maximum';
    }
  } else if (foundation.type === 'A') {
    scenarioId = 'maximum';
  } else if (foundation.type === 'B') {
    scenarioId = 'moderate';
  } else {
    scenarioId = 'minimal'; // Type C, D, network
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return getScenario('moderate')!;
  }

  return scenario;
}

/** Compute requested amount based on foundation's typical range vs year-1 funding gap */
function computeRequestedAmount(foundation: Foundation, scenario: BudgetScenario): number {
  const year1Budget = scenario.threeYearModel.year1.einmalig + scenario.threeYearModel.year1.jaehrlich;
  const gap = year1Budget - scenario.threeYearModel.year1.eigenleistung;
  const max = foundation.amount.max;
  const min = foundation.amount.min;

  // Use foundation's known range, capped at our actual gap
  if (max && max <= gap) return max;
  if (max && min) return Math.min(Math.round((min + max) / 2), gap);
  if (min) return Math.min(min * 2, gap);
  // Default: a meaningful chunk (~20% of gap, rounded to nearest 5k)
  return Math.round(gap * 0.2 / 5000) * 5000;
}

/** Build foundation mailing address from contact data */
function buildFoundationAddress(foundation: Foundation): string {
  const parts = [foundation.name];
  if (foundation.contact?.address) parts.push(foundation.contact.address);
  return parts.join('\n');
}

export function composeGesuchDokument(foundation: Foundation, schwerpunktId?: SchwerpunktId): ComposedGesuchDokument {
  const gesuch = composeGesuch(foundation, schwerpunktId);
  const template = ANSCHREIBEN_TEMPLATES[foundation.type] ?? ANSCHREIBEN_TEMPLATES['A'];
  const themeMetadata = collectThemeMetadata(foundation);
  const primaryLabel = themeMetadata[0]?.label ?? 'Kreislaufwirtschaft und Arbeitsintegration';

  // Get appropriate scenario based on foundation type
  const scenario = getScenarioForFoundation(foundation);
  const lineItems = getLineItemsForScenario(scenario.id);
  const requestedAmount = computeRequestedAmount(foundation, scenario);

  const today = new Date();
  const dateStr = formatDateDE(today, ORG_PROFILE.location);

  return {
    ...gesuch,
    anschreiben: {
      date: dateStr,
      foundationAddress: buildFoundationAddress(foundation),
      subject: `Fördergesuch: ${primaryLabel} — ${ORG_PROFILE.name}`,
      opening: buildDynamicOpening(foundation, primaryLabel),
      closing: template.closing,
      themeAlignment: buildThemeAlignment(foundation, themeMetadata),
    },
    budget: {
      scenario,
      lineItems,
      requestedAmount,
      projectDuration: `3 Jahre (2026–2028): ${PROJECT_DURATION_LABEL}`,
      threeYearModel: THREE_YEAR_MODEL.map((y) => ({
        year: y.year,
        einmalig: y.einmalig,
        stiftungen: y.stiftungen,
        eigen: y.eigen,
        total: y.total,
        label: y.label,
      })),
      stiftungen3yTotal: STIFTUNGEN_3Y_TOTAL,
      eigen3yTotal: EIGEN_3Y_TOTAL,
      project3yTotal: PROJECT_3Y_TOTAL,
      primaryThemeKey: schwerpunktId
        ? SCHWERPUNKTE[schwerpunktId].storyThemes[0]
        : undefined,
    },
    kurzportrait: {
      facts: [
        { label: 'Name', value: CORE_FACTS.organization.name },
        { label: 'Rechtsform', value: CORE_FACTS.organization.legalForm },
        { label: 'Gegründet', value: String(CORE_FACTS.organization.founded) },
        { label: 'Standort', value: CORE_FACTS.organization.address },
        { label: 'Kernteam', value: `${CORE_FACTS.organization.team_size} Festangestellte + Freelancer` },
        { label: 'Website', value: CORE_FACTS.organization.website },
        { label: 'Gemeinnützigkeit', value: 'Verein — alle Einnahmen fliessen in die Mission' },
        { label: 'Praktikant:innen betreut', value: `${SOCIAL_DISPLAY.practitioners_total} seit Gründung` },
        { label: 'Wiedereingliederungsquote', value: SOCIAL_DISPLAY.success_rate },
        { label: 'CO₂-Einsparung pro Laptop', value: `${CORE_FACTS.metrics.environmental.co2_per_laptop} kg` },
        { label: 'Reuse-Rate', value: `${CORE_FACTS.metrics.environmental.reuse_rate}%` },
      ],
      activities: CORE_FACTS.activities,
      unique: CORE_FACTS.unique,
    },
    landingPageUrl: `${ORG_PROFILE.platform.url}/fundraising/stiftungen/${foundation.slug}/gesuch`,
  };
}
