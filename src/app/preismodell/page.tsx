import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';

export const metadata: Metadata = {
  title: 'Solidarisches Preismodell',
  description: 'Wer kann, zahlt mehr. Wer nicht kann, zahlt weniger. So hat jede:r Zugang zu IT.',
};

// ---------------------------------------------------------------------------
// Pricing tiers
// ---------------------------------------------------------------------------

interface PricingTier {
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

const PRICING_TIERS: PricingTier[] = [
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

interface PriceExampleRow {
  tier: string;
  calculation: string;
  price: string;
  source: string;
  sourceType: 'decision' | 'derived';
}

const PRICE_EXAMPLES: PriceExampleRow[] = [
  { tier: 'Gratis', calculation: 'Auf Antrag', price: 'CHF 0', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'KulturLegi', calculation: 'CHF 200 x 0.5', price: 'CHF 100', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'Normal', calculation: 'Marktvergleich', price: 'CHF 200', source: 'Marktdaten', sourceType: 'derived' },
  { tier: 'Supporter +20%', calculation: 'CHF 200 x 1.2', price: 'CHF 240', source: 'Vorstand', sourceType: 'decision' },
  { tier: 'Supporter +50%', calculation: 'CHF 200 x 1.5', price: 'CHF 300', source: 'Vorstand', sourceType: 'decision' },
];

const PRICE_EXAMPLE_COLUMNS = [
  {
    key: 'tier',
    header: 'Stufe',
    render: (row: PriceExampleRow) => <span className="font-medium">{row.tier}</span>,
  },
  { key: 'calculation', header: 'Berechnung' },
  {
    key: 'price',
    header: 'Du zahlst',
    render: (row: PriceExampleRow) => <span className="font-semibold">{row.price}</span>,
  },
  {
    key: 'source',
    header: 'Quelle',
    render: (row: PriceExampleRow) => (
      <Badge variant={row.sourceType === 'decision' ? 'primary' : 'derived'}>
        {row.source}
      </Badge>
    ),
  },
];

// ---------------------------------------------------------------------------
// Monitoring KPIs table
// ---------------------------------------------------------------------------

interface KPIRow {
  kpi: string;
  formula: string;
  target: string;
  rationale: string;
}

const KPI_DATA: KPIRow[] = [
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

const KPI_COLUMNS = [
  { key: 'kpi', header: 'KPI' },
  {
    key: 'formula',
    header: 'Formel',
    render: (row: KPIRow) => (
      <code className="rounded bg-bg-light px-1 text-xs">{row.formula}</code>
    ),
  },
  { key: 'target', header: 'Zielwert' },
  { key: 'rationale', header: 'Begruendung' },
];

// ---------------------------------------------------------------------------
// Gratis process steps
// ---------------------------------------------------------------------------

const PROCESS_STEPS = [
  { step: 1, title: 'Anfrage', description: 'Formlos per E-Mail, Formular oder direkt im Laden' },
  { step: 2, title: 'Begruendung', description: 'Kurz erklaeren, warum du ein Gratis-Geraet brauchst' },
  { step: 3, title: 'Entscheidung', description: 'Team entscheidet unbuerokratisch auf Vertrauensbasis' },
  { step: 4, title: 'Abholung', description: 'Geraet abholen oder Lieferung vereinbaren' },
];

// ---------------------------------------------------------------------------
// FAQ items
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PreismodellPage() {
  return (
    <>
      <PageHeader
        title="Solidarisches Preismodell"
        subtitle="Wer kann, zahlt mehr. Wer nicht kann, zahlt weniger. So hat jede:r Zugang zu IT."
      />

      {/* Grundsatz */}
      <Card className="mb-8 border-l-4 border-l-primary bg-bg-light">
        <p className="text-lg">
          <strong>Unser Grundsatz:</strong> IT-Zugang ist ein Grundrecht. Niemand soll wegen Geld
          keinen funktionierenden Computer haben.
        </p>
      </Card>

      {/* Die 4 Preisstufen */}
      <section className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-grey-dark">Die 4 Preisstufen</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`relative border-2 bg-gradient-to-br ${tier.borderColor} ${tier.bgGradient} transition-shadow hover:shadow-lg`}
            >
              <span
                className={`absolute -top-3 right-4 rounded-full px-3 py-0.5 text-xs font-semibold ${tier.badgeColor}`}
              >
                {tier.badge}
              </span>
              <h3 className="mb-1 text-lg font-bold">{tier.name}</h3>
              <p className={`mb-3 text-xl font-bold ${tier.priceColor}`}>{tier.price}</p>
              <p className="mb-4 text-sm text-text-muted">{tier.description}</p>
              <ul className="space-y-2 border-t border-border pt-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-success">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Preisbeispiel */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">
          Preisbeispiel: Laptop (Normalpreis CHF 200)
        </h2>
        <Card>
          <Table
            columns={PRICE_EXAMPLE_COLUMNS}
            data={PRICE_EXAMPLES}
            keyExtractor={(row) => row.tier}
            compact
          />
          <div className="mt-4 rounded-lg border-l-4 border-primary bg-bg-light p-3 text-xs text-text-muted">
            <strong className="mb-1 block">Quellenangaben:</strong>
            <Badge variant="derived" className="mr-1">Marktdaten</Badge> = Vergleich Ricardo/Tutti/Revendo |{' '}
            <Badge variant="primary" className="mr-1">Vorstand</Badge> = Vorstandsentscheidung Januar 2025 |{' '}
            <a href="/methodik#pricing-model" className="text-primary hover:underline">
              Vollstaendige Methodik
            </a>
          </div>
        </Card>
      </section>

      {/* KulturLegi Info */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Was ist KulturLegi?</h2>
        <Card className="border border-amber-300 bg-amber-50">
          <h3 className="mb-3 text-lg font-semibold">Der Ausweis fuer Menschen mit wenig Geld</h3>
          <p className="mb-4 text-sm">
            Die <strong>KulturLegi</strong> ist ein schweizweiter Ausweis der Caritas. Er berechtigt
            Menschen mit bescheidenem Einkommen zu Rabatten bei Kultur, Sport, Bildung -- und bei uns.
          </p>
          <ul className="mb-4 space-y-2 text-sm">
            <li>
              <strong>Berechtigt:</strong> Personen mit Einkommen unter ca. CHF 2&apos;600/Monat (Einzelperson){' '}
              <Badge variant="primary">Externe Quelle</Badge>
            </li>
            <li>
              <strong>Mehr Info:</strong>{' '}
              <a href="https://www.kulturlegi.ch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                kulturlegi.ch
              </a>
            </li>
            <li>
              <strong>Bei uns:</strong> Einfach Karte vorzeigen &rarr; 50% Rabatt{' '}
              <Badge variant="primary">Vorstand</Badge>
            </li>
          </ul>
          <div className="rounded-lg border-l-4 border-primary bg-white p-3 text-xs text-text-muted">
            <strong>Quelle Einkommensgrenze:</strong>{' '}
            Die CHF 2&apos;600/Monat stammen von{' '}
            <a href="https://www.kulturlegi.ch/ueber-uns/faq/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              kulturlegi.ch FAQ
            </a>
            . Der genaue Betrag kann je nach Kanton und Haushaltsgroesse variieren.
          </div>
        </Card>
      </section>

      {/* Gratis-Prozess */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">So funktioniert die Gratis-Abgabe</h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <Card key={step.step} className="text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {step.step}
              </div>
              <h4 className="mb-1 font-semibold">{step.title}</h4>
              <p className="text-xs text-text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
        <Card className="border-l-4 border-l-blue-400 bg-blue-50">
          <p className="text-sm">
            <strong>Kein Papierkram:</strong> Wir setzen auf Vertrauen. Die meisten Menschen sind ehrlich.
            Die wenigen, die das System ausnutzen koennten, sind der Preis fuer ein unbuerokratisches System.
          </p>
        </Card>
      </section>

      {/* Supporter CTA */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Werde Supporter</h2>
        <Card className="border-2 border-violet-500 bg-gradient-to-br from-violet-50 to-white">
          <div className="flex flex-wrap items-center gap-8">
            <div className="min-w-[280px] flex-1">
              <h3 className="mb-3 text-lg font-semibold text-violet-600">
                Mehr zahlen, mehr ermoeglichen
              </h3>
              <p className="mb-3 text-sm">
                Wenn du beim Kauf einen freiwilligen Aufschlag zahlst, ermoeglichst du damit:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6 text-sm">
                <li>Gratis-Geraete fuer Menschen in Not</li>
                <li>KulturLegi-Rabatte fuer Working Poor</li>
                <li>Workshops fuer Kinder aus einkommensschwachen Familien</li>
              </ul>
              <p className="text-xs text-text-muted">
                <strong>Empfohlen:</strong> +20% bis +50% auf den Normalpreis<br />
                Bei einem CHF 200 Laptop sind das nur CHF 40 - 100 mehr.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-5xl">&#x1F91D;</p>
              <p className="mt-2 text-sm text-text-muted">Solidaritaet in der Praxis</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Monitoring KPIs */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">
          Monitoring: Wie erfolgreich ist das Modell?
        </h2>

        <MetricGrid columns={4} className="mb-6">
          <MetricCard label="Gratis-Quote" value="5 - 15%" subtitle="Ziel" sourceType="none" />
          <MetricCard label="KulturLegi-Quote" value="10 - 20%" subtitle="Ziel" sourceType="none" />
          <MetricCard label="Supporter-Quote" value="10 - 20%" subtitle="Ziel" sourceType="none" />
          <MetricCard label="Aufstockungen" value="Konto 3510" subtitle="Quelldaten" sourceType="live" />
        </MetricGrid>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Berechnung der Zielwerte</CardTitle>
          </CardHeader>
          <Table
            columns={KPI_COLUMNS}
            data={KPI_DATA}
            keyExtractor={(row) => row.kpi}
            compact
          />
          <div className="mt-4 rounded-lg border-l-4 border-primary bg-bg-light p-3 text-xs text-text-muted">
            <strong>Quelle aller Zielwerte:</strong>{' '}
            Vorstandsentscheidung Januar 2025. Basiert auf Schaetzungen, nicht auf historischen Daten.{' '}
            <a href="/methodik#pricing-model" className="text-primary hover:underline">
              Vollstaendige Methodik
            </a>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-400 bg-amber-50">
          <p className="text-sm">
            <strong>Daten-Limitierung:</strong> Aktuell erfassen wir nur die Aufstockungen (Konto 3510 in Kivitendo).
            Die Gratis-, KulturLegi- und Supporter-Quoten sind noch nicht systematisch messbar.
          </p>
          <p className="mt-2 text-sm">
            <strong>Naechster Schritt:</strong> Kassensystem erweitern, um Preisstufe pro Verkauf zu erfassen.
          </p>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Haeufige Fragen</h2>
        <Card>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map((faq) => (
              <details key={faq.question} className="group py-3">
                <summary className="cursor-pointer font-semibold text-sm hover:text-primary">
                  {faq.question}
                </summary>
                <p className="mt-2 pl-4 text-sm text-text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Card>
      </section>

      {/* Dokumentation */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Dokumentation</h2>
        <Card>
          <p className="text-sm">
            Das vollstaendige Preismodell-Dokument mit allen Details zu Buchhaltung,
            Umsetzung und Kommunikation findest du hier:
          </p>
          <p className="mt-2">
            <code className="rounded bg-bg-light px-2 py-1 text-sm">
              01_Management/B_Finanzen/Preismodell_Solidaritaet.md
            </code>
          </p>
          <a
            href="https://cloud.revamp-it.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Im Nextcloud oeffnen
          </a>
        </Card>
      </section>
    </>
  );
}
