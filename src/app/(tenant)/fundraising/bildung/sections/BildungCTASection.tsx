import Link from 'next/link';
import { BPL_TOTAL_COST_PER_YEAR } from '@/lib/config/team';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import { formatNumber } from '@/lib/utils/format';

export default function BildungCTASection() {
  return (
    <section className="mb-8">
      <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
        <h2 className="heading-section mb-3">Unterstütze das Bildungsprogramm</h2>
        <p className="text-base mb-6 text-text-secondary leading-relaxed max-w-3xl mx-auto">
          Mit <strong>CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR)}/Jahr über 3 Jahre</strong>{' '}
          (degressiv finanziert) schaffen wir ein selbsttragendes Train-the-Trainer-Programm, das{' '}
          {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreicht.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/fundraising"
            className="rounded-lg bg-text-primary px-6 py-3 text-sm font-semibold text-surface-base transition-colors hover:bg-text-secondary"
          >
            Fundraising-Übersicht
          </Link>
          <Link
            href="/fundraising/stiftungen"
            className="rounded-lg border border-border-default bg-surface-base px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
          >
            Passende Stiftungen finden
          </Link>
          <Link
            href="/revamp-2030"
            className="rounded-lg border border-border-default bg-surface-base px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
          >
            Gesamtstrategie 2030
          </Link>
        </div>
      </div>
    </section>
  );
}
