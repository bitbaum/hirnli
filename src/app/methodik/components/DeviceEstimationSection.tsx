// ---------------------------------------------------------------------------
// Methodik: 3. Geräteanzahl-Schätzung section
// ---------------------------------------------------------------------------

import { AVG_DEVICE_PRICE } from '@/lib/config/numbers';
import { FormulaBox, MethodologySection } from './MethodologyHelpers';

export function DeviceEstimationSection() {
  return (
    <MethodologySection
      id="device-estimation"
      title="3. Geräteanzahl-Schätzung"
      badgeLabel="Schätzung"
      badgeVariant="estimated"
      confidence="low"
    >
      <p className="mb-4 text-sm text-text-light">
        Da keine Stückzahlen in Kivitendo erfasst werden, schätzen wir die
        Geräteanzahl aus den Einnahmen.
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        Geschätzte Geräte = Warenverkauf (CHF) / Durchschnittspreis (CHF {AVG_DEVICE_PRICE})
      </FormulaBox>

      <h4 className="mb-2 heading-detail">Annahmen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>Durchschnittspreis pro Gerät: <strong>CHF {AVG_DEVICE_PRICE}</strong></li>
        <li>Alle Einnahmen auf Konto 3100 sind Geräteverkäufe</li>
        <li>Keine Unterscheidung nach Gerätetyp</li>
      </ul>

      <h4 className="mb-2 heading-detail">Limitationen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Zubehör (Kabel, Tastaturen, Mäuse) ist mitgezählt</li>
        <li>Grosse Preisvariation (CHF 50 - 500)</li>
        <li>Keine Unterscheidung Laptop/Desktop/Tablet</li>
        <li>Durchschnittspreis ist Schätzung, nicht berechnet</li>
      </ul>

      <div className="rounded-lg border-l-4 border-danger bg-danger-bg p-4">
        <p className="text-sm font-medium text-danger">
          KRITISCH: Stückzahlen sollten in Kivitendo erfasst werden.
          Das würde diese Schätzung überflüssig machen.
        </p>
      </div>
    </MethodologySection>
  );
}
