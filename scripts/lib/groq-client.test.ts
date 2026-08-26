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
import { describe, expect, it } from 'vitest';
import { GROQ_MODELS, resolveModel } from './groq-client';

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
