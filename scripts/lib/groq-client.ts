/**
 * Groq Client — Thin wrapper for LLM calls in scripts
 *
 * Extracts the Groq call pattern from /api/ai/gesuch-section into a reusable
 * module. Used by auto-research.ts and batch-customize.ts.
 *
 * Configuration:
 *   GROQ_API_KEY in .env.local (loaded by caller via dotenv)
 *   Model: llama-3.3-70b-versatile (fast, cheap, good for batch work)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;

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
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body: Record<string, unknown> = {
      model: GROQ_MODEL,
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
