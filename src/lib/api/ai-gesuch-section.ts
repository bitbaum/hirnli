import type { FoundationAIContext } from '@/lib/domain/ai-context';
import { apiFetch, type BaseApiResponse } from './client-fetch';

export type GesuchSectionApiResponse = BaseApiResponse<{ rewritten: string }>;

export interface RewriteSectionParams {
  instruction: string;
  currentText: string;
  fieldPath?: string;
  fieldDescription?: string;
  foundationContext?: FoundationAIContext;
}

export function rewriteGesuchSection(params: RewriteSectionParams): Promise<GesuchSectionApiResponse> {
  return apiFetch<{ rewritten: string }>('/api/ai/gesuch-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}
