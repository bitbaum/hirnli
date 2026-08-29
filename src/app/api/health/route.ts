/**
 * Health API
 *
 * GET /api/health          -> liveness: is the process up? (fast, no LLM check)
 * GET /api/health?strict=1 -> readiness: is the AI layer actually answering?
 *
 * Split the same way botsmann's health route learned to the hard way: a dead
 * Groq key is not fixed by a restart, so it must never fail the check a
 * deploy gate or process supervisor uses to decide whether to kill the app —
 * only the check something monitoring the AI feature specifically opts into.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getLLMHealth } from '@/lib/llm-health';

export async function GET(request: NextRequest) {
  const strict = request.nextUrl.searchParams.get('strict') === '1';
  const llm = getLLMHealth();

  if (strict && llm.status === 'down') {
    return NextResponse.json({ success: false, error: 'AI-Dienst nicht erreichbar', data: { llm } }, { status: 503 });
  }

  return NextResponse.json({ success: true, data: { status: 'healthy', llm } });
}
