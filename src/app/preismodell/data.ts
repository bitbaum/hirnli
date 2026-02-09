// ---------------------------------------------------------------------------
// Pricing tiers
// ---------------------------------------------------------------------------

export interface PricingTier {
  name: string;
  badge: string;
  price: string;
  description: string;
  features: string[];
  borderColor: string;
  bgGradient: string;
  priceColor: string;
  badgeColor: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Gratis',
    badge: 'Spende',
    price: 'CHF 0',
    description: 'Fuer Menschen in akuter Notlage und Repair-Aktivist:innen',
    features: [
      'Formlosen Antrag stellen',
      'Kurze Begruendung genuegt',
      'Unbuerokratische Entscheidung',
      'Auch fuer Repair-Cafes',
    ],
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-50 to-white',
    priceColor: 'text-emerald-500',
    badgeColor: 'bg-emerald-500 text-white',
  },
  {
    name: 'KulturLegi',
    badge: '50% Rabatt',
    price: '50% vom Normalpreis',
    description: 'Fuer Inhaber:innen einer gueltigen KulturLegi-Karte',
    features: [
      'KulturLegi-Karte vorzeigen',
      'Sofort 50% Rabatt',
      'Fuer Working Poor',
      'Fuer Studierende mit KulturLegi',
    ],
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-50 to-white',
    priceColor: 'text-amber-500',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    name: 'Normalpreis',
    badge: 'Standard',
    price: 'Marktueblich',
    description: 'Faire Preise, orientiert an aehnlichen Angeboten',
    features: [
      'Vergleichbar mit Ricardo, Tutti',
      'Transparente Preisschilder',
      'Qualitaetsgeprueft',
      'Inkl. Linux-Installation',
    ],
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-50 to-white',
    priceColor: 'text-blue-500',
    badgeColor: 'bg-blue-500 text-white',
  },
  {
    name: 'Supporter',
    badge: 'Solidaritaet',
    price: 'Normalpreis + X%',
    description: 'Fuer alle, die mehr zahlen koennen und wollen',
    features: [
      'Freiwilliger Aufschlag',
      'Empfohlen: +20% bis +50%',
      'Finanziert Gratis-Geraete',
      'Ermoeglicht KulturLegi-Rabatte',
    ],
    borderColor: 'border-violet-500',
    bgGradient: 'from-violet-50 to-white',
    priceColor: 'text-violet-500',
    badgeColor: 'bg-violet-500 text-white',
  },
];

// ---------------------------------------------------------------------------
// Price example table
// ---------------------------------------------------------------------------

export interface PriceExampleRow {
  tier: string;
  calculation: string;
  price: string;
  source: string;
  sourceType: 'decision' | 'derived';
}

export const PRICE_EXAMPLES: PriceExampleRow[] = [
  { tier: 'Gratis', calculation: 'Auf Antrag', price: 'CHF 0', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'KulturLegi', calculation: 'CHF 200 x 0.5', price: 'CHF 100', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'Normal', calculation: 'Marktvergleich', price: 'CHF 200', source: 'Marktdaten', sourceType: 'derived' },
  { tier: 'Supporter +20%', calculation: 'CHF 200 x 1.2', price: 'CHF 240', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'Supporter +50%', calculation: 'CHF 200 x 1.5', price: 'CHF 300', source: 'Vorstand', sourceType: 'decision' },
];

// ---------------------------------------------------------------------------
// Monitoring KPIs table
// ---------------------------------------------------------------------------

export interface KPIRow {
  kpi: string;
  formula: string;
  target: string;
  rationale: string;
}

export const KPI_DATA: KPIRow[] = [
  {
    kpi: 'Gratis-Quote',
    formula: 'Gratis-Abgaben / Gesamtverkaeufe x 100',
    target: '5 - 15%',
    rationale: 'Min. 1/20 fuer Beduerftige, max. 1/7 fuer Nachhaltigkeit',
  },
  {
    kpi: 'KulturLegi-Quote',
    formula: 'KulturLegi-Verkaeufe / Gesamtverkaeufe x 100',
    target: '10 - 20%',
    rationale: 'Entspricht ca. Anteil Bevoelkerung mit tiefem Einkommen',
  },
  {
    kpi: 'Supporter-Quote',
    formula: 'Supporter-Verkaeufe / Gesamtverkaeufe x 100',
    target: '10 - 20%',
    rationale: 'Soll Gratis+KulturLegi quersubventionieren',
  },
];

// ---------------------------------------------------------------------------
// Gratis process steps
// ---------------------------------------------------------------------------

export const PROCESS_STEPS = [
  { step: 1, title: 'Anfrage', description: 'Formlos per E-Mail, Formular oder direkt im Laden' },
  { step: 2, title: 'Begruendung', description: 'Kurz erklaeren, warum du ein Gratis-Geraet brauchst' },
  { step: 3, title: 'Entscheidung', description: 'Team entscheidet unbuerokratisch auf Vertrauensbasis' },
  { step: 4, title: 'Abholung', description: 'Geraet abholen oder Lieferung vereinbaren' },
];

// ---------------------------------------------------------------------------
// FAQ items
// ---------------------------------------------------------------------------

export const FAQ_ITEMS = [
  {
    question: 'Wie verhindert ihr Missbrauch beim Gratis-Angebot?',
    answer:
      'Wir setzen auf Vertrauen und gesunden Menschenverstand. Die meisten Menschen sind ehrlich. Die wenigen, die das System ausnutzen, sind der Preis fuer ein unbuerokratisches System.',
  },
  {
    question: 'Muss ich meinen KulturLegi-Ausweis zeigen?',
    answer:
      'Ja, bitte beim Kauf vorzeigen. Wir notieren keine persoenlichen Daten, nur dass der KulturLegi-Rabatt gewaehrt wurde.',
  },
  {
    question: 'Kann ich den Supporter-Aufschlag spaeter ueberweisen?',
    answer: 'Ja! Spenden sind jederzeit willkommen, auch nachtraeglich.',
  },
  {
    question: 'Werden Supporter-Kaeufer:innen speziell ausgewiesen?',
    answer:
      'Nein. Wir fuehren keine oeffentliche Liste. Dein solidarischer Beitrag bleibt anonym.',
  },
  {
    question: 'Gilt das Modell auch fuer Dienstleistungen (Reparaturen)?',
    answer:
      'Grundsaetzlich ja. Bei Reparaturen koennen wir ebenfalls flexible Preise anbieten. KulturLegi-Rabatt gilt, Gratis-Reparaturen auf Anfrage fuer Menschen in Notsituationen.',
  },
];
