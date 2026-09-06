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

/** One competency slot — what the organisation can do in a given field. */
function competency(theme: string) {
  return {
    headline: `${TODO}: Was kann {{name}} im Bereich ${theme}?`,
    capabilities: [
      `${TODO}: Eine konkrete Fähigkeit oder Leistung`,
      `${TODO}: Eine weitere — nennen Sie zwei bis vier`,
    ],
  };
}

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
    // Groups and keys are the organisation's own; empty until it states some.
    metrics: {},
    activities: [`${TODO}: Was tut {{name}} konkret? Nennen Sie Ihre Haupttätigkeiten.`],
    unique: [`${TODO}: Was unterscheidet {{name}} von anderen in diesem Feld?`],
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
   * Track record and competencies — prompts, not empty objects.
   *
   * This block was `{}` while the stored shape was checked loosely, and that
   * looked defensible: an organisation with no track record has nothing to say
   * yet. But the composer reads `HOW.track_record.headline` and walks a
   * competency per theme, so `{}` did not compose an empty section — it
   * composed `undefined` into a grant application, on the first document the
   * new customer generated. The schema now requires the structure, and the
   * structure is filled with the questions that produce it.
   */
  HOW: {
    track_record: {
      headline: `${TODO}: Ihre Erfahrung in einem Satz`,
      text: `${TODO}: Was hat {{name}} seit {{founded}} erreicht? Zwei bis drei Sätze, die einer Stiftung zeigen, dass Sie liefern können.`,
      proof_points: [{ label: 'Gegründet', value: '{{founded}}' }],
    },
    technical: competency('Kreislaufwirtschaft'),
    social: competency('soziale Integration'),
    environmental: competency('Klimaschutz'),
    digital: competency('Digitalisierung'),
    bildung: competency('Bildung'),
  },

  /**
   * Projects, citations, anecdotes and photos: empty, and honestly so.
   *
   * Unlike the block above, nothing composes these into a sentence — a Gesuch
   * with no projects renders no project section. They are things an
   * organisation has actually done, there is nothing plausible to pre-fill, and
   * filling them from another customer is the leak this all exists to end.
   */
  PROJECTS: {} as Record<string, unknown>,
  EVIDENCE: {} as Record<string, unknown>,
  ANECDOTES: [] as unknown[],
  PHOTO_SLOTS: [] as unknown[],
  /**
   * Deliberately empty rather than pre-filled with placeholder figures.
   *
   * Every other starter field carries a "[Bitte ergänzen]" marker, because an
   * unfinished sentence reads as unfinished. A number does not: "40%" in a
   * Kurzportrait reads as a measured result whether or not anyone measured it,
   * and this table is the first thing a funder reads. So a new organisation
   * starts with the five identity rows the composer builds from its profile and
   * adds its own figures when it has them.
   */
  KURZPORTRAIT_FACTS: [] as { label: string; value: string }[],
} as const;
