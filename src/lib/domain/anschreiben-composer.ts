/**
 * Anschreiben Composer — Type-specific cover letter text generation
 *
 * - buildDynamicOpening(): Foundation-type-aware opening paragraph
 * - buildThemeAlignment(): Theme alignment summary for cover letter
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { ThemeMetadata } from '@/lib/schemas/theme';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { ANSCHREIBEN_TEMPLATES } from '@/lib/config/stories';
import { extractPurposeCore } from './bridge-composer';
import { fitScoreToDisplay } from './fit-scoring';

/** Build a type-specific opening paragraph that references foundation purpose */
export function buildDynamicOpening(foundation: Foundation, primaryThemeLabel: string): string {
  const purposeCore = foundation.purposeSummary
    ? extractPurposeCore(foundation.purposeSummary)
    : '';
  const isDeep = foundation.researchDepth === 'deep';
  const highFit = fitScoreToDisplay(foundation.fitScore, false) === 3;

  // Lowercase only the first character so adjectives are lowercase but nouns stay capitalized
  // e.g. "Gemeinnütziger Verein" → "gemeinnütziger Verein" (correct German grammar)
  const legalFormLower = ORG_PROFILE.legalForm.charAt(0).toLowerCase() + ORG_PROFILE.legalForm.slice(1);

  // Deep research + high fit → lead with specific overlap
  if (isDeep && highFit && purposeCore) {
    return `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${legalFormLower} mit ${ORG_PROFILE.experienceLabel} in der Verbindung von ${ORG_PROFILE.missionSummary} möchten wir Ihnen eine konkrete Zusammenarbeit vorschlagen.`;
  }

  // Standard research → broader mission alignment framing
  switch (foundation.type) {
    case 'A':
      return purposeCore
        ? `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${legalFormLower} mit ${ORG_PROFILE.experienceLabel} in der Verbindung von ${ORG_PROFILE.missionSummary} möchten wir Ihnen eine Zusammenarbeit vorschlagen.`
        : ANSCHREIBEN_TEMPLATES['A'].opening;
    case 'B':
      return purposeCore
        ? `Ihr Engagement für ${purposeCore} hat uns angesprochen. ${ORG_PROFILE.name} verbindet seit über ${ORG_PROFILE.yearsActive} Jahren Umweltschutz mit sozialer Integration — ein Anliegen, das uns mit Ihrer Stiftung verbindet. Wir möchten Ihnen zeigen, wie eine Partnerschaft im Bereich ${primaryThemeLabel} konkret aussehen könnte.`
        : ANSCHREIBEN_TEMPLATES['B'].opening;
    case 'C':
      return purposeCore
        ? `Wir wissen, dass ${purposeCore} Ihnen ein wichtiges Anliegen ist. In ${ORG_PROFILE.location} reparieren wir Computer, die sonst im Müll landen würden — und geben gleichzeitig Menschen eine zweite Chance auf dem Arbeitsmarkt. Dürfen wir Ihnen kurz erzählen, was wir im Bereich ${primaryThemeLabel} tun?`
        : ANSCHREIBEN_TEMPLATES['C'].opening;
    case 'D':
      return purposeCore
        ? `Ihr Fokus auf ${purposeCore} zeigt, dass messbare Wirkung für Sie zählt. ${ORG_PROFILE.name} liefert genau das: transparente Impact-Daten zu ${ORG_PROFILE.missionSummary} im Bereich ${primaryThemeLabel}.`
        : ANSCHREIBEN_TEMPLATES['D'].opening;
    default:
      return ANSCHREIBEN_TEMPLATES['A'].opening;
  }
}

/** Generate theme alignment text for the cover letter */
export function buildThemeAlignment(foundation: Foundation, themeMetadata: ThemeMetadata[]): string {
  const themeLabels = themeMetadata.map((t) => t.label).join(', ');
  const purposeCore = foundation.purposeSummary ? extractPurposeCore(foundation.purposeSummary) : '';

  if (themeLabels) {
    return `Unser Projekt adressiert direkt Ihre Förderbereiche: ${themeLabels}. ${
      purposeCore
        ? `Ihr Stiftungszweck — ${purposeCore} — deckt sich eng mit unserer Mission.`
        : 'Wir sehen eine starke inhaltliche Übereinstimmung mit Ihrem Stiftungszweck.'
    }`;
  }
  // No matched themes — fall back to purpose-only alignment
  return purposeCore
    ? `Ihr Stiftungszweck — ${purposeCore} — deckt sich direkt mit unserer Mission in den Bereichen Kreislaufwirtschaft, Arbeitsintegration und digitale Bildung.`
    : `Unsere Arbeit in den Bereichen Kreislaufwirtschaft, Arbeitsintegration und digitale Bildung deckt sich mit Ihrem Stiftungszweck.`;
}
