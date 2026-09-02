/**
 * Health API
 *
 * GET /api/health -> liveness: is the process up? AI/LLM status is reported
 * in the body as an informational field only — a dead Groq key isn't fixed
 * by a restart, so it must never fail the HTTP status a deploy gate or
 * process supervisor uses to decide whether to kill the app.
 */

import { NextResponse } from 'next/server';
import { getLLMHealth } from '@/lib/llm-health';

export async function GET() {
  const llm = getLLMHealth();
  return NextResponse.json({ success: true, data: { status: 'healthy', llm } });
}
