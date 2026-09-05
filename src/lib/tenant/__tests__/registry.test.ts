/**
 * The host → tenant seam, after the map became a table.
 *
 * What this file used to assert is as informative as what it asserts now. It
 * guarded a `HOST_TENANTS` record and a `DEFAULT_TENANT_ID`, and one of its
 * cases required that an unknown host "must land on a real tenant, never
 * undefined — a missing tenant downstream reads as no org scope, which is the
 * shape of a cross-tenant data leak."
 *
 * That reasoning was right about the danger and wrong about the remedy.
 * Answering an unknown host with a real tenant does not avoid a leak; it
 * guarantees one, quietly, in that tenant's favour — a stray domain, a probe
 * or a not-yet-mapped customer rendered the first customer's site and scoped
 * queries to its data. Resolution now fails loudly instead, which is the same
 * choice `getTenantById` already made for a missing row.
 */

import { describe, it, expect } from 'vitest';
import { PLATFORM_HOST, TENANT_HOST_HEADER, isPlatformHost, normalizeHost } from '../registry';

describe('host normalisation', () => {
  it('strips the port', () => {
    // `localhost:3000` and `example.ch:443` are the same host to a browser and
    // a different string to any lookup.
    expect(normalizeHost('localhost:3000')).toBe('localhost');
    expect(normalizeHost('example.ch:443')).toBe('example.ch');
  });

  it('lowercases', () => {
    expect(normalizeHost('EXAMPLE.CH')).toBe('example.ch');
  });

  it('turns a missing host into the empty string, not "null"', () => {
    // A literal "null" host would be looked up in org_domains and could, in
    // principle, be registered. Empty cannot.
    expect(normalizeHost(null)).toBe('');
  });
});

describe('the platform host is not a tenant', () => {
  it('recognises the platform host', () => {
    expect(isPlatformHost(PLATFORM_HOST)).toBe(true);
    expect(isPlatformHost(`${PLATFORM_HOST}:443`)).toBe(true);
    expect(isPlatformHost(PLATFORM_HOST.toUpperCase())).toBe(true);
  });

  it('does not recognise anything else', () => {
    // If the platform host resolved as a tenant, the product's own homepage
    // would silently become an organisation's showcase.
    expect(isPlatformHost('some-customer.example.ch')).toBe(false);
    expect(isPlatformHost(null)).toBe(false);
  });
});

describe('no tenant is named in this module', () => {
  it('exports no customer id, host map or default', async () => {
    const registry = await import('../registry');
    const exported = Object.keys(registry).sort();

    // The point of the change: adding or removing a customer is a row, not a
    // deploy. If any of these come back, the map has been reintroduced.
    expect(exported).not.toContain('TENANT_IDS');
    expect(exported).not.toContain('HOST_TENANTS');
    expect(exported).not.toContain('DEFAULT_TENANT_ID');
    expect(exported).not.toContain('getTenantIdByHost');
  });

  it('names the header the middleware uses, so both sides cannot drift', () => {
    expect(TENANT_HOST_HEADER).toBe('x-tenant-host');
  });
});
