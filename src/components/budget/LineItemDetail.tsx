import type { BudgetLineItem } from '@/lib/schemas/budget';
import { formatCHF, formatDateCH } from '@/lib/utils/format';
import { CONFIDENCE_COLORS } from '@/lib/config/numbers';

/**
 * LineItemDetail Component
 *
 * Shows expanded details for a budget line item:
 * - Description
 * - Sub-items breakdown (if any)
 * - Source methodology
 * - Confidence level
 * - Last verified date
 *
 * Progressive disclosure: User clicks to see this level of detail
 */

interface LineItemDetailProps {
  item: BudgetLineItem;
}

export default function LineItemDetail({ item }: LineItemDetailProps) {
  return (
    <div className="ml-8 p-4 bg-primary/10 rounded-lg border-l-4 border-primary space-y-3">
      {/* Description */}
      <p className="text-sm text-grey-dark">{item.description}</p>

      {/* Sub-items breakdown */}
      {item.subItems && item.subItems.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text-light mb-2">Zusammensetzung:</p>
          <div className="space-y-1">
            {item.subItems.map((sub, idx) => (
              <div key={idx} className="flex justify-between text-sm text-text-light">
                <span className="flex-1">• {sub.label}</span>
                <span className="font-medium ml-2">{formatCHF(sub.amount)}</span>
              </div>
            ))}
          </div>
          {item.subItems.some((sub) => sub.note) && (
            <div className="mt-2 space-y-1">
              {item.subItems
                .filter((sub) => sub.note)
                .map((sub, idx) => (
                  <p key={idx} className="text-sm text-text-muted italic">
                    → {sub.label}: {sub.note}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Source metadata */}
      <div className="text-sm space-y-1.5 pt-2 border-t border-primary/20">
        <div>
          <strong className="text-grey-dark">Quelle:</strong>{' '}
          <span className="text-text-light">{item.source.methodology}</span>
        </div>

        {item.source.calculation && (
          <div>
            <strong className="text-grey-dark">Kalkulation:</strong>{' '}
            <span className="text-text-light">{item.source.calculation}</span>
          </div>
        )}

        {item.source.marketResearch && (
          <div>
            <strong className="text-grey-dark">Marktforschung:</strong>{' '}
            <span className="text-text-light">{item.source.marketResearch}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <strong className="text-grey-dark">Konfidenz:</strong>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${CONFIDENCE_COLORS[item.source.confidence]}`}
          >
            {item.source.confidence}
          </span>
        </div>

        <div>
          <strong className="text-grey-dark">Verifiziert:</strong>{' '}
          <span className="text-text-light">
            {formatDateCH(item.source.lastVerified)}
          </span>
        </div>

        {item.source.notes && (
          <div className="pt-1">
            <p className="text-text-muted italic">💡 {item.source.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
