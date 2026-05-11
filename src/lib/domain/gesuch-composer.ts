/**
 * Gesuch Composer — Generates personalized Gesuch content from foundation data
 * Quality gate: isResearched(f) AND priority P1-P3 AND themes mapped.
 * See CLAUDE.md § Scoring Model for gate definitions.
 *
 * Two outputs from the same data:
 * 1. composeGesuch()    → Landing page content (marketing-oriented)
 * 2. composeGesuchDokument() → Formal 5-page Gesuch document (Swiss standard)
 *
 * Delegates to:
 * - bridge-composer.ts    → Foundation↔Org connection text
 * - anschreiben-composer.ts → Cover letter text generation
 * - budget-mapper.ts      → Foundation→budget scenario mapping
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { ThemeMetadata } from '@/lib/schemas/theme';
import type { ThemeId } from '@/lib/schemas/foundation';
import { isResearched, isActionablePriority } from './foundation-helpers';
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
  getAnecdotes,
  getPhotoSlots,
} from '@/lib/config/stories';
import { TYPE_LABELS, THEMES, PRIORITY_CONFIG } from '@/lib/config/foundations';
import { getLineItemsForScenario } from '@/lib/domain/budget-calculations';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { BudgetLineItem, BudgetScenario } from '@/lib/schemas/budget';
import {
  THREE_YEAR_MODEL,
  STIFTUNGEN_3Y_TOTAL,
  EIGEN_3Y_TOTAL,
  PROJECT_3Y_TOTAL,
  PROJECT_DURATION_LABEL,
} from '@/app/fundraising/data';

// Extracted domain modules
import { buildFoundationBridge, buildSecondaryRelevance } from './bridge-composer';
import { buildDynamicOpening, buildThemeAlignment } from './anschreiben-composer';
import { getScenarioForFoundation, computeRequestedAmount } from './budget-mapper';

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
  foundationBridge: string;
  themes: {
    primary: ThemeKey;
    secondary: ThemeKey[];
    all: ThemeMetadata[];
  };
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
// Theme mapping helpers
// ============================================================================

function mapFoundationThemes(foundation: Foundation) {
  const mappedThemes = [...new Set(foundation.themes.map((id) => THEME_ID_TO_STORY_KEY[id]))];

  const sorted = [...mappedThemes].sort(
    (a, b) => THEME_PRIORITY.indexOf(b) - THEME_PRIORITY.indexOf(a)
  );

  return { primary: sorted[0], secondary: sorted.slice(1), all: mappedThemes };
}

function mapSchwerpunktThemes(schwerpunktId: SchwerpunktId) {
  const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
  const primary = schwerpunkt.storyThemes[0];
  const secondary = schwerpunkt.storyThemes.slice(1);
  return { primary, secondary, all: schwerpunkt.storyThemes };
}

function collectThemeMetadata(foundation: Foundation, schwerpunktId?: SchwerpunktId): ThemeMetadata[] {
  // When a Schwerpunkt is selected, prefer themes matching the Schwerpunkt's focus.
  if (schwerpunktId) {
    const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
    // Intersect foundation themes with Schwerpunkt themes, preserving Schwerpunkt order
    const orderedIds = schwerpunkt.themeIds.filter((id) => foundation.themes.includes(id));
    // If foundation has any matching themes, use those. Otherwise use Schwerpunkt themes directly.
    const ids = orderedIds.length > 0 ? orderedIds : schwerpunkt.themeIds;
    return ids.map((id) => {
      const t = THEMES[id];
      return { id: t.id, label: t.label, icon: t.icon, color: t.color };
    });
  }

  // Default: deduplicate by story key so geographic aliases (e.g. 'zuerich' → 'klima')
  // don't show alongside a proper klima theme. But keep 'zuerich' as a fallback
  // badge when it is the foundation's only tag — otherwise the hero shows
  // zero theme chips.
  const hasContentTheme = foundation.themes.some((id) => id !== 'zuerich');
  const seenStoryKeys = new Set<string>();
  return foundation.themes
    .filter((id) => {
      if (id === 'zuerich' && hasContentTheme) return false;
      const storyKey = THEME_ID_TO_STORY_KEY[id];
      if (seenStoryKeys.has(storyKey)) return false;
      seenStoryKeys.add(storyKey);
      return true;
    })
    .map((id) => {
      const t = THEMES[id];
      return { id: t.id, label: t.label, icon: t.icon, color: t.color };
    });
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

  // Quality gate: tier (data completeness), priority (fit × readiness), themes
  const lowPriority = !isActionablePriority(foundation);

  if (!isResearched(foundation) || mapped.all.length === 0 || lowPriority) {
    let reason = '';
    if (!isResearched(foundation)) {
      reason = 'Diese Stiftung benötigt noch weitere Recherche.';
    } else if (lowPriority) {
      const pc = PRIORITY_CONFIG[foundation.priority];
      reason = `Priorität ${pc.label}: ${pc.description}`;
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
  const primaryThemeId = (Object.keys(THEME_ID_TO_STORY_KEY) as ThemeId[]).find(
    (id) => THEME_ID_TO_STORY_KEY[id] === mapped.primary,
  );
  const primaryThemeLabel = primaryThemeId
    ? THEMES[primaryThemeId].label
    : mapped.primary;

  const whyAnecdotes = getAnecdotes(mapped.primary, 'why').slice(0, 2);
  const howAnecdotes = getAnecdotes(mapped.primary, 'how').slice(0, 1);

  return {
    ready: true,
    foundation: buildFoundationInfo(foundation),
    foundationBridge: buildFoundationBridge(foundation, primaryThemeLabel),
    themes: {
      primary: mapped.primary,
      secondary: mapped.secondary,
      all: collectThemeMetadata(foundation, schwerpunktId),
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

function buildFoundationAddress(foundation: Foundation): string {
  const parts = [foundation.name];
  if (foundation.contact?.address) parts.push(foundation.contact.address);
  return parts.join('\n');
}

export interface AnschreibenText {
  subject: string;
  opening: string;
  closing: string;
  themeAlignment: string;
}

/** Compute just the Anschreiben text fields (for the edit panel in step 2) */
export function composeAnschreibenText(foundation: Foundation, schwerpunktId?: SchwerpunktId): AnschreibenText {
  const template = ANSCHREIBEN_TEMPLATES[foundation.type];
  const themeMetadata = collectThemeMetadata(foundation, schwerpunktId);
  const primaryLabel = themeMetadata[0]?.label ?? 'Kreislaufwirtschaft und Arbeitsintegration';
  return {
    subject: `Fördergesuch: ${primaryLabel} — ${ORG_PROFILE.name}`,
    opening: buildDynamicOpening(foundation, primaryLabel),
    closing: template.closing,
    themeAlignment: buildThemeAlignment(foundation, themeMetadata),
  };
}

export function composeGesuchDokument(foundation: Foundation, schwerpunktId?: SchwerpunktId): ComposedGesuchDokument {
  const gesuch = composeGesuch(foundation, schwerpunktId);
  const template = ANSCHREIBEN_TEMPLATES[foundation.type];
  const themeMetadata = collectThemeMetadata(foundation, schwerpunktId);
  const primaryLabel = themeMetadata[0]?.label ?? 'Kreislaufwirtschaft und Arbeitsintegration';

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
