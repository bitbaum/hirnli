import Link from 'next/link';
import { BPL_TOTAL_COST_PER_YEAR } from '@/lib/config/team';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import { formatNumber } from '@/lib/utils/format';

export default function BildungCTASection() {
  return (
    <section className="mb-8">
      <div className="rounded-2xl gradient-hero-bildung p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Unterstütze das Bildungsprogramm</h3>
        <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
          Mit <strong>CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR)}/Jahr über 3 Jahre</strong> (degressiv finanziert) schaffen wir ein selbsttragendes Train-the-Trainer-Programm,
          das {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreicht.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/fundraising"
            className="rounded-lg bg-white px-8 py-4 font-bold text-grey-dark shadow-lg transition-colors hover:bg-bg-light"
          >
            📊 Fundraising-Übersicht
          </Link>
          <Link
            href="/fundraising/stiftungen"
            className="rounded-lg border-2 border-white bg-grey-dark px-8 py-4 font-bold text-white transition-colors hover:bg-grey-dark/85"
          >
            🏛️ Passende Stiftungen finden
          </Link>
          <Link
            href="/revamp-2030"
            className="rounded-lg border-2 border-white bg-grey-dark px-8 py-4 font-bold text-white transition-colors hover:bg-grey-dark/85"
          >
            🚀 Gesamtstrategie 2030
          </Link>
        </div>
      </div>
    </section>
  );
}
