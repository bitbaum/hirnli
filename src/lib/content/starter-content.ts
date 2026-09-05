/**
 * What a new customer's account starts with.
 *
 * The alternative — and the thing this exists to prevent — is copying the first
 * customer's story into the second customer's row. That would make onboarding
 * feel instant and produce grant applications describing an organisation that
 * is not theirs: the same contamination as the code block, moved into the
 * database where it is harder to see.
 *
 * So this is a SKELETON. Every field is present, so the product composes a
 * complete document from day one and nothing 500s on a missing key. Every
 * field is also obviously unfinished, in the tenant's own voice, with
 * `{{placeholders}}` the platform fills from their profile. A funder must never
 * receive this by accident, so the prose says what it is.
 *
 * Written in German because the product is Swiss and the stored locale is `de`;
 * `org_content` is keyed by locale, so a second language is a second row rather
 * than a change here.
 */

const TODO = '[Bitte ergänzen]';

/** The five theme angles a Gesuch can be written from. */
function whySection(theme: string, prompt: string) {
  return {
    headline: `${TODO}: Ihre Kernaussage zum Thema ${theme}`,
    hook: `${prompt} Beschreiben Sie hier in zwei bis drei Sätzen, warum dieses Thema für {{name}} zentral ist.`,
    problem: `${TODO}: Welches Problem adressiert {{name}} in diesem Bereich? Was passiert, wenn niemand handelt?`,
    solution: `${TODO}: Was tut {{name}} konkret dagegen — und was unterscheidet Ihren Ansatz?`,
    evidence: [] as string[],
    metrics: [] as string[],
    call_to_action: `Mit Ihrer Unterstützung kann {{name}} in diesem Bereich mehr erreichen.`,
  };
}

/**
 * The starter `stories` block. Shape mirrors `STORIES_CONTENT` exactly, so the
 * same schema validates both and every consumer works unchanged.
 */
export const STARTER_STORIES = {
  CORE_FACTS: {
    team_size: 1,
    metrics: {},
  },

  GESUCH_TEXT: {
    zusammenfassung_intro: `${TODO}: Ein Satz, der {{name}} und seine Wirkung zusammenfasst. Dieser Text steht zuoberst in jedem Gesuch.`,
    wirkungsmessung: {
      indicators: `${TODO}: Woran misst {{name}} seine Wirkung? Nennen Sie zwei bis drei konkrete Kennzahlen.`,
      sustainability: `${TODO}: Wie trägt sich die Arbeit von {{name}} langfristig, und wofür werden Fördermittel gebraucht?`,
    },
    kurzportrait_subtitle: `{{legalForm}} seit {{founded}} in {{location}}`,
  },

  WHY: {
    klima: whySection('Klimaschutz', 'Klimastiftungen fördern messbare Emissionsminderung.'),
    kreislaufwirtschaft: whySection(
      'Kreislaufwirtschaft',
      'Diese Stiftungen fördern Wiederverwendung statt Neuproduktion.',
    ),
    sozial: whySection(
      'soziale Integration',
      'Diese Stiftungen fördern Teilhabe und Zugang zum Arbeitsmarkt.',
    ),
    bildung: whySection('Bildung', 'Bildungsstiftungen fördern Kompetenz und Zugang zu Wissen.'),
    digital: whySection(
      'Digitalisierung',
      'Diese Stiftungen fördern digitale Teilhabe und Souveränität.',
    ),
  },

  /**
   * Cover-letter openings per foundation type (Robert Schmuki A–D + network).
   * The tone differs by type; the content is the tenant's to write.
   */
  ANSCHREIBEN_TEMPLATES: {
    A: {
      opening: `Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. ${TODO}: Ein Satz dazu, wer {{name}} ist und was Sie von dieser Stiftung erhoffen.`,
      closing:
        'Wir freuen uns auf Ihre Rückmeldung und stehen für ein Gespräch jederzeit zur Verfügung.',
    },
    B: {
      opening: `${TODO}: Was verbindet {{name}} inhaltlich mit dieser Stiftung? Formulieren Sie die Gemeinsamkeit in einem Satz.`,
      closing:
        'Wir würden uns über ein persönliches Gespräch freuen, um unsere Arbeit und mögliche Synergien vorzustellen.',
    },
    C: {
      opening: `${TODO}: Eine kurze, sachliche Vorstellung von {{name}} und dem Anliegen dieses Gesuchs.`,
      closing: 'Für Rückfragen stehen wir Ihnen gerne zur Verfügung.',
    },
    D: {
      opening: `${TODO}: Eine knappe Vorstellung von {{name}} — diese Stiftung erwartet Kürze.`,
      closing: 'Besten Dank für Ihre Prüfung.',
    },
    network: {
      opening: `${TODO}: Worauf können Sie sich beziehen — eine gemeinsame Bekanntschaft, ein Anlass, eine Empfehlung?`,
      closing: 'Gerne stelle ich Ihnen unsere Arbeit persönlich vor.',
    },
  },

  PARTNER_HIGHLIGHTS: [] as unknown[],

  /**
   * The rest of what a Gesuch is composed from. Present and empty rather than
   * absent: the schema requires them, and a missing key would fail validation
   * on the first page the new customer opens — after being told the account
   * was created.
   *
   * Empty is also the honest state. Competencies, projects and citations are
   * things an organisation has done; there is nothing plausible to pre-fill,
   * and filling them from another customer is the leak this all exists to end.
   */
  HOW: {} as Record<string, unknown>,
  PROJECTS: {} as Record<string, unknown>,
  EVIDENCE: {} as Record<string, unknown>,
  ANECDOTES: [] as unknown[],
  PHOTO_SLOTS: [] as unknown[],
} as const;
