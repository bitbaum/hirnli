/**
 * /plattform — content SSOT
 *
 * The one page that explains the TOOL itself (not Revamp-IT): what it is,
 * how it works, for whom, and how exactly. Written for outsiders —
 * advisors, consultants, other nonprofits, potential funders of the
 * platform idea.
 *
 * All funnel numbers are computed at build time in page.tsx from
 * STIFTUNGEN_DATA (via computeFunnelStats) — never hardcoded here.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';

export const PLATTFORM_META = {
  title: 'Die Plattform',
  description:
    'Was diese Fundraising-Plattform ist, wie sie funktioniert und für wen sie gebaut wurde: vom Schweizer Stiftungsregister zum massgeschneiderten Gesuch.',
};

export const PLATTFORM_HERO = {
  overline: 'Die Plattform',
  title: 'Vom Stiftungsregister zum fertigen Gesuch',
  lead: `${ORG_PROFILE.platform.name} ist eine Fundraising-Intelligence-Plattform: Sie durchsucht das gesamte Schweizer Stiftungswesen (${SWISS_FOUNDATIONS_DISPLAY} Stiftungen), findet die Förderstiftungen, die wirklich passen, und generiert für jede ein massgeschneidertes, belegbares Gesuch — in Minuten statt Tagen.`,
  context: `Entwickelt von und für ${ORG_PROFILE.name} — als erste Organisation auf der Plattform.`,
};

export const PROBLEM = {
  heading: 'Das Problem',
  lead: 'Stiftungsfundraising ist ein beidseitiges Informationsproblem.',
  sides: [
    {
      title: 'Für gemeinnützige Organisationen',
      points: [
        `${SWISS_FOUNDATIONS_DISPLAY} Stiftungen in der Schweiz — welche davon fördern was Sie tun? Die Recherche ist wochenlange Handarbeit.`,
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
};

/**
 * The 5-step pipeline. `stat` placeholders are filled in page.tsx from
 * computeFunnelStats() — see STEP_STAT_KEYS.
 */
export const HOW_IT_WORKS = {
  heading: 'Wie es funktioniert',
  lead: 'Fünf Stufen — von der Rohliste zum unterschriftsreifen Dokument.',
  steps: [
    {
      title: '1 · Erfassen',
      description: `Das gesamte Schweizer Stiftungsregister (Zefix, ESA) wird eingelesen und dedupliziert — ${SWISS_FOUNDATIONS_DISPLAY} Stiftungen als Ausgangsbasis, laufend aktualisiert.`,
    },
    {
      title: '2 · Triagieren',
      description:
        'Ein Sprachmodell bewertet jeden Stiftungszweck: Passt die Stiftung thematisch, geografisch und vom Zugang her? Ergebnis: Fit-Score (0–10) und Priorität (P1–P4) für jede aktive Stiftung.',
    },
    {
      title: '3 · Recherchieren',
      description:
        'Vielversprechende Kandidaten werden vertieft recherchiert: Website, Förderbeträge, Fristen, bisherige Vergabungen, Kontaktwege. Automatisch Erratenes ist verboten — Kontaktdaten gelten erst nach Verifikation.',
    },
    {
      title: '4 · Präsentieren',
      description:
        'Jede recherchierte Stiftung erhält eine eigene Profilseite mit Fit-Analyse: Warum passen wir zueinander? Die Seite ist zugleich internes Arbeitsinstrument und Präsentation gegenüber der Stiftung.',
    },
    {
      title: '5 · Generieren',
      description:
        'Pro Stiftung entsteht auf Knopfdruck ein komplettes Bewerbungspaket: vierseitiges Gesuch als PDF, Anschreiben, One-Pager, Pitch-Deck und eine teilbare Web-Seite — im Ton auf den Stiftungstyp abgestimmt, im Inhalt auf deren Förderzweck.',
    },
  ],
};

export const FUNNEL = {
  heading: 'Der Trichter — live',
  lead: 'Diese Zahlen kommen direkt aus der Datenbank, nicht aus einer Broschüre.',
  // labels for the stats computed in page.tsx
  labels: {
    universe: 'Stiftungen im Schweizer Register',
    analyzed: 'analysiert und bewertet',
    actionable: 'priorisierte Kandidaten (P1–P3)',
    gesuchReady: 'fertige Gesuch-Seiten',
  },
};

export const FOR_WHOM = {
  heading: 'Für wen',
  audiences: [
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
};

export const PRINCIPLES = {
  heading: 'Die Prinzipien dahinter',
  items: [
    {
      title: 'Jede Zahl belegbar',
      description:
        'Alle Kennzahlen auf der Plattform sind bis zur Quelle rückverfolgbar — ein Klick zeigt Herkunft, Formel und Vertrauensniveau. Keine Blackbox, keine Schönfärberei.',
    },
    {
      title: 'KI triagiert, Menschen entscheiden',
      description:
        'Das Sprachmodell übernimmt die Fleissarbeit (Tausende Zweckstexte lesen und vorsortieren). Recherche-Verifikation, Gesuch-Feinschliff und die Entscheidung, wo eingereicht wird, bleiben Handarbeit.',
    },
    {
      title: 'Fit zeigen statt bitten',
      description:
        'Jedes Gesuch argumentiert aus Sicht der Stiftung: Was hat sie davon? Die Fit-Analyse belegt die Übereinstimmung von Förderzweck und Wirkung, bevor um Geld gebeten wird.',
    },
  ],
};

export const SEE_IT = {
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
};

export const OUTLOOK = {
  heading: 'Heute eine Organisation — gebaut für viele',
  body: `Die Plattform trennt sauber zwischen dem universellen Stiftungsregister und der organisationsspezifischen Analyse (Fit-Scores, Erzählbausteine, Budgets). ${ORG_PROFILE.name} ist die erste Organisation, die damit arbeitet; die Architektur ist von Anfang an dafür gebaut, weitere gemeinnützige Organisationen aufzunehmen.`,
  cta: {
    label: 'Interesse an der Plattform für Ihre Organisation?',
    email: ORG_PROFILE.fundraisingEmail,
  },
};
