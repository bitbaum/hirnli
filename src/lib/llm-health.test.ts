/**
 * hirnli had no way to know its AI routes were down until someone tried one
 * by hand. This pins the state machine `/api/health?strict=1` depends on.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { getLLMHealth, recordLLMFailure, recordLLMSuccess, resetLLMHealth } from './llm-health';

describe('llm health tracker', () => {
  beforeEach(() => resetLLMHealth());

  it('starts unknown, before anything has been observed', () => {
    expect(getLLMHealth().status).toBe('unknown');
  });

  it('is ok after a success', () => {
    recordLLMSuccess();
    expect(getLLMHealth().status).toBe('ok');
  });

  it('is degraded on the first failures, not down', () => {
    recordLLMFailure(new Error('401 invalid_api_key'));
    expect(getLLMHealth().status).toBe('degraded');
  });

  it('is down once failures are consistent', () => {
    for (let i = 0; i < 3; i += 1) recordLLMFailure(new Error('401 invalid_api_key'));
    const health = getLLMHealth();
    expect(health.status).toBe('down');
    expect(health.consecutiveFailures).toBe(3);
    expect(health.lastError).toContain('401');
  });

  it('recovers to ok on the next success', () => {
    for (let i = 0; i < 5; i += 1) recordLLMFailure(new Error('boom'));
    expect(getLLMHealth().status).toBe('down');
    recordLLMSuccess();
    const health = getLLMHealth();
    expect(health.status).toBe('ok');
    expect(health.consecutiveFailures).toBe(0);
    expect(health.lastError).toBeNull();
  });
});
