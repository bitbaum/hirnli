/**
 * The only AI route here sits behind the shared internal Basic Auth, and the
 * rest of the AI surface is scripts with no HTTP entry point at all. So
 * "does the chain work?" could only be answered by knowing the internal
 * password, or by running a research script by hand.
 *
 * ai-kit owns the gating, the caching and the never-cache-a-failure rule and
 * tests them there. What is app-specific, and what these hold, is the WIRING:
 * an ordinary poll is free, the gate is really connected to AI_PROBE_SECRET,
 * and the probe walks THIS app's chain via callGroq.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Each test loads the module FRESH: the handler is a module-level singleton
 * (the probe's cache lives in it) and a success is cached ten minutes, so a
 * shared instance would let the first success answer every later case — the
 * failure tests would read 200 and pass for the wrong reason.
 */
async function loadHandler() {
  vi.resetModules();
  return (await import('./ai-liveness')).aiLivenessHandler;
}

const ORIGINAL_ENV = { ...process.env };

/** Built PER CALL: one Response body can be read only once. */
function completion(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.GROQ_API_KEY = 'gsk_test';
  delete process.env.AI_PROBE_SECRET;
  delete process.env.OPENROUTER_API_KEY;
  fetchMock = vi.fn(async () => completion('blue'));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...ORIGINAL_ENV };
});

describe('GET /api/health/ai', () => {
  it('an ordinary poll costs nothing', async () => {
    const handler = await loadHandler();
    const res = await handler(new Request('https://h.test/api/health/ai'));

    expect(res.status).toBe(200);
    expect((await res.json()).probed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses to probe without the secret, and spends nothing while refusing', async () => {
    process.env.AI_PROBE_SECRET = 'right';
    const handler = await loadHandler();

    expect((await handler(new Request('https://h.test/api/health/ai?probe=1'))).status).toBe(401);
    expect(
      (await handler(new Request('https://h.test/api/health/ai?probe=1&secret=nope'))).status,
    ).toBe(401);

    // The point of the gate is the SPEND, not the status code. This route sits
    // OUTSIDE the Basic Auth wall, so its own gate is the only one there is.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('with AI_PROBE_SECRET unset, probing is OFF (501) rather than open', async () => {
    const handler = await loadHandler();
    const res = await handler(new Request('https://h.test/api/health/ai?probe=1&secret=anything'));

    expect(res.status).toBe(501);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("probes THIS app's chain and returns what it said", async () => {
    process.env.AI_PROBE_SECRET = 'right';
    const handler = await loadHandler();

    const res = await handler(new Request('https://h.test/api/health/ai?probe=1&secret=right'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.answer).toBe('blue');
    // The real chain: Groq is its first link.
    expect(String(fetchMock.mock.calls[0][0])).toContain('groq');
  });

  it('a dead chain is 503, so an uptime monitor can watch this URL', async () => {
    process.env.AI_PROBE_SECRET = 'right';
    fetchMock.mockImplementation(async () => new Response('boom', { status: 500 }));
    const handler = await loadHandler();

    const res = await handler(new Request('https://h.test/api/health/ai?probe=1&secret=right'));

    expect(res.status).toBe(503);
  });

  it('an EMPTY 200 is a failure, not a healthy-looking silence', async () => {
    process.env.AI_PROBE_SECRET = 'right';
    fetchMock.mockImplementation(async () => completion(''));
    const handler = await loadHandler();

    const res = await handler(new Request('https://h.test/api/health/ai?probe=1&secret=right'));

    expect(res.status).toBe(503);
  });

  it('no key configured is 503 and makes no request', async () => {
    process.env.AI_PROBE_SECRET = 'right';
    delete process.env.GROQ_API_KEY;
    const handler = await loadHandler();

    const res = await handler(new Request('https://h.test/api/health/ai?probe=1&secret=right'));

    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('one probe teaches /api/health — it stops saying "unknown"', async () => {
    process.env.AI_PROBE_SECRET = 'right';
    vi.resetModules();
    // Same module graph as the handler, or this reads a different tracker
    // instance and always sees "unknown".
    const { aiLivenessHandler } = await import('./ai-liveness');
    const { getLLMHealth } = await import('./llm-health');

    expect(getLLMHealth().status).toBe('unknown');
    await aiLivenessHandler(new Request('https://h.test/api/health/ai?probe=1&secret=right'));
    expect(getLLMHealth().status).toBe('ok');
  });
});
