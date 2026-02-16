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
import type { Evidence, WhySection, CompetencySection, Project, CoreFacts, TrackRecord, Anecdote, PhotoSlot } from '@/lib/schemas/story';
import {
  composeStory,
  THEME_ID_TO_STORY_KEY,
  THEME_PRIORITY,
  CORE_FACTS,
  SOCIAL_DISPLAY,
  ANSCHREIBEN_TEMPLATES,
  PARTNER_HIGHLIGHTS,
  getAnecdotes,
  getPhotoSlots,
} from '@/lib/config/stories';
import { TYPE_LABELS, THEMES } from '@/lib/config/foundations';
import {
  BUDGET_SCENARIOS,
  EIGENLEISTUNG_CONFIG,
  getScenario,
  getLineItemsForScenario,
} from '@/lib/config/budget-scenarios';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { BudgetLineItem, BudgetScenario } from '@/lib/schemas/budget';
import { calculate3YearTotals } from '@/lib/domain/budget-calculations';
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
  themes: {
    primary: ThemeKey;
    secondary: ThemeKey[];
    all: ThemeMetadata[];
  };
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
// composeGesuch — Landing page content
// ============================================================================

export function composeGesuch(foundation: Foundation, schwerpunktId?: SchwerpunktId): ComposedGesuch {
  const typeLabel = TYPE_LABELS[foundation.type];
  const mapped = schwerpunktId
    ? mapSchwerpunktThemes(schwerpunktId)
    : mapFoundationThemes(foundation);

  // Quality gate — only generate Gesuchs for Priority 1-2 foundations
  if (foundation.needsResearch || mapped.all.length === 0 || (foundation.priority && foundation.priority >= 3)) {
    let reason = '';
    if (foundation.needsResearch) {
      reason = 'Diese Stiftung benötigt noch weitere Recherche.';
    } else if (foundation.priority && foundation.priority >= 3) {
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
      themes: { primary: 'klima', secondary: [], all: [] },
      story: { why: undefined, how: { track_record: { headline: '', text: '', proof_points: [] }, competencies: [] }, projects: [], evidence: [] },
      organization: CORE_FACTS,
      approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
      anecdotes: { why: [], how: [] },
      photos: { why: [], how: [], projects: [], kurzportrait: [] },
      partnerHighlights: [],
    };
  }

  const story = composeStory(mapped.primary, mapped.secondary);

  // Anecdotes: max 2 for WHY, max 1 for HOW
  const whyAnecdotes = getAnecdotes(mapped.primary, 'why').slice(0, 2);
  const howAnecdotes = getAnecdotes(mapped.primary, 'how').slice(0, 1);

  return {
    ready: true,
    foundation: buildFoundationInfo(foundation),
    themes: {
      primary: mapped.primary,
      secondary: mapped.secondary,
      all: collectThemeMetadata(foundation),
    },
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
 * Map foundation type to budget scenario
 * Type A → Maximum (full vision)
 * Type B → Moderate (recommended)
 * Type C, D → Minimal (solid foundation)
 */
function getScenarioForFoundation(foundation: Foundation): BudgetScenario {
  let scenarioId: string;

  if (foundation.type === 'A') {
    scenarioId = 'maximum';
  } else if (foundation.type === 'B') {
    scenarioId = 'moderate';
  } else {
    scenarioId = 'minimal'; // Type C, D, network
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    // Fallback to moderate if scenario not found
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

  // Get appropriate scenario based on foundation type
  const scenario = getScenarioForFoundation(foundation);
  const lineItems = getLineItemsForScenario(scenario.id);
  const requestedAmount = computeRequestedAmount(foundation, scenario);

  const today = new Date();
  const dateStr = `Zürich, ${today.getDate()}. ${
    ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][today.getMonth()]
  } ${today.getFullYear()}`;

  return {
    ...gesuch,
    anschreiben: {
      date: dateStr,
      foundationAddress: buildFoundationAddress(foundation),
      subject: `Fördergesuch: ${gesuch.story.projects[0]?.title ?? 'Kreislaufwirtschaft und Arbeitsintegration'}`,
      opening: template.opening,
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
    landingPageUrl: `https://revamp-info.vercel.app/fundraising/stiftungen/${foundation.slug}/gesuch`,
  };
}
