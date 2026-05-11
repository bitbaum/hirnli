import Card from '@/components/ui/Card';

export default function PrinciplesSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Prinzipien</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 heading-item">Günstigstes Signal zuerst</h3>
          <p className="text-sm text-text-light">
            Jede Stufe ist billiger als die nächste. Keyword-Matching kostet nichts,
            KI-Analyse kostet wenig, Tiefenrecherche kostet am meisten. Wir eliminieren
            so viel wie möglich, bevor wir Ressourcen investieren.
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Nie verschlechtern</h3>
          <p className="text-sm text-text-light">
            Neue Daten können einen Fit-Score nur verbessern, nie verschlechtern.
            Prioritäten können nur steigen, nie sinken. Bereits recherchierte Stiftungen
            werden nie auf eine niedrigere Stufe zurückgesetzt.
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Inspizierbar</h3>
          <p className="text-sm text-text-light">
            Jeder Score und jede Stufe ist auf der Stiftungs-Detailseite einsehbar.
            Welche Checks bestanden haben, welche Felder fehlen, warum die Priorität
            so ist wie sie ist. Keine Black Boxes.
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Wiederholbar</h3>
          <p className="text-sm text-text-light">
            Der gesamte Trichter ist idempotent — er kann jederzeit erneut ausgeführt werden,
            ohne bestehende Daten zu beschädigen. Neue Register-Daten werden automatisch
            in den Trichter aufgenommen.
          </p>
        </Card>
      </div>
    </section>
  );
}
