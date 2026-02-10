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
import type { Evidence, WhySection, CompetencySection, Project, CoreFacts, ProofPoint, TrackRecord } from '@/lib/schemas/story';
import {
  composeStory,
  THEME_ID_TO_STORY_KEY,
  THEME_PRIORITY,
  CORE_FACTS,
  BUDGET_LINES,
  BUDGET_TOTAL,
  BUDGET_EIGENLEISTUNG,
  ANSCHREIBEN_TEMPLATES,
} from '@/lib/config/stories';
import { TYPE_LABELS, THEMES } from '@/lib/config/foundations';

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
}

export interface BudgetLine {
  label: string;
  description: string;
  amount: number;
  category: string;
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
    lines: BudgetLine[];
    total: number;
    eigenleistung: { label: string; description: string; amount: number };
    requestedAmount: number;
    projectDuration: string;
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

export function composeGesuch(foundation: Foundation): ComposedGesuch {
  const typeLabel = TYPE_LABELS[foundation.type];
  const mapped = mapFoundationThemes(foundation);

  // Quality gate
  if (foundation.needsResearch || mapped.all.length === 0) {
    const reason = foundation.needsResearch
      ? 'Diese Stiftung benötigt noch weitere Recherche.'
      : 'Keine passenden Themen für die Gesuch-Generierung gefunden.';
    return {
      ready: false,
      readyReason: reason,
      foundation: buildFoundationInfo(foundation),
      themes: { primary: 'klima', secondary: [], all: [] },
      story: { why: undefined, how: { track_record: { headline: '', text: '', proof_points: [] }, competencies: [] }, projects: [], evidence: [] },
      organization: CORE_FACTS,
      approach: { strategy: typeLabel.approach, typeDescription: typeLabel.desc },
    };
  }

  const story = composeStory(mapped.primary, mapped.secondary);

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

/** Compute requested amount based on foundation's typical range */
function computeRequestedAmount(foundation: Foundation): number {
  const max = foundation.amount.max;
  const min = foundation.amount.min;

  if (max && max <= BUDGET_TOTAL) return max;
  if (max && min) return Math.min(Math.round((min + max) / 2), BUDGET_TOTAL);
  if (min) return Math.min(min * 2, BUDGET_TOTAL);
  // Default: ask for the gap between total and eigenleistung
  return BUDGET_TOTAL - BUDGET_EIGENLEISTUNG.amount;
}

/** Build foundation mailing address from contact data */
function buildFoundationAddress(foundation: Foundation): string {
  const parts = [foundation.name];
  if (foundation.contact?.address) parts.push(foundation.contact.address);
  return parts.join('\n');
}

export function composeGesuchDokument(foundation: Foundation): ComposedGesuchDokument {
  const gesuch = composeGesuch(foundation);
  const template = ANSCHREIBEN_TEMPLATES[foundation.type] ?? ANSCHREIBEN_TEMPLATES['A'];
  const themeMetadata = collectThemeMetadata(foundation);
  const requestedAmount = computeRequestedAmount(foundation);

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
      lines: BUDGET_LINES.map((l) => ({
        label: l.label,
        description: l.description,
        amount: l.amount,
        category: l.category,
      })),
      total: BUDGET_TOTAL,
      eigenleistung: BUDGET_EIGENLEISTUNG,
      requestedAmount,
      projectDuration: '12 Monate',
    },
    kurzportrait: {
      facts: [
        { label: 'Name', value: CORE_FACTS.organization.name },
        { label: 'Rechtsform', value: CORE_FACTS.organization.legalForm },
        { label: 'Gegründet', value: String(CORE_FACTS.organization.founded) },
        { label: 'Standort', value: CORE_FACTS.organization.address },
        { label: 'Team', value: `${CORE_FACTS.organization.team_size} Mitarbeitende` },
        { label: 'Website', value: CORE_FACTS.organization.website },
        { label: 'Geschäftsmodell', value: 'Eigenerwirtschaftet — investitionsbereit' },
        { label: 'Praktikant:innen betreut', value: '100+ seit Gründung' },
        { label: 'Wiedereingliederungsquote', value: '~40%' },
        { label: 'CO₂-Einsparung pro Laptop', value: `${CORE_FACTS.metrics.environmental.co2_per_laptop} kg` },
        { label: 'Reuse-Rate', value: `${CORE_FACTS.metrics.environmental.reuse_rate}%` },
      ],
      activities: CORE_FACTS.activities,
      unique: CORE_FACTS.unique,
    },
    landingPageUrl: `https://revamp-info.vercel.app/fundraising/stiftungen/${foundation.slug}/gesuch`,
  };
}
