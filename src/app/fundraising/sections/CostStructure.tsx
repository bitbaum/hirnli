import Link from 'next/link';
import Card from '@/components/ui/Card';
import { formatCHF } from '@/lib/utils/format';
import { COST_STRUCTURE_2023, FINANCIAL_CONTEXT } from '../data';

export default function CostStructure() {
  return (
    <section className="mb-8">
      <Card className="prose prose-sm max-w-none">
        <h2>Kostenstruktur 2023: Warum wir Verlust machen</h2>

        <p>
          2023 war das letzte vollständige Geschäftsjahr vor unserer aktuellen Krise.
          Einnahmen <strong>{formatCHF(COST_STRUCTURE_2023.totalRevenue)}</strong> vs. Ausgaben <strong>{formatCHF(COST_STRUCTURE_2023.totalExpenses)}</strong> ={' '}
          <span className="text-red-600 font-semibold">Verlust {formatCHF(COST_STRUCTURE_2023.result)}</span>.
        </p>

        <h3>Wohin geht das Geld?</h3>

        <p>
          <strong>Die grössten Kostentreiber 2023:</strong>
        </p>

        <ul>
          {COST_STRUCTURE_2023.categories.map((cat) => (
            <li key={cat.label}>
              <strong>{cat.label}:</strong> {formatCHF(cat.amount)} ({cat.pctOfExpenses}% der Ausgaben)
            </li>
          ))}
        </ul>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <p className="font-semibold text-red-800 mb-2">Das Problem:</p>
          <p className="text-red-700">
            Die Miete allein ({formatCHF(COST_STRUCTURE_2023.categories[0].amount)}) übersteigt unsere gesamten Einnahmen 2025 ({formatCHF(FINANCIAL_CONTEXT.total_2025)}).
            Die Ausgaben 2023 waren <strong>{Math.round((COST_STRUCTURE_2023.totalExpenses / COST_STRUCTURE_2023.totalRevenue) * 100)}% der Einnahmen</strong> — das ist nicht nachhaltig.
          </p>
        </div>

        <h3>Die Lösung: Hub + Menschen</h3>

        <p>
          Der Hub bringt Laden + Lager + Werkstatt unter ein Dach. Dadurch sparen wir Doppelmiete,
          gewinnen Effizienz, und schaffen Platz für neue Einnahmequellen (Workshops, Corporate Training, Events).
        </p>

        <p>
          <strong>Unser Ziel:</strong> Nicht mehr mit Defizit arbeiten, sondern durch Effizienzgewinn + neue Revenue-Streams
          einen nachhaltigen Betrieb aufbauen.
        </p>

        <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted not-prose">
          <strong>Datenquelle:</strong> {COST_STRUCTURE_2023.source}. Alle Zahlen verifiziert 11.02.2026.
        </div>
      </Card>
    </section>
  );
}
