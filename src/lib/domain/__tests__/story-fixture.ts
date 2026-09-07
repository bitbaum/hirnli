/**
 * A complete story block for an organisation that does not exist.
 *
 * The suite used to compose its Gesuche from `src/lib/config/stories.ts` — a
 * real customer's actual prose, its actual partners, its actual measured
 * figures. That was convenient and wrong in a specific way: the tests asserted
 * things about one customer, so they passed or failed for reasons that had
 * nothing to do with the product, and the customer's content could not be
 * deleted from the repository while the tests depended on it.
 *
 * Lesewerk is invented. It reads at the same density as a real block — five
 * themes, five cover-letter types, projects with citations, an anecdote, a
 * partner — because a thin fixture would not exercise composition. It carries
 * `{{placeholders}}` for the same reason: filling them is the behaviour under
 * test.
 *
 * Nothing here should ever be seeded anywhere. It is a fixture.
 */

const FOUNDED = '{{founded}}';

function why(
  headline: string,
  hook: string,
  problem: string,
  solution: string,
  evidence: string[],
) {
  return {
    headline,
    hook,
    problem,
    solution,
    evidence,
    metrics: [],
    call_to_action: `Mit Ihrer Unterstützung erreicht {{name}} mehr Menschen.`,
  };
}

function competency(headline: string, capabilities: string[]) {
  return { headline, capabilities };
}

export const LESEWERK_STORY = {
  CORE_FACTS: {
    team_size: 4,
    metrics: {
      reach: { participants_total: '600+', course_hours: '2400' },
    },
    activities: [
      'Lesekurse für Erwachsene',
      'Lernbegleitung in Quartiertreffs',
      'Ausbildung freiwilliger Lernbegleitender',
    ],
    unique: [
      `Seit ${FOUNDED} durchgehend im selben Quartier`,
      'Kurse am Abend und am Wochenende, weil Teilnehmende arbeiten',
    ],
  },

  GESUCH_TEXT: {
    zusammenfassung_intro:
      '{{name}} begleitet Erwachsene, die nicht sicher lesen und schreiben, in kleinen Gruppen und im eigenen Tempo.',
    wirkungsmessung: {
      indicators:
        '{{name}} erhebt Kursstunden, Teilnehmendenzahl und den Anteil, der nach einem Jahr noch dabei ist.',
      sustainability: `Kursbeiträge decken einen Teil; Stiftungsmittel tragen die Lernbegleitung seit ${FOUNDED}.`,
    },
    kurzportrait_subtitle:
      '{{legalForm}} seit {{founded}} in {{location}} — Grundbildung Erwachsene',
  },

  WHY: {
    bildung: why(
      'Lesen ist die Voraussetzung für alles Weitere',
      'Wer als Erwachsener nicht sicher liest, verbirgt es — und bleibt allein damit.',
      'Grundbildungsangebote sind selten am Abend und fast nie kostenlos, also erreichen sie die nicht, die sie brauchen.',
      '{{name}} unterrichtet in kleinen Gruppen, abends, im Quartier, mit ausgebildeten Freiwilligen.',
      ['unesco_literacy'],
    ),
    sozial: why(
      'Ohne Schrift kein Zugang',
      'Ein Formular entscheidet, ob jemand eine Wohnung bekommt.',
      'Fehlende Schriftsprache schliesst von Behörden, Verträgen und Arbeit aus, lange bevor es auffällt.',
      '{{name}} übt an den Texten, die im Alltag wirklich vorkommen.',
      [],
    ),
    digital: why(
      'Digitale Formulare sind auch Texte',
      'Der Gang zum Amt ist heute ein Login.',
      'Digitalisierung verschiebt Hürden, sie beseitigt sie nicht — wer nicht liest, scheitert jetzt online.',
      '{{name}} verbindet Lesekurse mit dem, was ein Konto und ein Antrag verlangen.',
      [],
    ),
    klima: why(
      'Information erreicht nicht alle gleich',
      'Merkblätter setzen Lesefähigkeit voraus.',
      'Wer Hinweise nicht lesen kann, kann ihnen nicht folgen — auch nicht bei Hitze oder Energiekosten.',
      '{{name}} arbeitet mit einfacher Sprache an Themen, die den Alltag verteuern.',
      [],
    ),
    kreislaufwirtschaft: why(
      'Weitergeben statt wegwerfen, auch bei Büchern',
      'Ein Buch, das niemand liest, ist kein Buch.',
      'Lehrmittel werden ersetzt und entsorgt, während Kurse zu wenig Material haben.',
      '{{name}} sammelt Lehrmittel ein und gibt sie an Kursgruppen weiter.',
      [],
    ),
  },

  HOW: {
    track_record: {
      headline: `Seit ${FOUNDED} im Quartier`,
      text: `{{name}} unterrichtet seit {{founded}} durchgehend, {{teamSize}} Personen im Kernteam, getragen von Freiwilligen.`,
      proof_points: [
        { label: 'Gegründet', value: '{{founded}}' },
        { label: 'Kursgruppen pro Woche', value: '6' },
      ],
    },
    bildung: competency('Grundbildung für Erwachsene', [
      'Kurse in Gruppen von höchstens sechs Personen',
      'Ausbildung und Begleitung freiwilliger Lernbegleitender',
    ]),
    social: competency('Zugang schaffen', [
      'Anmeldung ohne Formular, auf Zuruf im Quartiertreff',
      'Kursorte, die zu Fuss erreichbar sind',
    ]),
    digital: competency('Digitale Grundfertigkeiten', [
      'Üben an echten Behördenportalen',
      'Begleitung beim ersten eigenen Konto',
    ]),
    technical: competency('Lehrmittel im Umlauf', [
      'Sammlung und Aufbereitung gespendeter Lehrmittel',
    ]),
    environmental: competency('Einfache Sprache für Alltagsthemen', [
      'Merkblätter zu Energie und Hitze in einfacher Sprache',
    ]),
  },

  ANSCHREIBEN_TEMPLATES: {
    A: {
      opening:
        'Wir erlauben uns, Ihnen ein Fördergesuch einzureichen. {{name}} begleitet Erwachsene in der Grundbildung.',
      closing: 'Wir freuen uns auf Ihre Rückmeldung.',
    },
    B: {
      opening: 'Grundbildung entscheidet über Zugang. Genau dort setzt {{name}} an.',
      closing: 'Über ein Gespräch würden wir uns freuen.',
    },
    C: {
      opening: '{{name}} ist {{legalForm}} in {{location}} und unterrichtet Erwachsene im Lesen.',
      closing: 'Für Rückfragen stehen wir gerne zur Verfügung.',
    },
    D: {
      opening: '{{name}} misst Kursstunden, Teilnehmende und Verbleib — und legt beides offen.',
      closing: 'Besten Dank für Ihre Prüfung.',
    },
    network: {
      opening: 'Auf Empfehlung hin stellen wir Ihnen {{name}} kurz vor.',
      closing: 'Gerne stelle ich unsere Arbeit persönlich vor.',
    },
  },

  PARTNER_HIGHLIGHTS: [
    {
      name: 'Quartiertreff Nordfeld',
      relationship: 'Stellt Räume und vermittelt Teilnehmende, die sonst niemanden fragen würden.',
      since: 'seit {{founded}}',
    },
  ],

  PROJECTS: {
    abendkurse: {
      title: 'Abendkurse Grundbildung',
      subtitle: 'Sechs Gruppen pro Woche',
      summary: 'Lesekurse am Abend, in Gruppen von höchstens sechs Personen.',
      goals: ['Mehr Kursplätze am Abend'],
      activities: ['Kursleitung', 'Ausbildung Freiwilliger'],
      outcomes: ['Teilnehmende bewältigen Alltagstexte selbständig'],
      budget_category: 'programs',
      themes: ['bildung', 'sozial', 'digital', 'klima', 'kreislaufwirtschaft'],
    },
  },

  EVIDENCE: {
    literacy: {
      unesco_literacy: {
        title: 'UNESCO Global Education Monitoring Report',
        year: 2024,
        claim: 'Grundbildung Erwachsener wirkt auf Gesundheit, Einkommen und Teilhabe',
        url: 'https://www.unesco.org/gem-report/',
      },
    },
  },

  ANECDOTES: [
    {
      id: 'erster_brief',
      template: 'Eine Teilnehmerin las nach acht Monaten zum ersten Mal einen Brief ohne Hilfe.',
      themes: ['bildung', 'sozial'],
      placement: 'why' as const,
    },
  ],

  PHOTO_SLOTS: [
    {
      id: 'kursraum',
      description: 'Kursgruppe im Quartiertreff, Blick über die Schulter auf ein Arbeitsblatt',
      placement: 'why' as const,
      themes: ['bildung'],
    },
  ],

  KURZPORTRAIT_FACTS: [
    { label: 'Kursgruppen pro Woche', value: '6' },
    { label: 'Kernteam', value: '{{teamSize}} Personen' },
  ],
};
