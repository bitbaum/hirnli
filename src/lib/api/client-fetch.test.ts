import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch } from './client-fetch';
import { NET_ERR_LOAD } from '@/lib/utils/errors';

describe('apiFetch', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetchOk(body: unknown, status = 200) {
    globalThis.fetch = vi.fn(async () => ({
      status,
      json: async () => body,
    })) as unknown as typeof fetch;
  }

  function mockFetchThrow(error: unknown = new Error('network')) {
    globalThis.fetch = vi.fn(async () => {
      throw error;
    }) as unknown as typeof fetch;
  }

  describe('without trackStatus (default)', () => {
    it('returns the parsed JSON body on success', async () => {
      mockFetchOk({ success: true, data: { foo: 'bar' } });
      const result = await apiFetch<{ foo: string }>('/api/test');
      expect(result).toEqual({ success: true, data: { foo: 'bar' } });
    });

    it('passes init options to fetch', async () => {
      const fetchSpy = vi.fn(async () => ({ status: 200, json: async () => ({ success: true }) }));
      globalThis.fetch = fetchSpy as unknown as typeof fetch;
      await apiFetch('/api/test', { method: 'POST', body: 'hello' });
      expect(fetchSpy).toHaveBeenCalledWith('/api/test', { method: 'POST', body: 'hello' });
    });

    it('returns NET_ERR_LOAD on network failure', async () => {
      mockFetchThrow();
      const result = await apiFetch('/api/test');
      expect(result).toEqual({ success: false, error: NET_ERR_LOAD });
    });

    it('returns NET_ERR_LOAD on JSON parse failure', async () => {
      globalThis.fetch = vi.fn(async () => ({
        status: 200,
        json: async () => {
          throw new Error('invalid json');
        },
      })) as unknown as typeof fetch;
      const result = await apiFetch('/api/test');
      expect(result).toEqual({ success: false, error: NET_ERR_LOAD });
    });

    it('does NOT include httpStatus when not requested', async () => {
      mockFetchOk({ success: true });
      const result = await apiFetch('/api/test');
      expect(result).not.toHaveProperty('httpStatus');
    });

    it('does NOT include httpStatus on network failure when not requested', async () => {
      mockFetchThrow();
      const result = await apiFetch('/api/test');
      expect(result).not.toHaveProperty('httpStatus');
    });
  });

  describe('with trackStatus: true', () => {
    it('adds httpStatus to a successful response', async () => {
      mockFetchOk({ success: true, data: 'x' }, 201);
      const result = await apiFetch('/api/test', undefined, { trackStatus: true });
      expect(result.httpStatus).toBe(201);
      expect(result.success).toBe(true);
    });

    it('passes through extra server-side fields like existingId', async () => {
      mockFetchOk({ success: false, error: 'duplicate', existingId: 'app-42' }, 409);
      const result = await apiFetch('/api/test', undefined, { trackStatus: true });
      expect(result).toMatchObject({
        success: false,
        error: 'duplicate',
        existingId: 'app-42',
        httpStatus: 409,
      });
    });

    it('returns httpStatus=0 on network failure (so callers can distinguish from a real status)', async () => {
      mockFetchThrow();
      const result = await apiFetch('/api/test', undefined, { trackStatus: true });
      expect(result).toEqual({ success: false, error: NET_ERR_LOAD, httpStatus: 0 });
    });
  });

  it('forwards a server-side 500 response as success:false (the API contract)', async () => {
    // Server returns { success: false } at status 500 — the helper should pass
    // through the body verbatim; the caller branches on `result.success`.
    mockFetchOk({ success: false, error: 'Datenbankfehler' }, 500);
    const result = await apiFetch('/api/test', undefined, { trackStatus: true });
    expect(result).toEqual({ success: false, error: 'Datenbankfehler', httpStatus: 500 });
  });
});
