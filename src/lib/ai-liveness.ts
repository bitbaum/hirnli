/**
 * Can the AI chain answer RIGHT NOW?
 *
 * `/api/health` already reports `llm`, and that field says what happened the
 * LAST time something called a provider. Straight after a deploy it is
 * "unknown", and unknown is what it stays until real traffic arrives — so the
 * question a deploy needs answered is the one it cannot answer.
 *
 * The only AI route here (`/api/ai/gesuch-section`) sits behind the shared
 * internal Basic Auth, and the rest of the AI surface is scripts with no HTTP
 * entry point at all. Checking the chain therefore meant either knowing the
 * internal password or running a research script by hand.
 *
 * ── It probes THIS app's chain ───────────────────────────────────────────────
 * `ask` calls `callGroq` — the same function the gesuch-section route and every
 * research script use, including its cross-vendor walk. A probe assembled from
 * its own provider list would test a path nothing else takes.
 *
 * ── Why it is not behind the Basic Auth wall ─────────────────────────────────
 * `/api/health/ai` deliberately sits outside PROTECTED_PREFIXES, alongside
 * `/api/health`. Its callers are uptime monitors and deploy scripts, which have
 * no password to present — and it carries its own gate: AI_PROBE_SECRET, a
 * constant-time compare inside ai-kit. Without it the probe is 401; with no
 * secret configured at all it is 501, so a deployment that forgets to set one
 * cannot be made to spend money by a stranger.
 */

import { createAiHealthHandler } from '@bitbaum/ai-kit';

import { callGroq } from '../../scripts/lib/groq-client';
import { llmHealthTracker } from './llm-health';

/**
 * Built lazily. Next evaluates module-level code during the BUILD, where the
 * runtime's keys are absent — an eagerly-built handler would capture that empty
 * environment and report a dead chain forever on a deployment that is fine.
 */
let handler: ((request: Request) => Promise<Response>) | null = null;

export function aiLivenessHandler(request: Request): Promise<Response> {
  handler ??= createAiHealthHandler({
    // A getter, not a value: the handler is built once and reused, so a plain
    // string would be whatever the environment held on the first request —
    // un-rotatable without a restart, and untestable.
    secret: () => process.env.AI_PROBE_SECRET,
    // The tracker the real AI route writes to, so one probe also answers the
    // next ordinary /api/health poll instead of dying with this request.
    health: llmHealthTracker,
    ask: async () => {
      const result = await callGroq(
        'Answer with a single word, no punctuation.',
        'What colour is a clear midday sky? Answer in one word.',
        // Generous on purpose: the chain leads with reasoning models, which
        // spend this budget thinking before emitting a visible token, and an
        // empty completion is a failure. A mean budget would make a healthy
        // deployment report itself dead.
        { maxTokens: 256, temperature: 0, timeoutMs: 20_000 },
      );

      // callGroq returns { ok: false, error } rather than throwing, so its
      // callers can degrade. Surfacing the reason is the whole job here.
      if (!result.ok) throw new Error(result.error ?? 'AI chain failed');
      return { text: result.content ?? '', id: 'hirnli-chain' };
    },
  });
  return handler(request);
}
