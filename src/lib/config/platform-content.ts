/**
 * Platform product page — bilingual content SSOT (de/en)
 *
 * The typed dictionary IS the i18n foundation: both locales must satisfy
 * PlatformContent, so a missing translation is a compile error, not a
 * silent gap. Rendered by src/components/platform/* on /plattform (de)
 * and /en/platform (en).
 *
 * Funnel numbers are NEVER written here — they are computed at build time
 * from STIFTUNGEN_DATA (see PlatformPageView). Market numbers are external
 * facts and carry their source (Stiftungsreport 2025/2026, SwissFoundations
 * & CEPS Universität Basel).
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';

export type PlatformLocale = 'de' | 'en';

interface Cta {
  label: string;
  href: string;
}

interface TitledText {
  title: string;
  description: string;
}

export type RoadmapStatus = 'live' | 'progress' | 'target';

export interface RoadmapPhase {
  name: string;
  timeframe: string;
  status: RoadmapStatus;
  description: string;
  value: string;
}

export interface PlatformContent {
  meta: { title: string; description: string };
  langSwitch: { label: string; href: string };
  hero: {
    overline: string;
    title: string;
    lead: string;
    context: string;
    ctas: Cta[];
  };
  problem: { heading: string; lead: string; sides: { title: string; points: string[] }[] };
  how: { heading: string; lead: string; steps: TitledText[] };
  funnel: {
    heading: string;
    lead: string;
    labels: { universe: string; analyzed: string; actionable: string; gesuchReady: string };
  };
  market: {
    heading: string;
    lead: string;
    stats: { value: string; label: string }[];
    source: string;
  };
  audiences: { heading: string; items: TitledText[] };
  principles: { heading: string; items: TitledText[] };
  roadmap: {
    heading: string;
    lead: string;
    statusLabels: Record<RoadmapStatus, string>;
    valueLabel: string;
    phases: RoadmapPhase[];
    disclaimer: string;
  };
  businessModel: { heading: string; points: string[] };
  seeIt: { heading: string; lead: string; links: (TitledText & { href: string })[] };
  outlook: { heading: string; body: string; ctaLabel: string };
}

const MARKET_SOURCE =
  'Stiftungsreport 2025/2026 — SwissFoundations & CEPS Universität Basel (swissfoundations.ch/stiftungssektor/zahlen-fakten)';

// ---------------------------------------------------------------------------
// Deutsch
// ---------------------------------------------------------------------------

const de: PlatformContent = {
  meta: {
    title: 'Die Plattform',
    description:
      'Was diese Fundraising-Plattform ist, wie sie funktioniert, für wen sie gebaut wurde — und wann sie für weitere Organisationen offen ist.',
  },
  langSwitch: { label: 'English', href: '/en/platform' },
  hero: {
    overline: 'Die Plattform',
    title: 'Die richtigen Stiftungen finden. Mit Belegen überzeugen.',
    lead: `Eine Fundraising-Intelligence-Plattform: Sie durchsucht das gesamte Schweizer Stiftungswesen (${SWISS_FOUNDATIONS_DISPLAY} Einträge), findet die Förderstiftungen, die wirklich passen, und generiert für jede ein massgeschneidertes, belegbares Gesuch — in Minuten statt Tagen.`,
    context: `Entwickelt von und für ${ORG_PROFILE.name} — als erste Organisation auf der Plattform.`,
    ctas: [
      { label: 'Stiftungen durchsuchen', href: '/fundraising/stiftungen' },
      { label: 'Roadmap ansehen', href: '#roadmap' },
    ],
  },
  problem: {
    heading: 'Das Problem',
    lead: 'Stiftungsfundraising ist ein beidseitiges Informationsproblem.',
    sides: [
      {
        title: 'Für gemeinnützige Organisationen',
        points: [
          `${SWISS_FOUNDATIONS_DISPLAY} Stiftungen in der Schweiz — welche fördern was Sie tun? Die Recherche ist wochenlange Handarbeit.`,
          'Ohne Recherche bleibt nur das Giesskannen-Gesuch: dieselbe Vorlage an alle.',
          'Kleine Teams haben weder Zeit noch Budget für professionelle Fundraising-Recherche.',
        ],
      },
      {
        title: 'Für Förderstiftungen',
        points: [
          'Hunderte Gesuche pro Jahr — die meisten generisch, viele passen gar nicht zum Förderzweck.',
          'Gute Projekte gehen unter, weil das Gesuch den Fit nicht zeigt.',
          'Prüfen kostet Zeit: unbelegte Zahlen, fehlende Quellen, kein Kontext.',
        ],
      },
    ],
  },
  how: {
    heading: 'Wie es funktioniert',
    lead: 'Fünf Stufen — von der Rohliste zum unterschriftsreifen Dokument.',
    steps: [
      {
        title: 'Erfassen',
        description: `Das gesamte Schweizer Stiftungsregister (Zefix, ESA) wird eingelesen und dedupliziert — ${SWISS_FOUNDATIONS_DISPLAY} Einträge als Ausgangsbasis, laufend aktualisiert.`,
      },
      {
        title: 'Triagieren',
        description:
          'Ein Sprachmodell bewertet jeden Stiftungszweck: Passt die Stiftung thematisch, geografisch und vom Zugang her? Ergebnis: Fit-Score (0–10) und Priorität (P1–P4) für jede aktive Stiftung.',
      },
      {
        title: 'Recherchieren',
        description:
          'Vielversprechende Kandidaten werden vertieft recherchiert: Website, Förderbeträge, Fristen, bisherige Vergabungen, Kontaktwege. Automatisch Erratenes ist verboten — Kontaktdaten gelten erst nach Verifikation.',
      },
      {
        title: 'Präsentieren',
        description:
          'Jede recherchierte Stiftung erhält eine eigene Profilseite mit Fit-Analyse: Warum passen wir zueinander? Die Seite ist zugleich Arbeitsinstrument und Präsentation gegenüber der Stiftung.',
      },
      {
        title: 'Generieren',
        description:
          'Pro Stiftung entsteht auf Knopfdruck ein komplettes Bewerbungspaket: vierseitiges Gesuch als PDF, Anschreiben, One-Pager, Pitch-Deck und eine teilbare Web-Seite — im Ton auf den Stiftungstyp abgestimmt, im Inhalt auf deren Förderzweck.',
      },
    ],
  },
  funnel: {
    heading: 'Der Trichter — live',
    lead: 'Diese Zahlen kommen direkt aus der Datenbank, nicht aus einer Broschüre.',
    labels: {
      universe: 'Stiftungen im Schweizer Register',
      analyzed: 'analysiert und bewertet',
      actionable: 'priorisierte Kandidaten (P1–P3)',
      gesuchReady: 'fertige Gesuch-Seiten',
    },
  },
  market: {
    heading: 'Der Markt',
    lead: 'Die Schweiz hat die höchste Stiftungsdichte Europas — und kein Werkzeug, das Organisationen systematisch zu den passenden Förderern führt.',
    stats: [
      { value: "13'782", label: 'aktive gemeinnützige Stiftungen (Ende 2025)' },
      { value: 'CHF 159,6 Mrd.', label: 'kumuliertes Stiftungsvermögen' },
      { value: '~CHF 6 Mrd.', label: 'jährliche Ausschüttungen der Förderstiftungen' },
    ],
    source: `Quelle: ${MARKET_SOURCE}`,
  },
  audiences: {
    heading: 'Für wen',
    items: [
      {
        title: 'Gemeinnützige Organisationen',
        description:
          'Vereine und Stiftungen, die auf Fördergelder angewiesen sind, aber kein Fundraising-Team haben. Die Plattform übernimmt Recherche und Dokumentenerstellung — die Organisation behält Urteil und Beziehung.',
      },
      {
        title: 'Fundraising-Profis und Beratende',
        description:
          'Die Plattform operationalisiert klassisches Fundraising-Handwerk: Stiftungstypologie (A/B/C/D) mit typgerechter Ansprache, Priorisierung nach Fit und Bereitschaft, sauberes Pipeline-Management statt Excel-Listen.',
      },
      {
        title: 'Förderstiftungen',
        description:
          'Indirekt profitieren auch die Stiftungen: Sie erhalten Gesuche, die ihren Förderzweck tatsächlich treffen, mit belegten Zahlen und nachvollziehbaren Quellen — statt Serienbriefe.',
      },
    ],
  },
  principles: {
    heading: 'Die Prinzipien dahinter',
    items: [
      {
        title: 'Jede Zahl belegbar',
        description:
          'Alle Kennzahlen sind bis zur Quelle rückverfolgbar — ein Klick zeigt Herkunft, Formel und Vertrauensniveau. Keine Blackbox, keine Schönfärberei.',
      },
      {
        title: 'KI triagiert, Menschen entscheiden',
        description:
          'Das Sprachmodell übernimmt die Fleissarbeit (Tausende Zweckstexte lesen und vorsortieren). Verifikation, Feinschliff und die Entscheidung, wo eingereicht wird, bleiben Handarbeit.',
      },
      {
        title: 'Fit zeigen statt bitten',
        description:
          'Jedes Gesuch argumentiert aus Sicht der Stiftung: Was hat sie davon? Die Fit-Analyse belegt die Übereinstimmung, bevor um Geld gebeten wird.',
      },
    ],
  },
  roadmap: {
    heading: 'Roadmap',
    lead: 'Von einem Nutzer zur Plattform — in klaren, ehrlichen Etappen.',
    statusLabels: { live: 'Live', progress: 'In Arbeit', target: 'Ziel' },
    valueLabel: 'Wert',
    phases: [
      {
        name: 'Werkzeug beweisen',
        timeframe: 'Q3 2026 — jetzt',
        status: 'progress',
        description: `${ORG_PROFILE.name} reicht die ersten priorisierten Gesuche ein (P1-Stiftungen). Jede Rückmeldung fliesst zurück in Scoring und Textbausteine.`,
        value: 'Belegte Erfolgsquote statt Behauptung — die Fallstudie, die alles Weitere trägt.',
      },
      {
        name: 'Zweite Organisation',
        timeframe: 'Q4 2026',
        status: 'target',
        description:
          'Eine zweite gemeinnützige Organisation wird manuell aufgenommen (dokumentiertes Onboarding: Kontext-Dokumente rein, organisationsspezifische Analyse raus).',
        value:
          'Beweis der Architektur: Das Stiftungsregister wird einmal recherchiert und dient allen — jede weitere Organisation startet mit dem vollen, verifizierten Datenbestand.',
      },
      {
        name: 'Mandantenfähige Plattform',
        timeframe: '1. Halbjahr 2027',
        status: 'target',
        description:
          'Organisations-Konten mit eigener Anmeldung, strikt getrennte Daten (org_id ist bereits heute in jeder Tabelle), Self-Service-Onboarding, vollständige Zweisprachigkeit DE/EN.',
        value:
          'Aus dem internen Werkzeug wird ein Produkt: Jede Schweizer Non-Profit-Organisation kann sich anmelden und am selben Tag mit priorisierten Stiftungen arbeiten.',
      },
      {
        name: 'Das Netzwerk',
        timeframe: 'ab 2027',
        status: 'target',
        description:
          'Einreichungs-Ergebnisse (Zusagen, Absagen, Begründungen) fliessen anonymisiert ins Scoring zurück. Perspektivisch: eine Schnittstelle für Stiftungen selbst.',
        value:
          'Je mehr Organisationen einreichen, desto präziser weiss die Plattform, welche Stiftung was fördert — ein Datenvorsprung, der mit jedem Gesuch wächst.',
      },
    ],
    disclaimer:
      'Zeithorizonte sind Ziele, keine Versprechen — sie verschieben sich, wenn Phase 1 etwas anderes lehrt.',
  },
  businessModel: {
    heading: 'Geschäftsmodell',
    points: [
      `Heute: internes Werkzeug von ${ORG_PROFILE.name} — kostenlos, am eigenen Fundraising geschärft.`,
      'Ab Mandantenfähigkeit: Abonnement pro Organisation für Analyse-Ebene, Dokumenten-Generierung und Pipeline — das recherchierte Stiftungsregister bleibt gemeinsame Basis.',
      'Später: Zusatzleistungen wie begleitete Recherche, Beratungs-Integrationen und Auswertungen für Stiftungen.',
    ],
  },
  seeIt: {
    heading: 'Selbst ansehen',
    lead: 'Die Plattform ist live — alle Bereiche sind offen zugänglich.',
    links: [
      {
        href: '/fundraising/stiftungen',
        title: 'Stiftungen durchsuchen',
        description: 'Die bewertete Datenbank mit Filtern, Fit-Scores und Prioritäten.',
      },
      {
        href: '/fundraising/stiftungen/mercator/gesuch',
        title: 'Ein Gesuch entstehen sehen',
        description: 'Beispiel Mercator Stiftung: vom Schwerpunkt zum fertigen Dokument in drei Schritten.',
      },
      {
        href: '/fundraising/scoring-methodik',
        title: 'Die Methodik prüfen',
        description: 'Wie Fit, Bereitschaft und Priorität berechnet werden — offengelegt.',
      },
    ],
  },
  outlook: {
    heading: 'Heute eine Organisation — gebaut für viele',
    body: `Die Plattform trennt sauber zwischen dem universellen Stiftungsregister und der organisationsspezifischen Analyse (Fit-Scores, Erzählbausteine, Budgets). ${ORG_PROFILE.name} ist die erste Organisation, die damit arbeitet; die Architektur ist von Anfang an dafür gebaut, weitere aufzunehmen.`,
    ctaLabel: 'Interesse an der Plattform für Ihre Organisation?',
  },
};

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

const en: PlatformContent = {
  meta: {
    title: 'The Platform',
    description:
      'A fundraising intelligence platform: from the Swiss foundation register to a submission-ready grant application in minutes — and a roadmap to multi-tenant.',
  },
  langSwitch: { label: 'Deutsch', href: '/plattform' },
  hero: {
    overline: 'The Platform',
    title: 'Find the right foundations. Apply with evidence.',
    lead: `A fundraising intelligence platform: it screens Switzerland's entire foundation register (${SWISS_FOUNDATIONS_DISPLAY} entries), surfaces the grant-makers that actually fit, and generates a tailored, evidence-backed application for each one — in minutes instead of days.`,
    context: `Built by and for ${ORG_PROFILE.name} — the first organization on the platform.`,
    ctas: [
      { label: 'Browse the foundation database', href: '/fundraising/stiftungen' },
      { label: 'See the roadmap', href: '#roadmap' },
    ],
  },
  problem: {
    heading: 'The problem',
    lead: 'Foundation fundraising is an information problem — on both sides.',
    sides: [
      {
        title: 'For nonprofits',
        points: [
          `${SWISS_FOUNDATIONS_DISPLAY} foundations in Switzerland — which ones fund what you do? Finding out is weeks of manual research.`,
          'Without research, the only option is the mail-merge application: the same template to everyone.',
          'Small teams have neither the time nor the budget for professional fundraising research.',
        ],
      },
      {
        title: 'For grant-making foundations',
        points: [
          "Hundreds of applications a year — most generic, many entirely outside the foundation's purpose.",
          "Good projects get lost because the application never demonstrates fit.",
          'Reviewing costs time: unsourced numbers, missing evidence, no context.',
        ],
      },
    ],
  },
  how: {
    heading: 'How it works',
    lead: 'Five stages — from raw register to a signature-ready document.',
    steps: [
      {
        title: 'Ingest',
        description: `The entire Swiss foundation register (Zefix, ESA) is imported and deduplicated — ${SWISS_FOUNDATIONS_DISPLAY} entries as the base, continuously refreshed.`,
      },
      {
        title: 'Triage',
        description:
          'A language model reads every foundation purpose statement: does it fit thematically, geographically, and in terms of access? Output: a fit score (0–10) and a priority (P1–P4) for every active foundation.',
      },
      {
        title: 'Research',
        description:
          'Promising candidates get deep research: website, grant ranges, deadlines, past grantees, contact channels. Auto-guessing is banned — contact data only counts once verified.',
      },
      {
        title: 'Present',
        description:
          'Every researched foundation gets its own profile page with a fit analysis: why do we match? The page doubles as internal working tool and presentation to the foundation.',
      },
      {
        title: 'Generate',
        description:
          'One click per foundation produces a complete application package: four-page grant application PDF, cover letter, one-pager, pitch deck, and a shareable web page — tone matched to the foundation type, content matched to its funding purpose.',
      },
    ],
  },
  funnel: {
    heading: 'The funnel — live',
    lead: 'These numbers come straight from the database, not from a brochure.',
    labels: {
      universe: 'foundations in the Swiss register',
      analyzed: 'analyzed and scored',
      actionable: 'prioritized candidates (P1–P3)',
      gesuchReady: 'application pages generated',
    },
  },
  market: {
    heading: 'The market',
    lead: 'Switzerland has the highest foundation density in Europe — and no tool that systematically routes organizations to the right funders.',
    stats: [
      { value: '13,782', label: 'active charitable foundations (end of 2025)' },
      { value: 'CHF 159.6bn', label: 'cumulative foundation assets' },
      { value: '~CHF 6bn', label: 'distributed by grant-making foundations per year' },
    ],
    source: `Source: ${MARKET_SOURCE}`,
  },
  audiences: {
    heading: 'Who it serves',
    items: [
      {
        title: 'Nonprofits',
        description:
          'Organizations that depend on grants but have no fundraising team. The platform handles research and document generation — the organization keeps judgment and the relationship.',
      },
      {
        title: 'Fundraising professionals',
        description:
          'The platform operationalizes classic fundraising craft: a foundation typology (A/B/C/D) with type-appropriate tone, prioritization by fit and readiness, and clean pipeline management instead of spreadsheets.',
      },
      {
        title: 'Grant-making foundations',
        description:
          'Foundations benefit indirectly: they receive applications that actually match their purpose, with sourced numbers and verifiable evidence — instead of mail merges.',
      },
    ],
  },
  principles: {
    heading: 'Principles',
    items: [
      {
        title: 'Every number traceable',
        description:
          'Every metric on the platform traces back to its source — one click shows origin, formula, and confidence level. No black boxes, no window dressing.',
      },
      {
        title: 'AI triages, humans decide',
        description:
          'The language model does the grunt work (reading thousands of purpose statements and pre-sorting). Verification, final editing, and the decision where to submit stay human.',
      },
      {
        title: 'Show fit, don’t beg',
        description:
          'Every application argues from the foundation’s perspective: what do they gain? The fit analysis proves the match before any money is asked for.',
      },
    ],
  },
  roadmap: {
    heading: 'Roadmap',
    lead: 'From one user to a platform — in clear, honest stages.',
    statusLabels: { live: 'Live', progress: 'In progress', target: 'Target' },
    valueLabel: 'Value',
    phases: [
      {
        name: 'Prove the tool',
        timeframe: 'Q3 2026 — now',
        status: 'progress',
        description: `${ORG_PROFILE.name} submits the first prioritized applications (P1 foundations). Every response feeds back into scoring and copy.`,
        value: 'A documented win rate instead of a claim — the case study that carries everything after it.',
      },
      {
        name: 'Second organization',
        timeframe: 'Q4 2026',
        status: 'target',
        description:
          'A second nonprofit is onboarded manually (documented playbook: context documents in, organization-specific analysis out).',
        value:
          'Proof of the architecture: the foundation register is researched once and serves everyone — each new organization starts with the full, verified dataset.',
      },
      {
        name: 'Multi-tenant platform',
        timeframe: 'H1 2027',
        status: 'target',
        description:
          'Organization accounts with their own login, strictly separated data (org_id already exists on every table today), self-serve onboarding, full DE/EN bilingual product.',
        value:
          'The internal tool becomes a product: any Swiss nonprofit can sign up and work with prioritized foundations the same day.',
      },
      {
        name: 'The network',
        timeframe: '2027+',
        status: 'target',
        description:
          'Submission outcomes (approvals, rejections, reasons) flow back into scoring, anonymized. Eventually: an interface for foundations themselves.',
        value:
          'Every application makes the platform smarter about which foundation funds what — a data advantage that compounds with each submission.',
      },
    ],
    disclaimer: 'Timeframes are targets, not promises — they move if phase 1 teaches us something different.',
  },
  businessModel: {
    heading: 'Business model',
    points: [
      `Today: ${ORG_PROFILE.name}’s internal tool — free, sharpened on our own fundraising.`,
      'From multi-tenancy: a per-organization subscription covering the analysis layer, document generation, and pipeline — the researched foundation register stays a shared base.',
      'Later: added services such as assisted research, consultant integrations, and analytics for foundations.',
    ],
  },
  seeIt: {
    heading: 'See it yourself',
    lead: 'The platform is live — every area is openly accessible.',
    links: [
      {
        href: '/fundraising/stiftungen',
        title: 'Browse foundations',
        description: 'The scored database with filters, fit scores, and priorities. (German UI)',
      },
      {
        href: '/fundraising/stiftungen/mercator/gesuch',
        title: 'Watch an application take shape',
        description: 'Example Mercator Foundation: from focus area to finished document in three steps. (German UI)',
      },
      {
        href: '/fundraising/scoring-methodik',
        title: 'Inspect the methodology',
        description: 'How fit, readiness, and priority are computed — fully disclosed. (German UI)',
      },
    ],
  },
  outlook: {
    heading: 'One organization today — built for many',
    body: `The platform cleanly separates the universal foundation register from organization-specific analysis (fit scores, narrative building blocks, budgets). ${ORG_PROFILE.name} is the first organization working with it; the architecture was built from day one to take on more.`,
    ctaLabel: 'Interested in the platform for your organization?',
  },
};

export const PLATFORM_CONTENT: Record<PlatformLocale, PlatformContent> = { de, en };

/** Contact target for the platform CTA (shared across locales) */
export const PLATFORM_CONTACT_EMAIL = ORG_PROFILE.fundraisingEmail;
