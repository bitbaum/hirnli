import type { FoundationAIContext } from '@/lib/domain/ai-context';

export interface GesuchSectionApiResponse {
  success: boolean;
  data?: { rewritten: string };
  error?: string;
}

export interface RewriteSectionParams {
  instruction: string;
  currentText: string;
  fieldPath?: string;
  fieldDescription?: string;
  foundationContext?: FoundationAIContext;
}

export function rewriteGesuchSection(params: RewriteSectionParams): Promise<GesuchSectionApiResponse> {
  return fetch('/api/ai/gesuch-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
    .then((r) => r.json() as Promise<GesuchSectionApiResponse>)
    .catch((): GesuchSectionApiResponse => ({ success: false, error: 'Netzwerkfehler' }));
}
