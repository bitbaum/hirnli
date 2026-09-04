/**
 * The organisation's own identity — name, addresses, phone, email, website,
 * founding year — comes from the request's tenant. KontaktSection in
 * particular used to render the first tenant's postal address, phone number
 * and email on every tenant's /strategie page: not a cosmetic default, but one
 * customer publishing another customer's contact details as its own.
 *
 * STILL ORG-SPECIFIC: the founding narrative below is Revamp-IT's, down to the
 * founders' names and the Käsekeller in the Toni Molkerei. No substitution
 * makes it true of anybody else. It belongs in `org_content` with the other
 * per-tenant prose; until it moves, this section is only correct for the
 * reference tenant, and is left visibly so rather than quietly generalised.
 */
import Card from '@/components/ui/Card';
import { getTenant } from '@/lib/tenant/resolve';

export { default as SovereigntyPillar } from './components/SovereigntyPillar';
export { default as VisionMetric } from './components/VisionMetric';
export { default as PillarDetail } from './components/PillarDetail';
export { default as CommunitySpaceCard } from './components/CommunitySpaceCard';

export async function GeschichteSection() {
  const tenant = await getTenant();
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Unsere Geschichte</h2>
      <Card>
        <div className="flex flex-wrap gap-8">
          <div className="min-w-0 flex-[2] sm:min-w-[300px]">
            <h3 className="mt-0 heading-card text-primary">Gegründet Dezember {tenant.founded}</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Revamp-IT wurde im Dezember {tenant.founded} in Zürich gegründet – geboren aus einer
              einfachen Beobachtung: Immer mehr brauchbare Computer landeten im Müll. &ldquo;Da muss
              etwas passieren&rdquo;, war der Gedanke, der alles ins Rollen brachte.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              In der Toni Molkerei in Zürich-West – in einem alten Käsekeller – begannen die Gründer
              Michel, Eckhardt und Andreas, sich mit der Reparatur und Lebensverlängerung von
              Computern zu beschäftigen. Schritt für Schritt hat sich daraus ein Verein entwickelt,
              der sich auf{' '}
              <strong>Kreislaufwirtschaft, digitale Teilhabe und Open-Source-Technologie</strong>{' '}
              konzentriert.
            </p>
            <h4 className="mt-4 heading-detail">Drei Themen von Anfang an:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li>
                <strong>Hardware und Reparatur</strong> – die Freude daran, Geräte zu reparieren und
                länger nutzbar zu machen
              </li>
              <li>
                <strong>Freie und Open-Source-Software</strong> – insbesondere Linux, um ältere
                Geräte ohne zusätzliche Lizenzkosten weiter zu betreiben
              </li>
              <li>
                <strong>Soziale Wirkung</strong> – die Überzeugung, dass Technologie Menschen
                unterstützen soll, statt sie auszuschliessen
              </li>
            </ul>
          </div>
          <div className="min-w-[200px] flex-1">
            <Card
              variant="muted"
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <span className="mb-3 text-4xl">🏢</span>
              <h3 className="heading-item">Heute</h3>
              <p className="mt-2 text-left text-sm text-text-secondary">
                <strong>Laden:</strong> {tenant.address}
                <br />
                <strong>Lager:</strong> {tenant.warehouseAddress}
                <br />
                <br />
                Werkstatt, Verkauf und Community-Treffpunkt unter einem Dach.
              </p>
            </Card>
          </div>
        </div>
      </Card>
    </section>
  );
}

export async function KontaktSection() {
  const tenant = await getTenant();
  // Address, phone and website are optional on a tenant. Each line is omitted
  // when absent — a "Telefon:" label with nothing after it reads as a broken
  // page, and inventing a value would be worse than either.
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Kontakt</h2>
      <Card className="text-center">
        <h3 className="mb-3 heading-card">{tenant.name}</h3>
        {tenant.address && (
          <p className="text-sm">
            <strong>Adresse:</strong> {tenant.address}
          </p>
        )}
        {tenant.phone && (
          <p className="text-sm">
            <strong>Telefon:</strong> {tenant.phone}
          </p>
        )}
        <p className="text-sm">
          <strong>E-Mail:</strong> {tenant.email}
        </p>
        {tenant.website && (
          <p className="text-sm">
            <strong>Web:</strong>{' '}
            <a href={tenant.website} target="_blank" rel="noopener noreferrer">
              {new URL(tenant.website).hostname}
            </a>
          </p>
        )}
        <p className="mt-6 text-sm italic text-text-muted">
          &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
        </p>
      </Card>
    </section>
  );
}
