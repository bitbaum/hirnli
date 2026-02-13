'use client';

import { useState } from 'react';
import type { BudgetCategory } from '@/lib/schemas/budget';
import { BUDGET_CATEGORY_LABELS } from '@/lib/schemas/budget';
import { getLineItemsForScenario } from '@/lib/config/budget-scenarios';
import { groupLineItemsByCategory } from '@/lib/domain/budget-calculations';
import { formatCHF } from '@/lib/utils/format';
import LineItemDetail from './LineItemDetail';

/**
 * BudgetTable Component
 *
 * Displays all line items for a scenario, grouped by category.
 * Features:
 * - Click to expand/collapse line item details
 * - Progressive disclosure (Summary → Detail → Methodology)
 * - Visual hierarchy (category → items → sub-items)
 */

interface BudgetTableProps {
  scenarioId: string;
  className?: string;
}

export default function BudgetTable({ scenarioId, className = '' }: BudgetTableProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const items = getLineItemsForScenario(scenarioId);
  const grouped = groupLineItemsByCategory(items);

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  // Sort categories in display order
  const categoryOrder: BudgetCategory[] = [
    'space',
    'equipment',
    'infrastructure',
    'personnel',
    'programs',
    'operations',
  ];

  const sortedCategories = categoryOrder.filter((cat) => grouped.has(cat));

  return (
    <div className={`space-y-6 ${className}`}>
      {sortedCategories.map((category) => {
        const categoryItems = grouped.get(category)!;
        const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0);

        return (
          <div key={category} className="bg-white rounded-lg border border-gray-200 p-5">
            {/* Category header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {BUDGET_CATEGORY_LABELS[category]}
              </h3>
              <span className="text-sm font-medium text-gray-600">
                Total: {formatCHF(categoryTotal)}
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id}>
                  {/* Line item row (clickable) */}
                  <div
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-xl">{item.icon}</span>}
                      <div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                        {item.isOptional && (
                          <span className="ml-2 text-xs text-gray-500 italic">(optional)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{formatCHF(item.amount)}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.type === 'einmalig'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedItem === item.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedItem === item.id && <LineItemDetail item={item} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
