/**
 * Platform chrome — the product's own identity, distinct from any tenant.
 * Minimal by design: wordmark, link to the first tenant's live site (the
 * proof of concept), language + theme toggles.
 */

import Link from 'next/link';
import { PLATFORM_BRAND } from '@/lib/config/platform-brand';
import { getTenantById } from '@/lib/tenant/resolve';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/registry';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();
  // Deliberately the REFERENCE tenant, not the viewing one. These are the
  // platform's own pages, and the link means "see it running for a real
  // customer" — a specific customer, not whoever is reading. Resolved by id so
  // it is a stated choice rather than a compile-time accident.
  const showcase = await getTenantById(DEFAULT_TENANT_ID);
  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-border-default bg-surface-base/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/plattform" className="flex items-baseline gap-2 hover:no-underline">
            <span className="text-base font-bold tracking-tight text-text-primary">
              {PLATFORM_BRAND.name}
            </span>
            <span className="hidden text-sm text-text-muted sm:inline">
              {PLATFORM_BRAND.tagline}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="mr-2 hidden min-h-11 items-center rounded-lg px-3 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary sm:inline-flex"
            >
              {showcase.name} →
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="mt-auto border-t border-border-subtle bg-surface-raised">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-text-tertiary">
          {PLATFORM_BRAND.name} &copy; {year}
        </div>
      </footer>
    </>
  );
}
