// ---------------------------------------------------------------------------
// Methodik: 1. Einnahmen-Daten section
// ---------------------------------------------------------------------------

import Table from '@/components/ui/Table';
import type { AccountRow } from '../data';
import { ACCOUNTS, ACCOUNT_COLUMNS } from '../data';
import { MethodologySection } from './MethodologyHelpers';

export function IncomeDataSection() {
  return (
    <MethodologySection
      id="income-data"
      title="1. Einnahmen-Daten"
      badgeLabel="Quelldaten"
      badgeVariant="success"
      confidence="high"
    >
      <p className="mb-4 text-sm text-text-light">
        Die Einnahmen-Daten sind die einzigen direkten Quelldaten im Dashboard.
        Sie werden direkt aus der Kivitendo-Buchhaltung exportiert.
      </p>

      <h4 className="mb-2 heading-detail">Kivitendo-Konten:</h4>
      <Table
        columns={ACCOUNT_COLUMNS}
        data={ACCOUNTS}
        keyExtractor={(row: AccountRow) => row.account}
        compact
        className="mb-4"
      />

      <h4 className="mb-2 heading-detail">Verifizierung:</h4>
      <p className="text-sm text-text-muted">
        Jeder Wert kann direkt in{' '}
        <code className="rounded bg-bg-light px-1">revamp-Einnahmen-2025.xlsx</code>{' '}
        nachgeschlagen werden. Die Datei enthält monatliche Werte für jedes Konto.
      </p>
    </MethodologySection>
  );
}
