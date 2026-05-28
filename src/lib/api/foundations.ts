/**
 * Foundation API client — thin wrapper over /api/foundations/[id]
 */

import { apiFetch, type BaseApiResponse } from './client-fetch';

export async function patchFoundationResearch(
  id: string,
  fields: {
    purposeSummary?: string;
    researchNotes?: string;
    contact?: { email: string; phone: string; address: string };
    websiteUrl?: string;
    amount?: { min: number | null; max: number | null; text: string };
    annualBudget?: string;
    grantExpenditure?: string;
    pastGrantees?: string[];
  },
): Promise<BaseApiResponse> {
  return apiFetch(`/api/foundations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ configData: fields }),
  });
}
