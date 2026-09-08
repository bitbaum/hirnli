/**
 * Observed health of the LLM (Groq) chain used by /api/ai/*.
 *
 * hirnli's AI routes have already been silently dead once: Groq withdrew the
 * whole llama-3.x family and every route calling it returned "AI unavailable"
 * with a perfectly valid key, discovered by hand rather than by any check —
 * this repo had no `/api/health` at all until this file. A friendly 5xx is
 * still a check nothing was watching.
 *
 * Thin wrapper around `ai-kit`'s `createHealthTracker`: one shared in-process
 * instance, since hirnli runs as a single service and module state is shared
 * by every request. If it is ever scaled horizontally this becomes
 * per-instance and wants a shared store.
 */

import { createHealthTracker } from '@bitbaum/ai-kit';

/**
 * Exported so the liveness probe can write into the SAME tracker the real AI
 * route writes into. Otherwise one probe proves the chain works and
 * /api/health carries on saying it has never seen a call — the probe's
 * knowledge would die with the request that made it.
 *
 * Prefer the record* helpers below in ordinary code; this exists for handing
 * the tracker to something that records on your behalf.
 */
export const llmHealthTracker = createHealthTracker({ downAfter: 3 });

const tracker = llmHealthTracker;

/** Call after a generation that produced usable content. */
export function recordLLMSuccess(): void {
  tracker.recordSuccess();
}

/** Call when generation threw, or returned nothing usable. */
export function recordLLMFailure(error: unknown): void {
  tracker.recordFailure(error);
}

export function getLLMHealth() {
  const health = tracker.getHealth();
  return {
    status: health.status,
    consecutiveFailures: health.consecutiveFailures,
    lastError: health.lastError,
    lastSuccessAt: health.lastSuccessAt ? new Date(health.lastSuccessAt).toISOString() : null,
    lastFailureAt: health.lastFailureAt ? new Date(health.lastFailureAt).toISOString() : null,
  };
}

/** Test seam. */
export function resetLLMHealth(): void {
  tracker.reset();
}
