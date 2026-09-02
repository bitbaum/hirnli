/**
 * The host → tenant seam. These assertions look small, but each one guards a
 * failure that is invisible until it is expensive:
 *
 *  - platform vs tenant host: if the platform host resolves as a tenant, the
 *    product's own homepage silently becomes an org's showcase (which is what
 *    it did before host routing existed).
 *  - port/case normalisation: `localhost:3000` and `HIRNLI.orangecat.ch` are
 *    the same host to a browser and a different string to a `Record` lookup.
 *  - the fallback: an unknown host must land on a real tenant, never
 *    `undefined` — a missing tenant downstream reads as "no org scope", which
 *    is the shape of a cross-tenant data leak.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TENANT_ID,
  HOST_TENANTS,
  PLATFORM_HOST,
  TENANTS,
  TENANT_IDS,
  getTenantByHost,
  getTenantIdByHost,
  isPlatformHost,
} from '../registry';

describe('isPlatformHost', () => {
  it('recognises the platform host', () => {
    expect(isPlatformHost(PLATFORM_HOST)).toBe(true);
  });

  it('ignores case and port', () => {
    expect(isPlatformHost('HIRNLI.orangecat.ch')).toBe(true);
    expect(isPlatformHost(`${PLATFORM_HOST}:443`)).toBe(true);
  });

  it('does not treat a tenant host as the platform', () => {
    expect(isPlatformHost('revamp-info.orangecat.ch')).toBe(false);
  });

  it('treats a missing Host header as not-the-platform', () => {
    expect(isPlatformHost(null)).toBe(false);
  });
});

describe('getTenantIdByHost', () => {
  it('maps the tenant host to its org id', () => {
    expect(getTenantIdByHost('revamp-info.orangecat.ch')).toBe(TENANT_IDS.revampIt);
  });

  it('falls back to the default tenant for unknown hosts', () => {
    expect(getTenantIdByHost('example.invalid')).toBe(DEFAULT_TENANT_ID);
    expect(getTenantIdByHost(null)).toBe(DEFAULT_TENANT_ID);
  });

  it('never returns undefined — an unscoped org id is a data-leak shape', () => {
    for (const host of [null, '', 'unknown.host', PLATFORM_HOST, 'revamp-info.orangecat.ch']) {
      expect(typeof getTenantIdByHost(host)).toBe('string');
      expect(getTenantIdByHost(host).length).toBeGreaterThan(0);
    }
  });
});

describe('getTenantByHost', () => {
  it('resolves a real tenant object for every known host', () => {
    for (const host of Object.keys(HOST_TENANTS)) {
      expect(getTenantByHost(host)).toBeDefined();
      expect(getTenantByHost(host).orgId).toBe(HOST_TENANTS[host]);
    }
  });
});

describe('tenant ids', () => {
  it('declares both tenants, matching the org_profiles rows', () => {
    expect(Object.values(TENANT_IDS)).toEqual(expect.arrayContaining(['revamp-it', 'evig']));
  });

  it('every registered host points at a declared tenant id', () => {
    const declared = Object.values(TENANT_IDS) as string[];
    for (const orgId of Object.values(HOST_TENANTS)) {
      expect(declared).toContain(orgId);
    }
  });

  it('the static TENANTS map still backs the default tenant', () => {
    // evig is intentionally absent here: it exists as a DB row and gains a
    // profile when getTenant() becomes DB-backed (Phase C). If this ever
    // fails because evig was hardcoded in, that is the coupling coming back.
    expect(TENANTS[DEFAULT_TENANT_ID]).toBeDefined();
  });
});
