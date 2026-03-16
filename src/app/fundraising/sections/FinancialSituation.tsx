import Card from '@/components/ui/Card';
import { formatCHF, formatNumber } from '@/lib/utils/format';
import { FINANCIAL_CONTEXT, TRACK_RECORD } from '../data';
import Inspectable, { type InspectorHandle } from './Inspectable';

export default function FinancialSituation({ inspector }: { inspector: InspectorHandle }) {
  return (
    <Card className="mb-8 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100">
      <h3 className="mb-3 font-semibold text-amber-800">Die ehrliche Finanzlage</h3>
      <div className="space-y-2 text-sm text-amber-900">
        <p>
          <strong>Was passiert ist:</strong> Der Verlust von B2B-Grosskunden hat unsere
          Dienstleistungs-Einnahmen um{' '}
          <Inspectable
            data={{
              label: 'Einnahmenrückgang Dienstleistungen',
              value: `${FINANCIAL_CONTEXT.decline_pct}%`,
              sourceType: 'derived',
              source: 'Kivitendo Erfolgsrechnung 3400 (2022-2025)',
              formula: `(${formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)} - ${formatCHF(FINANCIAL_CONTEXT.services_2025)}) / ${formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)} × 100`,
              confidence: 'Hoch',
              description: `Dienstleistungen (3400): CHF ${formatNumber(FINANCIAL_CONTEXT.services_2022)} (2022), CHF ${formatNumber(FINANCIAL_CONTEXT.services_2023)} (2023), CHF ${formatNumber(FINANCIAL_CONTEXT.services_2024)} (2024), CHF ${formatNumber(FINANCIAL_CONTEXT.services_2025)} (2025). Quelle: Kivitendo Erfolgsrechnung, verifiziert 11.02.2026.`,
            }}
            inspector={inspector}
            className="text-amber-900"
          >
            {FINANCIAL_CONTEXT.decline_pct}%
          </Inspectable>
          {' '}reduziert. Von ~
          <Inspectable
            data={{
              label: 'Dienstleistungseinnahmen Durchschnitt 2022-23',
              value: formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23),
              sourceType: 'live',
              source: 'Kivitendo Erfolgsrechnung 3400',
              formula: `(${formatCHF(FINANCIAL_CONTEXT.services_2022)} + ${formatCHF(FINANCIAL_CONTEXT.services_2023)}) / 2`,
              confidence: 'Hoch',
            }}
            inspector={inspector}
            className="text-amber-900"
          >
            {formatCHF(FINANCIAL_CONTEXT.services_avg_2022_23)}
          </Inspectable>
          {' '}(Durchschnitt 2022-23) auf{' '}
          <Inspectable
            data={{
              label: 'Dienstleistungseinnahmen 2025',
              value: formatCHF(FINANCIAL_CONTEXT.services_2025),
              sourceType: 'live',
              source: 'Kivitendo Erfolgsrechnung 3400 (2025, Gesamtjahr)',
              confidence: 'Hoch',
            }}
            inspector={inspector}
            className="text-amber-900"
          >
            {formatCHF(FINANCIAL_CONTEXT.services_2025)}
          </Inspectable>
          {' '}(2025). Gesamteinnahmen fielen von {formatCHF(FINANCIAL_CONTEXT.total_2023)} auf {formatCHF(FINANCIAL_CONTEXT.total_2025)}.
        </p>
        <p>
          <strong>Der Grund:</strong> Abhängigkeit von wenigen B2B-Hosting-Kunden. Keine
          diversifizierten Einnahmequellen. Keine aktive Akquise.
        </p>
        <p className="font-medium text-emerald-800">
          <strong>Das Positive:</strong> Geräteverkauf ({formatCHF(FINANCIAL_CONTEXT.warenverkauf_2025)} in 2025) bleibt
          stabil. {TRACK_RECORD.yearsActive} Jahre Erfahrung, {formatNumber(TRACK_RECORD.totalInvoices)} Rechnungen,{' '}
          {formatNumber(TRACK_RECORD.totalCustomers)} Kunden — die Kompetenz ist da. Der Hub ist unsere Turnaround-Strategie.
        </p>
      </div>
    </Card>
  );
}
