import Card from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils/format';
import type { FunnelStats } from '@/lib/domain/pipeline-stats';

interface Props {
  s: Pick<FunnelStats, 'total' | 'withPurpose'>;
}

export default function DarkPoolSection({ s }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Die verbleibende Lücke</h2>
      <Card>
        <p className="mb-3 text-sm text-text-secondary">
          Von den {formatNumber(s.total)} Stiftungen in unserer Datenbank
          haben {formatNumber(s.total - s.withPurpose)} keinen bekannten Stiftungszweck — sie stammen
          ausschliesslich aus dem Handelsregister (Zefix) und bestehen nur aus einem Namen und einer UID.
        </p>
        <p className="mb-3 text-sm text-text-secondary">
          Für diese Stiftungen gibt es keine günstige Erstbewertung. Der nächste Schritt ist
          die automatische Website-Erkennung: Über DNS-Abfragen und Namens-Heuristiken
          wird geprüft, ob eine Stiftung eine eigene Website hat. Falls ja, wird diese
          gescrapt und der Stiftungszweck daraus extrahiert — danach greift der reguläre Trichter.
        </p>
        <div className="rounded bg-surface-raised p-3 text-sm text-text-muted">
          Bisherige Website-Erkennung: ~555 Websites bei ~16&apos;000 geprüften Stiftungen gefunden (3.4% Trefferquote).
          Die meisten Zefix-Stiftungen haben keine eigene Website.
        </div>
      </Card>
    </section>
  );
}
