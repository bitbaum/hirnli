/**
 * Tenant chrome — one organisation's own site.
 *
 * Branding is resolved HERE, server-side, and handed to the nav as data. It
 * used to be imported from a config module that hardcoded Revamp-IT's logo, so
 * every tenant wore the same mark. A tenant with no branding of its own renders
 * unbranded rather than borrowing another's.
 */

import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { LocaleNotice } from '@/components/layout/LocaleNotice';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { getTenant, getTenantBranding } from '@/lib/tenant/resolve';
import { TenantProvider } from '@/lib/tenant/TenantProvider';

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const [foundations, tenant, branding] = await Promise.all([
    getAllFoundations(),
    getTenant(),
    getTenantBranding(),
  ]);
  return (
    <TenantProvider tenant={tenant} branding={branding}>
      <Nav
        stiftungenCount={foundations.length}
        logoUrl={branding.logoUrl}
        logoAlt={branding.logoAlt ?? `${tenant.name} Logo`}
      />
      <LocaleNotice />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </TenantProvider>
  );
}
