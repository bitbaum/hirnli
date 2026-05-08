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
  bgColor: string;
  priceColor: string;
  badgeColor: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Gratis',
    badge: 'Spende',
    price: 'CHF 0',
    description: 'Für Menschen in akuter Notlage und Repair-Aktivist:innen',
    features: [
      'Formlosen Antrag stellen',
      'Kurze Begründung genügt',
      'Unbürokratische Entscheidung',
      'Auch für Repair-Cafés',
    ],
    borderColor: 'border-success',
    bgColor: 'bg-success-bg',
    priceColor: 'text-success',
    badgeColor: 'bg-success text-white',
  },
  {
    name: 'KulturLegi',
    badge: '50% Rabatt',
    price: '50% vom Normalpreis',
    description: 'Für Inhaber:innen einer gültigen KulturLegi-Karte',
    features: [
      'KulturLegi-Karte vorzeigen',
      'Sofort 50% Rabatt',
      'Für Working Poor',
      'Für Studierende mit KulturLegi',
    ],
    borderColor: 'border-amber',
    bgColor: 'bg-amber-bg',
    priceColor: 'text-amber-text',
    badgeColor: 'bg-amber text-white',
  },
  {
    name: 'Normalpreis',
    badge: 'Standard',
    price: 'Marktüblich',
    description: 'Faire Preise, orientiert an ähnlichen Angeboten',
    features: [
      'Vergleichbar mit Ricardo, Tutti',
      'Transparente Preisschilder',
      'Qualitätsgeprüft',
      'Inkl. Linux-Installation',
    ],
    borderColor: 'border-primary',
    bgColor: 'bg-primary/10',
    priceColor: 'text-primary',
    badgeColor: 'bg-primary text-white',
  },
  {
    name: 'Supporter',
    badge: 'Solidarität',
    price: 'Normalpreis + X%',
    description: 'Für alle, die mehr zahlen können und wollen',
    features: [
      'Freiwilliger Aufschlag',
      'Empfohlen: +20% bis +50%',
      'Finanziert Gratis-Geräte',
      'Ermöglicht KulturLegi-Rabatte',
    ],
    borderColor: 'border-pillar-vision',
    bgColor: 'bg-pillar-vision/10',
    priceColor: 'text-pillar-vision',
    badgeColor: 'bg-pillar-vision text-white',
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
    formula: 'Gratis-Abgaben / Gesamtverkäufe x 100',
    target: '5 - 15%',
    rationale: 'Min. 1/20 für Bedürftige, max. 1/7 für Nachhaltigkeit',
  },
  {
    kpi: 'KulturLegi-Quote',
    formula: 'KulturLegi-Verkäufe / Gesamtverkäufe x 100',
    target: '10 - 20%',
    rationale: 'Entspricht ca. Anteil Bevölkerung mit tiefem Einkommen',
  },
  {
    kpi: 'Supporter-Quote',
    formula: 'Supporter-Verkäufe / Gesamtverkäufe x 100',
    target: '10 - 20%',
    rationale: 'Soll Gratis+KulturLegi quersubventionieren',
  },
];

// ---------------------------------------------------------------------------
// Gratis process steps
// ---------------------------------------------------------------------------

export const PROCESS_STEPS = [
  { step: 1, title: 'Anfrage', description: 'Formlos per E-Mail, Formular oder direkt im Laden' },
  { step: 2, title: 'Begründung', description: 'Kurz erklären, warum du ein Gratis-Gerät brauchst' },
  { step: 3, title: 'Entscheidung', description: 'Team entscheidet unbürokratisch auf Vertrauensbasis' },
  { step: 4, title: 'Abholung', description: 'Gerät abholen oder Lieferung vereinbaren' },
];

// ---------------------------------------------------------------------------
// FAQ items
// ---------------------------------------------------------------------------

export const FAQ_ITEMS = [
  {
    question: 'Kann ich einfach kommen und ein Gratis-Gerät abholen?',
    answer:
      'Nein. Kostenlose Geräte werden nur über Partnerorganisationen (AOZ, Caritas, Solinetz) oder auf Einzelantrag mit Begründung der Notlage vergeben. Für alle anderen bieten wir extreme Preisflexibilität — wir finden fast immer eine Lösung — aber nicht automatisch gratis.',
  },
  {
    question: 'Wie verhindert ihr Missbrauch beim Gratis-Angebot?',
    answer:
      'Wir setzen auf Vertrauen und gesunden Menschenverstand. Die meisten Menschen sind ehrlich. Die wenigen, die das System ausnutzen, sind der Preis für ein unbürokratisches System.',
  },
  {
    question: 'Muss ich meinen KulturLegi-Ausweis zeigen?',
    answer:
      'Ja, bitte beim Kauf vorzeigen. Wir notieren keine persönlichen Daten, nur dass der KulturLegi-Rabatt gewährt wurde.',
  },
  {
    question: 'Kann ich den Supporter-Aufschlag später überweisen?',
    answer: 'Ja! Spenden sind jederzeit willkommen, auch nachträglich.',
  },
  {
    question: 'Werden Supporter-Käufer:innen speziell ausgewiesen?',
    answer:
      'Nein. Wir führen keine öffentliche Liste. Dein solidarischer Beitrag bleibt anonym.',
  },
  {
    question: 'Gilt das Modell auch für Dienstleistungen (Reparaturen)?',
    answer:
      'Grundsätzlich ja. Bei Reparaturen können wir ebenfalls flexible Preise anbieten. KulturLegi-Rabatt gilt, Gratis-Reparaturen auf Anfrage für Menschen in Notsituationen.',
  },
];
