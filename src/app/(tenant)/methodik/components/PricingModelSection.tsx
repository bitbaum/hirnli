// ---------------------------------------------------------------------------
// Methodik: 6. Preismodell-Methodik section
// ---------------------------------------------------------------------------

import Table from '@/components/ui/Table';
import type { PricingRow } from '../data';
import { PRICING_EXAMPLE, PRICING_COLUMNS } from '../data';
import { FormulaBox, MethodologySection } from './MethodologyHelpers';

export function PricingModelSection() {
  return (
    <MethodologySection
      id="pricing-model"
      title="6. Preismodell-Methodik"
      badgeLabel="Berechnet / Entscheidung"
      badgeVariant="derived"
      confidence="medium"
      confidenceNote="(Entscheidungen dokumentiert, Marktvergleich nicht automatisiert)"
    >
      <p className="mb-4 text-sm text-text-secondary">
        Das solidarische Preismodell basiert auf einer Kombination aus Marktdaten, externen
        Standards und Vorstandsentscheidungen.
      </p>

      <h4 className="mb-2 heading-detail">6.1 Normalpreis (Marktvergleich)</h4>
      <FormulaBox>
        <strong>Methode:</strong>
        <br />
        Vergleich mit ähnlichen Angeboten auf Ricardo, Tutti, Revendo, eBay Kleinanzeigen
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>
          <strong>Quelle:</strong> Manuelle Marktbeobachtung
        </li>
        <li>
          <strong>Konfidenz:</strong> Mittel (variiert je nach Gerät)
        </li>
        <li>
          <strong>Beispiel:</strong> ThinkPad X270 i5/8GB &rarr; Ricardo CHF 180-250 &rarr;
          Normalpreis CHF 200
        </li>
      </ul>

      <h4 className="mb-2 heading-detail">6.2 KulturLegi-Rabatt (50%)</h4>
      <FormulaBox>
        <strong>Formel:</strong>
        <br />
        KulturLegi-Preis = Normalpreis &times; 0.5
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>
          <strong>Quelle:</strong> Vorstandsentscheidung (Januar 2025)
        </li>
        <li>
          <strong>Begründung:</strong> Einheitlicher, leicht kommunizierbarer Rabatt
        </li>
        <li>
          <strong>KulturLegi-Einkommensgrenze:</strong> ca. CHF 2&apos;600/Monat (Einzelperson)
        </li>
        <li>
          <strong>Externe Quelle:</strong>{' '}
          <a
            href="https://www.kulturlegi.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            kulturlegi.ch
          </a>
        </li>
      </ul>

      <h4 className="mb-2 heading-detail">6.3 Supporter-Aufschlag (+20% bis +50%)</h4>
      <FormulaBox>
        <strong>Formel:</strong>
        <br />
        Supporter-Preis = Normalpreis &times; (1 + Aufschlag)
        <br />
        <span className="text-sm">wobei Aufschlag = 0.2 bis 0.5 (empfohlen)</span>
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>
          <strong>Quelle:</strong> Vorstandsentscheidung (Januar 2025)
        </li>
        <li>
          <strong>Begründung +20%:</strong> Niedrige Einstiegshürde (CHF 40 bei CHF 200 Gerät)
        </li>
        <li>
          <strong>Begründung +50%:</strong> Signifikanter Impact ohne zu hohe Abschreckung
        </li>
        <li>
          <strong>Buchung:</strong> Aufschlag wird separat auf Konto 3510 verbucht
        </li>
      </ul>

      <h4 className="mb-2 heading-detail">Preis-Beispiel vollständig nachvollziehbar:</h4>
      <Table
        columns={PRICING_COLUMNS}
        data={PRICING_EXAMPLE}
        keyExtractor={(row: PricingRow) => row.tier}
        compact
      />
    </MethodologySection>
  );
}
