/**
 * Foundation API client — thin wrapper over /api/foundations/[id]
 */

interface FoundationApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

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
): Promise<FoundationApiResponse> {
  try {
    const res = await fetch(`/api/foundations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configData: fields }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error ?? 'Fehler beim Speichern' };
    return { success: true, data: data.data };
  } catch {
    return { success: false, error: 'Netzwerkfehler — bitte erneut versuchen' };
  }
}
