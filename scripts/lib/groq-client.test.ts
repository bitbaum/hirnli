/**
 * The alias table has to be consulted, not merely present.
 *
 * Two separate faults met in this file, and the second was hidden by the first.
 *
 * 1. Every id here was retired. Groq withdrew the llama-3.x family, so the
 *    default `llama-3.3-70b-versatile` and both entries of `GROQ_MODELS`
 *    returned 404 with a perfectly valid key.
 *
 * 2. The alias table was never used. `website-verifier.ts` calls
 *    `callGroqJSON(..., { model: '8b' })`, and `model` went straight into the
 *    request body — so those requests asked Groq for a model literally named
 *    "8b". The table mapping `8b` to a real id had been sitting in this file
 *    the whole time, consulted by nobody.
 *
 * Fault 2 was invisible while fault 1 was true: when every id 404s anyway,
 * sending a nonsense one looks exactly the same from the outside. That is the
 * argument for testing the resolution rather than the ids.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { freeChain, providerModels, usableChain } from '@bitbaum/ai-kit';
import { GROQ_MODELS, callGroq, resolveModel } from './groq-client';

const CHAIN_MODEL_COUNT = providerModels(freeChain('HIRNLI')[0]).length;

describe('resolveModel', () => {
  it('turns a size alias into a real id', () => {
    // The precise call website-verifier.ts makes.
    expect(resolveModel('8b')).toBe(GROQ_MODELS.small);
    expect(resolveModel('70b')).toBe(GROQ_MODELS.large);
  });

  it('resolves the role names too', () => {
    expect(resolveModel('small')).toBe(GROQ_MODELS.small);
    expect(resolveModel('large')).toBe(GROQ_MODELS.large);
  });

  it('never returns an alias, only an id', () => {
    // The bug in one assertion: whatever goes in, what comes out must be
    // something a vendor could accept.
    for (const alias of Object.keys(GROQ_MODELS)) {
      const resolved = resolveModel(alias);
      expect(Object.keys(GROQ_MODELS)).not.toContain(resolved);
      expect(resolved).toMatch(/\//);
    }
  });

  it('passes an unrecognised value through, so a real id still works', () => {
    // Naming a model directly must keep working; the table is a convenience,
    // not a whitelist.
    expect(resolveModel('openai/gpt-oss-safeguard-20b')).toBe('openai/gpt-oss-safeguard-20b');
  });
});

describe('the model ids themselves', () => {
  it('contains nothing from the llama-3.x family Groq retired', () => {
    // The family, not the individual ids: what happened was a whole lineage
    // withdrawn at once, and listing one id would pass happily on its sibling.
    const retired = Object.values(GROQ_MODELS).filter((id) => /llama-3\.\d/i.test(id));
    expect(retired).toEqual([]);
  });

  it('keeps the deprecated size keys, because they are a typed CLI contract', () => {
    // `pipeline-graduate.ts --model=8b` is typed by a human. Silently changing
    // what that accepts is a worse failure than a key whose name now describes
    // a role rather than a parameter count.
    expect(GROQ_MODELS).toHaveProperty('8b');
    expect(GROQ_MODELS).toHaveProperty('70b');
  });

  it('maps the small alias to a smaller model than the large one', () => {
    // Guards a copy-paste that would make both aliases identical and quietly
    // remove the caller's ability to pick a faster model.
    expect(GROQ_MODELS.small).not.toBe(GROQ_MODELS.large);
  });
});

/**
 * `callGroq` used to call ONE pinned model, once — the exact shape that let a
 * single Groq retirement take down every route and script in this repo at
 * the same moment. It now walks `ai-kit`'s fallback chain for Groq, so these
 * pin the demote-on-failure behaviour the fix actually depends on.
 */
describe('callGroq — fallback across the chain', () => {
  const originalGroqKey = process.env.GROQ_API_KEY;
  const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
  let fetchMock: ReturnType<typeof vi.fn>;

  /**
   * Real `Response` objects, not `{ ok, json }` literals.
   *
   * The literals encoded an assumption about HOW the client reads a body, and
   * broke the moment it read the text first — which it must, to keep the vendor's
   * body in the error and tell a spent daily budget from a busy minute. A fake
   * that diverges from the contract it imitates keeps a suite green over a client
   * that cannot work.
   *
   * They also need to be built PER CALL: one `Response` body can only be read
   * once, so a single instance handed to every link makes link two fail with
   * "Body has already been read" — a fake failure in front of the real one, in
   * the very tests that check the fallback.
   */
  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key';
    // Explicitly unset so these tests exercise Groq-only behaviour regardless
    // of what the host shell happens to export — a test that only passes
    // because OPENROUTER_API_KEY isn't set locally is not actually pinning
    // anything.
    delete process.env.OPENROUTER_API_KEY;
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env.GROQ_API_KEY = originalGroqKey;
    if (originalOpenRouterKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
    }
    vi.unstubAllGlobals();
  });

  // ── The 429 taxonomy: three failures, one status code, opposite responses ──
  //
  // The previous client raised `<vendor> API HTTP 429: <first 200 chars>`. The
  // body was fetched, truncated into a string, and read by nothing — so a spent
  // daily budget and a one-second burst produced the same message and the same
  // behaviour, and only one of them can be fixed by trying again.

  it('a DAILY 429 condemns the whole vendor — its other models share that meter', async () => {
    process.env.OPENROUTER_API_KEY = 'or-key';
    fetchMock.mockImplementation(async (url: string) =>
      String(url).includes('groq')
        ? new Response(
            JSON.stringify({
              error: {
                message: 'Rate limit reached for model per day. Limit 100000, used 100000.',
              },
            }),
            { status: 429 },
          )
        : jsonResponse({ choices: [{ message: { content: 'openrouter answered' } }] }),
    );

    const result = await callGroq('sys', 'user');

    expect(result).toMatchObject({ ok: true, content: 'openrouter answered' });
    // Groq is asked ONCE. Its second model draws on the same exhausted org-wide
    // budget, so trying it buys a dead round trip and the identical error.
    const groqCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('groq'));
    expect(groqCalls).toHaveLength(1);
  });

  it('a SIZE 429 ends the walk — the next model down has a SMALLER ceiling', async () => {
    process.env.OPENROUTER_API_KEY = 'or-key';
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            error: {
              message:
                'Request too large for model with 12000 tokens per minute. Limit 12000, Requested 15000.',
            },
          }),
          { status: 429 },
        ),
    );

    const result = await callGroq('sys', 'user');

    expect(result.ok).toBe(false);
    // Demoting cannot help: one request already exceeded the whole per-minute
    // allowance, and every link below has a smaller one. The cure is a shorter
    // prompt, and burning the chain to reach a worse version of the same error
    // only delays saying so.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('demotes to the next model in the chain when the first is retired', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{"error":{"code":"model_not_found"}}', { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({ choices: [{ message: { content: 'second model answered' } }] }),
      );

    const result = await callGroq('system', 'user');

    expect(result).toEqual({ ok: true, content: 'second model answered', usage: undefined });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // The first attempt must have asked for the FIRST chain model, and the
    // second for a DIFFERENT one — a retry that resends the same id is not a
    // fallback.
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(firstBody.model).not.toBe(secondBody.model);
  });

  it('reports every model it tried when the whole chain is exhausted', async () => {
    fetchMock.mockResolvedValue(new Response('invalid_api_key', { status: 401 }));

    const result = await callGroq('system', 'user');

    expect(result.ok).toBe(false);
    // Every model in the chain must have been tried — not just the first.
    expect(fetchMock).toHaveBeenCalledTimes(CHAIN_MODEL_COUNT);
    // Every link's failure should be named, not just the last one tried.
    expect(result.error).toMatch(/link\(s\) failed/);
  });

  it('an explicit model is called once and alone, not folded into the chain', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: 'ok' } }] }));

    const result = await callGroq('system', 'user', { model: 'small' });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    // The alias must still be resolved, exactly as before this change.
    expect(body.model).toBe(GROQ_MODELS.small);
  });

  it('an explicit model that fails does NOT fall through to the rest of the chain', async () => {
    fetchMock.mockResolvedValue(new Response('model_not_found', { status: 404 }));

    const result = await callGroq('system', 'user', { model: 'small' });

    expect(result.ok).toBe(false);
    // Naming a model and silently answering from a different one would be
    // worse than failing — so exactly one attempt, not a walk.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports missing key without calling fetch at all', async () => {
    process.env.GROQ_API_KEY = '';
    // OPENROUTER_API_KEY is already unset in beforeEach — neither vendor is
    // configured, so there is no chain to walk at all.

    const result = await callGroq('system', 'user');

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/No AI provider configured/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls through to OpenRouter when every Groq model fails and both keys are configured', async () => {
    // This is the exact bug this fallback exists to close: a Groq-wide
    // outage (every Groq model refusing) used to be total failure even with
    // a second vendor's key sitting configured and unused, because nothing
    // ever crossed vendors.
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

    fetchMock
      .mockResolvedValueOnce(new Response('invalid_api_key', { status: 401 }))
      .mockResolvedValueOnce(new Response('invalid_api_key', { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({ choices: [{ message: { content: 'openrouter answered' } }] }),
      );

    const result = await callGroq('system', 'user');

    expect(result).toEqual({ ok: true, content: 'openrouter answered', usage: undefined });
    // Every Groq model tried first (CHAIN_MODEL_COUNT of them), then the walk
    // crossed to OpenRouter.
    expect(fetchMock).toHaveBeenCalledTimes(CHAIN_MODEL_COUNT + 1);
    const lastCallUrl = fetchMock.mock.calls[CHAIN_MODEL_COUNT][0] as string;
    expect(lastCallUrl).toContain('openrouter.ai');
  });

  it('the usable chain includes both vendors when both keys are present', () => {
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    const chain = usableChain(freeChain('HIRNLI'), process.env);
    const vendors = new Set(chain.map((link) => link.provider.id));
    expect(vendors.has('groq')).toBe(true);
    expect(vendors.has('openrouter')).toBe(true);
  });
});
