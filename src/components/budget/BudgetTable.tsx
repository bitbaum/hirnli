'use client';

import { useState } from 'react';
import type { BudgetCategory } from '@/lib/schemas/budget';
import { BUDGET_CATEGORY_LABELS } from '@/lib/schemas/budget';
import { getLineItemsForScenario } from '@/lib/domain/budget-calculations';
import { groupLineItemsByCategory } from '@/lib/domain/budget-calculations';
import { formatCHF } from '@/lib/utils/format';
import LineItemDetail from './LineItemDetail';
import Card from '@/components/ui/Card';

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
          <Card key={category} padding={false} className="p-5">
            {/* Category header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-default">
              <h3 className="heading-card">
                {BUDGET_CATEGORY_LABELS[category]}
              </h3>
              <span className="text-sm font-medium text-text-secondary">
                Total: {formatCHF(categoryTotal)}
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id}>
                  {/* Line item row (clickable) */}
                  <div
                    className="flex justify-between items-center p-3 hover:bg-surface-raised rounded-md cursor-pointer transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-xl">{item.icon}</span>}
                      <div>
                        <span className="font-medium text-text-primary">{item.label}</span>
                        {item.isOptional && (
                          <span className="ml-2 text-xs text-text-muted italic">(optional)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-text-primary">{formatCHF(item.amount)}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.type === 'einmalig'
                            ? 'bg-chart-5/10 text-chart-5'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {item.type}
                      </span>
                      <svg
                        className={`w-5 h-5 text-text-muted transition-transform ${
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
          </Card>
        );
      })}
    </div>
  );
}
