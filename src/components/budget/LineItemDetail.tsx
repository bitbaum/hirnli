import type { BudgetLineItem } from '@/lib/schemas/budget';
import { formatCHF } from '@/lib/utils/format';

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
  const confidenceColors: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    estimated: 'bg-orange-100 text-orange-800',
    target: 'bg-blue-100 text-blue-800',
    unknown: 'bg-red-100 text-red-800',
  };

  return (
    <div className="ml-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 space-y-3">
      {/* Description */}
      <p className="text-sm text-gray-700">{item.description}</p>

      {/* Sub-items breakdown */}
      {item.subItems && item.subItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Zusammensetzung:</p>
          <div className="space-y-1">
            {item.subItems.map((sub, idx) => (
              <div key={idx} className="flex justify-between text-xs text-gray-600">
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
                  <p key={idx} className="text-xs text-gray-500 italic">
                    → {sub.label}: {sub.note}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Source metadata */}
      <div className="text-xs space-y-1.5 pt-2 border-t border-blue-200">
        <div>
          <strong className="text-gray-700">Quelle:</strong>{' '}
          <span className="text-gray-600">{item.source.methodology}</span>
        </div>

        {item.source.calculation && (
          <div>
            <strong className="text-gray-700">Kalkulation:</strong>{' '}
            <span className="text-gray-600">{item.source.calculation}</span>
          </div>
        )}

        {item.source.marketResearch && (
          <div>
            <strong className="text-gray-700">Marktforschung:</strong>{' '}
            <span className="text-gray-600">{item.source.marketResearch}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <strong className="text-gray-700">Konfidenz:</strong>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${confidenceColors[item.source.confidence]}`}
          >
            {item.source.confidence}
          </span>
        </div>

        <div>
          <strong className="text-gray-700">Verifiziert:</strong>{' '}
          <span className="text-gray-600">
            {new Date(item.source.lastVerified).toLocaleDateString('de-CH')}
          </span>
        </div>

        {item.source.notes && (
          <div className="pt-1">
            <p className="text-gray-500 italic">💡 {item.source.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
