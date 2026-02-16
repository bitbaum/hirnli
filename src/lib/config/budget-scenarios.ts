import type { BudgetLineItem, BudgetScenario, EigenleistungConfig } from '@/lib/schemas/budget';

/**
 * Budget Scenarios Configuration - SSOT
 *
 * All budget data lives here. No hardcoded CHF amounts elsewhere.
 * Every line item has full source attribution (methodology, confidence, lastVerified).
 */

/**
 * All Budget Line Items (Building Blocks)
 *
 * These are atomic units that scenarios compose together.
 * Each has complete source metadata for transparency.
 */
export const BUDGET_LINE_ITEMS: BudgetLineItem[] = [
  // ==================== SPACE & INFRASTRUCTURE ====================
  {
    id: 'space_rent_agglomeration',
    label: 'Miete (Agglomeration)',
    description: '550m² in Volketswil/Schlieren/Dietikon, inkl. Nebenkosten',
    category: 'space',
    amount: 110_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Marktforschung Homegate.ch, ImmoScout24 (Januar 2026)',
      calculation: '550m² × CHF 200/m²/Jahr (Mittelwert Agglomeration Zürich)',
      marketResearch: 'Volketswil: CHF 150/m², Schlieren: CHF 252/m², Dietikon: CHF 180/m² → gewählt: CHF 200/m² als realistischer Durchschnitt',
      confidence: 'medium',
      lastVerified: '2026-02-13',
      notes: 'City Zürich würde CHF 137-192k/Jahr kosten (zu teuer für NGO-Budget)',
    },
    icon: '🏢',
  },

  // ==================== EQUIPMENT ====================
  {
    id: 'equipment_workshop_setup',
    label: 'Werkstatt-Einrichtung',
    description: 'Werkbänke, Regale, Werkzeuge, Lötarbeitsplätze (einmalig)',
    category: 'equipment',
    amount: 25_000,
    type: 'einmalig',
    source: {
      methodology: 'Bottom-up Kalkulation basierend auf Industriepreisen',
      calculation: '8× Werkbänke à CHF 800 + 15× Regale à CHF 400 + Werkzeuge CHF 5k + Beleuchtung CHF 3.6k + Reserve CHF 4k',
      confidence: 'medium',
      lastVerified: '2026-02-12',
    },
    subItems: [
      { label: '8× ESD-sichere Werkbänke (höhenverstellbar)', amount: 6_400 },
      { label: '15× Industrieregale (verzinkt, 200kg Tragkraft)', amount: 6_000 },
      { label: 'Werkzeuge & Kleinmaterial (Schraubendreher, Zangen, Multimeter)', amount: 5_000 },
      { label: 'LED-Beleuchtung (min 500 lux, ESD-sicher)', amount: 3_600 },
      { label: 'Reserve & Unvorhergesehenes (16%)', amount: 4_000 },
    ],
    icon: '🔧',
  },

  {
    id: 'equipment_shop_setup',
    label: 'Second-Hand Shop Einrichtung',
    description: 'Regale, Kleiderständer, Kasse, Beleuchtung (einmalig)',
    category: 'equipment',
    amount: 18_000,
    type: 'einmalig',
    source: {
      methodology: 'Retail-Ausstattung basierend auf Branchenstandards',
      calculation: '12× Regale à CHF 350 + 6× Kleiderständer à CHF 200 + Kasse CHF 2.5k + Beleuchtung CHF 4k + Beschilderung CHF 2k + Reserve CHF 3.5k',
      confidence: 'medium',
      lastVerified: '2026-02-12',
    },
    subItems: [
      { label: '12× Verkaufsregale (modular, höhenverstellbar)', amount: 4_200 },
      { label: '6× Kleiderständer (rollbar, höhenverstellbar)', amount: 1_200 },
      { label: 'Kassensystem (iPad POS, Bondrucker, Barcode-Scanner)', amount: 2_500 },
      { label: 'Shop-Beleuchtung (LED-Spots, Akzentbeleuchtung)', amount: 4_000 },
      { label: 'Beschilderung & Dekoration', amount: 2_000 },
      { label: 'Reserve & Unvorhergesehenes (19%)', amount: 3_500 },
      { label: 'Umkleidekabinen (2× modulare Kabinen)', amount: 600 },
    ],
    icon: '🛍️',
  },

  {
    id: 'equipment_makerspace',
    label: 'Makerspace Ausstattung',
    description: '3D-Drucker, Lasercutter, Elektronik-Werkzeuge (einmalig)',
    category: 'equipment',
    amount: 35_000,
    type: 'einmalig',
    source: {
      methodology: 'Marktpreise für Makerspace-Equipment (Ultimaker, Prusa, Epilog)',
      calculation: '2× 3D-Drucker à CHF 3.5k + 1× Lasercutter CHF 15k + Lötstationen CHF 4k + CNC-Fräse CHF 8k + Werkzeuge CHF 4.5k',
      confidence: 'high',
      lastVerified: '2026-02-13',
      notes: 'Preise für neue Geräte mit Garantie; gebrauchte Geräte würden CHF 20-25k kosten',
    },
    subItems: [
      { label: '2× 3D-Drucker (Prusa MK4, Ultimaker S3)', amount: 7_000 },
      { label: '1× Lasercutter (40W CO2, 600×400mm Arbeitsbereich)', amount: 15_000 },
      { label: '4× Lötstationen (Weller, temperaturgeregelt)', amount: 4_000 },
      { label: '1× CNC-Fräse (Desktop, 300×200mm)', amount: 8_000 },
      { label: 'Elektronik-Werkzeuge (Oszilloskop, Netzgeräte)', amount: 4_500 },
      { label: 'Verbrauchsmaterial (Filament, Laser-Material)', amount: 2_500, note: 'Erstausstattung für 6 Monate' },
    ],
    icon: '⚙️',
    isOptional: true,
  },

  {
    id: 'equipment_culture_space',
    label: 'Kulturraum-Ausstattung',
    description: 'Musikinstrumente, Bühne, Soundsystem (einmalig)',
    category: 'equipment',
    amount: 22_000,
    type: 'einmalig',
    source: {
      methodology: 'Preise für Veranstaltungstechnik & Musikinstrumente',
      calculation: 'PA-System CHF 8k + Bühne CHF 5k + Instrumente CHF 6k + Beleuchtung CHF 3k',
      confidence: 'medium',
      lastVerified: '2026-02-12',
      notes: 'Ausbaustufe für Konzerte, Poetry Slams, Community Events',
    },
    subItems: [
      { label: 'PA-System (Yamaha, 2× Aktiv-Boxen, Mischpult)', amount: 8_000 },
      { label: 'Modulare Bühne (4× 2m², höhenverstellbar)', amount: 5_000 },
      { label: 'Musikinstrumente (Keyboards, Gitarren, Schlagzeug)', amount: 6_000 },
      { label: 'Bühnenbeleuchtung (LED-Pars, DMX-Steuerung)', amount: 3_000 },
    ],
    icon: '🎭',
    isOptional: true,
  },

  // ==================== INFRASTRUCTURE (IT) ====================
  {
    id: 'infrastructure_it_basic',
    label: 'IT-Grundausstattung',
    description: 'Netzwerk, WLAN, Firewalls, Drucker (einmalig)',
    category: 'infrastructure',
    amount: 12_000,
    type: 'einmalig',
    source: {
      methodology: 'KMU-Standard IT-Setup',
      calculation: 'Router/Firewall CHF 2k + WLAN Access Points CHF 3k + Switch CHF 1.5k + Drucker CHF 1.5k + Verkabelung CHF 4k',
      confidence: 'high',
      lastVerified: '2026-02-13',
    },
    subItems: [
      { label: 'Router & Firewall (Ubiquiti Dream Machine Pro)', amount: 2_000 },
      { label: '3× WLAN Access Points (Ubiquiti U6 Pro)', amount: 3_000 },
      { label: 'Netzwerk-Switch (24-Port PoE)', amount: 1_500 },
      { label: '2× Drucker (Laser A4, Farbe)', amount: 1_500 },
      { label: 'Verkabelung & Installation (Cat6, Patchpanels)', amount: 4_000 },
    ],
    icon: '🖥️',
  },

  {
    id: 'infrastructure_ai_lab_starter',
    label: 'AI Lab — Setup A (Starter)',
    description: '2-4× Consumer GPUs für AI Literacy Workshops (einmalig)',
    category: 'infrastructure',
    amount: 17_500,
    type: 'einmalig',
    source: {
      methodology: 'Marktpreise für gebrauchte Consumer GPUs (eBay, Ricardo)',
      calculation: '3× NVIDIA RTX 3090 (gebraucht) à CHF 4k + Server-Rack CHF 3k + Kühlung CHF 2.5k',
      confidence: 'high',
      lastVerified: '2026-02-13',
      notes: 'Setup A ist realistisch ohne Corporate-Spenden, funktioniert für kleine Modelle (Llama 7B, Stable Diffusion)',
    },
    subItems: [
      { label: '3× NVIDIA RTX 3090 24GB (gebraucht)', amount: 12_000, note: '~CHF 4k/GPU (Marktpreis Feb 2026)' },
      { label: '1× Server-Rack (19", 12HE)', amount: 3_000 },
      { label: 'Kühlung & Verkabelung (Lüfter, PSU)', amount: 2_500 },
    ],
    icon: '🤖',
    isOptional: true,
  },

  {
    id: 'infrastructure_ai_lab_professional',
    label: 'AI Lab — Setup B (Professional)',
    description: '4-6× A40/A6000 GPUs mit Corporate-Spenden (einmalig)',
    category: 'infrastructure',
    amount: 50_000,
    type: 'einmalig',
    source: {
      methodology: 'Marktpreise für Professional GPUs mit 50% Corporate-Spenden-Anteil',
      calculation: '5× NVIDIA A40 à CHF 6k (50% gespendet, 50% gekauft) + 2× Server-Racks CHF 6k + Klimatisierung CHF 8k + Installation CHF 6k',
      confidence: 'medium',
      lastVerified: '2026-02-13',
      notes: 'Benötigt aktive Corporate-Spenden-Akquise bei Tech-Firmen (Google, Meta, OpenAI, Anthropic)',
    },
    subItems: [
      { label: '5× NVIDIA A40 GPUs (teilweise gespendet)', amount: 30_000, note: 'A40: 48GB VRAM, ideal für Finetuning' },
      { label: '2× Server-Racks mit professioneller Kühlung', amount: 12_000 },
      { label: 'Klimatisierung & Redundanz (Split-Klima)', amount: 8_000 },
    ],
    icon: '🤖',
    isOptional: true,
  },

  // ==================== PERSONNEL ====================
  {
    id: 'personnel_education_leaders_2',
    label: 'Bildungsprogrammleitung (2 Personen)',
    description: '2× Teilzeit (60%) für Curriculum-Entwicklung & Workshop-Durchführung',
    category: 'personnel',
    amount: 180_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Schweizer NGO-Gehälter für Bildungskoordination',
      calculation: '2× CHF 90k/Jahr (60% von CHF 150k Vollzeit-Äquivalent)',
      confidence: 'high',
      lastVerified: '2026-02-13',
      notes: 'CHF 150k Vollzeit ist marktüblich für Senior Education Coordinator in Zürich',
    },
    subItems: [
      { label: 'Person 1: Digital Literacy Lead (60%)', amount: 90_000 },
      { label: 'Person 2: AI Literacy Lead (60%)', amount: 90_000 },
    ],
    icon: '👥',
  },

  // ==================== PROGRAMS ====================
  {
    id: 'programs_workshop_materials',
    label: 'Workshop-Materialien',
    description: 'Lernmaterialien, Elektronik-Kits, Software-Lizenzen',
    category: 'programs',
    amount: 15_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Budget pro Workshop-Teilnehmer × erwartete Teilnehmerzahl',
      calculation: 'CHF 50/Person × 300 Teilnehmer/Jahr = CHF 15k',
      confidence: 'medium',
      lastVerified: '2026-02-13',
      notes: 'Annahme: 25 Workshops à 12 Teilnehmer = 300 Personen/Jahr',
    },
    subItems: [
      { label: 'Elektronik-Kits (Arduino, Raspberry Pi)', amount: 8_000 },
      { label: 'Software-Lizenzen (Adobe, CAD-Tools)', amount: 4_000 },
      { label: 'Lernmaterialien (Bücher, Handouts)', amount: 3_000 },
    ],
    icon: '📚',
  },

  {
    id: 'programs_event_costs',
    label: 'Event-Kosten',
    description: 'Community Events, Hack-Nights, Gastredner',
    category: 'programs',
    amount: 12_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Durchschnittskosten pro Event × geplante Events',
      calculation: 'CHF 500/Event × 24 Events/Jahr = CHF 12k',
      confidence: 'medium',
      lastVerified: '2026-02-13',
      notes: 'Events: 2× monatlich (Hack-Nights, Vorträge, Demos)',
    },
    subItems: [
      { label: 'Catering (Snacks, Getränke)', amount: 6_000 },
      { label: 'Gastredner-Honorare', amount: 4_000 },
      { label: 'Marketing & Drucksachen', amount: 2_000 },
    ],
    icon: '🎉',
    isOptional: true,
  },

  {
    id: 'programs_culture',
    label: 'Kulturprogramm',
    description: 'Konzerte, Poetry Slams, Kunstausstellungen',
    category: 'programs',
    amount: 8_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Budget für 12 kulturelle Events pro Jahr',
      calculation: 'CHF 667/Event × 12 Events = CHF 8k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      notes: 'Optionale Erweiterung — nur bei genügend Raum & Budget',
    },
    icon: '🎭',
    isOptional: true,
  },

  // ==================== OPERATIONS ====================
  {
    id: 'operations_materials',
    label: 'Betriebsmaterialien',
    description: 'Büromaterial, Reinigung, Verbrauchsmaterial',
    category: 'operations',
    amount: 10_000,
    type: 'jaehrlich',
    source: {
      methodology: 'Pauschalschätzung basierend auf Raumgröße',
      calculation: 'CHF 15-20/m²/Jahr für 550m² = CHF 10k',
      confidence: 'medium',
      lastVerified: '2026-02-13',
    },
    subItems: [
      { label: 'Reinigungsmaterial & Service', amount: 4_000 },
      { label: 'Büromaterial (Papier, Stifte, etc.)', amount: 2_000 },
      { label: 'Verbrauchsmaterial (Werkstatt, Shop)', amount: 4_000 },
    ],
    icon: '🧹',
  },

  {
    id: 'operations_insurance',
    label: 'Versicherungen',
    description: 'Haftpflicht, Inventar, Betriebsversicherung',
    category: 'operations',
    amount: 7_000,
    type: 'jaehrlich',
    source: {
      methodology: 'KMU-Versicherungspakete (Zürich Versicherung, Mobiliar)',
      calculation: 'Haftpflicht CHF 3k + Inventar CHF 2.5k + Betrieb CHF 1.5k',
      confidence: 'medium',
      lastVerified: '2026-02-13',
    },
    subItems: [
      { label: 'Betriebshaftpflicht (CHF 5M Deckung)', amount: 3_000 },
      { label: 'Inventarversicherung (CHF 200k Deckung)', amount: 2_500 },
      { label: 'Betriebsunterbrechungsversicherung', amount: 1_500 },
    ],
    icon: '🛡️',
  },
];

/**
 * Budget Scenarios (Minimal, Moderate, Maximum)
 */
export const BUDGET_SCENARIOS: BudgetScenario[] = [
  {
    id: 'minimal',
    label: 'Minimal — Solides Fundament',
    description: 'Kerngeschäft professionalisieren: Shop + Werkstatt + 2 Bildungsprogrammleiter',
    tagline: 'Das Minimum, um Chaos in strukturierte Prozesse zu verwandeln',
    lineItemIds: [
      'space_rent_agglomeration',
      'equipment_workshop_setup',
      'equipment_shop_setup',
      'infrastructure_it_basic',
      'personnel_education_leaders_2',
      'operations_materials',
      'operations_insurance',
    ],
    targetFoundations: ['C', 'B'],
    spaceRequirement: { min_sqm: 380, max_sqm: 450 },
    threeYearModel: {
      year1: { einmalig: 55_000, jaehrlich: 307_000, eigenleistung: 80_000 },
      year2: { jaehrlich: 307_000, eigenleistung: 160_000 },
      year3: { jaehrlich: 307_000, eigenleistung: 240_000 },
    },
  },

  {
    id: 'moderate',
    label: 'Moderate — Empfohlene Lösung',
    description: 'Kerngeschäft + Bildung + Makerspace + AI Lab Starter',
    tagline: 'Unser ideales Setup: Prozesse + Innovation',
    lineItemIds: [
      'space_rent_agglomeration',
      'equipment_workshop_setup',
      'equipment_shop_setup',
      'equipment_makerspace',
      'infrastructure_it_basic',
      'infrastructure_ai_lab_starter',
      'personnel_education_leaders_2',
      'programs_workshop_materials',
      'programs_event_costs',
      'operations_materials',
      'operations_insurance',
    ],
    targetFoundations: ['B', 'A'],
    spaceRequirement: { min_sqm: 500, max_sqm: 600 },
    threeYearModel: {
      year1: { einmalig: 119_500, jaehrlich: 334_000, eigenleistung: 100_000 },
      year2: { jaehrlich: 334_000, eigenleistung: 180_000 },
      year3: { jaehrlich: 334_000, eigenleistung: 280_000 },
    },
  },

  {
    id: 'maximum',
    label: 'Maximum — Vollständige Vision',
    description: 'Alles: Kerngeschäft + Bildung + AI Lab Professional + Kultur',
    tagline: 'Die komplette Vision — bei genügend Budget und Raum',
    lineItemIds: [
      'space_rent_agglomeration',
      'equipment_workshop_setup',
      'equipment_shop_setup',
      'equipment_makerspace',
      'equipment_culture_space',
      'infrastructure_it_basic',
      'infrastructure_ai_lab_professional',
      'personnel_education_leaders_2',
      'programs_workshop_materials',
      'programs_event_costs',
      'programs_culture',
      'operations_materials',
      'operations_insurance',
    ],
    targetFoundations: ['A'],
    spaceRequirement: { min_sqm: 600, max_sqm: 700 },
    threeYearModel: {
      year1: { einmalig: 181_500, jaehrlich: 342_000, eigenleistung: 100_000 },
      year2: { jaehrlich: 342_000, eigenleistung: 196_000 },
      year3: { jaehrlich: 342_000, eigenleistung: 296_000 },
    },
  },
];

/**
 * Eigenleistung (Volunteer Value) Configuration
 */
export const EIGENLEISTUNG_CONFIG: EigenleistungConfig = {
  label: 'Eigenleistung (kein Cash — Freiwilligenarbeit bewertet)',
  description: 'Bewerteter Wert der Freiwilligenarbeit, KEIN Cashflow. Berechnet als Stunden × CHF 35/h (NGO-Standard für Freiwilligenarbeit). Jahr 3 setzt ~3.4 VZÄ unbezahlte Arbeit voraus.',
  year1: 80_000,
  year2: 160_000,
  year3: 240_000,
  source: {
    methodology: 'Bewertete Freiwilligen-Stunden × CHF 35/h (NGO-Standard). KEIN Cashflow — rein kalkulatorischer Wert.',
    calculation: 'Jahr 1: 2,286h × CHF 35 (~1.1 VZÄ), Jahr 2: 4,571h × CHF 35 (~2.3 VZÄ), Jahr 3: 6,857h × CHF 35 (~3.4 VZÄ). Wachstum setzt Community-Aufbau und Hub voraus.',
    confidence: 'estimated',
    lastVerified: '2026-02-16',
    notes: 'Nicht Cash. Setzt voraus, dass Freiwilligen-Stunden durch Hub-Aufbau und Community-Wachstum steigen. Aktuell nicht systematisch erfasst.',
  },
};

/**
 * Helper Functions
 */

export function getScenario(id: string): BudgetScenario | undefined {
  return BUDGET_SCENARIOS.find((s) => s.id === id);
}

export function getLineItem(id: string): BudgetLineItem | undefined {
  return BUDGET_LINE_ITEMS.find((item) => item.id === id);
}

export function getLineItemsForScenario(scenarioId: string): BudgetLineItem[] {
  const scenario = getScenario(scenarioId);
  if (!scenario) return [];
  return scenario.lineItemIds
    .map((id) => getLineItem(id))
    .filter((item): item is BudgetLineItem => item !== undefined);
}
