/**
 * Caddy's on-demand TLS gate: "is this hostname one of ours?"
 *
 * Without this, taking on a customer means editing `/etc/caddy/apps.d/*.caddy`
 * and reloading a web server by hand — the same class of problem as the
 * hard-coded host map, one layer down. With it, a customer's subdomain starts
 * working the moment their row exists, certificate and all.
 *
 * Caddy calls this before issuing a certificate for a hostname it has never
 * seen. The contract is the status code only: 200 means "yes, provision a
 * certificate", anything else means refuse. Body is ignored.
 *
 * WHY THIS MUST BE STRICT: an endpoint that answers 200 to everything turns the
 * box into an open certificate mill — any domain pointed at this IP would get a
 * cert issued in our name, until the ACME rate limit stops it. So it answers
 * from `org_domains` and nothing else, and it does not create, guess or
 * normalise its way to a match beyond case and port.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orgDomains } from '@/lib/db/schema';
import { normalizeHost, isPlatformHost } from '@/lib/tenant/registry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const domain = normalizeHost(request.nextUrl.searchParams.get('domain'));

  if (!domain) {
    return new NextResponse('missing domain', { status: 400 });
  }

  // The platform's own host is legitimate but is not a tenant, so it would not
  // be found below. It is served from a normal Caddy site block today; allowing
  // it here means that block could become on-demand too without this endpoint
  // quietly refusing the product's own certificate.
  if (isPlatformHost(domain)) {
    return new NextResponse('platform', { status: 200 });
  }

  const rows = await db
    .select({ orgId: orgDomains.orgId })
    .from(orgDomains)
    .where(eq(orgDomains.host, domain))
    .limit(1);

  return rows.length > 0
    ? new NextResponse('ok', { status: 200 })
    : new NextResponse('unknown domain', { status: 404 });
}
