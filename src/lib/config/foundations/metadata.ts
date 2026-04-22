/**
 * Foundation Metadata — Lookup tables and reference data
 *
 * FOUNDATION TYPES (Robert Schmuki classification):
 * A = Professionalisierte Förderstiftung
 * B = Potente Familienstiftung
 * C = Kleine Familienstiftung
 * D = Corporate Foundation
 * network = Netzwerk/Verband
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */

import type {
  Theme,
  ThemeId,
  Source,
  SourceId,
  FoundationType,
  FoundationStatus,
  TypeLabel,
  StatusLabel,
  ApplicationMethod,
} from '../../schemas/foundation';

// Human-readable labels for ApplicationMethod enum values.
// Hide when value is 'unknown' or 'none' (no useful info to show).
export const APPLICATION_METHOD_LABELS: Record<ApplicationMethod, string | null> = {
  email:       'Per E-Mail',
  online:      'Online-Formular',
  post:        'Per Post',
  contact:     'Auf Anfrage',
  direct:      'Direkte Kontaktaufnahme',
  personal:    'Persönliches Gespräch',
  partnership: 'Partnerschaft',
  via_partner: 'Über Partner',
  membership:  'Mitgliedschaft',
  contract:    'Vertrag',
  none:        null,   // no open applications — shown as warning elsewhere
  unknown:     null,   // no data — hide rather than display "unknown"
  invitation:  'Nur auf Einladung',
};

// ============================================================================
// THEME DEFINITIONS - Revamp-IT relevant categories
// ============================================================================

export const THEMES: Record<ThemeId, Theme> = {
  klima: {
    id: 'klima',
    label: 'Klima & Umwelt',
    icon: '\u{1F30D}',
    description: 'Klimaschutz, CO2-Reduktion, Nachhaltigkeit',
    color: '#10b981',
  },
  kreislaufwirtschaft: {
    id: 'kreislaufwirtschaft',
    label: 'Kreislaufwirtschaft',
    icon: '\u267B\uFE0F',
    description: 'Wiederverwendung, Reparatur, E-Waste',
    color: '#059669',
  },
  'soziale-integration': {
    id: 'soziale-integration',
    label: 'Soziale Integration',
    icon: '\u{1F91D}',
    description: 'Benachteiligte, Chancengleichheit, Second Chance',
    color: '#8b5cf6',
  },
  'digitale-bildung': {
    id: 'digitale-bildung',
    label: 'Digitale Bildung',
    icon: '\u{1F4BB}',
    description: 'IT-Workshops, Tech Skills, Medienkompetenz',
    color: '#3b82f6',
  },
  'digitale-souveraenitaet': {
    id: 'digitale-souveraenitaet',
    label: 'Digitale Souver\u00E4nit\u00E4t',
    icon: '\u{1F513}',
    description: 'Open Source, Linux, Unabh\u00E4ngigkeit',
    color: '#6366f1',
  },
  zuerich: {
    id: 'zuerich',
    label: 'Region Z\u00FCrich',
    icon: '\u{1F4CD}',
    description: 'Stadt oder Kanton Z\u00FCrich Fokus',
    color: '#ef4444',
  },
  arbeitsintegration: {
    id: 'arbeitsintegration',
    label: 'Arbeitsintegration',
    icon: '\u{1F4BC}',
    description: 'Arbeitsmarkt-Integration, Besch\u00E4ftigung',
    color: '#14b8a6',
  },
} as const satisfies Record<ThemeId, Theme>;

// ============================================================================
// SOURCE DEFINITIONS - Where we found the foundation
// ============================================================================

export const SOURCES: Record<SourceId, Source> = {
  manual: {
    id: 'manual',
    label: 'Eigenrecherche',
    description: 'Direkt recherchiert oder durch Netzwerk gefunden',
  },
  fundraiso: {
    id: 'fundraiso',
    label: 'Fundraiso.ch',
    url: 'https://www.fundraiso.ch',
    description: "13'300+ Schweizer Stiftungen",
  },
  stiftungschweiz: {
    id: 'stiftungschweiz',
    label: 'Spheriq (ex StiftungSchweiz)',
    url: 'https://app.spheriq.ch',
    description: "~14'000 Stiftungen mit SDG-/Themen-/Zielgruppenfilter (Login erforderlich)",
  },
  esa: {
    id: 'esa',
    label: 'Eidg. Stiftungsaufsicht',
    url: 'https://www.esa.admin.ch/de/stiftungsverzeichnis',
    description: 'Offizielles Bundesregister',
  },
  zefix: {
    id: 'zefix',
    label: 'Zefix',
    url: 'https://www.zefix.admin.ch',
    description: 'Zentraler Firmenindex (Handelsregister)',
  },
  website: {
    id: 'website',
    label: 'Eigene Website',
    description: 'Informationen von der Website der Stiftung',
  },
  cantonal: {
    id: 'cantonal',
    label: 'Kantonale Aufsicht',
    description: 'Kantonales Stiftungsregister',
  },
} as const satisfies Record<SourceId, Source>;

// ============================================================================
// TYPE LABELS (Robert Schmuki classification)
// ============================================================================

export const TYPE_LABELS: Record<FoundationType, TypeLabel> = {
  A: {
    short: 'A',
    long: 'Professionalisierte F\u00F6rderstiftung',
    desc: 'Professionelles Management, Entscheide basieren auf Analysen & Normen',
    approach: 'Strukturierte Antr\u00E4ge, Impact-Metriken, professionelle Kommunikation',
  },
  B: {
    short: 'B',
    long: 'Potente Familienstiftung',
    desc: 'Familienstiftung mit Administration, pers\u00F6nliche Interessen relevant',
    approach: 'Pers\u00F6nliche Beziehung aufbauen, Story erz\u00E4hlen, Werte teilen',
  },
  C: {
    short: 'C',
    long: 'Kleine Familienstiftung',
    desc: 'Kleines Gremium (3-5 Personen), emotionale Entscheide, direkte Bewerbung',
    approach: 'Direkter Kontakt, emotionaler Appeal, kurze pr\u00E4gnante Anfrage',
  },
  D: {
    short: 'D',
    long: 'Corporate Foundation',
    desc: 'Professionell aber weniger transparent, normbasierte Prozesse',
    approach: 'Alignment mit Unternehmenszielen zeigen, CSR-Sprache verwenden',
  },
  network: {
    short: 'N',
    long: 'Netzwerk',
    desc: 'Netzwerk/Verband - keine direkte F\u00F6rderung',
    approach: 'Mitgliedschaft f\u00FCr Sichtbarkeit und Partnerschaften',
  },
} as const satisfies Record<FoundationType, TypeLabel>;

// ============================================================================
// STATUS LABELS
// ============================================================================

export const STATUS_LABELS: Record<FoundationStatus, StatusLabel> = {
  open: { text: 'Offen', class: 'open', desc: 'Bewerbungen werden angenommen' },
  closed: { text: 'Geschlossen', class: 'closed', desc: 'Aktuell keine Bewerbungen m\u00F6glich' },
  soon: { text: '\u00D6ffnet bald', class: 'soon', desc: 'Bewerbungsportal \u00F6ffnet demn\u00E4chst' },
  rolling: { text: 'Laufend', class: 'rolling', desc: 'Jederzeit bewerbbar' },
} as const satisfies Record<FoundationStatus, StatusLabel>;

// ============================================================================
// PRIORITY CONFIG
// ============================================================================
// Priority is a manual strategic assessment: how important is this foundation
// for our fundraising strategy? Lower number = higher priority.
// Determines resource allocation and whether a Gesuch page is generated (≤ 2).

export interface PriorityConfig {
  label: string;
  description: string;
  /** Short action label for dropdowns (e.g. 'Jetzt', 'Bald') */
  shortLabel: string;
  /** Badge style: background + text color (e.g. 'bg-danger-bg text-danger') */
  color: string;
  /** Text-only color for inline labels (e.g. 'text-danger') */
  textColor: string;
  /** Card style: border + background for stat cards (e.g. 'border-danger/20 bg-danger-bg') */
  cardColor: string;
}

export const PRIORITY_CONFIG: Record<number, PriorityConfig> = {
  1: {
    label: 'P1',
    shortLabel: 'Jetzt',
    description: 'Erstpriorität — Gesuch aktiv vorbereiten',
    color: 'bg-danger-bg text-danger',
    textColor: 'text-danger',
    cardColor: 'border-danger/20 bg-danger-bg',
  },
  2: {
    label: 'P2',
    shortLabel: 'Bald',
    description: 'Hohe Priorität — gezielt bewerben',
    color: 'bg-warning-bg text-warning',
    textColor: 'text-warning',
    cardColor: 'border-warning/20 bg-warning-bg',
  },
  3: {
    label: 'P3',
    shortLabel: 'Später',
    description: 'Beobachten — bei passendem Timing bewerben',
    color: 'bg-primary/10 text-primary',
    textColor: 'text-primary',
    cardColor: 'border-primary/20 bg-primary/5',
  },
  4: {
    label: 'P4',
    shortLabel: 'Netzwerk',
    description: 'Niedrige Priorität — Beziehung pflegen',
    color: 'bg-grey-light text-text-muted',
    textColor: 'text-text-muted',
    cardColor: 'border-border bg-bg-light',
  },
};

// ============================================================================
// FIT SCORE CONFIG - Re-exported from SSOT (lib/config/fit-scoring.ts)
// ============================================================================

export { FIT_DISPLAY as FIT_CONFIG } from '../fit-scoring';

// ============================================================================
// NOT RECOMMENDED - Foundations that don't fit Revamp-IT
// ============================================================================

export const NOT_RECOMMENDED = [
  { name: 'Avina Stiftung', reason: 'Nur Ern\u00E4hrung/Food - "Soziale Projekte" explizit ausgeschlossen (best\u00E4tigt Feb 2026)' },
  { name: 'Velux Stiftung', reason: 'Nur akademische Forschung (Tageslicht, Wald, Alter) - nur Uni-Angestellte (best\u00E4tigt Feb 2026)' },
  { name: 'Stiftung Walder', reason: 'Nur Projekte f\u00FCr Senioren (65+)' },
  { name: 'Pestalozzi-Stiftung', reason: 'F\u00FChrt eigene Programme, keine externe F\u00F6rderung' },
  { name: 'UBS Optimus Foundation', reason: 'Aktuell geschlossen f\u00FCr Bewerbungen, globaler Fokus' },
  { name: 'Swiss Re Foundation', reason: 'Nur Entwicklungsl\u00E4nder' },
  { name: 'Coop Nachhaltigkeitsfonds', reason: 'Stark auf Food fokussiert, "Kerngesch\u00E4ft-Verbindung" n\u00F6tig' },
  { name: 'Ernst Schmidheiny Stiftung', reason: 'Aufgel\u00F6st (Liquidation abgeschlossen Okt 2023)' },
  { name: 'Arcas Foundation', reason: 'Aufgel\u00F6st 2022, keine Antr\u00E4ge mehr m\u00F6glich' },
  { name: 'Christoph Merian Stiftung', reason: 'Nur Stadt Basel - geografische Beschr\u00E4nkung' },
  { name: 'Volkart Stiftung', reason: 'Sozialbereich nur auf Einladung, aktuell geschlossen f\u00FCr Gesuche' },
  { name: 'Stiftung Wegweiser', reason: 'Nur Bildungsinstitutionen f\u00FCr Jugendpers\u00F6nlichkeitsentwicklung - zu enge Nische' },
  { name: 'Roger Federer Foundation', reason: 'Keine externen Antr\u00E4ge, nur Fr\u00FChkindliche Bildung' },
  { name: 'Jacobs Foundation', reason: 'Keine unaufgeforderten Antr\u00E4ge, forschungsorientiert' },
  { name: 'Oak Foundation', reason: 'Kein passendes Programm, sehr tiefe Annahmequote' },
  { name: 'Z Zurich Foundation', reason: 'Kein offener Antragsprozess - w\u00E4hlt Partner selbst aus' },
  { name: 'STI Stiftung (Biel)', reason: 'Nur Startups im Espace Mittelland, Darlehen statt Grants' },
  { name: 'IKEA Stiftung Schweiz', reason: 'Nur Design/Architektur/Kunsthandwerk' },
  { name: 'Werner Siemens-Stiftung', reason: 'Nur universitaere Mega-Forschung (CHF 5-15 Mio. pro Projekt) - falscher Massstab' },
  { name: 'SIG For Better Foundation', reason: 'Corporate Stiftung fürLebensmittelverpackung/Food Waste - Fokus Entwicklungsländer' },
  { name: 'Blue Earth Foundation', reason: 'Nimmt keine externen Gesuche an - operiert über Blue Earth Capital (Impact Investor)' },
  { name: 'Stiftung fürBevoelkerung, Migration und Umwelt', reason: 'Aufgeloest Mai 2020' },
  { name: 'Innovationsstiftung SZKB', reason: 'VC fürTech-Startups (CHF 300k-2M Eigenkapital/Darlehen) - Kt. Schwyz Fokus' },
  { name: 'Gemeinnütziger Fonds Bildung (Kanton Zürich)', reason: 'Aufgelöst Ende 2023 — Bildungsförderung an Swisslos Gemeinnützigen Fonds richten' },
  // Batch 6: ESA candidate research (false positives)
  { name: 'Bridging Nations Stiftung', reason: 'Kunst/kulturelle Diplomatie/interreligioeser Dialog - kein Technologie/IT-Bezug' },
  { name: 'SEFA KAYA FOUNDATION', reason: 'Nur Entwicklungsländer mit hoher Armut - kein Schweiz-Inland' },
  { name: 'UTIL Stiftung', reason: 'Fokus Asien (Social Impact Investor) - nicht fürSchweizer Projekte' },
  { name: 'Stiftung Horyzon', reason: 'Operatives Hilfswerk (YMCA/YWCA) nur in Entwicklungsländern - keine externe Förderung' },
  { name: 'Arco Foundation (Winterthur)', reason: 'Dachstiftung/Donor-Advised Fund - nimmt explizit keine Gesuche an' },
  { name: 'Fondation e-Sankt Moritz', reason: 'E-Mobilitaet/Transport-Fokus + primaer Vermoegensverwaltung' },
  { name: 'Schilling-Stiftung', reason: 'Nord-Sued-Entwicklungszusammenarbeit (Mikrokredite Bauern/Fischer) - nicht CH-Inland' },
  { name: 'Stiftung Fritz Boesch', reason: 'Individuelle Stipendien nur fürBewohner:innen Lyss (BE) unter 20 Jahren' },
  { name: 'Marigold Philanthropic Foundation', reason: 'Biodiversität/Ökosystem-Restaurierung - kein IT/Digital/Kreislaufwirtschaft' },
  { name: 'Stiftung Symphasis', reason: 'Geschlossener Partnerkreis - nimmt grundsaetzlich keine Gesuche an' },
  { name: 'Hamasil Stiftung', reason: 'Nimmt prinzipiell keine Gesuche an - sucht proaktiv Langzeit-Partner' },
  { name: 'Fondation Botnar', reason: 'Schweiz nur fürForschungsprojekte - Einladung only - kein offener Antragsprozess' },
  // Leopold Bachmann Stiftung → in STIFTUNGEN_DATA (slug: leopold-bachmann)
  // Batch 7: ESA Zürich candidates
  { name: 'Hulda und Gustav Zumsteg-Stiftung', reason: 'Kunst/Gastronomie/Textil - kein IT/Digital/Sozial-Bezug' },
  { name: 'Annette Ringier-Stiftung', reason: 'Nur benannte Partnerorganisationen + Ringier-Mitarbeiter-Wohlfahrt' },
  { name: 'STIFTUNG ACCENTUS', reason: 'Akzeptiert keine unaufgeforderten Bewerbungen - fester Partnerkreis' },
  { name: 'Rudolf und Romilda Kaegi-Stiftung', reason: 'Keine unaufgeforderten Gesuche + Biodiversität/Bergregionen/Behinderung' },
  { name: 'Juerg Walter Meier-Stiftung', reason: 'Nur Alleinerziehende/Behinderte - keine Bildungsfinanzierung - sehr bescheiden' },
  { name: 'Jean Anderson Studenten SOS Stiftung', reason: 'Stipendienfonds fürEinzelpersonen (ETH/UZH) - nicht fürOrganisationen' },
  { name: 'ROKPA Unterstuetzungs-Stiftung', reason: 'Operativ (ROKPA International) - nur Himalaya/Suedafrika' },
  { name: 'HC FAMILY FOUNDATION', reason: 'Geografischer Fokus: Argentinien und Uruguay' },
  { name: 'PEMOL-Baumann-Stiftung', reason: 'Libertaere Werte + Landwirtschaft + Alternativmedizin - Falschmatch (politische Souveraenitaet)' },
  // Batch 7: ESA non-ZH candidates
  { name: 'Swiss Osteopath', reason: 'Nur Gesundheit/Osteopathie - kein IT/Sozial-Bezug' },
  { name: 'Cartago Foundation', reason: 'Budget erschoepft - kann keine weiteren Projekte unterstützen' },
  { name: '3hf Stiftung Schweiz', reason: 'Operativ, Aktivitäten werden reduziert - nur noch Naturpädagogik (Bienenschule)' },
  { name: 'TrustBridge Global Foundation', reason: 'Dachstiftung/Donor-Advised-Fund-Plattform - kein Förderer' },
  { name: 'We Share Forward Foundation', reason: 'Landwirtschaft/Gesundheit/Nahrung SDGs - Afrika/Ukraine-Fokus' },
  { name: 'AMBUHL MANDELBAUM FOUNDATION', reason: 'In Liquidation/Konkurs (August 2025) - kein Vermoegen mehr' },
  { name: 'Stiftung Bildungswerkstatt Bergwald', reason: 'Operativ (Waldpädagogik) - keine externen Projektförderung' },
  { name: 'Integrated Sustainable Development Foundation', reason: 'Nur informelle Siedlungen in Afrika (Khayelitsha) - kein Schweiz-Fokus' },
  { name: 'Heinrich Renggli Stiftung', reason: 'Behinderung, Tierschutz, Altenpflege - kein IT/Digital/Kreislauf' },
  { name: 'Ernesto Bertarelli Stiftung', reason: 'Marine Wissenschaft + Gstaad Community - Familienphilanthropie ohne IT-Bezug' },
  { name: 'Qhubeka Stiftung', reason: 'Operativ - stellt Fahrraeder in Afrika her - kein Schweiz-Projektfokus' },
  // Batch 7: Well-known Swiss foundations
  { name: 'Hatt-Bucher-Stiftung', reason: 'Nur Seniorenbetreuung/Altenpflege (65+)' },
  { name: 'Daetwyler Stiftung', reason: 'Primaer Kanton Uri + Kultur - geografisch/thematisch nicht passend' },
  { name: 'Helmut Horten Stiftung', reason: 'Nur medizinische Grundlagenforschung' },
  { name: 'Limmat Stiftung', reason: 'Religioese Ausrichtung (Opus Dei) - nicht passend fürunabhaengiges Sozialunternehmen' },
  { name: 'Gottfried Keller-Stiftung', reason: 'Nur bildende Kunst fürMuseen' },
  { name: 'Stiftung Denk an mich', reason: 'Nur Freizeit/Ferien fürMenschen mit Behinderung - zu enge Nische' },
  { name: 'Walter Haefner Stiftung', reason: 'Kein offener Antragsprozess - primaer Forschung und Kultur' },
  { name: 'Empiris Stiftung', reason: 'Dachstiftung fürWissenschaft - kein offener Antragsprozess' },
  { name: 'Stiftung Edith Maryon', reason: 'Nur Immobilien/Landentspekulation - kein IT/Bildungs/Integrationsbezug' },
  { name: 'MAVA Foundation', reason: 'Förderaktivitaeten beendet (Sunsetting 2022)' },
  { name: 'Stiftung IPT', reason: 'Operativ - Dienstleister fürberufliche Integration, kein Förderer' },
  // Batch 7: Final research
  { name: 'Kathrin Schweizer-Stiftung', reason: 'Derzeit keine Gesuche - Neuorientierung der Stiftung bis auf Weiteres' },
  { name: 'Stiftung Alpenblick Gstaad', reason: 'Operativ - betreibt eigenes Ferienhaus fürbenachteiligte Familien' },
  { name: 'Maria und Rudolf Laederach Stiftung', reason: 'Keine Gesuche - Vergabe nur durch Stiftungsrat - Fokus Kakaobauern/Ghana' },
  { name: 'Ursula Joshi Stiftung', reason: 'Keine offene Bewerbung - Vergabe nur durch Stiftungsrat - Fokus Indien' },
  { name: 'EDUCA SWISS', reason: 'Individuelle Bildungskredite - kein Förderprogramm fürOrganisationen' },
  // Batch 8: IT/tech social enterprise funders (a9847fa)
  { name: 'Paradies-Stiftung fürsoziale Innovation', reason: 'Nimmt keine Gesuche an - Stiftungsrat waehlt proaktiv aus' },
  { name: 'Stiftung fürangepasste Technologie und Sozialoekologie', reason: 'Operativ (Oekozentrum) - kein Förderprogramm fürexterne Projekte' },
  { name: 'Beatrice Ederer-Weber Stiftung', reason: 'Nur Behinderung/Innovation und Tierschutz - zu enge Nische fürRevamp-IT' },
  // Batch 9: Fundraiso discovery Phase 3 exclusions (Feb 2026, ad6ef8d)
  { name: 'reSPact Foundation', reason: 'Operativ - führt eigene Nachhaltigkeitsprojekte, keine externe Förderung' },
  { name: 'Malia Stiftung', reason: 'Operativ - Arbeitsintegrationsdienste in Altstätten SG, nicht Zürich, kein Förderer' },
  { name: 'Heinrich & Erna Walder-Bachmann Stiftung', reason: 'Operativ - betreibt Seniorenwohnungen, keine Jugendförderung' },
  { name: 'Brockenhaus Reimal Stiftung', reason: 'Operativ - Brockenhaus für Arbeitsintegration (ähnlich Revamp-IT Modell), kein Förderer' },
  { name: 'Schweizer Jugend forscht', reason: 'Operativ - führt eigenes Jugend-Wissenschaftsprogramm, keine externe Projektförderung' },
  { name: 'Lucie Gunst-Stiftung', reason: 'Standort Luzern nicht Zürich + Thema Denkmalpflege, nicht Jugend/IT' },
  { name: 'Zurich Community Trust', reason: 'Birmingham UK, nicht Zürich Schweiz - komplett falscher Eintrag auf Fundraiso' },
  { name: 'Stiftung Kreislaufwirtschaft Schweiz', reason: 'Existiert nicht - kein Eintrag in ESA oder offiziellem Register' },
  { name: 'Rutz-Möbius-Stiftung', reason: 'Existiert nicht - nicht auffindbar in öffentlichen Datenbanken' },
  { name: 'Iris & Matthias Mettler-Hofer Stiftung', reason: 'Existiert nicht - kein Eintrag in ESA oder Zefix' },
  { name: 'Stiftung Zukunftsfähig', reason: 'Existiert nicht - kein Eintrag in ESA oder offiziellen Registern' },
  { name: 'Stiftung für Wissenschaft und Gesellschaft', reason: 'Existiert nicht unter diesem Namen - möglicherweise Science et Cité (operativ)' },
] as const;

// ============================================================================
// FOUNDATION DATABASES - For finding more foundations
// ============================================================================

export const DATABASES = [
  {
    name: 'Fundraiso.ch',
    url: 'https://www.fundraiso.ch/de/page/stiftungsverzeichnis-schweiz',
    count: "13'300+",
    cost: 'Basis: Gratis / Pro: Abo',
    description: 'T\u00E4glich aktualisierte Datenbank aller gemeinn\u00FCtzigen Stiftungen der Schweiz',
  },
  {
    name: 'Spheriq (ex StiftungSchweiz)',
    url: 'https://app.spheriq.ch',
    count: "~14'000",
    cost: 'Login erforderlich / Premium: Abo',
    description: 'Beste Filteroptionen: SDGs, Wirkungsart, Themengebiet, Zielgruppe. Rebranded von StiftungSchweiz (Feb 2026)',
  },
  {
    name: 'Eidg. Stiftungsaufsicht (ESA)',
    url: 'https://www.esa.admin.ch/de/stiftungsverzeichnis',
    count: "~5'400",
    cost: 'Gratis',
    description: 'Offizielles Bundesregister der Stiftungen unter Bundesaufsicht. Excel-Download mit UID, Zweck, Kanton',
  },
] as const;
