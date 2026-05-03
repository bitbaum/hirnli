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
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
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
  TrackRecord,
  Anecdote,
  PhotoSlot,
} from '@/lib/schemas/story';
import type { ThemeId, FoundationType } from '@/lib/schemas/foundation';
import { getNumericValue, CO2_PER_LAPTOP } from '@/lib/config/numbers';
import { formatNumber } from '@/lib/utils/format';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SHARED_ORG_NUMBERS } from '@/lib/config/shared-org-numbers.generated';

// ============================================================================
// Types for structures not covered by the story schema
// ============================================================================

interface HowSection {
  track_record: TrackRecord;
  technical: CompetencySection;
  social: CompetencySection & { partners: string[] };
  environmental: CompetencySection;
  digital: CompetencySection;
  bildung: CompetencySection;
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
    name: ORG_PROFILE.name,
    legalForm: 'Verein (gemeinnützig)',
    founded: ORG_PROFILE.founded,
    location: ORG_PROFILE.location,
    address: ORG_PROFILE.address,
    team_size: 3, // 2 angestellt (Daniel, Veronica) + 1 ehrenamtlich (Andreas)
    website: ORG_PROFILE.website,
  },

  // These IDs link to number-sources for actual values
  metrics: {
    financial: {
      self_financing_rate: 'financial_self_financing_2025', // historically ~96% (because never fundraised — not because no need)
      monthly_target: 'financial_monthly_avg_2025', // CHF 8-12k
    },
    environmental: {
      co2_per_laptop: getNumericValue('CO2_SAVED_PER_LAPTOP'),
      device_lifespan_extension: getNumericValue('DEVICE_LIFESPAN_EXTENSION'),
      reuse_rate: getNumericValue('REUSE_RATE'),
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
    'Entwicklung einer Open-Source-Community-Plattform (Marktplatz, IT-Hilfe, Wissensplattform)',
  ],

  // Differentiators
  unique: [
    `Über ${ORG_PROFILE.yearsActive} Jahre Erfahrung`,
    'Gemeinnütziger Verein — alle Einnahmen fliessen in die Mission',
    'Kombination: Umwelt + Soziales + Digital',
    'Lokal in Zürich verankert',
    'Open-Source-First-Philosophie',
    'Eigene Open-Source-Plattform mit Community-Marktplatz, IT-Hilfe und Wissensportal',
  ],
};

// ============================================================================
// SOCIAL DISPLAY VALUES — Resolved display strings for social metric IDs
// (The IDs in CORE_FACTS.metrics.social are references to metrics.ts,
//  but nobody resolves them at runtime. These are the SSOT display values.)
// ============================================================================

export const SOCIAL_DISPLAY = {
  practitioners_total: SHARED_ORG_NUMBERS.PEOPLE_HELPED,
  success_rate: '~40%',
  success_rate_numeric: 40,
  capacity: '8-10',
} as const;

// ============================================================================
// GESUCH TEXT BLOCKS — Reusable text for Gesuch sections (not in components)
// ============================================================================

export const GESUCH_TEXT = {
  zusammenfassung_intro:
    'Revamp-IT verlängert die Lebensdauer von IT-Geräten durch professionelles Refurbishing und bietet gleichzeitig Arbeitsintegrationsplätze für Menschen am Rand des Arbeitsmarktes.',
  wirkungsmessung: {
    indicators: `Revamp-IT misst die Wirkung seiner Aktivitäten anhand konkreter Indikatoren: CO₂-Einsparung pro Gerät (${CORE_FACTS.metrics.environmental.co2_per_laptop} kg/Laptop), Anzahl betreuter Praktikant:innen, Wiedereingliederungsquote (${SOCIAL_DISPLAY.success_rate}), sowie die Reuse-Rate (${CORE_FACTS.metrics.environmental.reuse_rate}%) der eingegangenen Geräte. Die Ergebnisse werden in unserem transparenten Online-Dashboard publiziert.`,
    sustainability:
      `Revamp-IT hat über ${ORG_PROFILE.yearsActive} Jahre bewiesen, dass das Kerngeschäft tragfähig ist. Stiftungsgelder ermöglichen die gezielte Skalierung: grösserer Standort, Programmleitung, Sovereign-AI-Infrastruktur und mehr Ausbildungsplätze.`,
  },
  kurzportrait_subtitle:
    `Gemeinnütziger Verein seit ${ORG_PROFILE.founded} — Kreislaufwirtschaft, Arbeitsintegration, digitale Bildung`,
} as const;

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
    open_source_platform: {
      title: 'Revamp-IT Community Platform (Open Source)',
      year: 2026,
      claim: `Produktionsreife Full-Stack-Plattform mit ${formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))} TypeScript-Dateien, eigenentwickelt als Open Source`,
      url: 'https://revampit.vercel.app',
    },
  },
};

// ============================================================================
// WHY - Emotional hooks by theme (Page 1 of Gesuch)
// ============================================================================
export const WHY: Record<ThemeKey, WhySection> = {
  // For Klimaschutz / Nachhaltigkeit foundations
  klima: {
    headline: '62 Millionen Tonnen Elektroschrott. Jedes Jahr.',
    hook: `Während wir über Klimaziele diskutieren, landen funktionierende Laptops im Müll. Jedes weggeworfene Gerät bedeutet bis zu ${CO2_PER_LAPTOP} kg CO₂, die umsonst produziert wurden. Das muss nicht sein.`,
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
    evidence: ['digitalswitzerland', 'wef_future_of_jobs', 'open_source_platform'],
    metrics: ['praktikanten_100'],
    call_to_action: 'Investieren Sie in digitale Chancengleichheit.',
  },

  // For Digitale Souveränität / Open Source / Sovereign AI foundations
  digital: {
    headline: 'Souveränität beginnt bei der Infrastruktur.',
    hook: `Wer Microsoft oder Apple nutzt, gibt Kontrolle ab — über Updates, über Daten, über die Lebensdauer des Geräts. Wer ChatGPT nutzt, sendet seine Daten in US-Clouds. Es gibt Alternativen — und wir bauen sie.`,
    problem: `Proprietäre Software schafft Abhängigkeiten. Zwangsupdates machen funktionierende Hardware "obsolet". Daten fliessen in ausländische Clouds — mit CLOUD Act und Schrems II ein reales Risiko für Schweizer Organisationen. Gleichzeitig werden KI-Werkzeuge unverzichtbar, aber lokale Alternativen fehlen.`,
    solution: `Revamp-IT geht drei Schritte: Erstens installieren wir Linux auf allen refurbished Geräten — digitale Souveränität auf dem Desktop. Zweitens bauen wir aus gespendeten GPU-Servern eine lokale KI-Infrastruktur auf. Schweizer Organisationen können Open-Source-KI-Modelle nutzen, ohne Daten das Land verlassen zu lassen. Drittens entwickeln wir eine Open-Source-Community-Plattform: ein digitaler Marktplatz für gebrauchte IT, eine Wissensplattform mit Reparaturanleitungen und Workshops, und ein IT-Hilfe-Portal, auf dem die Community sich gegenseitig unterstützt — alles selbst entwickelt, alles Open Source.`,
    evidence: ['digitalswitzerland', 'wef_future_of_jobs', 'open_source_platform'],
    metrics: ['devices_estimated_2025'],
    call_to_action: 'Unterstützen Sie Schweizer Datensouveränität — vom Betriebssystem bis zur KI.',
  },
};

// ============================================================================
// HOW - Competencies and track record (Page 2 of Gesuch)
// ============================================================================
export const HOW: HowSection = {
  // Core competencies (same for all foundations, different emphasis)
  track_record: {
    headline: `Über ${ORG_PROFILE.yearsActive} Jahre Erfahrung`,
    text: `Seit ${ORG_PROFILE.founded} repariert, refurbished und verkauft Revamp-IT Computer in Zürich. Was als kleine Werkstatt begann, ist heute ein etablierter Betrieb mit ${CORE_FACTS.organization.team_size} Kernteam-Mitgliedern, unterstützt durch Freelancer und 8-10 Integrationsteilnehmende — mit einem klaren Auftrag: IT-Geräte länger nutzen, Menschen eine Chance geben.`,
    proof_points: [
      { label: 'Gegründet', value: String(ORG_PROFILE.founded) },
      {
        label: 'Gemeinnützigkeit',
        value: 'Alle Einnahmen fliessen in die Mission',
        metric_id: 'financial_self_financing_2025',
      },
      {
        label: 'Praktikant:innen betreut',
        value: SOCIAL_DISPLAY.practitioners_total,
        metric_id: 'praktikanten_100',
      },
      { label: 'Kernteam', value: `${CORE_FACTS.organization.team_size} Kernteam + Freelancer` },
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
    evidence: ['seco_arbeitsmarkt'],
  },

  // Environmental competencies
  environmental: {
    headline: 'Umweltkompetenz',
    capabilities: [
      'Lifecycle Assessment und CO₂-Berechnung',
      'Optimierte Prozesse für maximale Wiederverwendung',
      `${getNumericValue('REUSE_RATE')}% Reuse-Rate bei eingegangenen Geräten`,
      'Transparente Wirkungsmessung',
      'Partnerschaft mit SWICO für fachgerechtes Recycling',
    ],
    evidence: ['bafu_lca', 'circular_computing'],
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
      'Full-Stack-Webentwicklung: Next.js, TypeScript, PostgreSQL, Redis, Meilisearch',
      `Eigenentwicklung einer Community-Plattform mit ${formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))} TypeScript-Dateien, Marktplatz, Authentifizierung und Suchfunktion`,
    ],
    evidence: ['digitalswitzerland', 'open_source_platform'],
  },

  // Education / digital skills competencies
  bildung: {
    headline: 'Bildungskompetenz',
    capabilities: [
      'Konzeption und Durchführung praxisnaher IT-Workshops',
      'Erfahrung mit heterogenen Lerngruppen (Anfänger bis Fortgeschrittene)',
      'Niederschwellige Vermittlung: Lernen am echten Gerät, nicht am Simulator',
      'Kombination von Hardware-Reparatur-Praxis und Software-Schulung',
      'Bereitstellung von Übungsgeräten aus eigenem Bestand',
    ],
    evidence: ['digitalswitzerland', 'wef_future_of_jobs'],
  },
};

// ============================================================================
// WHAT - Project templates (Pages 3-4 of Gesuch)
// ============================================================================
const PROJECTS: Record<string, Project> = {
  // Project 1: Device repair and refurbishment
  device_repair: {
    title: 'Ressourcenschonung durch Reparatur und Refurbishing',
    subtitle: 'Verlängerung der Lebensdauer von IT-Geräten um 5+ Jahre',
    summary: `Jedes Jahr landen in der Schweiz Tausende funktionsfähige Laptops und PCs im Elektroschrott — oft nur, weil ein Windows-Update sie „zu langsam" macht. Revamp-IT gibt diesen Geräten ein zweites Leben: Wir diagnostizieren auf Komponentenebene, tauschen defekte Teile, installieren Linux Mint oder Ubuntu und liefern vollwertige Arbeitsgeräte. Ein ThinkPad von 2017 läuft mit Linux einwandfrei als Office-Rechner, Schulcomputer oder Heimarbeitsplatz — noch mindestens 5 Jahre lang.`,
    goals: [
      `Mindestens ${getNumericValue('DEVICES_YEAR_CURRENT')} Geräte pro Jahr aufbereiten und in Umlauf bringen`,
      'CO₂-Einsparung von über 40 Tonnen pro Jahr durch verlängerte Gerätenutzung',
      'Solidarisches Preismodell: bezahlbare IT für alle Einkommensschichten',
    ],
    activities: [
      'Annahme von Geräte-Spenden von Unternehmen (Flottengeräte) und Privatpersonen',
      'Hardware-Diagnose auf Komponentenebene: RAM, SSD, Akku, Display, Mainboard',
      'Linux-Installation (Mint, Ubuntu), Konfiguration, Qualitätskontrolle',
      'Verkauf über Laden an der Badenerstrasse und Online-Shop',
    ],
    outcomes: [
      `Jedes aufbereitete Gerät spart ~${CO2_PER_LAPTOP} kg CO₂ gegenüber einem Neukauf`,
      'Einkommensschwache Haushalte, Schulen und Vereine erhalten bezahlbare IT',
      `Reuse-Rate von ${getNumericValue('REUSE_RATE')}% — nur was wirklich nicht mehr geht, wird recycelt`,
    ],
    budget_category: 'Refurbishing-Betrieb',
    themes: ['klima', 'kreislaufwirtschaft', 'digital'],
  },

  // Project 2: Spare parts recovery
  spare_parts: {
    title: 'Ersatzteilgewinnung und Reparatur-Infrastruktur',
    subtitle: 'Kreislaufwirtschaft in der Praxis — nichts geht verloren',
    summary: `Wer ein 5 Jahre altes Laptop reparieren will, findet beim Hersteller oft keine Ersatzteile mehr. Revamp-IT löst dieses Problem: Aus Geräten, die wirklich nicht mehr zu retten sind, gewinnen wir Displays, Tastaturen, RAM-Module, SSDs und Akkus. Diese Teile ermöglichen Reparaturen, die sonst unmöglich wären. So schliesst sich der Kreislauf — was bei einem Gerät nicht mehr funktioniert, gibt einem anderen neues Leben.`,
    goals: [
      'Systematischer Ersatzteilbestand für die gängigsten 20 Laptop-Modelle',
      'Reparaturquote auf über 80% der eingehenden Geräte steigern',
      'Dokumentation der Reparierbarkeit nach Modell und Hersteller',
    ],
    activities: [
      'Fachgerechte Demontage nicht reparierbarer Geräte',
      'Funktionsprüfung, Katalogisierung und Einlagerung gewonnener Teile',
      'Einsatz bei eigenen Reparaturen und für externe Reparaturaufträge',
      'Nicht verwertbare Reste gehen an SWICO-Partner zum fachgerechten Recycling',
    ],
    outcomes: [
      'Höhere Reparaturquote — mehr Geräte werden gerettet statt entsorgt',
      'Aufbau einer einzigartigen Wissensbasis zur Reparierbarkeit von IT-Geräten',
      'Reduktion des Materialverbrauchs durch maximale Wiederverwendung',
    ],
    budget_category: 'Ersatzteil-Programm',
    themes: ['kreislaufwirtschaft', 'klima'],
  },

  // Project 3: Work integration program
  work_integration: {
    title: 'Arbeitsintegration durch IT-Praktika',
    subtitle: 'Echte Arbeit, echte Verantwortung, echte Perspektiven',
    summary: `Seit über ${ORG_PROFILE.yearsActive} Jahren bietet Revamp-IT Praktikumsplätze für Menschen, die auf dem regulären Arbeitsmarkt keine Chance bekommen: Langzeitarbeitslose, Menschen mit Migrationshintergrund, Personen nach psychischen Krisen. Sie kommen über RAV, IV-Stellen oder die Sozialen Einrichtungen der Stadt Zürich zu uns. Bei Revamp-IT arbeiten sie nicht an Simulationen, sondern an echten Geräten für echte Kunden — von der Hardware-Diagnose über die Reparatur bis zur Linux-Installation. Über ${SOCIAL_DISPLAY.practitioners_total} Praktikant:innen haben diesen Weg bereits gemacht, rund ${SOCIAL_DISPLAY.success_rate_numeric}% haben danach eine Festanstellung oder Ausbildung gefunden.`,
    goals: [
      '8-10 Praktikumsplätze gleichzeitig, betreut durch sozialpädagogische Fachperson',
      'Wiedereingliederungsquote von ~40% in Festanstellung oder Ausbildung halten',
      'Aufbau marktrelevanter IT-Kompetenzen bei allen Teilnehmenden',
    ],
    activities: [
      'Individuelle sozialpädagogische Begleitung mit regelmässigen Standortgesprächen',
      'Strukturierte Einarbeitung: Hardware-Diagnose, Reparatur, Linux, Kundenkontakt',
      'Zusammenarbeit mit RAV, IV-Stellen und Sozialen Einrichtungen der Stadt Zürich',
      'Unterstützung bei Bewerbungen, Referenzen und Vermittlung an Arbeitgeber',
    ],
    outcomes: [
      'Berufserfahrung und Arbeitsreferenz in einem echten IT-Betrieb',
      'Marktrelevante IT-Skills: Hardware, Linux, Kundenkommunikation',
      'Strukturierter Tagesablauf und Wiederaufbau von Arbeitsroutinen',
      'Rund 40% der Teilnehmenden finden den Weg zurück in den Arbeitsmarkt',
    ],
    budget_category: 'Integrations-Programm',
    themes: ['sozial', 'bildung'],
  },

  // Project 4: Digital skills training
  digital_training: {
    title: 'Workshops für digitale Kompetenzen',
    subtitle: 'Digitale Teilhabe und Selbstbefähigung',
    summary: `Wer sich keinen Laptop leisten kann, kann sich erst recht keinen IT-Kurs leisten. Revamp-IT verbindet beides: Wir bieten praxisnahe Workshops zu Linux, Open-Source-Software und IT-Grundlagen — und wer will, bekommt ein günstiges refurbished Gerät dazu. Unsere Teilnehmenden lernen am echten Gerät, nicht am Whiteboard. Vom ersten Einschalten über E-Mail-Einrichtung bis zur eigenen Cloud — was andere Kurse in der Theorie erklären, machen wir in der Praxis.`,
    goals: [
      'Mindestens 50 Workshop-Teilnehmende pro Jahr',
      'Regelmässiges monatliches Kursangebot (Einsteiger bis Fortgeschrittene)',
      'Jeder Teilnehmende kann optional ein refurbished Gerät erwerben',
    ],
    activities: [
      'Workshop-Formate: Linux-Einstieg, E-Mail & Cloud, Datensicherheit, Selbstreparatur',
      'Durchführung in eigener Werkstatt mit Übungsgeräten aus eigenem Bestand',
      'Repair Cafes: Gemeinsam reparieren, voneinander lernen',
      'Nachbetreuung: Support-Hotline und Community-Treff für ehemalige Teilnehmende',
    ],
    outcomes: [
      'Teilnehmende können ihren Computer eigenständig bedienen und Probleme lösen',
      'Unabhängigkeit von proprietärer Software und kostenpflichtigen Lizenzen',
      'Digitale Selbstbestimmung: eigene Daten, eigene Werkzeuge, eigenes Wissen',
    ],
    budget_category: 'Bildungs-Programm',
    themes: ['bildung', 'digital'],
  },

  // Project 5: Program management (meta-project for capacity)
  program_management: {
    title: 'Projektkoordination und Kapazitätsaufbau',
    subtitle: 'Vom Werkstatt-Betrieb zur skalierbaren Organisation',
    summary: `Revamp-IT wird seit über ${ORG_PROFILE.yearsActive} Jahren von Techniker:innen geführt, die reparieren, betreuen und verkaufen — gleichzeitig. Für den nächsten Schritt braucht es dedizierte Projektkoordination: jemand, der sich um Wirkungsmessung kümmert, der Praktikant:innen systematisch begleitet, der mit Stiftungen und Partnern kommuniziert. Nicht mehr Verwaltung — sondern die Kapazität, das zu tun, was wir gut können, in grösserem Massstab.`,
    goals: [
      'Transparentes Wirkungsmonitoring mit nachvollziehbaren KPIs',
      'Kapazität für 12-15 statt 8-10 gleichzeitige Praktikumsplätze',
      'Systematischer Aufbau von Stiftungs-Partnerschaften',
    ],
    activities: [
      'Einführung eines KPI-Tracking-Systems für alle Wirkungsbereiche',
      'Koordination zwischen Werkstatt, Integrationsprogramm und Bildungsangeboten',
      'Kontaktpflege mit Stiftungen, Zuweisenden und potenziellen Partnern',
      'Quartalsweise Wirkungsberichte und transparente Online-Dashboards',
    ],
    outcomes: [
      'Nachvollziehbare Wirkungsdaten als Grundlage für Entscheidungen und Förderanträge',
      'Mehr Menschen erhalten Zugang zu Praktikumsplätzen und Begleitung',
      'Diversifizierte Finanzierung — weniger Abhängigkeit von einzelnen Einnahmequellen',
    ],
    budget_category: 'Projektkoordination',
    themes: ['sozial', 'klima', 'bildung'],
  },

  // Project 6: Open Hardware, Robotik & Makerspace
  open_hardware: {
    title: 'Open Hardware, Robotik & Makerspace',
    subtitle: 'Selber bauen, verstehen, teilen — Technologie zum Anfassen',
    summary: `Reparieren ist der erste Schritt. Der nächste: selber bauen. Im Makerspace von Revamp-IT lernen Teilnehmende, wie Elektronik funktioniert — vom Lötkolben bis zum 3D-Drucker, vom Arduino-Projekt bis zum Roboter aus recycelten Komponenten. Alle Projekte werden offen dokumentiert und als Open Hardware veröffentlicht. So entsteht nicht nur individuelles Wissen, sondern ein Beitrag zur globalen Maker-Community.`,
    goals: [
      'Makerspace mit 3D-Druckern, Lötarbeitsplätzen und Elektronik-Werkzeugen aufbauen',
      'Monatliche Robotik- und Elektronik-Workshops für Einsteiger:innen und Fortgeschrittene',
      'Mindestens 10 Open-Hardware-Projekte pro Jahr dokumentiert und veröffentlicht',
    ],
    activities: [
      '3D-Druck-Workshops: Von der Idee zum Objekt, Reparaturteile selber drucken',
      'Elektronik-Grundlagen: Löten, Schaltungen, Arduino und Raspberry Pi',
      'Robotik aus Recycling-Komponenten: Motoren, Sensoren und Steuerung aus alten Geräten',
      'Open-Hardware-Dokumentation: Anleitungen, Schaltpläne und Bauanleitungen frei zugänglich',
    ],
    outcomes: [
      'Technisches Verständnis auf Komponentenebene — nicht nur nutzen, sondern verstehen',
      'Praktische Fähigkeiten: Löten, 3D-Druck, Programmierung, Sensorik',
      'Nachhaltige Kreislaufwirtschaft: Neue Produkte aus alten Komponenten',
      'Beitrag zur Open-Hardware-Community: Wissen, das allen gehört',
    ],
    budget_category: 'Makerspace-Programm',
    themes: ['bildung', 'digital', 'kreislaufwirtschaft'],
  },

  // Project 7: Open-Source Community Platform
  community_platform: {
    title: 'Open-Source-Community-Plattform',
    subtitle: 'Digitale Infrastruktur für Kreislaufwirtschaft und Wissenstransfer',
    summary: `Revamp-IT entwickelt eine eigene Community-Plattform als Open-Source-Software. Die Plattform umfasst einen digitalen Marktplatz für gebrauchte IT-Geräte, ein IT-Hilfe-Portal für gegenseitige Unterstützung in der Community, eine Wissensplattform mit Reparaturanleitungen und Workshops, sowie Enterprise-AI-Lösungen. Mit ${formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))} TypeScript-Dateien, PostgreSQL-Datenbank, Volltextsuche und professioneller Software-Architektur ist dies keine Bastelei, sondern produktionsreife Software — und ein konkreter Beweis, dass ein gemeinnütziger Verein anspruchsvolle Technologie entwickeln kann. Die Plattform erhöht die messbare Wirkung: Jedes Gerät wird systematisch erfasst, jeder Service-Kontakt dokumentiert, jede Reparaturanleitung erreicht unbegrenzt viele Menschen online.`,
    goals: [
      'Digitaler Marktplatz für gebrauchte IT mit transparenter Preisgestaltung und Solidaritätsmodell',
      'IT-Hilfe-Portal: Community-basierte technische Unterstützung — skaliert ohne proportionale Kostensteigerung',
      'Wissensplattform: Reparaturanleitungen, Workshops und Knowhow frei zugänglich',
      'Systematische Erfassung aller Geräte, Services und Impact-Daten für transparentes Wirkungsmonitoring',
    ],
    activities: [
      'Full-Stack-Entwicklung mit Next.js, TypeScript, PostgreSQL, Redis und Meilisearch',
      'Community-Marktplatz mit Produktkatalog, Suche und Zahlungsintegration (Payrexx)',
      'IT-Hilfe-System: Anfragen stellen, Community antwortet, Wissen wird archiviert',
      'Knowhow-Blog mit Reparaturanleitungen, Workshop-Dokumentation und Best Practices',
      'Geräte-Erfassungssystem: Vom Eingang über Refurbishing bis zum Verkauf — lückenlos dokumentiert',
    ],
    outcomes: [
      'Jedes Gerät wird systematisch erfasst — messbare Wirkungsdaten statt Schätzungen',
      'Online-Reichweite: Reparaturanleitungen und Knowhow erreichen unbegrenzt viele Menschen',
      'Skalierung ohne proportionale Kosten: Ein IT-Hilfe-Portal bedient 100 Anfragen so effizient wie 10',
      'Open Source: Andere Organisationen können die Plattform nachnutzen und anpassen',
    ],
    budget_category: 'Plattform-Entwicklung',
    themes: ['digital', 'bildung', 'kreislaufwirtschaft', 'sozial'],
  },

  // Project 8: Sovereign AI Infrastructure
  sovereign_ai: {
    title: 'Souveräne KI-Infrastruktur',
    subtitle: 'GPU-Spenden, lokale KI-Modelle, Schweizer Datensouveränität',
    summary: `Unternehmen ersetzen ihre GPU-Server alle 3-5 Jahre — genau wie bei Laptops landet funktionierende Hardware im Müll. Revamp-IT erweitert das bewährte Spendenmodell auf GPUs: Wir nehmen ausgemusterte Grafikkarten und Server entgegen, testen und clustern sie, und bauen daraus eine lokale KI-Infrastruktur. Das Ergebnis: Schweizer Organisationen können KI-Modelle nutzen, ohne Daten in ausländische Clouds zu senden — ein konkreter Beitrag zur digitalen Souveränität.`,
    goals: [
      'GPU-Cluster aus gespendeter Hardware aufbauen und betreiben',
      'KI-Workshops für Einsteiger:innen und Fortgeschrittene anbieten',
      'Lokales Hosting von Open-Source-KI-Modellen für Schweizer Organisationen',
    ],
    activities: [
      'GPU-Spenden von Unternehmen entgegennehmen, testen und in Cluster integrieren',
      'Workshops zu KI-Grundlagen, Prompt Engineering und lokalen Modellen',
      'Fine-Tuning-Services für Schweizer KMU und NPOs',
      'Souveränes KI-Hosting: Schweizer Daten bleiben in der Schweiz',
    ],
    outcomes: [
      'Schweizer Datensouveränität: KI ohne CLOUD Act und Schrems II-Risiken',
      'KI-Kompetenz in der Breite: Nicht nur für Tech-Konzerne, sondern für alle',
      'Selbsttragende Einnahmen durch Hosting- und Fine-Tuning-Dienstleistungen',
      'Kreislaufwirtschaft auch bei GPUs: Zweites Leben statt Elektroschrott',
    ],
    budget_category: 'AI-Infrastruktur',
    themes: ['digital', 'bildung'],
  },
};

// ============================================================================
// ============================================================================
// ANSCHREIBEN - Cover letter building blocks per foundation type
// ============================================================================

export const ANSCHREIBEN_TEMPLATES: Record<FoundationType, { opening: string; closing: string }> = {
  A: {
    opening: `Wir erlauben uns, Ihnen ein Fördergesuch für unser Projekt einzureichen. Als gemeinnütziger Verein mit ${ORG_PROFILE.experienceLabel} in der Verbindung von Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung möchten wir Ihnen eine Zusammenarbeit vorschlagen.`,
    closing: 'Wir freuen uns auf Ihre Rückmeldung und stehen für ein Gespräch jederzeit zur Verfügung. Gerne senden wir Ihnen weitere Unterlagen zu.',
  },
  B: {
    opening: `Revamp-IT verbindet seit über ${ORG_PROFILE.yearsActive} Jahren Umweltschutz mit sozialer Integration — ein Anliegen, das uns mit Ihrer Stiftung verbindet. Wir möchten Ihnen zeigen, wie eine Partnerschaft konkret aussehen könnte.`,
    closing: 'Wir würden uns sehr über ein persönliches Gespräch freuen, um unsere Arbeit und mögliche Synergien vorzustellen.',
  },
  C: {
    opening: 'In Zürich reparieren wir Computer, die sonst im Müll landen würden — und geben gleichzeitig Menschen eine zweite Chance auf dem Arbeitsmarkt. Dürfen wir Ihnen kurz erzählen, was wir tun?',
    closing: 'Wir würden uns freuen, von Ihnen zu hören. Ein kurzes Telefonat genügt, um zu klären, ob eine Unterstützung in Frage kommt.',
  },
  D: {
    opening: 'Als gemeinnütziger Verein an der Schnittstelle von Kreislaufwirtschaft, digitaler Bildung und Arbeitsintegration bietet Revamp-IT konkrete Partnerschaftsmodelle für Unternehmen: Hardware-Spenden (Computer und GPUs) erhalten ein zweites Leben, Corporate Placements ermöglichen sinnvolle Outplacement-Lösungen, und unsere Bildungsprogramme stärken digitale Kompetenzen in der Region. Wir möchten Ihnen eine Zusammenarbeit vorschlagen, die messbare soziale, ökologische und wirtschaftliche Wirkung erzielt.',
    closing: 'Wir freuen uns auf Ihre Rückmeldung und stehen für eine Präsentation unserer Impact-Daten und Partnerschaftsmodelle jederzeit bereit.',
  },
  network: {
    opening: `Revamp-IT ist seit ${ORG_PROFILE.founded} in Zürich aktiv und verbindet Kreislaufwirtschaft mit sozialer Integration. Wir interessieren uns für eine Mitgliedschaft und mögliche Partnerschaften.`,
    closing: 'Wir freuen uns auf den Austausch.',
  },
};

// ============================================================================
// THEME MAPPING - Foundation ThemeIds → Story ThemeKeys
// ============================================================================

/** Maps foundation ThemeId values to story ThemeKey values */
export const THEME_ID_TO_STORY_KEY: Record<ThemeId, ThemeKey> = {
  'klima': 'klima',
  'kreislaufwirtschaft': 'kreislaufwirtschaft',
  'soziale-integration': 'sozial',
  'digitale-bildung': 'bildung',
  'digitale-souveraenitaet': 'digital',
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
// PARTNER HIGHLIGHTS — Prominent partnerships (Robert: "angeben, dass die Stadt uns unterstützt")
// ============================================================================

export const PARTNER_HIGHLIGHTS = [
  {
    name: 'Stadt Zürich',
    relationship: 'Die Sozialen Einrichtungen der Stadt Zürich weisen regelmässig Praktikant:innen an Revamp-IT zu. Diese langjährige Zusammenarbeit bestätigt die Qualität unserer Integrationsarbeit.',
    since: `seit ${ORG_PROFILE.milestones.integrationProgram}`,
  },
];

// ============================================================================
// ANECDOTES — Human stories with [placeholder] markers (Robert: "Anektoden mit Menschen sind cool")
// ============================================================================

const ANECDOTES: Anecdote[] = [
  {
    id: 'integration_success',
    template: 'Ein Praktikant kam über die Sozialen Einrichtungen der Stadt Zürich zu uns. Nach sechs Monaten in der Werkstatt — von der Hardware-Diagnose über Reparaturen bis zur Linux-Installation — hatte er sich ein solides IT-Profil aufgebaut. Heute arbeitet er als IT-Supporter bei einem Zürcher KMU.',
    themes: ['sozial', 'bildung'],
    placement: 'why',
  },
  {
    id: 'klima_impact',
    template: 'Eine Zürcher Firma spendete 40 ausgemusterte Laptops. Unsere Praktikant:innen diagnostizierten jedes Gerät, tauschten defekte Komponenten und installierten Linux. 30 Geräte gingen an eine Schule und einen gemeinnützigen Verein. Die restlichen 10 lieferten Ersatzteile für künftige Reparaturen. Kein einziges Gerät landete im Müll.',
    themes: ['klima', 'kreislaufwirtschaft'],
    placement: 'why',
  },
  {
    id: 'digital_empowerment',
    template: 'Eine Teilnehmerin hatte noch nie einen eigenen Computer. Im Workshop bei Revamp-IT lernte sie Schritt für Schritt: E-Mail einrichten, Dokumente erstellen, sicher im Internet recherchieren. Am Ende nahm sie ein refurbished Laptop mit nach Hause — zum Solidaritätspreis von 50 Franken.',
    themes: ['bildung', 'digital'],
    placement: 'why',
  },
  {
    id: 'werkstatt_daily',
    template: 'An einem typischen Tag in der Werkstatt: Ein Praktikant testet Akkus, eine Kollegin lötet einen USB-Port, ein dritter installiert Linux Mint auf einem ThinkPad von 2018. Drei Menschen, drei Geschichten, ein gemeinsames Ziel — und am Ende des Tages fünf Geräte mehr, die wieder funktionieren.',
    themes: ['sozial', 'klima', 'kreislaufwirtschaft', 'bildung', 'digital'],
    placement: 'how',
  },
];

// ============================================================================
// PHOTO SLOTS — Placeholder descriptions (Robert: "+ Bilder", team: Bruno/Mohannad)
// ============================================================================

const PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: 'werkstatt_overview',
    description: '[Foto: Werkstatt-Übersicht — Praktikant:innen bei der Arbeit an Geräten, Badenerstrasse 816]',
    placement: 'why',
  },
  {
    id: 'team_working',
    description: '[Foto: Nahaufnahme — Hände bei der Reparatur eines Laptops (Tastatur/Mainboard)]',
    placement: 'how',
  },
  {
    id: 'refurbished_devices',
    description: '[Foto: Fertige Geräte — aufbereitete Laptops mit Linux-Desktop, bereit für den Verkauf]',
    placement: 'projects',
    themes: ['klima', 'kreislaufwirtschaft', 'digital'],
  },
  {
    id: 'workshop_scene',
    description: '[Foto: Workshop — Teilnehmende lernen am eigenen Gerät, Kursleiter erklärt]',
    placement: 'projects',
    themes: ['bildung'],
  },
  {
    id: 'team_portrait',
    description: '[Foto: Teamfoto — Kernteam und Praktikant:innen vor der Werkstatt, Badenerstrasse 816]',
    placement: 'kurzportrait',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get projects matching specific themes (internal — used by composeStory) */
function getProjectsByTheme(theme: string): Project[] {
  return Object.values(PROJECTS).filter((p) => p.themes.includes(theme));
}

/**
 * Find evidence by key across all categories
 */
export function findEvidence(key: string): Evidence | null {
  for (const category of Object.keys(EVIDENCE)) {
    if (EVIDENCE[category][key]) return EVIDENCE[category][key];
  }
  return null;
}

/**
 * Get anecdotes matching a theme and placement
 */
export function getAnecdotes(theme: ThemeKey, placement: 'why' | 'how'): Anecdote[] {
  return ANECDOTES.filter(
    (a) => a.placement === placement && a.themes.includes(theme),
  );
}

/**
 * Get photo slots matching a placement and optional theme
 */
export function getPhotoSlots(placement: PhotoSlot['placement'], theme?: ThemeKey): PhotoSlot[] {
  return PHOTO_SLOTS.filter(
    (p) => p.placement === placement && (!p.themes || !theme || p.themes.includes(theme)),
  );
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
      // Include relevant competency sections based on themes (deduplicated)
      competencies: allThemes
        .flatMap((t) => {
          if (t === 'klima') return [HOW.environmental];
          if (t === 'kreislaufwirtschaft') return [HOW.technical];
          if (t === 'sozial') return [HOW.social];
          if (t === 'bildung') return [HOW.bildung];
          if (t === 'digital') return [HOW.digital];
          return [];
        })
        .filter((c, i, arr): c is CompetencySection => arr.indexOf(c) === i),
    },
    // Collect projects from ALL themes, deduplicated and in order
    projects: [...new Set(allThemes.flatMap((t) => getProjectsByTheme(t)))],
    evidence:
      WHY[primaryTheme].evidence
        ?.map((key) => findEvidence(key))
        .filter((e): e is Evidence => e !== null) ?? [],
  };
}
