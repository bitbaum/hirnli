/**
 * The rule that decides whether a failed read is an outage or a defect.
 *
 * On 2026-09-04 this distinction did not exist: every database error fell
 * through one catch that logged "DB unreachable" and returned []. A missing
 * GRANT on the newly created assessments table therefore rendered as a customer
 * with zero foundations, served with HTTP 200, with no alert and no error page.
 *
 * These tests pin the boundary. Postgres class 42 means the deployed code and
 * the database schema disagree — it will be just as true on the next request,
 * so it must surface. Everything else may be transient and may degrade.
 */

import { describe, it, expect } from 'vitest';
import { isSchemaOrPermissionError } from '../foundations-repo';

describe('isSchemaOrPermissionError', () => {
  it('catches the permission error that caused the 2026-09-04 empty-export outage', () => {
    expect(isSchemaOrPermissionError({ code: '42501' })).toBe(true);
  });

  it('catches an undefined table — a migration that never ran', () => {
    expect(isSchemaOrPermissionError({ code: '42P01' })).toBe(true);
  });

  it('catches an undefined column — a schema ahead of or behind the code', () => {
    expect(isSchemaOrPermissionError({ code: '42703' })).toBe(true);
  });

  it('sees through the driver wrapper, since Drizzle nests the real error', () => {
    const wrapped = new Error('Failed query: select ...');
    (wrapped as Error & { cause?: unknown }).cause = { code: '42501' };
    expect(isSchemaOrPermissionError(wrapped)).toBe(true);
  });

  it('treats a refused connection as transient, so a blip still degrades gracefully', () => {
    expect(isSchemaOrPermissionError({ code: 'ECONNREFUSED' })).toBe(false);
  });

  it('treats a serialization failure as transient — retrying can succeed', () => {
    expect(isSchemaOrPermissionError({ code: '40001' })).toBe(false);
  });

  it('does not mistake an error with no code for a schema problem', () => {
    expect(isSchemaOrPermissionError(new Error('boom'))).toBe(false);
    expect(isSchemaOrPermissionError(undefined)).toBe(false);
    expect(isSchemaOrPermissionError(null)).toBe(false);
  });

  it('terminates on a self-referential cause chain', () => {
    const err: { code: string; cause?: unknown } = { code: 'X' };
    err.cause = err;
    expect(isSchemaOrPermissionError(err)).toBe(false);
  });
});
