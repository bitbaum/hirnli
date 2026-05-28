import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiError, apiClientError } from './route-helpers';

describe('apiError', () => {
  // Silence the console.error call by mocking it before each test; restore so
  // failures in other tests still show.
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it('returns a 500 response with the given message by default', async () => {
    const res = apiError('GET /api/foo', new Error('boom'), 'Datenbankfehler');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Datenbankfehler' });
  });

  it('logs the tag + error using console.error', () => {
    const err = new Error('boom');
    apiError('GET /api/foo', err, 'msg');
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith('GET /api/foo error:', err);
  });

  it('honours a custom status code', async () => {
    const res = apiError('GET /api/foo', new Error('boom'), 'Fehler', 502);
    expect(res.status).toBe(502);
  });

  it('handles non-Error throwables (string, number, undefined)', async () => {
    const res1 = apiError('GET /api/foo', 'string-error', 'msg');
    const res2 = apiError('GET /api/foo', 42, 'msg');
    const res3 = apiError('GET /api/foo', undefined, 'msg');
    expect(res1.status).toBe(500);
    expect(res2.status).toBe(500);
    expect(res3.status).toBe(500);
  });
});

describe('apiClientError', () => {
  it('returns a 400 response by default with the given message', async () => {
    const res = apiClientError('Validierungsfehler');
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Validierungsfehler' });
  });

  it('does NOT call console.error (client errors are not server bugs)', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiClientError('Validierungsfehler');
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('attaches a details payload when provided', async () => {
    const details = { field: 'email', message: 'required' };
    const res = apiClientError('Validierungsfehler', 400, details);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: 'Validierungsfehler',
      details,
    });
  });

  it('omits details when undefined (so the response stays minimal)', async () => {
    const res = apiClientError('Validierungsfehler');
    const body = await res.json();
    expect(body).not.toHaveProperty('details');
  });

  it('honours a custom status code (e.g. 404, 409, 422)', async () => {
    expect(apiClientError('Nicht gefunden', 404).status).toBe(404);
    expect(apiClientError('Konflikt', 409).status).toBe(409);
    expect(apiClientError('Validierungsfehler', 422).status).toBe(422);
  });
});
