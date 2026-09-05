/**
 * Platform chrome — the product's own identity, distinct from any tenant.
 *
 * It used to link to the first customer's live site as a proof of concept,
 * resolved by a hard-coded id. A product page that names one customer is not
 * the product's identity, it is that customer's; and it made the platform
 * surface unrenderable without that particular tenant existing.
 */

import Link from 'next/link';
import { PLATFORM_BRAND } from '@/lib/config/platform-brand';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();
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
