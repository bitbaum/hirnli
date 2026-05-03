/**
 * Foundation Contextualization — Narrative text generation from config data
 *
 * Pure functions that transform Foundation config into human-readable narratives.
 * No I/O, no side effects. All text in Swiss German (ss not ss, real umlauts).
 *
 * Used by foundation detail pages and application preparation views to show:
 * - How well a foundation fits Revamp-IT (FitNarrative)
 * - What steps to take for an application (ApproachStep)
 * - Whether we're ready to apply (ReadinessItem)
 * - How each theme connects to our work (ThemeAlignment)
 */

import type { Foundation, ThemeId } from '@/lib/schemas/foundation';
import { isResearched } from './foundation-helpers';
import { THEME_ID_TO_STORY_KEY, WHY } from '@/lib/config/stories';
import { THEMES, APPLICATION_METHOD_LABELS } from '@/lib/config/foundations';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { fitScoreToDisplay } from './fit-scoring';

// ============================================================================
// Types
// ============================================================================

export interface FitNarrative {
  text: string;
  themeOverlaps: number;
  strengthLevel: 'strong' | 'moderate' | 'limited';
}

export interface ApproachStep {
  order: number;
  action: string;
  detail: string;
  timing: string;
  status: 'ready' | 'todo' | 'blocked';
}

export interface ReadinessItem {
  label: string;
  ready: boolean;
  detail: string;
}

export interface ThemeAlignment {
  themeId: ThemeId;
  themeLabel: string;
  icon: string;
  revampConnection: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Extract the first sentence from a text block */
function firstSentence(text: string | undefined): string {
  if (!text) return '';
  const trimmed = text.trim();
  const dotIndex = trimmed.indexOf('.');
  if (dotIndex === -1) return trimmed;
  return trimmed.slice(0, dotIndex + 1);
}

/** Determine strength level from fitScore (0-10) via domain engine thresholds */
function fitToStrength(fitScore: number): 'strong' | 'moderate' | 'limited' {
  const level = fitScoreToDisplay(fitScore, false);
  if (level === 3) return 'strong';
  if (level >= 2) return 'moderate';
  return 'limited';
}

// ============================================================================
// 1. generateFitNarrative
// ============================================================================

export function generateFitNarrative(foundation: Foundation): FitNarrative {
  const overlaps = foundation.themes.length;
  const strengthLevel = fitToStrength(foundation.fitScore);
  const purposeFirst = firstSentence(foundation.purposeSummary) || 'Ihr Stiftungszweck';
  const overlappingLabels = foundation.themes.map((id) => THEMES[id].label);

  let text: string;

  switch (strengthLevel) {
    case 'strong': {
      const themeList = overlappingLabels.join(', ');
      text = `Die ${foundation.name} und ${ORG_PROFILE.name} teilen ${overlaps} thematische Schwerpunkte. ${purposeFirst} deckt sich eng mit unserer Arbeit in ${themeList}. Eine Partnerschaft bietet starkes Synergiepotenzial.`;
      break;
    }
    case 'moderate': {
      const bestLabel = overlappingLabels[0] ?? '';
      text = `Mit ${overlaps} thematischen Berührungspunkten bietet sich ein gezielter Ansatz. ${purposeFirst} Besonders im Bereich ${bestLabel} sehen wir Anknüpfungspunkte.`;
      break;
    }
    case 'limited': {
      const bestLabel = overlappingLabels[0] ?? '';
      text = `Obwohl die thematische Überschneidung begrenzt ist, gibt es im Bereich ${bestLabel} einen spezifischen Ansatzpunkt. ${purposeFirst}`;
      break;
    }
  }

  return { text, themeOverlaps: overlaps, strengthLevel };
}

// ============================================================================
// 2. generateApproachSteps
// ============================================================================

export function generateApproachSteps(foundation: Foundation): ApproachStep[] {
  const steps: ApproachStep[] = [];
  let order = 1;

  // Step 1: Prepare application — level >= 2 (moderate or strong fit)
  const canPrepare = fitScoreToDisplay(foundation.fitScore, false) >= 2 && foundation.themes.length > 0;
  steps.push({
    order: order++,
    action: 'Gesuch vorbereiten',
    detail: canPrepare
      ? 'Gesuch mit passenden Schwerpunkten zusammenstellen'
      : 'Vor dem Gesuch weitere Recherche empfohlen',
    timing: canPrepare ? 'Sofort möglich' : 'Nach Recherche',
    status: canPrepare ? 'ready' : 'todo',
  });

  // Step 2: Submission method
  const method = foundation.applicationMethod;
  switch (method) {
    case 'email':
      steps.push({
        order: order++,
        action: 'Per E-Mail einreichen',
        detail: foundation.contact?.email
          ? `Gesuch an ${foundation.contact.email} senden`
          : 'E-Mail-Adresse noch recherchieren',
        timing: 'Nach Fertigstellung des Gesuchs',
        status: foundation.contact?.email ? 'ready' : 'blocked',
      });
      break;
    case 'online':
      steps.push({
        order: order++,
        action: 'Online-Formular ausfüllen',
        detail: foundation.applicationUrl
          ? 'Gesuch über das Online-Portal einreichen'
          : 'URL des Online-Formulars noch recherchieren',
        timing: 'Nach Fertigstellung des Gesuchs',
        status: foundation.applicationUrl ? 'ready' : 'blocked',
      });
      break;
    case 'post':
      steps.push({
        order: order++,
        action: 'Per Post senden',
        detail: foundation.contact?.address
          ? 'Gesuch per Post an die Stiftungsadresse senden'
          : 'Postadresse noch recherchieren',
        timing: 'Nach Fertigstellung und Druck',
        status: foundation.contact?.address ? 'ready' : 'blocked',
      });
      break;
    case 'contact':
    case 'personal':
      steps.push({
        order: order++,
        action: 'Persönlichen Kontakt herstellen',
        detail: 'Zuerst Beziehung aufbauen, dann Gesuch nachreichen',
        timing: '2-4 Wochen vor dem Gesuch',
        status: 'todo',
      });
      break;
    case 'partnership':
    case 'via_partner':
      steps.push({
        order: order++,
        action: 'Über Partner einreichen',
        detail: foundation.possiblePartners?.length
          ? `Mögliche Partner: ${foundation.possiblePartners.join(', ')}`
          : 'Partner für die Einreichung identifizieren',
        timing: 'Partnersuche einplanen',
        status: 'todo',
      });
      break;
    default:
      steps.push({
        order: order++,
        action: 'Bewerbungsweg klären',
        detail: 'Bewerbungsmethode konnte nicht automatisch bestimmt werden',
        timing: 'Vor der Einreichung recherchieren',
        status: 'blocked',
      });
      break;
  }

  // Step 3: Deadline (only if deadline info exists)
  if (foundation.deadline || foundation.deadlineText) {
    const deadlineDisplay = foundation.deadlineText || foundation.deadline || '';
    const isUpcoming = foundation.deadline
      ? new Date(foundation.deadline) > new Date()
      : true;

    steps.push({
      order: order++,
      action: `Vor ${deadlineDisplay} einreichen`,
      detail: foundation.deadline
        ? `Frist: ${deadlineDisplay}`
        : `Fristen: ${deadlineDisplay}`,
      timing: deadlineDisplay,
      status: isUpcoming ? 'ready' : 'todo',
    });
  }

  // Step 4: Follow up
  steps.push({
    order: order++,
    action: 'Nachfassen nach 6 Wochen',
    detail: 'Falls keine Rückmeldung erfolgt, freundlich nachfragen',
    timing: '6 Wochen nach Einreichung',
    status: 'todo',
  });

  return steps;
}

// ============================================================================
// 3. getApplicationReadiness
// ============================================================================

export function getApplicationReadiness(foundation: Foundation): ReadinessItem[] {
  const hasContact = !!(foundation.contact?.email || foundation.contact?.address);
  const hasApplicationUrl = !!foundation.applicationUrl;
  const hasThemeMatch = foundation.themes.length > 0;
  const hasFrist = !!foundation.deadline || foundation.status === 'rolling';
  const researched = isResearched(foundation);
  const hasMethod = foundation.applicationMethod !== 'unknown';

  return [
    {
      label: 'Kontaktdaten vorhanden',
      ready: hasContact,
      detail: hasContact
        ? 'E-Mail oder Adresse bekannt'
        : 'Kontaktdaten fehlen — auf der Website recherchieren',
    },
    {
      label: 'Bewerbungs-URL bekannt',
      ready: hasApplicationUrl,
      detail: hasApplicationUrl
        ? 'Online-Bewerbungslink vorhanden'
        : 'Kein Online-Formular bekannt',
    },
    {
      label: 'Thematische Übereinstimmung',
      ready: hasThemeMatch,
      detail: hasThemeMatch
        ? `${foundation.themes.length} passende Schwerpunkte identifiziert`
        : 'Keine thematische Überschneidung gefunden',
    },
    {
      label: 'Gesuch generiert',
      ready: true,
      detail: 'Gesuch wird automatisch aus Projektdaten zusammengestellt',
    },
    {
      label: 'Frist bekannt',
      ready: hasFrist,
      detail: hasFrist
        ? foundation.status === 'rolling'
          ? 'Laufende Eingabe — jederzeit möglich'
          : `Nächste Frist: ${foundation.deadlineText || foundation.deadline}`
        : 'Keine Fristinformation vorhanden',
    },
    {
      label: 'Recherche abgeschlossen',
      ready: researched,
      detail: researched
        ? 'Stiftung vollständig recherchiert'
        : 'Weitere Recherche empfohlen (Zweck, Kontakt, Strategie)',
    },
    {
      label: 'Bewerbungsweg bekannt',
      ready: hasMethod,
      detail: hasMethod
        ? `Methode: ${APPLICATION_METHOD_LABELS[foundation.applicationMethod] ?? foundation.applicationMethod}`
        : 'Bewerbungsweg noch unklar',
    },
  ];
}

// ============================================================================
// 4. generateThemeAlignments
// ============================================================================

export function generateThemeAlignments(foundation: Foundation): ThemeAlignment[] {
  return foundation.themes.map((themeId) => {
    const theme = THEMES[themeId];
    const storyKey = THEME_ID_TO_STORY_KEY[themeId];
    return {
      themeId,
      themeLabel: theme.label,
      icon: theme.icon,
      revampConnection: firstSentence(WHY[storyKey].solution),
    };
  });
}
