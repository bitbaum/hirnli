'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { NAV_STRUCTURE } from '@/lib/config/nav';
import { BRANDING } from '@/lib/config/branding';
import { NAV_LINK_BASE, activeClasses, isActive } from './nav/nav-utils';
import MegaMenu from './nav/MegaMenu';
import Dropdown from './nav/Dropdown';
import MobileAccordion from './nav/MobileAccordion';
import { ThemeToggle } from './ThemeToggle';
import Backdrop from '@/components/ui/Backdrop';

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setExpandedItem(null);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, closeMobile]);

  return (
    <nav aria-label="Hauptnavigation" className="sticky top-0 z-30 border-b border-border-default bg-surface-base/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-all hover:opacity-80 hover:no-underline"
        >
          <Image
            src={BRANDING.logo.main}
            alt={BRANDING.logo.alt}
            width={BRANDING.logo.width}
            height={BRANDING.logo.height}
            priority
            className="h-auto w-auto"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-revamp-green">
              {BRANDING.siteName}
            </span>
            <span className="text-sm text-text-muted">
              {BRANDING.siteTagline}
            </span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          className="flex min-h-11 min-w-11 items-center justify-center rounded text-2xl lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_STRUCTURE.items.map((item) => {
            if (item.mega) {
              return <MegaMenu key={item.text} item={item} pathname={pathname} />;
            }
            if (item.children) {
              return <Dropdown key={item.text} item={item} pathname={pathname} />;
            }
            return (
              <li key={item.text}>
                <Link
                  href={item.href || '#'}
                  className={`${NAV_LINK_BASE} hover:no-underline ${activeClasses(isActive(item.href, pathname))}`}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  {item.text}
                </Link>
              </li>
            );
          })}
          <li><ThemeToggle /></li>
        </ul>
      </div>

      {/* Mobile backdrop + nav */}
      {mobileOpen && (
        <>
          <Backdrop onClose={closeMobile} className="lg:hidden" />
          <div className="fixed inset-x-0 top-[calc(3.5rem+1px)] z-modal max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border-default bg-surface-base px-4 py-4 lg:hidden">
            <ul className="space-y-1">
              {NAV_STRUCTURE.items.map((item) => (
                <MobileAccordion
                  key={item.text}
                  item={item}
                  pathname={pathname}
                  expanded={expandedItem === item.text}
                  onToggle={() =>
                    setExpandedItem((cur) =>
                      cur === item.text ? null : item.text,
                    )
                  }
                  onNavigate={closeMobile}
                />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
              <span className="text-sm text-text-secondary">Erscheinungsbild</span>
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
