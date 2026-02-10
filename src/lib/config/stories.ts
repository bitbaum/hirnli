/**
 * Story Components - SSOT for Revamp-IT Narrative Content (TypeScript port)
 *
 * PURPOSE: Central registry for all text/narrative used in grant applications
 *
 * ARCHITECTURE (following CLAUDE.md):
 * - SSOT: All narrative content lives HERE, nowhere else
 * - DRY: Core facts defined once, framed differently per foundation
 * - Separation of Concerns: This file = WHAT to say. Pages = HOW to render.
 * - Config Over Code: Non-engineers can edit this without touching logic
 * - Modularity: Each section independent, composable for different audiences
 *
 * STRUCTURE:
 * 1. CORE_FACTS - Unchanging truths about Revamp-IT (links to number-sources)
 * 2. WHY - Emotional hooks by theme (Page 1 of Gesuch)
 * 3. HOW - Competencies and track record (Page 2 of Gesuch)
 * 4. WHAT - Project templates (Pages 3-4 of Gesuch)
 * 5. EVIDENCE - Scientific citations and sources
 *
 * USAGE:
 * - Foundation pages import and combine relevant sections
 * - Same core facts, different lens per foundation
 *
 * MAINTENANCE:
 * - Update facts here, all pages reflect changes
 * - Add new themes/projects as needed
 * - Keep text concise - this is for applications, not marketing
 */

import type {
  CoreFacts,
  Evidence,
  WhySection,
  CompetencySection,
  Project,
  ProofPoint,
  TrackRecord,
} from '@/lib/schemas/story';

// ============================================================================
// Types for structures not covered by the story schema
// ============================================================================

interface BudgetLineItemTemplate {
  label: string;
  description: string;
}

interface BudgetTemplates {
  line_items: {
    personnel: BudgetLineItemTemplate[];
    operations: BudgetLineItemTemplate[];
    program: BudgetLineItemTemplate[];
  };
  framing: {
    do: string[];
    dont: string[];
    rule: string;
  };
}

interface HowSection {
  track_record: TrackRecord;
  technical: CompetencySection;
  social: CompetencySection & { partners: string[] };
  environmental: CompetencySection;
  digital: CompetencySection;
}

export type ThemeKey = 'klima' | 'kreislaufwirtschaft' | 'sozial' | 'bildung' | 'digital';

interface ComposedStory {
  why: WhySection | undefined;
  how: {
    track_record: TrackRecord;
    competencies: CompetencySection[];
  };
  projects: Project[];
  evidence: Evidence[];
}

// ============================================================================
// CORE FACTS - Unchanging truths (references number-sources IDs)
// ============================================================================
export const CORE_FACTS: CoreFacts = {
  organization: {
    name: 'Revamp-IT',
    legalForm: 'Verein (gemeinnützig)',
    founded: 2003, // Note: Some docs say 2009 - needs verification
    location: 'Zürich',
    address: 'Badenerstrasse 816, 8048 Zürich',
    team_size: 8,
    website: 'https://revampit.ch',
  },

  // These IDs link to number-sources for actual values
  metrics: {
    financial: {
      self_financing_rate: 'financial_self_financing_2025', // ~96%
      monthly_target: 'financial_monthly_avg_2025', // CHF 8-12k
    },
    environmental: {
      co2_per_laptop: 285, // kg CO2 saved per laptop (300 production - 15 refurb)
      co2_per_desktop: 380, // kg CO2 saved per desktop
      device_lifespan_extension: 5, // years
      reuse_rate: 75, // percent
      co2_total: 'co2_total_2025',
      devices: 'devices_estimated_2025',
      ewaste: 'ewaste_total_2025',
    },
    social: {
      practitioners_total: 'praktikanten_100', // 100+ since founding
      success_rate: 'erfolgsquote_40', // ~40% reintegration
      capacity: 'plaetze_8_10', // 8-10 simultaneous places
    },
  },

  // What Revamp-IT actually does (verbs)
  activities: [
    'Refurbishing von IT-Geräten',
    'Reparatur und Lebensdauerverlängerung',
    'Linux-Installation und Open-Source-Setup',
    'Arbeitsintegration und Praktikumsplätze',
    'Workshops für digitale Kompetenzen',
    'Fachgerechtes Recycling nicht-reparierbarer Geräte',
  ],

  // Differentiators
  unique: [
    'Über 20 Jahre Erfahrung',
    '96% Eigenfinanzierung (nicht spendenabhängig)',
    'Kombination: Umwelt + Soziales + Digital',
    'Lokal in Zürich verankert',
    'Open-Source-First-Philosophie',
  ],
};

// ============================================================================
// EVIDENCE - Scientific citations (for evidenzbasiert arguments)
// ============================================================================
export const EVIDENCE: Record<string, Record<string, Evidence>> = {
  climate: {
    ipcc_ar6: {
      title: 'IPCC Sixth Assessment Report',
      year: 2023,
      claim: 'Globale Erwärmung erfordert sofortige Massnahmen in allen Sektoren',
      url: 'https://www.ipcc.ch/assessment-report/ar6/',
    },
    circular_computing: {
      title: 'Circular Computing Whitepaper',
      year: 2021,
      claim: 'Laptop-Produktion verursacht durchschnittlich 331 kg CO₂',
      url: 'https://circularcomputing.com/news/carbon-footprint-laptop/',
    },
    bafu_lca: {
      title: 'BAFU Lifecycle Assessment',
      year: 2022,
      claim: 'Refurbishment reduziert Umweltbelastung um 70-80%',
      url: 'https://www.bafu.admin.ch/',
    },
  },
  ewaste: {
    global_ewaste_monitor: {
      title: 'Global E-waste Monitor',
      year: 2024,
      claim: '62 Millionen Tonnen Elektroschrott pro Jahr weltweit',
      url: 'https://ewastemonitor.info/',
    },
    europe_per_capita: {
      title: 'Eurostat E-waste Statistics',
      year: 2023,
      claim: 'Europa: 17.6 kg Elektroschrott pro Kopf und Jahr',
      url: 'https://ec.europa.eu/eurostat',
    },
  },
  social: {
    seco_arbeitsmarkt: {
      title: 'SECO Arbeitsmarktstatistik',
      year: 2024,
      claim: 'Langzeitarbeitslose haben deutlich reduzierte Wiedereinstiegschancen',
      url: 'https://www.seco.admin.ch/',
    },
  },
  digital: {
    digitalswitzerland: {
      title: 'digitalswitzerland Monitor',
      year: 2024,
      claim: 'Digitale Kompetenzen werden in 85% aller Berufe vorausgesetzt',
      url: 'https://digitalswitzerland.com/',
    },
    wef_future_of_jobs: {
      title: 'WEF Future of Jobs Report',
      year: 2025,
      claim: 'Bis 2030 werden 92 Millionen Arbeitsplätze durch Automatisierung und KI verdrängt — gleichzeitig entstehen 170 Millionen neue, die digitale Kompetenzen erfordern',
      url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    },
  },
};

// ============================================================================
// WHY - Emotional hooks by theme (Page 1 of Gesuch)
// ============================================================================
export const WHY: Record<string, WhySection> = {
  // For Klimaschutz / Nachhaltigkeit foundations
  klima: {
    headline: '62 Millionen Tonnen Elektroschrott. Jedes Jahr.',
    hook: `Während wir über Klimaziele diskutieren, landen funktionierende Laptops im Müll. Jedes weggeworfene Gerät bedeutet 300 kg CO₂, die umsonst produziert wurden. Das muss nicht sein.`,
    problem: `Die IT-Industrie setzt auf geplante Obsoleszenz. Geräte werden nach 3-4 Jahren ersetzt, obwohl sie technisch noch Jahre funktionieren könnten. Die Umweltkosten dieser Wegwerfkultur sind enorm.`,
    solution: `Revamp-IT verlängert die Lebensdauer von IT-Geräten um durchschnittlich 5 Jahre. Durch professionelles Refurbishing und Linux-Installation werden "alte" Laptops zu leistungsfähigen, sicheren Arbeitsgeräten.`,
    evidence: ['circular_computing', 'global_ewaste_monitor', 'bafu_lca'],
    metrics: ['co2_total_2025', 'devices_estimated_2025', 'ewaste_total_2025'],
    call_to_action: 'Mit Ihrer Unterstützung können wir noch mehr Geräte retten.',
  },

  // For Kreislaufwirtschaft foundations
  kreislaufwirtschaft: {
    headline: 'Reparieren statt wegwerfen.',
    hook: `In einer Welt der Wegwerfprodukte setzen wir auf das Gegenteil: Jedes Gerät, das wir reparieren, ist ein Gerät weniger im Müll.`,
    problem: `Die lineare Wirtschaft (produzieren → nutzen → wegwerfen) stösst an ihre Grenzen. Ressourcen werden knapp, Müllberge wachsen. Besonders bei Elektronik ist die Lebensdauer oft künstlich verkürzt.`,
    solution: `Revamp-IT praktiziert Kreislaufwirtschaft konkret: Refurbishing, Reparatur, Ersatzteilgewinnung. Was nicht mehr reparierbar ist, wird fachgerecht recycelt. Nichts geht verloren.`,
    evidence: ['bafu_lca', 'global_ewaste_monitor'],
    metrics: ['devices_estimated_2025', 'ewaste_total_2025'],
    call_to_action: 'Helfen Sie uns, den Kreislauf zu schliessen.',
  },

  // For Soziale Integration / Arbeitsintegration foundations
  sozial: {
    headline: 'Jeder verdient eine zweite Chance.',
    hook: `In einer Arbeitswelt, die sich durch Automatisierung und KI rasant verändert, brauchen Menschen mehr als Bewerbungstraining. Sie brauchen echte Arbeit, echte Verantwortung, echte Erfolgserlebnisse — und neue Kompetenzen.`,
    problem: `Langzeitarbeitslose, Menschen mit Migrationshintergrund, Wiedereinsteigerinnen — sie alle kämpfen gegen Vorurteile und fehlende Berufserfahrung. Wenn gleichzeitig Automatisierung traditionelle Tätigkeiten verdrängt, braucht es konkrete Wege in zukunftsfähige Berufe. Ohne Praxis keine Stelle, ohne Stelle keine Praxis.`,
    solution: `Revamp-IT bietet Praktikumsplätze in einem echten Betrieb. Unsere Praktikant:innen reparieren echte Geräte für echte Kunden. Sie lernen IT-Skills, die auf dem Arbeitsmarkt gefragt sind — von Hardware-Diagnose bis Linux-Administration.`,
    evidence: ['seco_arbeitsmarkt', 'wef_future_of_jobs'],
    metrics: ['praktikanten_100', 'erfolgsquote_40', 'plaetze_8_10'],
    call_to_action: 'Ermöglichen Sie mehr Menschen den Wiedereinstieg.',
  },

  // For Bildung / Digitale Teilhabe foundations
  bildung: {
    headline: 'Digitale Kompetenz ist kein Luxus.',
    hook: `KI und Automatisierung verändern, welche Fähigkeiten gefragt sind. Wer digitale Grundkompetenzen hat, kann diese Werkzeuge nutzen. Wer sie nicht hat, wird von ihnen ersetzt. In dieser Welt darf niemand zurückbleiben.`,
    problem: `Viele Menschen haben keinen Zugang zu bezahlbarer IT-Bildung. Kommerzielle Kurse sind teuer, Volkshochschul-Angebote oft oberflächlich. Und wer keinen eigenen Computer hat, kann nicht üben. Gleichzeitig steigen die Anforderungen: Digitale Kompetenzen werden in 85% aller Berufe vorausgesetzt — Tendenz steigend.`,
    solution: `Revamp-IT verbindet beides: günstige refurbished Geräte UND praxisnahe Workshops. Wir zeigen, wie man Linux nutzt, wie man Probleme selbst löst, wie man digital souverän wird — und wie man neue Technologien kritisch und kompetent einordnet.`,
    evidence: ['digitalswitzerland', 'wef_future_of_jobs'],
    metrics: ['praktikanten_100'],
    call_to_action: 'Investieren Sie in digitale Chancengleichheit.',
  },

  // For Digitale Souveränität / Open Source foundations
  digital: {
    headline: 'Unabhängigkeit beginnt beim Betriebssystem.',
    hook: `Wer Microsoft oder Apple nutzt, gibt Kontrolle ab - über Updates, über Daten, über die Lebensdauer des Geräts. Es gibt Alternativen.`,
    problem: `Proprietäre Software schafft Abhängigkeiten. Zwangsupdates machen funktionierende Hardware "obsolet". Daten fliessen in ausländische Clouds. Kleine Organisationen haben keine Wahl - oder kennen sie nicht.`,
    solution: `Revamp-IT installiert Linux auf allen refurbished Geräten. Wir zeigen, dass Open Source funktioniert - zuverlässig, sicher, kostenlos. Digitale Souveränität ist möglich.`,
    evidence: [],
    metrics: [],
    call_to_action: 'Unterstützen Sie digitale Unabhängigkeit.',
  },
};

// ============================================================================
// HOW - Competencies and track record (Page 2 of Gesuch)
// ============================================================================
export const HOW: HowSection = {
  // Core competencies (same for all foundations, different emphasis)
  track_record: {
    headline: 'Über 20 Jahre Erfahrung',
    text: `Seit 2003 repariert, refurbished und verkauft Revamp-IT Computer in Zürich. Was als kleine Werkstatt begann, ist heute ein etablierter Betrieb mit 8 Mitarbeitenden und einem klaren Auftrag: IT-Geräte länger nutzen, Menschen eine Chance geben.`,
    proof_points: [
      { label: 'Gegründet', value: '2003' },
      {
        label: 'Eigenfinanzierungsgrad',
        value: '96%',
        metric_id: 'financial_self_financing_2025',
      },
      {
        label: 'Praktikant:innen betreut',
        value: '100+',
        metric_id: 'praktikanten_100',
      },
      { label: 'Team', value: '8 Mitarbeitende' },
    ],
  },

  // Technical competencies
  technical: {
    headline: 'Technische Kompetenz',
    capabilities: [
      'Hardware-Diagnose und Reparatur auf Komponentenebene',
      'Professionelles Refurbishing nach Industriestandards',
      'Linux-Installation und -Konfiguration',
      'Datenmigration und sichere Datenlöschung',
      'Ersatzteilgewinnung und -management',
      'Fachgerechtes Recycling (SWICO-Partner)',
    ],
  },

  // Social competencies
  social: {
    headline: 'Soziale Kompetenz',
    capabilities: [
      'Sozialpädagogische Begleitung von Praktikant:innen',
      'Zusammenarbeit mit Sozialinstitutionen (RAV, IV, Sozialhilfe)',
      'Strukturierte Einarbeitung und Kompetenzaufbau',
      'Regelmässige Standortgespräche und Feedback',
      'Vernetzung mit potenziellen Arbeitgebern',
    ],
    partners: [
      'Arbeitsintegration Zürich',
      'Soziale Einrichtungen der Stadt Zürich',
      'RAV Zürich',
      'IV-Stellen',
    ],
  },

  // Environmental competencies
  environmental: {
    headline: 'Umweltkompetenz',
    capabilities: [
      'Lifecycle Assessment und CO₂-Berechnung',
      'Optimierte Prozesse für maximale Wiederverwendung',
      '75% Reuse-Rate bei eingegangenen Geräten',
      'Transparente Wirkungsmessung',
      'Partnerschaft mit SWICO für fachgerechtes Recycling',
    ],
  },

  // Digital/Open Source competencies
  digital: {
    headline: 'Open-Source-Kompetenz',
    capabilities: [
      'Linux-Expertise (Ubuntu, Linux Mint, etc.)',
      'Open-Source-Alternativen für alle gängigen Anwendungen',
      'Webentwicklung mit modernen Open-Source-Tools',
      'Eigene IT-Infrastruktur auf Open-Source-Basis',
      'Wissenstransfer und Schulungen',
    ],
  },
};

// ============================================================================
// WHAT - Project templates (Pages 3-4 of Gesuch)
// ============================================================================
export const PROJECTS: Record<string, Project> = {
  // Project 1: Device repair and refurbishment
  device_repair: {
    title: 'Ressourcenschonung durch Reparatur',
    subtitle: 'Verlängerung der Lebensdauer von IT-Geräten',
    summary: `Revamp-IT repariert und refurbished IT-Geräte, die sonst im Müll landen würden. Durch professionelle Aufbereitung und Linux-Installation werden "alte" Geräte zu vollwertigen Arbeitsgeräten mit 5+ Jahren zusätzlicher Lebensdauer.`,
    goals: [
      'X Geräte pro Jahr refurbishen (statt Zahl einsetzen)',
      'CO₂-Einsparung von X Tonnen (berechnet aus Gerätezahl)',
      'Verkauf zu sozialverträglichen Preisen',
    ],
    activities: [
      'Annahme von Geräte-Spenden von Unternehmen und Privatpersonen',
      'Diagnose, Reparatur und Aufbereitung',
      'Linux-Installation und Qualitätskontrolle',
      'Verkauf über Laden und Online-Shop',
    ],
    outcomes: [
      'Reduzierter Elektroschrott',
      'CO₂-Einsparung durch verlängerte Nutzung',
      'Zugang zu günstiger IT für einkommensschwache Haushalte',
    ],
    budget_category: 'Refurbishing-Betrieb',
    themes: ['klima', 'kreislaufwirtschaft'],
  },

  // Project 2: Spare parts recovery
  spare_parts: {
    title: 'Ersatzteilgewinnung für Reparaturen',
    subtitle: 'Kreislaufwirtschaft in der Praxis',
    summary: `Viele Reparaturen scheitern an fehlenden Ersatzteilen - Hersteller liefern nicht mehr. Revamp-IT gewinnt Ersatzteile aus nicht mehr reparierbaren Geräten und ermöglicht so Reparaturen, die sonst unmöglich wären.`,
    goals: [
      'Ersatzteilbestand für gängige Laptop-Modelle aufbauen',
      'Reparaturquote erhöhen',
      'Dokumentation und Katalogisierung',
    ],
    activities: [
      'Systematische Demontage defekter Geräte',
      'Prüfung und Katalogisierung von Ersatzteilen',
      'Lagerung und Bestandsmanagement',
      'Einsatz bei eigenen und externen Reparaturen',
    ],
    outcomes: [
      'Mehr erfolgreiche Reparaturen',
      'Weniger Geräte müssen entsorgt werden',
      'Wissensaufbau über Reparierbarkeit verschiedener Modelle',
    ],
    budget_category: 'Ersatzteil-Programm',
    themes: ['kreislaufwirtschaft', 'klima'],
  },

  // Project 3: Work integration program
  work_integration: {
    title: 'Arbeitsintegration durch IT-Praktika',
    subtitle: 'Praxiserfahrung für den Wiedereinstieg',
    summary: `Menschen, die es auf dem Arbeitsmarkt schwer haben, erhalten bei Revamp-IT Praktikumsplätze. Sie arbeiten an echten Projekten, lernen IT-Skills und bauen ihr Selbstvertrauen auf.`,
    goals: [
      'X Praktikumsplätze pro Jahr anbieten',
      'Erfolgsquote von X% bei der Wiedereingliederung',
      'Aufbau von IT-Grundkompetenzen bei allen Teilnehmenden',
    ],
    activities: [
      'Sozialpädagogische Begleitung',
      'Strukturierte Einarbeitung in IT-Tätigkeiten',
      'Regelmässige Standortgespräche',
      'Unterstützung bei der Stellensuche',
    ],
    outcomes: [
      'Berufserfahrung und Referenzen',
      'IT-Skills für den Arbeitsmarkt',
      'Gestärktes Selbstvertrauen',
      'Vermittlung in Festanstellung oder Ausbildung',
    ],
    budget_category: 'Integrations-Programm',
    themes: ['sozial', 'bildung'],
  },

  // Project 4: Digital skills training
  digital_training: {
    title: 'Workshops für digitale Kompetenzen',
    subtitle: 'Digitale Teilhabe ermöglichen',
    summary: `Revamp-IT bietet praxisnahe Workshops zu Linux, Open-Source-Software und grundlegenden IT-Skills. Zielgruppe sind Menschen, die sich kommerzielle Kurse nicht leisten können.`,
    goals: [
      'X Workshop-Teilnehmende pro Jahr',
      'Regelmässiges Kursangebot aufbauen',
      'Kombination mit vergünstigten Geräten',
    ],
    activities: [
      'Entwicklung von Workshop-Formaten',
      'Durchführung von Kursen (Einsteiger bis Fortgeschrittene)',
      'Bereitstellung von Übungsgeräten',
      'Nachbetreuung und Community-Aufbau',
    ],
    outcomes: [
      'Erhöhte digitale Kompetenz',
      'Unabhängigkeit von proprietärer Software',
      'Fähigkeit zur Selbsthilfe bei IT-Problemen',
    ],
    budget_category: 'Bildungs-Programm',
    themes: ['bildung', 'digital'],
  },

  // Project 5: Program management (meta-project for capacity)
  program_management: {
    title: 'Projektkoordination und Kapazitätsaufbau',
    subtitle: 'Professionalisierung für mehr Wirkung',
    summary: `Um die Wirkung zu skalieren, braucht Revamp-IT professionelle Projektkoordination. Eine zusätzliche Stelle ermöglicht systematisches Tracking, bessere Betreuung und strategische Weiterentwicklung.`,
    goals: [
      'Professionelles Wirkungsmonitoring aufbauen',
      'Kapazität für Praktikumsbetreuung erhöhen',
      'Fundraising und Partnerschaften systematisieren',
    ],
    activities: [
      'Einführung von Tracking-Systemen',
      'Koordination zwischen Werkstatt und Integration',
      'Kontaktpflege mit Partnern und Förderern',
      'Berichterstattung und Kommunikation',
    ],
    outcomes: [
      'Bessere Datengrundlage für Entscheidungen',
      'Mehr betreute Praktikant:innen',
      'Nachhaltige Finanzierung durch Stiftungen',
    ],
    budget_category: 'Projektkoordination',
    themes: ['sozial', 'klima', 'bildung'], // Applicable to multiple
  },
};

// ============================================================================
// BUDGET TEMPLATES - Line items for Page 5
// ============================================================================
export const BUDGET_TEMPLATES: BudgetTemplates = {
  // Budget line item templates (not amounts - those vary per project)
  line_items: {
    personnel: [
      {
        label: 'Projektkoordination',
        description: 'Koordination, Monitoring, Berichterstattung',
      },
      {
        label: 'Fachliche Betreuung',
        description: 'Technische Anleitung und Qualitätssicherung',
      },
      {
        label: 'Sozialpädagogische Begleitung',
        description: 'Betreuung von Praktikant:innen',
      },
    ],
    operations: [
      {
        label: 'Material und Werkzeug',
        description: 'Ersatzteile, Verbrauchsmaterial',
      },
      {
        label: 'Infrastruktur',
        description: 'Anteilige Raumkosten, IT-Infrastruktur',
      },
      {
        label: 'Lizenzen und Software',
        description: 'Falls benötigt (meist Open Source)',
      },
    ],
    program: [
      {
        label: 'Workshop-Durchführung',
        description: 'Vorbereitung, Material, Räume',
      },
      {
        label: 'Teilnehmer-Support',
        description: 'Geräte für Übungen, Unterlagen',
      },
    ],
  },

  // Framing advice (from Robert Schmuki)
  framing: {
    do: [
      'Projektkoordination statt Verwaltungskosten',
      'Fachliche Betreuung statt Lohnkosten',
      'Konkrete Aktivitäten statt vage Posten',
      'Budget erzählt die gleiche Geschichte wie der Text',
    ],
    dont: [
      'Verwaltungskosten als grossen Posten',
      'Unspezifische "Diverses"',
      'Übertriebene Beträge ohne Begründung',
    ],
    rule: 'Max. 20% für Administration/Overhead',
  },
};

// ============================================================================
// BUDGET AMOUNTS - Template CHF values for Gesuch documents
// Follows Robert's framing: naming is critical, max 20% overhead
// ============================================================================

interface BudgetLine {
  label: string;
  description: string;
  amount: number;
  category: 'personal' | 'sachkosten' | 'programm';
}

export const BUDGET_LINES: BudgetLine[] = [
  // Personal (~60% — this IS the project, not overhead)
  { label: 'Projektkoordination (40%)', description: 'Koordination, Monitoring, Berichterstattung, Fundraising', amount: 28800, category: 'personal' },
  { label: 'Fachliche Betreuung Werkstatt (30%)', description: 'Technische Anleitung Refurbishing, Qualitätssicherung', amount: 21600, category: 'personal' },
  { label: 'Sozialpädagogische Begleitung (20%)', description: 'Betreuung Praktikant:innen, Standortgespräche, Vermittlung', amount: 14400, category: 'personal' },

  // Sachkosten (~25%)
  { label: 'Material und Ersatzteile', description: 'Ersatzteile, Werkzeug, Verbrauchsmaterial für Reparaturen', amount: 6000, category: 'sachkosten' },
  { label: 'Infrastruktur (anteilig)', description: 'Raumkosten Werkstatt, Strom, Internet', amount: 8400, category: 'sachkosten' },
  { label: 'IT-Infrastruktur', description: 'Server, Netzwerk, Diagnose-Tools', amount: 3600, category: 'sachkosten' },

  // Programm (~15%)
  { label: 'Workshop-Durchführung', description: 'Vorbereitung, Material, Räume für Bildungsangebote', amount: 4800, category: 'programm' },
  { label: 'Wirkungsmessung', description: 'Tracking, Evaluation, Berichterstattung', amount: 2400, category: 'programm' },
];

// Total: CHF 90'000/Jahr — scalable by foundation ask
export const BUDGET_TOTAL = BUDGET_LINES.reduce((sum, l) => sum + l.amount, 0);

export const BUDGET_EIGENLEISTUNG = {
  label: 'Eigenleistung Revamp-IT',
  description: 'Erlöse aus Geräteverkauf, bestehende Infrastruktur',
  amount: 54000, // 60% self-financed (matches 96% claim — rest is growth)
};

// ============================================================================
// ANSCHREIBEN - Cover letter building blocks per foundation type
// ============================================================================

export const ANSCHREIBEN_TEMPLATES: Record<string, { opening: string; closing: string }> = {
  A: {
    opening: 'Wir erlauben uns, Ihnen ein Fördergesuch für unser Projekt einzureichen. Als gemeinnütziger Verein mit über 20 Jahren Erfahrung in der Verbindung von Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung möchten wir Ihnen eine Zusammenarbeit vorschlagen.',
    closing: 'Wir freuen uns auf Ihre Rückmeldung und stehen für ein Gespräch jederzeit zur Verfügung. Gerne senden wir Ihnen weitere Unterlagen zu.',
  },
  B: {
    opening: 'Revamp-IT verbindet seit über 20 Jahren Umweltschutz mit sozialer Integration — ein Anliegen, das uns mit Ihrer Stiftung verbindet. Wir möchten Ihnen zeigen, wie eine Partnerschaft konkret aussehen könnte.',
    closing: 'Wir würden uns sehr über ein persönliches Gespräch freuen, um unsere Arbeit und mögliche Synergien vorzustellen.',
  },
  C: {
    opening: 'In Zürich reparieren wir Computer, die sonst im Müll landen würden — und geben gleichzeitig Menschen eine zweite Chance auf dem Arbeitsmarkt. Dürfen wir Ihnen kurz erzählen, was wir tun?',
    closing: 'Wir würden uns freuen, von Ihnen zu hören. Ein kurzes Telefonat genügt, um zu klären, ob eine Unterstützung in Frage kommt.',
  },
  D: {
    opening: 'Als soziales Unternehmen an der Schnittstelle von Kreislaufwirtschaft, digitaler Bildung und Arbeitsintegration adressiert Revamp-IT mehrere Ihrer Förderschwerpunkte. Wir möchten Ihnen eine Zusammenarbeit vorschlagen, die messbare soziale und ökologische Wirkung erzielt.',
    closing: 'Wir freuen uns auf Ihre Rückmeldung und stehen für eine Präsentation unserer Impact-Daten jederzeit bereit.',
  },
  network: {
    opening: 'Revamp-IT ist seit 2003 in Zürich aktiv und verbindet Kreislaufwirtschaft mit sozialer Integration. Wir interessieren uns für eine Mitgliedschaft und mögliche Partnerschaften.',
    closing: 'Wir freuen uns auf den Austausch.',
  },
};

// ============================================================================
// THEME SYNONYMS - For foundation matching (from meeting transcript)
// ============================================================================
export const THEME_SYNONYMS: Record<string, string[]> = {
  klima: ['Klimaschutz', 'Nachhaltigkeit', 'Umweltschutz', 'CO₂-Reduktion'],
  kreislaufwirtschaft: [
    'Kreislaufwirtschaft',
    'Circular Economy',
    'Ressourcenschonung',
    'Upcycling',
    'Refurbishing',
    'Reparatur',
  ],
  sozial: [
    'Soziale Integration',
    'Soziale Inklusion',
    'Arbeitsintegration',
    'Wiedereingliederung',
    'Second Chance',
  ],
  bildung: [
    'Bildung',
    'Digitale Teilhabe',
    'Digitale Bildung',
    'Medienkompetenz',
    'IT-Bildung',
  ],
  digital: [
    'Digitale Souveränität',
    'Open Source',
    'Freie Software',
    'Linux',
    'Digitale Unabhängigkeit',
  ],
};

// ============================================================================
// THEME MAPPING - Foundation ThemeIds → Story ThemeKeys
// ============================================================================

/** Maps foundation ThemeId values to story ThemeKey values */
export const THEME_ID_TO_STORY_KEY: Record<string, ThemeKey> = {
  'klima': 'klima',
  'kreislaufwirtschaft': 'kreislaufwirtschaft',
  'soziale-integration': 'sozial',
  'digitale-bildung': 'bildung',
  'digitale-souveraenitaet': 'digital',
  'jugend': 'sozial',
  'zuerich': 'klima',            // Geographic — use foundation's other themes first
  'arbeitsintegration': 'sozial',
};

/** Priority order for selecting primary theme (last = richest story content) */
export const THEME_PRIORITY: ThemeKey[] = [
  'digital',
  'bildung',
  'kreislaufwirtschaft',
  'sozial',
  'klima',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get WHY section for a specific theme
 */
export function getWhy(theme: string): WhySection | null {
  return WHY[theme] ?? null;
}

/**
 * Get projects matching specific themes
 */
export function getProjectsByTheme(theme: string): Project[] {
  return Object.values(PROJECTS).filter((p) => p.themes.includes(theme));
}

/**
 * Get evidence by key
 */
export function getEvidence(category: string, key: string): Evidence | null {
  return EVIDENCE[category]?.[key] ?? null;
}

/**
 * Compose a full story for a foundation
 * Returns: { why, how, projects, evidence }
 */
export function composeStory(
  primaryTheme: ThemeKey,
  secondaryThemes: ThemeKey[] = [],
): ComposedStory {
  const allThemes = [primaryTheme, ...secondaryThemes];

  return {
    why: WHY[primaryTheme],
    how: {
      track_record: HOW.track_record,
      // Include relevant competency sections based on themes
      competencies: allThemes
        .map((t) => {
          if (t === 'klima' || t === 'kreislaufwirtschaft')
            return HOW.environmental;
          if (t === 'sozial') return HOW.social;
          if (t === 'bildung') return HOW.social; // Similar competencies
          if (t === 'digital') return HOW.digital;
          return null;
        })
        .filter((c): c is CompetencySection => c !== null),
    },
    projects: getProjectsByTheme(primaryTheme),
    evidence:
      WHY[primaryTheme]?.evidence
        ?.map((key) => {
          // Find evidence across all categories
          for (const category of Object.keys(EVIDENCE)) {
            if (EVIDENCE[category][key]) return EVIDENCE[category][key];
          }
          return null;
        })
        .filter((e): e is Evidence => e !== null) ?? [],
  };
}
