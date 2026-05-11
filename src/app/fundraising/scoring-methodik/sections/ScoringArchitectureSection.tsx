import Card from '@/components/ui/Card';

export default function ScoringArchitectureSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Drei Scoring-Ebenen</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="mb-2 text-2xl">🎯</div>
          <h3 className="mb-1 heading-item">Fit-Score (0-10)</h3>
          <p className="text-sm text-text-light">
            Passt diese Stiftung zu unserer Mission? Thematische, geografische und
            Zugangs-Übereinstimmung.
          </p>
          <p className="mt-2 text-sm text-text-muted">Berechnet bei der Recherche, gespeichert pro Stiftung.</p>
        </Card>
        <Card>
          <div className="mb-2 text-2xl">📊</div>
          <h3 className="mb-1 heading-item">Bereitschaft (0-100)</h3>
          <p className="text-sm text-text-light">
            Können wir ein massgeschneidertes Gesuch schreiben? Misst die
            Vollständigkeit unserer Recherche-Daten.
          </p>
          <p className="mt-2 text-sm text-text-muted">Berechnet in Echtzeit aus Stiftungsfeldern.</p>
        </Card>
        <Card>
          <div className="mb-2 text-2xl">⚡</div>
          <h3 className="mb-1 heading-item">Priorität (0-100)</h3>
          <p className="text-sm text-text-light">
            Sollten wir jetzt Aufwand investieren? Kombiniert Fit und Bereitschaft
            zu einer handlungsorientierten Empfehlung.
          </p>
          <p className="mt-2 text-sm text-text-muted">Berechnet in Echtzeit. Fit ist Multiplikator.</p>
        </Card>
      </div>
    </section>
  );
}
