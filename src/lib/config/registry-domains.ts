// Registry/directory domains — SSOT
// These are aggregator/lookup sites, NOT foundation-owned websites.
// Used to distinguish real websiteUrl from registry references.

/** Known directory/registry domains that are NOT foundation websites */
export const REGISTRY_DOMAINS = [
  'zefix.ch',
  'zefix.admin.ch',
  'uid.admin.ch',
  'stiftungschweiz.ch',
  'fundraiso.ch',
  'fundraiso.com',
  'spheriq.ch',
  'esa.admin.ch',
  'edi.admin.ch',
  'wikipedia.org',
  'linkedin.com',
  'moneyhouse.ch',
  'northdata.com',
] as const;

/** Check if a URL belongs to a known registry/directory site */
export function isRegistryUrl(url: string): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return REGISTRY_DOMAINS.some(
      (d) => hostname === d || hostname === `www.${d}` || hostname.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}
