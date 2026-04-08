import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { PRICING_TIERS, PRICE_EXAMPLES, KPI_DATA, PROCESS_STEPS, FAQ_ITEMS } from './data';
import { PRICE_EXAMPLE_COLUMNS, KPI_COLUMNS } from './components';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import UnifiedNumberDisplay from '@/components/data/UnifiedNumberDisplay';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Solidarisches Preismodell',
  description: 'Wer kann, zahlt mehr. Wer nicht kann, zahlt weniger. So hat jede:r Zugang zu IT.',
};

export default function PreismodellPage() {
  return (
    <>
      <PageHeader
        title="Solidarisches Preismodell"
        subtitle="Wer kann, zahlt mehr. Wer nicht kann, zahlt weniger. So hat jede:r Zugang zu IT."
      />

      <WhyThisMatters
        purpose="KOSTENLOSE Laptops gibt es nur auf Anfrage von Partnerorganisationen (AOZ, Caritas, Solinetz) oder bei nachgewiesener Notlage. Ansonsten bieten wir extreme Preisflexibilität (auch unter KulturLegi-Niveau) — aber nicht automatisch gratis."
        connection="Revenue = Operations finanziert. Stiftungen = Impact finanziert (kostenlose Geräte, Workshops, Stipendien)."
      />

      {/* Grundsatz */}
      <Card className="mb-8 border-l-4 border-l-primary bg-bg-light">
        <p className="text-lg">
          <strong>Unser Grundsatz:</strong> IT-Zugang ist ein Grundrecht. Niemand soll wegen Geld
          keinen funktionierenden Computer haben.
        </p>
        <p className="mt-3 text-sm text-text-light">
          <strong>Wichtig:</strong> Wir bieten <strong>kostenlose Laptops</strong> an soziale Organisationen
          wie AOZ, Caritas, Solinetz für deren Klient:innen. Dies wird durch Stiftungsgelder finanziert.
          Zahlende Kund:innen finanzieren unsere Betriebskosten (Operations).
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
              Vollständige Methodik
            </a>
          </div>
        </Card>
      </section>

      {/* KulturLegi Info */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Was ist KulturLegi?</h2>
        <Card className="border border-warning/30 bg-warning/10">
          <h3 className="mb-3 text-lg font-semibold">Der Ausweis für Menschen mit wenig Geld</h3>
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
            . Der genaue Betrag kann je nach Kanton und Haushaltsgrösse variieren.
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
        <Card className="border-l-4 border-l-primary bg-primary/10">
          <p className="text-sm">
            <strong>Kein Papierkram:</strong> Wir setzen auf Vertrauen. Die meisten Menschen sind ehrlich.
            Die wenigen, die das System ausnutzen könnten, sind der Preis für ein unbürokratisches System.
          </p>
        </Card>
      </section>

      {/* Supporter CTA */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Werde Supporter</h2>
        <Card className="border-2 border-pillar-vision bg-gradient-to-br from-pillar-vision/10 to-white">
          <div className="flex flex-wrap items-center gap-8">
            <div className="min-w-0 flex-1 sm:min-w-[280px]">
              <h3 className="mb-3 text-lg font-semibold text-pillar-vision">
                Mehr zahlen, mehr ermöglichen
              </h3>
              <p className="mb-3 text-sm">
                Wenn du beim Kauf einen freiwilligen Aufschlag zahlst, ermöglichst du damit:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6 text-sm">
                <li>Gratis-Geräte für Menschen in Not</li>
                <li>KulturLegi-Rabatte für Working Poor</li>
                <li>Workshops für Kinder aus einkommensschwachen Familien</li>
              </ul>
              <p className="text-xs text-text-muted">
                <strong>Empfohlen:</strong> +20% bis +50% auf den Normalpreis<br />
                Bei einem CHF 200 Laptop sind das nur CHF 40 - 100 mehr.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-5xl">&#x1F91D;</p>
              <p className="mt-2 text-sm text-text-muted">Solidarität in der Praxis</p>
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
          <UnifiedNumberDisplay numberKey="GRATIS_QUOTE_TARGET" size="md" showLabel={true} />
          <UnifiedNumberDisplay numberKey="KULTURLEGI_QUOTE_TARGET" size="md" showLabel={true} />
          <UnifiedNumberDisplay numberKey="SUPPORTER_QUOTE_TARGET" size="md" showLabel={true} />
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
            Vorstandsentscheidung Januar 2025. Basiert auf Schätzungen, nicht auf historischen Daten.{' '}
            <a href="/methodik#pricing-model" className="text-primary hover:underline">
              Vollständige Methodik
            </a>
          </div>
        </Card>

        <Card className="border-l-4 border-l-warning bg-warning/10">
          <p className="text-sm">
            <strong>Daten-Limitierung:</strong> Aktuell erfassen wir nur die Aufstockungen (Konto 3510 in Kivitendo).
            Die Gratis-, KulturLegi- und Supporter-Quoten sind noch nicht systematisch messbar.
          </p>
          <p className="mt-2 text-sm">
            <strong>Nächster Schritt:</strong> Kassensystem erweitern, um Preisstufe pro Verkauf zu erfassen.
          </p>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Häufige Fragen</h2>
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
            Das vollständige Preismodell-Dokument mit allen Details zu Buchhaltung,
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
            className="mt-4 inline-block rounded-lg bg-grey-dark px-4 py-2 text-sm font-medium text-white hover:bg-grey-dark/85"
          >
            Im Nextcloud öffnen
          </a>
        </Card>
      </section>

      <StoryBridge bridges={STORY_BRIDGES.preismodell} />
    </>
  );
}
