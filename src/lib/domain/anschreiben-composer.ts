/**
 * Anschreiben Composer — Type-specific cover letter text generation
 *
 * - buildDynamicOpening(): Foundation-type-aware opening paragraph
 * - buildThemeAlignment(): Theme alignment summary for cover letter
 *
 * Every sentence here is assembled from two vocabularies and nothing else: the
 * tenant's profile, and the foundation being written to. That constraint is
 * load-bearing rather than stylistic, and it was not met before.
 *
 * Three of these openings used to describe one organisation's business in plain
 * German — repairing computers that would otherwise be thrown away, combining
 * environmental protection with social integration, working in circular
 * economy, labour integration and digital education. None of those sentences
 * named the organisation, so no search for its name found them, and they were
 * emitted under whichever tenant's letterhead asked for a cover letter. A
 * second customer would have posted a funder a paragraph about a business they
 * are not in, signed with their own name.
 *
 * Now a variant that needs a fact the tenant has not stated does not invent it:
 * it falls back to that tenant's own template opening. Less tailored, and true.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { ThemeMetadata } from '@/lib/schemas/theme';
import type { TenantStory } from '@/lib/content/story-engine';
import { extractPurposeCore } from './bridge-composer';
import { fitScoreToDisplay } from './fit-scoring';

/**
 * Build a type-specific opening paragraph that references foundation purpose.
 *
 * Every personalised variant is built around two things: something concrete to
 * name in the foundation's purpose, and the applicant's own mission to name it
 * against. A tenant that has written neither gets the template opening from its
 * own story block — which is generic, but is at least about them.
 */
export function buildDynamicOpening(
  story: TenantStory,
  foundation: Foundation,
  primaryThemeLabel: string,
): string {
  const { tenant } = story;
  const template = story.anschreibenTemplate(foundation.type).opening;

  const purposeCore = foundation.purposeSummary
    ? extractPurposeCore(foundation.purposeSummary)
    : '';
  const mission = tenant.missionSummary;
  if (!purposeCore || !mission) return template;

  // Lowercase only the first character so adjectives are lowercase but nouns stay capitalized
  // e.g. "Gemeinnütziger Verein" → "gemeinnütziger Verein" (correct German grammar)
  const legalFormLower = tenant.legalForm.charAt(0).toLowerCase() + tenant.legalForm.slice(1);
  const isDeep = foundation.researchDepth === 'deep';
  const highFit = fitScoreToDisplay(foundation.fitScore, false) === 3;

  // Deep research + high fit → lead with specific overlap
  if (isDeep && highFit) {
    return `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${legalFormLower} mit ${tenant.experienceLabel} in der Verbindung von ${mission} möchten wir Ihnen eine konkrete Zusammenarbeit vorschlagen.`;
  }

  // Standard research → broader mission alignment framing
  switch (foundation.type) {
    case 'A':
      return `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. Ihr Engagement für ${purposeCore} deckt sich eng mit unserer Arbeit im Bereich ${primaryThemeLabel}. Als ${legalFormLower} mit ${tenant.experienceLabel} in der Verbindung von ${mission} möchten wir Ihnen eine Zusammenarbeit vorschlagen.`;
    case 'B':
      return `Ihr Engagement für ${purposeCore} hat uns angesprochen. ${tenant.name} arbeitet seit über ${tenant.yearsActive} Jahren an ${mission} — ein Anliegen, das uns mit Ihrer Stiftung verbindet. Wir möchten Ihnen zeigen, wie eine Partnerschaft im Bereich ${primaryThemeLabel} konkret aussehen könnte.`;
    case 'C':
      return `Wir wissen, dass ${purposeCore} Ihnen ein wichtiges Anliegen ist. ${tenant.name} arbeitet in ${tenant.location} an ${mission}. Dürfen wir Ihnen kurz erzählen, was wir im Bereich ${primaryThemeLabel} tun?`;
    case 'D':
      return `Ihr Fokus auf ${purposeCore} zeigt, dass messbare Wirkung für Sie zählt. ${tenant.name} liefert genau das: transparente Impact-Daten zu ${mission} im Bereich ${primaryThemeLabel}.`;
    default:
      return template;
  }
}

/**
 * Generate theme alignment text for the cover letter.
 *
 * The no-matched-themes fallback used to end by listing three fields of work.
 * They were one organisation's fields, printed for every applicant, in the
 * paragraph that claims overlap with the funder's purpose — the worst possible
 * place to be wrong. It now names the applicant's own mission, or claims the
 * overlap without enumerating anything.
 */
export function buildThemeAlignment(
  story: TenantStory,
  foundation: Foundation,
  themeMetadata: ThemeMetadata[],
): string {
  const themeLabels = themeMetadata.map((t) => t.label).join(', ');
  const purposeCore = foundation.purposeSummary
    ? extractPurposeCore(foundation.purposeSummary)
    : '';

  // Named on both sides where possible. A claim of alignment that describes
  // only the funder's half is not a claim about alignment at all — and it was
  // also what let the applicant's half be filled in, once, with one
  // organisation's fields of work for everybody.
  const mission = story.tenant.missionSummary;

  if (themeLabels) {
    const ours = mission ? `unserer Arbeit in ${mission}` : 'unserer Mission';
    return `Unser Projekt adressiert direkt Ihre Förderbereiche: ${themeLabels}. ${
      purposeCore
        ? `Ihr Stiftungszweck — ${purposeCore} — deckt sich eng mit ${ours}.`
        : `Wir sehen eine starke inhaltliche Übereinstimmung zwischen Ihrem Stiftungszweck und ${ours}.`
    }`;
  }

  // No matched themes — fall back to purpose-only alignment
  if (purposeCore) {
    return mission
      ? `Ihr Stiftungszweck — ${purposeCore} — deckt sich direkt mit unserer Mission in den Bereichen ${mission}.`
      : `Ihr Stiftungszweck — ${purposeCore} — deckt sich direkt mit unserer Mission.`;
  }
  return mission
    ? `Unsere Arbeit in den Bereichen ${mission} deckt sich mit Ihrem Stiftungszweck.`
    : `Unsere Arbeit deckt sich mit Ihrem Stiftungszweck.`;
}
