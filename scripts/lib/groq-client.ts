/**
 * AI Client — Thin wrapper for LLM calls in scripts
 *
 * Extracts the Groq call pattern from /api/ai/gesuch-section into a reusable
 * module. Used by auto-research.ts and batch-customize.ts.
 *
 * Configuration:
 *   GROQ_API_KEY / OPENROUTER_API_KEY in .env.local (loaded by caller via dotenv)
 *   Model: see GROQ_MODELS below — never spell an id out at a call site
 */

import { freeChain, providerModels, tryChain, usableChain, type Link } from '@bitbaum/ai-kit';

// Groq retired the entire llama-3.x family, so the previous single pinned
// default `llama-3.3-70b-versatile` returned 404 on every call with a valid
// key, and there was nothing between that and total failure — this module
// called ONE model, once.
//
// The fix that followed was still only a fallback across MODELS, and every
// one of them at Groq — all of Groq's models share the same org-wide daily
// budget, so a Groq-wide outage or budget exhaustion still took this app's AI
// fully dead, with nothing configured for `OPENROUTER_API_KEY` to even fall
// into. `CHAIN` (from `ai-kit`'s `freeChain`, checked daily by
// fleet/scripts/ci/model-pin-audit.mjs) is the fleet's real cross-VENDOR
// chain — Groq, then OpenRouter — and `callGroq` walks it with `tryChain`
// when the caller leaves the model unspecified, via `usableChain` so a
// deployment carrying only one vendor's key still gets exactly that vendor's
// models rather than a second link guaranteed to fail with no key.
const CHAIN = freeChain('HIRNLI');
// The size-role aliases below (`GROQ_MODELS`) have always meant "call Groq
// with this specific model" — `pipeline-graduate.ts --model=8b` is a typed
// CLI contract, not a request to start the chain at a different vendor — so
// they keep resolving against Groq specifically, not the cross-vendor chain.
const GROQ_PROVIDER = CHAIN[0];
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;

// The ids themselves now come from `ai-kit`'s chain, not a literal here —
// this file used to be the second of the two places this repo hardcoded
// them (the other was the gesuch-section route), so a retirement had to be
// fixed twice. `SECONDARY_MODEL` falls back to the primary rather than going
// `undefined` if the fleet's chain for HIRNLI is ever pared to one model.
const [PRIMARY_MODEL, SECONDARY_MODEL = PRIMARY_MODEL] = providerModels(GROQ_PROVIDER);

/**
 * Model ALIASES — a size role, resolved to a live id by `resolveModel` below.
 *
 * The old keys `70b` and `8b` are kept because they are a CLI contract:
 * `pipeline-graduate.ts --model=8b` is typed by a human, and silently changing
 * what that accepts is a worse failure than an inaccurate key name. They now
 * describe a ROLE (bigger / faster) rather than a parameter count.
 */
export const GROQ_MODELS = {
  large: PRIMARY_MODEL,
  small: SECONDARY_MODEL,
  /** @deprecated size-named aliases, kept so existing --model= flags keep working */
  '70b': PRIMARY_MODEL,
  '8b': SECONDARY_MODEL,
} as const;

/**
 * Turn whatever a caller passed into an id the vendor will accept.
 *
 * This exists because an alias was being sent to Groq verbatim.
 * `website-verifier.ts` calls `callGroqJSON(..., { model: '8b' })`, and `model`
 * went straight into the request body — so every verification request asked
 * Groq for a model literally named "8b" and was refused. The alias table above
 * had existed the whole time; nothing consulted it.
 *
 * An unrecognised value is passed through untouched, so naming a real id
 * directly still works.
 */
export function resolveModel(model: string): string {
  return (GROQ_MODELS as Record<string, string>)[model] ?? model;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  /** If true, attempt to parse response as JSON */
  json?: boolean;
  /** Override model: an id, or an alias from GROQ_MODELS ('large' / 'small') */
  model?: string;
}

export interface GroqResult {
  ok: boolean;
  content?: string;
  error?: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface CallOnceOptions {
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  json: boolean;
}

/**
 * One call, one link (vendor + model). `callGroq`'s fallback walk and its
 * single-explicit-model path both go through here, so there is exactly one
 * fetch implementation, not two — one per vendor. Throws on any failure —
 * the caller decides whether that means "try the next link" or "report it".
 */
async function callGroqOnce(
  link: Link,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options: CallOnceOptions,
): Promise<{ content: string; usage?: GroqResult['usage'] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const body: Record<string, unknown> = {
      model: link.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: false,
    };

    if (options.json) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${link.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `${link.provider.id} API HTTP ${response.status}: ${errText.substring(0, 200)}`,
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error(`Empty response from ${link.provider.id}`);
    }

    return { content, usage: data.usage };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`${link.provider.id} timeout after ${options.timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call the fleet's AI chain with system + user message.
 * Returns the assistant's response content.
 *
 * When the caller leaves `model` unspecified, walks the fleet's cross-vendor
 * chain (Groq, then OpenRouter) via `ai-kit`'s `usableChain` + `tryChain`
 * instead of calling one pinned model at one vendor — a Groq-wide outage or
 * daily-budget exhaustion used to mean this whole module was down, with
 * nowhere else to go. An explicit `model`/alias is honoured as-is, alone, and
 * against Groq specifically (see `GROQ_MODELS`): silently answering from a
 * different model — or a different vendor — than asked for is worse than
 * failing.
 */
export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: GroqOptions = {},
): Promise<GroqResult> {
  const {
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    json = false,
    model,
  } = options;
  const callOnceOptions: CallOnceOptions = { maxTokens, temperature, timeoutMs, json };

  if (model) {
    // Explicit model: a Groq-specific pin, called once and alone — see the
    // doc comment above.
    const apiKey = process.env[GROQ_PROVIDER.keyEnv];
    if (!apiKey) {
      return { ok: false, error: `${GROQ_PROVIDER.keyEnv} not set in environment` };
    }
    const link: Link = { provider: GROQ_PROVIDER, model: resolveModel(model) };
    try {
      const { content, usage } = await callGroqOnce(
        link,
        apiKey,
        systemPrompt,
        userPrompt,
        callOnceOptions,
      );
      return { ok: true, content, usage };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // No explicit model: walk every vendor whose key is actually configured.
  // A missing key is a normal deployment state (most boxes carry one
  // vendor's key, not every vendor's), so `usableChain` drops that vendor
  // silently rather than the walk failing on it.
  const chain = usableChain(CHAIN, process.env);
  if (chain.length === 0) {
    const keyEnvs = CHAIN.map((p) => p.keyEnv).join(' or ');
    return { ok: false, error: `No AI provider configured (set ${keyEnvs})` };
  }

  try {
    const { content, usage } = await tryChain(chain, {
      // `usableChain` only returns links whose vendor has a key, so this is
      // always defined — the `!` documents that guarantee rather than
      // re-deriving it.
      attempt: (link) =>
        callGroqOnce(
          link,
          process.env[link.provider.keyEnv]!,
          systemPrompt,
          userPrompt,
          callOnceOptions,
        ),
    });
    return { ok: true, content, usage };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Call Groq and parse JSON response.
 * Returns parsed object or error.
 */
export async function callGroqJSON<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  options: Omit<GroqOptions, 'json'> = {},
): Promise<{ ok: true; data: T; usage?: GroqResult['usage'] } | { ok: false; error: string }> {
  const result = await callGroq(systemPrompt, userPrompt, { ...options, json: true });

  if (!result.ok) {
    return { ok: false, error: result.error! };
  }

  try {
    const data = JSON.parse(result.content!) as T;
    return { ok: true, data, usage: result.usage };
  } catch {
    return { ok: false, error: `Failed to parse JSON: ${result.content?.substring(0, 200)}` };
  }
}
