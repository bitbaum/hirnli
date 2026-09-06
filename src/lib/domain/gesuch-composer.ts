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
import type { ComposedCompetency, TenantStory } from '@/lib/content/story-engine';
import type { ThemeKey } from '@/lib/content/story-themes';
import { THEME_ID_TO_STORY_KEY, THEME_PRIORITY } from '@/lib/content/story-themes';
import type { Tenant } from '@/lib/tenant/profile';
import { formatDateDE } from '@/lib/utils/format';
import type {
  Evidence,
  WhySection,
  GesuchText,
  PartnerHighlight,
  Project,
  CoreFacts,
  TrackRecord,
  Anecdote,
  PhotoSlot,
} from '@/lib/schemas/story';
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
} from '@/app/(tenant)/fundraising/data';

// Extracted domain modules
import { buildFoundationBridge, buildSecondaryRelevance } from './bridge-composer';
import { buildDynamicOpening, buildThemeAlignment } from './anschreiben-composer';
import { getScenarioForFoundation, computeRequestedAmount } from './budget-mapper';

export interface ComposedGesuch {
  /**
   * The organisation this Gesuch was composed FOR, carried with the content.
   *
   * The renderers — eight page sections and five PDF components — each need a
   * few identity fields: the name in a heading, the address in a letterhead,
   * the site URL in a footer. Passing a second `tenant` prop beside `gesuch` to
   * every one of them would make it possible to render a document composed for
   * one organisation under another's name, and nothing would catch it: both
   * props would be present and well-typed.
   *
   * Keeping them together makes that unrepresentable. The composed document and
   * its author are one value.
   */
  tenant: Tenant;
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
      competencies: ComposedCompetency[];
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
  partnerHighlights: PartnerHighlight[];
  /**
   * The prose blocks the renderers print verbatim.
   *
   * Carried on the composed document rather than imported by each renderer.
   * Eight sections and five PDF components used to reach for this themselves,
   * which meant eight places that could reach for the wrong organisation's —
   * and they did: every one of them read one specific module. A renderer given
   * a document has no way to render text belonging to anyone else.
   */
  gesuchText: GesuchText;
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
    (a, b) => THEME_PRIORITY.indexOf(b) - THEME_PRIORITY.indexOf(a),
  );

  return { primary: sorted[0], secondary: sorted.slice(1), all: mappedThemes };
}

function mapSchwerpunktThemes(schwerpunktId: SchwerpunktId) {
  const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
  const primary = schwerpunkt.storyThemes[0];
  const secondary = schwerpunkt.storyThemes.slice(1);
  return { primary, secondary, all: schwerpunkt.storyThemes };
}

function collectThemeMetadata(
  foundation: Foundation,
  schwerpunktId?: SchwerpunktId,
): ThemeMetadata[] {
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

/**
 * Compose the landing-page Gesuch for one applicant and one foundation.
 *
 * `story` rather than `tenant` is the whole change: the applicant's narrative
 * arrives as an argument instead of being imported, so this function has no way
 * to reach a story other than the one it was handed. It used to import one, and
 * therefore composed that organisation's WHY sections, competencies, projects,
 * citations, anecdotes and partners for whoever asked — with the caller's name
 * interpolated on top, which made the result look tailored.
 */
export function composeGesuch(
  story: TenantStory,
  foundation: Foundation,
  schwerpunktId?: SchwerpunktId,
): ComposedGesuch {
  const { tenant } = story;
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
    return story.fill({
      tenant,
      ready: false,
      readyReason: reason,
      foundation: buildFoundationInfo(foundation),
      foundationBridge: '',
      themes: { primary: 'klima', secondary: [], all: [] },
      secondaryThemeRelevance: [],
      story: {
        why: undefined,
        how: { track_record: { headline: '', text: '', proof_points: [] }, competencies: [] },
        projects: [],
        evidence: [],
      },
      organization: story.coreFacts(),
      approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
      anecdotes: { why: [], how: [] },
      photos: { why: [], how: [], projects: [], kurzportrait: [] },
      partnerHighlights: [],
      gesuchText: story.gesuchText(),
    });
  }

  const composed = story.compose(mapped.primary, mapped.secondary);

  // Primary theme label for bridge text
  const primaryThemeId = (Object.keys(THEME_ID_TO_STORY_KEY) as ThemeId[]).find(
    (id) => THEME_ID_TO_STORY_KEY[id] === mapped.primary,
  );
  const primaryThemeLabel = primaryThemeId ? THEMES[primaryThemeId].label : mapped.primary;

  const whyAnecdotes = story.anecdotes(mapped.primary, 'why').slice(0, 2);
  const howAnecdotes = story.anecdotes(mapped.primary, 'how').slice(0, 1);

  return story.fill({
    tenant,
    ready: true,
    foundation: buildFoundationInfo(foundation),
    foundationBridge: buildFoundationBridge(tenant, foundation, primaryThemeLabel),
    themes: {
      primary: mapped.primary,
      secondary: mapped.secondary,
      all: collectThemeMetadata(foundation, schwerpunktId),
    },
    secondaryThemeRelevance: buildSecondaryRelevance(story, mapped.secondary),
    story: composed,
    organization: story.coreFacts(),
    approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
    anecdotes: { why: whyAnecdotes, how: howAnecdotes },
    photos: {
      why: story.photoSlots('why', mapped.primary),
      how: story.photoSlots('how', mapped.primary),
      projects: story.photoSlots('projects', mapped.primary),
      kurzportrait: story.photoSlots('kurzportrait'),
    },
    partnerHighlights: story.partnerHighlights(),
    gesuchText: story.gesuchText(),
  });
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

/**
 * The label a cover letter is addressed under when no theme matched.
 *
 * This was one organisation's two fields of work, written into the platform as
 * the default subject line — so an applicant whose foundation matched no theme
 * posted a letter titled with somebody else's specialism. The applicant's own
 * mission is the right fallback, and an applicant who has stated none gets a
 * subject with no claim in it rather than a borrowed one.
 */
function subjectLabel(tenant: Tenant, themeMetadata: ThemeMetadata[]): string | undefined {
  return themeMetadata[0]?.label ?? tenant.missionSummary;
}

function anschreibenSubject(tenant: Tenant, label: string | undefined): string {
  return label ? `Fördergesuch: ${label} — ${tenant.name}` : `Fördergesuch — ${tenant.name}`;
}

/** Compute just the Anschreiben text fields (for the edit panel in step 2) */
export function composeAnschreibenText(
  story: TenantStory,
  foundation: Foundation,
  schwerpunktId?: SchwerpunktId,
): AnschreibenText {
  const { tenant } = story;
  const themeMetadata = collectThemeMetadata(foundation, schwerpunktId);
  const label = subjectLabel(tenant, themeMetadata);
  return story.fill({
    subject: anschreibenSubject(tenant, label),
    opening: buildDynamicOpening(story, foundation, label ?? ''),
    closing: story.anschreibenTemplate(foundation.type).closing,
    themeAlignment: buildThemeAlignment(story, foundation, themeMetadata),
  });
}

export function composeGesuchDokument(
  story: TenantStory,
  foundation: Foundation,
  schwerpunktId?: SchwerpunktId,
): ComposedGesuchDokument {
  const { tenant } = story;
  const gesuch = composeGesuch(story, foundation, schwerpunktId);
  const themeMetadata = collectThemeMetadata(foundation, schwerpunktId);
  const label = subjectLabel(tenant, themeMetadata);

  const scenario = getScenarioForFoundation(foundation);
  const lineItems = getLineItemsForScenario(scenario.id);
  const requestedAmount = computeRequestedAmount(foundation, scenario);

  const today = new Date();
  const dateStr = formatDateDE(today, tenant.location);

  const coreFacts = story.coreFacts();

  return story.fill({
    ...gesuch,
    anschreiben: {
      date: dateStr,
      foundationAddress: buildFoundationAddress(foundation),
      subject: anschreibenSubject(tenant, label),
      opening: buildDynamicOpening(story, foundation, label ?? ''),
      closing: story.anschreibenTemplate(foundation.type).closing,
      themeAlignment: buildThemeAlignment(story, foundation, themeMetadata),
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
      primaryThemeKey: schwerpunktId ? SCHWERPUNKTE[schwerpunktId].storyThemes[0] : undefined,
    },
    kurzportrait: {
      // Identity rows first — these are the same questions every Swiss
      // Kurzportrait answers, and their values come from the profile. Then
      // the organisation's own figures, which are the part that differs and
      // therefore the part that cannot live here. An empty value means the
      // organisation has not stated that fact, and an unstated fact is left
      // out rather than printed blank.
      facts: [
        { label: 'Name', value: coreFacts.organization.name },
        { label: 'Rechtsform', value: coreFacts.organization.legalForm },
        { label: 'Gegründet', value: String(coreFacts.organization.founded) },
        // The postal address when there is one — a funder wants to know where
        // to write — and otherwise the town, which every organisation has.
        // Reading only the address meant an organisation that had not given
        // one reported no location at all, in a document whose whole purpose
        // is to say who and where you are.
        {
          label: 'Standort',
          value: coreFacts.organization.address || coreFacts.organization.location,
        },
        { label: 'Website', value: coreFacts.organization.website },
        ...story.kurzportraitFacts(),
      ].filter((f) => f.value !== ''),
      activities: coreFacts.activities,
      unique: coreFacts.unique,
    },
    // A tenant with no hosted site of its own gets a relative path rather than
    // one absolute against somebody else's domain — this URL is printed in a
    // Gesuch that goes to a foundation.
    landingPageUrl: tenant.siteUrl
      ? `${tenant.siteUrl.replace(/\/$/, '')}/fundraising/stiftungen/${foundation.slug}/gesuch`
      : `/fundraising/stiftungen/${foundation.slug}/gesuch`,
  });
}
