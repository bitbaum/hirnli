/**
 * Groq Client — Thin wrapper for LLM calls in scripts
 *
 * Extracts the Groq call pattern from /api/ai/gesuch-section into a reusable
 * module. Used by auto-research.ts and batch-customize.ts.
 *
 * Configuration:
 *   GROQ_API_KEY in .env.local (loaded by caller via dotenv)
 *   Model: see GROQ_MODELS below — never spell an id out at a call site
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Groq retired the entire llama-3.x family, so the previous default
// `llama-3.3-70b-versatile` returned 404 on every call with a valid key.
// Verified present in the live catalogue on 2026-08-27, and now checked daily
// by dotfiles/scripts/ci/model-pin-audit.mjs.
const GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;

/**
 * Model ALIASES — a size role, resolved to a live id by `resolveModel` below.
 *
 * Both previous ids were retired together when Groq withdrew the llama-3.x
 * family, so every alias here pointed at a 404.
 *
 * The old keys `70b` and `8b` are kept because they are a CLI contract:
 * `pipeline-graduate.ts --model=8b` is typed by a human, and silently changing
 * what that accepts is a worse failure than an inaccurate key name. They now
 * describe a ROLE (bigger / faster) rather than a parameter count.
 */
export const GROQ_MODELS = {
  large: 'openai/gpt-oss-120b',
  small: 'openai/gpt-oss-20b',
  /** @deprecated size-named aliases, kept so existing --model= flags keep working */
  '70b': 'openai/gpt-oss-120b',
  '8b': 'openai/gpt-oss-20b',
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

/**
 * Call Groq API with system + user message.
 * Returns the assistant's response content.
 */
export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: GroqOptions = {},
): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'GROQ_API_KEY not set in environment' };
  }

  const {
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    json = false,
    model = GROQ_MODEL,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body: Record<string, unknown> = {
      // Resolved, not passed through: a caller naming a size alias must not
      // have that alias sent to the vendor as if it were a model id.
      model: resolveModel(model),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    };

    if (json) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { ok: false, error: `Groq API HTTP ${response.status}: ${errText.substring(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { ok: false, error: 'Empty response from Groq' };
    }

    return {
      ok: true,
      content,
      usage: data.usage,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      return { ok: false, error: `Groq timeout after ${timeoutMs}ms` };
    }
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
