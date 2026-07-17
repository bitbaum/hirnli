import Card from '@/components/ui/Card';

export default function FitScoreSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Ebene 1: Fit-Score</h2>
      <Card>
        <p className="mb-4 text-sm text-text-secondary">
          Der Fit-Score bewertet die inhaltliche Übereinstimmung zwischen Stiftungszweck
          und unserer Mission auf drei Dimensionen:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left">
                <th scope="col" className="pb-2 pr-4 heading-item">Dimension</th>
                <th scope="col" className="pb-2 pr-4 heading-item">Bereich</th>
                <th scope="col" className="pb-2 heading-item">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border-default/50">
                <td className="py-2 pr-4 heading-detail">Thematisch</td>
                <td className="py-2 pr-4 tabular-nums">0-4</td>
                <td className="py-2">Gewichtete Übereinstimmung der Förderthemen mit unseren Schwerpunkten</td>
              </tr>
              <tr className="border-b border-border-default/50">
                <td className="py-2 pr-4 heading-detail">Geografisch</td>
                <td className="py-2 pr-4 tabular-nums">0-3</td>
                <td className="py-2">Zürich → Schweiz → DACH → International (Stufenmodell)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 heading-detail">Zugang</td>
                <td className="py-2 pr-4 tabular-nums">0-3</td>
                <td className="py-2">Bewerbungsweg, Annahmestatus und Vereinbarkeit</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded bg-surface-raised p-3 text-sm text-text-muted">
          <strong>Dimensionsfloors:</strong> Wenn der geografische Score unter 1 liegt
          (z.B. Stiftung fördert nur in Mexiko), wird der Gesamt-Fit auf maximal 3
          begrenzt. Bei thematischem Score 0 auf maximal 2. Dies verhindert, dass
          ein guter Zugang einen fundamentalen Mismatch kompensiert.
        </div>
        <p className="mt-3 text-sm text-text-muted">
          Anzeige: 0-3 Sterne (≥7 → 3 Sterne, ≥4 → 2 Sterne, ≥1 → 1 Stern, 0 → 0 Sterne). Stiftungen unter Tier «Profiliert» → 0 Sterne (ungenügende Datengrundlage).
        </p>
        <div className="mt-3 rounded bg-surface-raised p-3 text-sm text-text-muted">
          <strong>Vertrauensgate:</strong> Stiftungen mit Bereitschafts-Tier unter «Profiliert» zeigen keine
          Sterne-Bewertung, da die Datengrundlage für eine belastbare Einschätzung nicht ausreicht.
        </div>
      </Card>
    </section>
  );
}
