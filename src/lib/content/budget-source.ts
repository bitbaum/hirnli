/**
 * Where a tenant's budget comes from.
 *
 * The same seam as `stories-source.ts`, for the same reason and with the same
 * rule: a tenant without a budget of its own gets NOTHING, never another
 * organisation's numbers. A story composed from the wrong source embarrasses;
 * a budget composed from the wrong source states a false figure to a funder in
 * a document the applicant signs.
 *
 * The code block stays readable by the organisation it was written for, gated
 * exactly as its pages are, until its row is the only copy.
 */

import type { Tenant } from '@/lib/tenant/profile';
import { budgetBlockSchema, type BudgetBlock } from '@/lib/schemas/budget';
import { getOrgContent } from './org-content';
import { ownsCodeContent } from './page-content';

export { budgetBlockSchema, type BudgetBlock };

/** This tenant's raw budget block, or null if it has not written one. */
export async function getBudgetBlock(tenant: Tenant): Promise<BudgetBlock | null> {
  const stored = await getOrgContent('budget', budgetBlockSchema, { orgId: tenant.orgId });
  if (stored) return stored;

  // Transitional: the organisation the code block was written for may still
  // read it. Everyone else gets null.
  if (await ownsCodeContent('fundraising', tenant.orgId)) {
    const [{ BUDGET_LINE_ITEMS, BUDGET_SCENARIOS, EIGENLEISTUNG_CONFIG }, { CODE_BUDGET_MODEL }] =
      await Promise.all([
        import('@/lib/config/budget-scenarios'),
        import('@/lib/config/budget-model'),
      ]);
    return budgetBlockSchema.parse({
      LINE_ITEMS: BUDGET_LINE_ITEMS,
      SCENARIOS: BUDGET_SCENARIOS,
      EIGENLEISTUNG: EIGENLEISTUNG_CONFIG,
      DEGRESSIVE: CODE_BUDGET_MODEL.DEGRESSIVE,
      PROJECT: CODE_BUDGET_MODEL.PROJECT,
    });
  }
  return null;
}

/** Has this tenant stated what its project costs? */
export async function hasBudget(tenant: Tenant): Promise<boolean> {
  return (await getBudgetBlock(tenant)) !== null;
}
