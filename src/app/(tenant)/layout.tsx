/**
 * Tenant chrome — the organization's site (today: Revamp-IT).
 * Org nav, org branding, org footer. Route group = no URL change.
 */

import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { LocaleNotice } from '@/components/layout/LocaleNotice';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <LocaleNotice />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
