// ---------------------------------------------------------------------------
// Methodik: 2. Eigenfinanzierungsgrad section
// ---------------------------------------------------------------------------

import { FormulaBox, MethodologySection } from './MethodologyHelpers';

export function SelfFinancingSection() {
  return (
    <MethodologySection
      id="self-financing"
      title="2. Eigenfinanzierungsgrad"
      badgeLabel="Berechnet"
      badgeVariant="derived"
      confidence="high"
      confidenceNote="(Berechnung aus Quelldaten)"
    >
      <p className="mb-4 text-sm text-text-light">
        Der Eigenfinanzierungsgrad zeigt, wie viel der Einnahmen durch eigene
        Wirtschaftstätigkeit erwirtschaftet wird (ohne Spenden).
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        Eigenfinanzierungsgrad = (Warenverkauf + Dienstleistungen + Integration) / Gesamteinnahmen &times; 100%
      </FormulaBox>

      <h4 className="mb-2 heading-detail">Bedeutung:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>&gt;60%:</strong> Hohe Unabhängigkeit von Spenden (Ziel)</li>
        <li><strong>40-60%:</strong> Mischfinanzierung</li>
        <li><strong>&lt;40%:</strong> Starke Spendenabhängigkeit</li>
      </ul>

      <h4 className="mb-2 heading-detail">Treiber:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm">
        <li>Anzahl verkaufter Geräte</li>
        <li>Durchschnittlicher Verkaufspreis</li>
        <li>Anzahl Dienstleistungsaufträge</li>
      </ul>
    </MethodologySection>
  );
}
