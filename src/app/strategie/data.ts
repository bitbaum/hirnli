/* ────────────────────────────────────────────
   Static data for the strategie page
   ──────────────────────────────────────────── */

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
  { icon: '🐧', title: '2. Digitale Souveränität', description: 'Förderung von Linux & Open-Source Software als nachhaltige, kostengünstige und befähigende Technologieoption' },
  { icon: '📚', title: '3. Bildung & Aufklärung', description: 'Workshops, technische Unterstützung und niederschwellige Lernangebote — von Reparaturwissen bis zu digitalen Kompetenzen in einer Welt, die sich durch Automatisierung und KI rasant verändert' },
  { icon: '🤝', title: '4. Soziale Integration', description: 'Unterstützung bei der beruflichen Wiedereingliederung durch Struktur, Routinen und sinnvolle Tätigkeiten — besonders wichtig, wenn Automatisierung traditionelle Berufsbilder verändert' },
] as const;

export const VISION_TARGETS = [
  { value: "10'000+", label: 'Geräte jährlich vor Elektroschrott gerettet' },
  { value: 'Schweizweit', label: 'Netzwerk von Repair-Hubs aufbauen' },
  { value: '500+', label: 'Menschen pro Jahr in digitalen Skills ausbilden' },
  { value: '100%', label: 'Aller Einnahmen fliessen zurück in die Mission' },
  { value: '#1', label: 'Führende Organisation für nachhaltige IT in der Schweiz' },
  { value: 'Community Tech Space', label: 'Museum, Werkstatt & Treffpunkt' },
] as const;

/** Hub-Kern: Bereiche, die direkt aus der heutigen Arbeit wachsen */
export const HUB_CORE_SPACES = [
  { icon: '🔧', title: 'Offene Werkstatt', description: 'Community-Reparatur-Events, Hands-on Workshops, Repair Cafe' },
  { icon: '🏛️', title: 'Vintage-Hardware Museum', description: 'Von Apple I bis Amiga — Computergeschichte zum Anfassen' },
  { icon: '🎓', title: 'Schulungs- & Hackerspace', description: 'Kurse, Tüfteln, digitale Kompetenzen für alle' },
  { icon: '🖥️', title: 'Sovereign AI Lab', description: 'Eigenes Rechenzentrum — lokale KI-Modelle hosten, trainieren und vermitteln' },
  { icon: '☕', title: 'Community Cafe', description: 'Austausch, Networking, niederschwelliger Treffpunkt' },
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
  { stat: '~331 kg CO2', description: 'Herstellung eines neuen Laptops' },
];

export const UNIQUE_POINTS = [
  { icon: '✨', title: 'Ganzheitlicher Ansatz', text: 'Wir kombinieren Umweltschutz, soziale Wirkung und ökonomische Nachhaltigkeit in einem Modell.' },
  { icon: '🔬', title: 'Expertise', text: 'Spezialisierung auf Vintage-Computer, Legacy-Systeme und Datenrettung – Wissen, das sonst verloren geht.' },
  { icon: '👥', title: 'Community', text: 'Starkes Netzwerk aus Freiwilligen, Praktikanten und Partnern.' },
  { icon: '📊', title: 'Messbare Wirkung', text: 'Klare KPIs und transparentes Impact-Reporting – jede Zahl ist nachvollziehbar.' },
  { icon: '📍', title: 'Lokale Verankerung', text: 'Zürich-basiert mit schweizweitem Service, physischer Treffpunkt und persönliche Beratung.' },
] as const;
