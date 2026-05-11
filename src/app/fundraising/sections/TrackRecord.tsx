import { formatNumber } from '@/lib/utils/format';
import { TRACK_RECORD } from '../data';
import { CORE_FACTS } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import Inspectable, { type InspectorHandle } from './Inspectable';

export default function TrackRecord({ inspector }: { inspector: InspectorHandle }) {
  const items = [
    { value: `${TRACK_RECORD.yearsActive}+`, label: 'Jahre aktiv', sub: `Seit ${CORE_FACTS.organization.founded}` },
    { value: formatNumber(TRACK_RECORD.totalCustomers), label: 'Kunden', sub: 'im Kivitendo ERP' },
    { value: formatNumber(TRACK_RECORD.totalInvoices), label: 'Rechnungen', sub: `seit ${ORG_PROFILE.milestones.kivitendoStart}` },
    { value: formatNumber(TRACK_RECORD.productsInCatalog), label: 'Produkte', sub: 'im Katalog' },
    { value: formatNumber(TRACK_RECORD.deliveryNotes), label: 'Lieferungen', sub: 'ausgeführt' },
    { value: `${TRACK_RECORD.quoteConversion}%`, label: 'Offerten-Konversion', sub: 'Zuverlässigkeit' },
  ];

  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-card">Leistungsausweis (verifiziert)</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Inspectable
            key={item.label}
            data={{
              label: item.label,
              value: item.value,
              sourceType: 'live',
              source: TRACK_RECORD.source,
              confidence: 'Hoch',
              description: item.sub,
            }}
            inspector={inspector}
            className="block rounded-xl border border-border bg-white p-3 text-center transition-shadow hover:shadow-sm"
          >
            <div className="text-xl font-bold tabular-nums text-grey-dark">{item.value}</div>
            <div className="text-sm font-medium text-text-muted">{item.label}</div>
            <div className="text-sm text-text-muted">{item.sub}</div>
          </Inspectable>
        ))}
      </div>
      <p className="mt-2 text-right text-sm text-text-muted">Quelle: {TRACK_RECORD.source}</p>
    </section>
  );
}
