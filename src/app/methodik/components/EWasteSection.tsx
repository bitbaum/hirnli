// ---------------------------------------------------------------------------
// Methodik: 5. E-Waste-Berechnung section
// ---------------------------------------------------------------------------

import { FormulaBox, MethodologySection } from './MethodologyHelpers';

export function EWasteSection() {
  return (
    <MethodologySection
      id="ewaste-calculation"
      title="5. E-Waste-Berechnung"
      badgeLabel="Schätzung"
      badgeVariant="estimated"
      confidence="low"
    >
      <p className="mb-4 text-sm text-text-light">
        Die E-Waste-Ersparnis wird ebenfalls aus der geschätzten Geräteanzahl abgeleitet.
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        E-Waste vermieden = Geschätzte Geräte &times; 5 kg/Gerät
      </FormulaBox>

      <h4 className="mb-2 text-sm font-medium">Annahmen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>Durchschnittliches Gerätegewicht: 5 kg (inkl. Peripherie)</li>
        <li>Jedes wiederverwendete Gerät vermeidet Entsorgung</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Gerätegewicht variiert stark (Laptop ~2kg, Desktop ~10kg)</li>
        <li>Nur das Gerät selbst, nicht Verpackung/Zubehör</li>
        <li>Basiert auf Geräteschätzung</li>
      </ul>
    </MethodologySection>
  );
}
