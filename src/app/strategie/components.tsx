import Card from '@/components/ui/Card';

export function GeschichteSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unsere Geschichte</h2>
      <Card>
        <div className="flex flex-wrap gap-8">
          <div className="min-w-[300px] flex-[2]">
            <h3 className="mt-0 text-lg font-semibold text-primary">Gegründet Dezember 2003</h3>
            <p className="mt-2 text-sm text-text-light">
              Revamp-IT wurde im Dezember 2003 in Zürich gegründet – geboren aus einer einfachen Beobachtung:
              Immer mehr brauchbare Computer landeten im Müll. &ldquo;Da muss etwas passieren&rdquo;, war der Gedanke,
              der alles ins Rollen brachte.
            </p>
            <p className="mt-2 text-sm text-text-light">
              In der Toni Molkerei in Zürich-West – in einem alten Käsekeller – begannen die Gründer
              Michel, Eckhardt und Andreas, sich mit der Reparatur und Lebensverlängerung von Computern
              zu beschäftigen. Schritt für Schritt hat sich daraus ein Verein entwickelt, der sich auf{' '}
              <strong>Kreislaufwirtschaft, digitale Teilhabe und Open-Source-Technologie</strong> konzentriert.
            </p>
            <h4 className="mt-4 text-sm font-semibold">Drei Themen von Anfang an:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-light">
              <li><strong>Hardware und Reparatur</strong> – die Freude daran, Geräte zu reparieren und länger nutzbar zu machen</li>
              <li><strong>Freie und Open-Source-Software</strong> – insbesondere Linux, um ältere Geräte ohne zusätzliche Lizenzkosten weiter zu betreiben</li>
              <li><strong>Soziale Wirkung</strong> – die Überzeugung, dass Technologie Menschen unterstützen soll, statt sie auszuschliessen</li>
            </ul>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-bg-light p-6 text-center">
              <span className="mb-3 text-4xl">🏢</span>
              <h3 className="text-base font-semibold">Heute</h3>
              <p className="mt-2 text-left text-sm text-text-light">
                <strong>Laden:</strong> Birmensdorferstrasse 379, 8055 Zürich<br />
                <strong>Lager:</strong> Badenerstrasse 816, 8048 Zürich<br /><br />
                Werkstatt, Verkauf und Community-Treffpunkt unter einem Dach.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

export function KontaktSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Kontakt</h2>
      <Card className="text-center">
        <h3 className="mb-3 text-lg font-semibold">Revamp-IT</h3>
        <p className="text-sm"><strong>Adresse:</strong> Birmensdorferstrasse 379, 8055 Zürich</p>
        <p className="text-sm"><strong>Telefon:</strong> +41 (0)43 960 32 64</p>
        <p className="text-sm"><strong>E-Mail:</strong> empfang@revamp-it.ch</p>
        <p className="text-sm">
          <strong>Web:</strong>{' '}
          <a href="https://revamp-it.ch" target="_blank" rel="noopener noreferrer">
            revamp-it.ch
          </a>
        </p>
        <p className="mt-6 text-sm italic text-text-muted">
          &ldquo;Alte Computer. Neue Chancen. Bessere Zukunft.&rdquo;
        </p>
      </Card>
    </section>
  );
}
