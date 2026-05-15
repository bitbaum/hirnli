// ---------------------------------------------------------------------------
// Methodik: 4. CO₂-Berechnung section
// ---------------------------------------------------------------------------

import Table from '@/components/ui/Table';
import type { CO2Row } from '../data';
import { CO2_DATA } from '../data';
import { FormulaBox, MethodologySection } from './MethodologyHelpers';

const CO2_COLUMNS = [
  { key: 'manufacturer', header: 'Hersteller' },
  { key: 'model', header: 'Modell' },
  {
    key: 'co2Kg',
    header: 'CO\u2082 (kg)',
    align: 'right' as const,
    render: (row: CO2Row) => <span className="font-semibold">{row.co2Kg.toFixed(1)}</span>,
  },
  {
    key: 'source',
    header: 'Quelle',
    render: (row: CO2Row) => (
      <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {row.source}
      </a>
    ),
  },
];

export function CO2CalculationSection() {
  return (
    <MethodologySection
      id="co2-calculation"
      title="4. CO&#x2082;-Berechnung"
      badgeLabel="Berechnet"
      badgeVariant="derived"
      confidence="high"
      confidenceNote="(Hersteller-LCA-Reports für bekannte Modelle)"
    >
      <p className="mb-4 text-sm text-text-light">
        Die CO&#x2082;-Ersparnis wird basierend auf <strong>Hersteller-spezifischen Life Cycle Assessment (LCA) Reports</strong> berechnet.
      </p>

      <FormulaBox>
        <strong>Formel (für bekannte Modelle):</strong><br />
        CO&#x2082; vermieden = SUM(CO2_LCA_Total_kg pro Gerät)
      </FormulaBox>
      <FormulaBox>
        <strong>Formel (für unbekannte Modelle):</strong><br />
        CO&#x2082; vermieden = SUM(Gewicht_kg &times; CO2_Faktor_kg_per_kg)
      </FormulaBox>

      <h4 className="mb-2 mt-4 heading-detail">Hersteller-spezifische CO&#x2082;-Werte (High Confidence):</h4>
      <Table
        columns={CO2_COLUMNS}
        data={CO2_DATA}
        keyExtractor={(row: CO2Row) => `${row.manufacturer}-${row.model}`}
        compact
        className="mb-4"
      />

      <h4 className="mb-2 mt-4 heading-detail">Datenquellen (Peer-Reviewed Studien):</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>
          <strong>MDPI Sustainability (2025):</strong>{' '}
          <a href="https://www.mdpi.com/2071-1050/17/10/4455" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Environmental and Economic Assessment Desktop vs. Laptop
          </a>{' '}
          - Business Laptop Durchschnitt: 300 kg CO&#x2082;
        </li>
        <li>
          <strong>ScienceDirect (2023):</strong>{' '}
          <a href="https://www.sciencedirect.com/science/article/pii/S1364032123002794" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Assessing embodied carbon emissions
          </a>{' '}
          - Monitore: 200-250 kg CO&#x2082;
        </li>
        <li>
          <strong>Circular Computing:</strong>{' '}
          <a href="https://circularcomputing.com/news/carbon-footprint-laptop/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Analysis of 231 Laptops
          </a>{' '}
          - Consumer Laptop Durchschnitt: 250 kg CO&#x2082;
        </li>
      </ul>

      <h4 className="mb-2 mt-4 heading-detail">Methodik:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>Für bekannte Modelle:</strong> Direkte CO&#x2082;-Werte aus Hersteller-LCA-Reports (High Confidence)</li>
        <li><strong>Für unbekannte Modelle:</strong> Hersteller-Durchschnitt oder Kategorie-Durchschnitt (Medium Confidence)</li>
        <li><strong>Alle verkauften Geräte ersetzen Neukäufe</strong> (Avoided Burden Ansatz nach ISO 14040/14044)</li>
        <li>Alle Quellen sind direkt verlinkt und nachprüfbar</li>
      </ul>

      <h4 className="mb-2 heading-detail">Limitationen:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Falls Geräteanzahl geschätzt wird, entsteht Unsicherheit (siehe Geräte-Berechnung)</li>
        <li>Nicht alle Käufer hätten neu gekauft (konservative Annahme)</li>
        <li>Lebensdauerverlängerung durch Refurbishment wird separat gemessen (LIFETIME_YEARS)</li>
      </ul>
    </MethodologySection>
  );
}
