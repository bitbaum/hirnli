// ---------------------------------------------------------------------------
// Methodik: 7. Datenlücken section
// ---------------------------------------------------------------------------

import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import type { DataGapRow } from '../data';
import { DATA_GAPS } from '../data';

const DATA_GAP_COLUMNS = [
  { key: 'dataPoint', header: 'Datenpunkt' },
  {
    key: 'priority',
    header: 'Priorität',
    render: (row: DataGapRow) => (
      <span className={`font-semibold ${row.priorityColor}`}>{row.priority}</span>
    ),
  },
  { key: 'whyImportant', header: 'Warum wichtig' },
  { key: 'howToFix', header: 'Wie beheben' },
];

export function DataGapsSection() {
  return (
    <section id="data-gaps" className="scroll-mt-8">
      <Card>
        <CardHeader>
          <CardTitle>7. Datenlücken</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-text-light">
          Folgende Daten fehlen komplett und können nicht einmal geschätzt werden:
        </p>
        <Table
          columns={DATA_GAP_COLUMNS}
          data={DATA_GAPS}
          keyExtractor={(row: DataGapRow) => row.dataPoint}
          compact
        />
      </Card>
    </section>
  );
}
