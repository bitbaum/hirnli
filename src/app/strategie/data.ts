/* ────────────────────────────────────────────
   Static data for the strategie page

   ORG-SPECIFIC: Content written for Revamp-IT.
   To support a new org, rewrite this file's content.
   Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
   ──────────────────────────────────────────── */

import { HUB_SPACE_DISPLAY, PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import { getNumericValue } from '@/lib/config/numbers';
import { formatNumber } from '@/lib/utils/format';

export const VALUES = [
  { icon: '🌍', title: 'Nachhaltigkeit', description: 'Wir verlängern die Lebensdauer von IT-Geräten und reduzieren aktiv Elektroschrott und CO2-Emissionen.', color: 'border-l-emerald-500' },
  { icon: '🔓', title: 'Offenheit', description: 'Wir setzen auf Open Source Software, transparente Prozesse und teilen unser Wissen frei mit der Community.', color: 'border-l-blue-500' },
  { icon: '🤝', title: 'Inklusion', description: 'Wir schaffen Zugang zu Technologie für alle – unabhängig von Einkommen, Vorwissen oder Herkunft.', color: 'border-l-violet-500' },
  { icon: '💡', title: 'Befähigung', description: 'Wir bilden Menschen aus, vermitteln Fähigkeiten und schaffen Perspektiven für berufliche Entwicklung.', color: 'border-l-amber-500' },
  { icon: '⚡', title: 'Innovation', description: 'Wir finden kreative Lösungen für alte Probleme und beweisen, dass Nachhaltigkeit und Leistung Hand in Hand gehen.', color: 'border-l-red-500' },
  { icon: '🎯', title: 'Wirkung', description: 'Jede unserer Aktivitäten dient einem messbaren ökologischen, sozialen oder ökonomischen Nutzen.', color: 'border-l-cyan-500' },
] as const;

export const PILLARS = [
  { icon: '♻️', title: '1. Umweltschutz', description: 'Reduktion von Elektroschrott durch Wiederinstandsetzung, Reparatur, Weiterverwendung und fachgerechtes Recycling' },
  { icon: '🐧', title: '2. Digitale Souveränität', description: 'Förderung von Linux & Open-Source Software als nachhaltige, kostengünstige und befähigende Technologieoption — inklusive Eigenentwicklung einer Community-Plattform mit Marktplatz, IT-Hilfe und Wissensportal' },
  { icon: '📚', title: '3. Bildung & Aufklärung', description: 'Workshops, technische Unterstützung und niederschwellige Lernangebote — von Reparaturwissen bis zu digitalen Kompetenzen in einer Welt, die sich durch Automatisierung und KI rasant verändert' },
  { icon: '🤝', title: '4. Soziale Integration', description: 'Unterstützung bei der beruflichen Wiedereingliederung durch Struktur, Routinen und sinnvolle Tätigkeiten — besonders wichtig, wenn Automatisierung traditionelle Berufsbilder verändert' },
] as const;

export const VISION_TARGETS = [
  {
    value: HUB_SPACE_DISPLAY,
    label: 'Community Tech Hub in Zürich Agglomeration',
    source: {
      methodology: 'Detaillierter Raumplan (fundraising/data.ts SPACE_PLAN) + Mietkalkulation budget-scenarios.ts',
      confidence: 'medium',
      lastVerified: '2026-02-16',
      notes: 'Mietkosten: ~600m² × CHF 200/m²/Jahr = CHF 120k/Jahr (Agglomeration). Quelle: budget-scenarios.ts',
    },
  },
  {
    value: 'Schweizweit',
    label: 'Netzwerk von Repair-Hubs aufbauen',
    source: {
      methodology: 'Vision für föderales Modell: Zürich als Flagship-Hub, Franchise-/Partner-Modell für weitere Städte',
      confidence: 'aspirational',
      lastVerified: '2026-01-15',
      notes: 'Erfordert: Standardisierte SOPs, Train-the-Trainer Programme, zentrale Logistik',
    },
  },
  {
    value: PEOPLE_REACHED_PER_YEAR,
    label: 'Menschen pro Jahr direkt trainiert (Jahr 3)',
    source: {
      methodology: 'Konservative Schätzung: 2× BPL direkte Trainings + Workshop-Teilnehmer',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
      notes: 'Hardware-BPL 8-12 + Software-BPL 6-10 + Workshops 20-40 = 40-60 Menschen/Jahr',
    },
  },
  {
    value: '100%',
    label: 'Aller Einnahmen fliessen zurück in die Mission',
    source: {
      methodology: 'Gemeinnütziger Verein (non-profit): Per Statuten keine Gewinnausschüttung, alle Einnahmen reinvestiert in Mission',
      confidence: 'high',
      lastVerified: '2026-01-15',
      notes: 'Bereits heute 100% — Dies ist keine Zukunftsvision, sondern unser Grundprinzip seit 2003',
    },
  },
] as const;

/** Hub-Kern: Bereiche, die direkt aus der heutigen Arbeit wachsen */
export const HUB_CORE_SPACES = [
  { icon: '🔧', title: 'Offene Werkstatt & Makerspace', description: 'Community-Reparatur, 3D-Drucker, Lötarbeitsplätze, Robotik-Kits — vom Repair Café bis zum eigenen Arduino-Projekt' },
  { icon: '🏛️', title: 'Museum & Kulturraum', description: 'Computergeschichte zum Anfassen, E-Waste-Kunst-Installationen, Vintage-Synthesizer-Restaurierung' },
  { icon: '🎓', title: 'Schulungs- & Hackerspace', description: 'Kurse, Tüfteln, digitale Kompetenzen für alle' },
  { icon: '🖥️', title: 'Sovereign AI Lab', description: 'GPU-Cluster aus Unternehmens-Spenden — lokale KI-Modelle hosten, trainieren und vermitteln. Souveränes KI-Hosting für Schweizer Organisationen.' },
  { icon: '🎤', title: 'Event- & Kulturraum', description: 'Tags Café & Co-Working, abends Konzerte, Talks, Filmabende, Repair-Partys — 50-80 Personen' },
  { icon: '☕', title: 'Community Café', description: 'Austausch, Networking, niederschwelliger Treffpunkt' },
] as const;

/** Kulturelle Dimension: Mögliche Erweiterungen, die den Hub einzigartig machen könnten */
export const HUB_CULTURAL_SPACES = [
  { icon: '🎨', title: 'Kunst aus Elektroschrott', description: 'Skulpturen, Installationen und Objekte aus ausrangierten Platinen, Gehäusen und Komponenten' },
  { icon: '🎹', title: 'Elektronische Musik', description: 'Synthesizer, Drum Machines und Instrumente — restauriert, gebaut oder gerettet aus alter Hardware' },
  { icon: '📖', title: 'Tech-Bibliothek', description: 'Leseecke mit Büchern, Zines und Magazinen rund um Technologie, Nachhaltigkeit und Maker-Kultur' },
  { icon: '🎬', title: 'Filmabende', description: 'Dokumentarfilme und Diskussionsrunden zu Technologie, Nachhaltigkeit und digitaler Kultur' },
] as const;

export const TOC_STEPS = [
  { level: 'Input', highlight: false },
  { level: 'Aktivitäten', highlight: false },
  { level: 'Output', highlight: false },
  { level: 'Outcome', highlight: false },
  { level: 'Impact', highlight: true },
] as const;

export type TocRow = { level: string; measure: string; kpi: string; source: string };

export const TOC_TABLE_DATA: TocRow[] = [
  { level: 'Input', measure: 'Ressourcen, die wir einsetzen', kpi: 'Volunteer-Stunden, Spendeneinnahmen', source: 'Kivitendo' },
  { level: 'Aktivitäten', measure: 'Was wir tun', kpi: 'Workshops durchgeführt, Geräte aufbereitet', source: 'Tracking' },
  { level: 'Output', measure: 'Direkte Ergebnisse', kpi: 'DEV_SAVED, WS_PEOPLE, PARTICIPANTS', source: 'KPI System' },
  { level: 'Outcome', measure: 'Veränderungen bei Zielgruppen', kpi: 'Reintegration erfolgreich, Digitale Skills erworben', source: 'Befragung' },
  { level: 'Impact', measure: 'Langfristige gesellschaftliche Wirkung', kpi: 'CO2 vermieden, Elektroschrott reduziert', source: 'Berechnet' },
];

export type SdgRow = { sdg: string; name: string; activities: string };

export const SDG_DATA: SdgRow[] = [
  { sdg: 'SDG 4', name: 'Hochwertige Bildung', activities: 'Workshops, Digital-Skills-Training, Praktikanten-Ausbildung' },
  { sdg: 'SDG 8', name: 'Menschenwürdige Arbeit', activities: 'Arbeitsintegrationsprogramme, sinnvolle Beschäftigung' },
  { sdg: 'SDG 9', name: 'Innovation & Infrastruktur', activities: 'Zugang zu IT-Infrastruktur, Open-Source-Lösungen' },
  { sdg: 'SDG 10', name: 'Weniger Ungleichheiten', activities: 'Solidarisches Preismodell, Gratis-Geräte für Bedürftige' },
  { sdg: 'SDG 12', name: 'Nachhaltiger Konsum', activities: 'Refurbishment, Reparatur statt Neukauf' },
  { sdg: 'SDG 13', name: 'Klimaschutz', activities: 'CO2-Vermeidung durch Lebensdauerverlängerung' },
];

export const SDG_COLORS: Record<string, string> = {
  'SDG 4': 'from-red-700 to-red-500',
  'SDG 8': 'from-pink-800 to-pink-600',
  'SDG 9': 'from-orange-600 to-orange-400',
  'SDG 10': 'from-pink-700 to-red-500',
  'SDG 12': 'from-yellow-700 to-yellow-500',
  'SDG 13': 'from-green-700 to-green-600',
};

export type EwasteRow = { stat: string; description: string };

export const EWASTE_FACTS: EwasteRow[] = [
  { stat: '62 Mio. Tonnen', description: 'Elektroschrott jährlich weltweit' },
  { stat: '22.3%', description: 'werden korrekt recycelt' },
  { stat: '~23 kg', description: 'E-Waste pro Person/Jahr in der Schweiz' },
  { stat: '~350 kg CO2', description: 'Herstellung eines neuen Laptops (Fraunhofer IZM)' },
];

export const UNIQUE_POINTS = [
  { icon: '✨', title: 'Ganzheitlicher Ansatz', text: 'Wir kombinieren Umweltschutz, soziale Wirkung und ökonomische Nachhaltigkeit in einem Modell.' },
  { icon: '🔬', title: 'Expertise', text: 'Spezialisierung auf Vintage-Computer, Legacy-Systeme und Datenrettung – Wissen, das sonst verloren geht.' },
  { icon: '👥', title: 'Community', text: 'Starkes Netzwerk aus Freiwilligen, Praktikanten und Partnern.' },
  { icon: '📊', title: 'Messbare Wirkung', text: 'Klare KPIs und transparentes Impact-Reporting – jede Zahl ist nachvollziehbar.' },
  { icon: '📍', title: 'Lokale Verankerung', text: 'Zürich-basiert mit schweizweitem Service, physischer Treffpunkt und persönliche Beratung.' },
  { icon: '🌐', title: 'Eigene Plattform', text: `Eigenentwickelte Open-Source-Community-Plattform mit Marktplatz für gebrauchte IT, Wissensportal und IT-Hilfe — ${formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))} TypeScript-Dateien, professionelle Software-Architektur.` },
];
