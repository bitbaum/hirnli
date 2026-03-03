'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { NAV_STRUCTURE } from '@/lib/config/nav';
import { BRANDING } from '@/lib/config/branding';
import type { NavItem, NavSection } from '@/lib/config/nav';

// -- Shared style constants (DRY) -------------------------------------------

const NAV_LINK_BASE =
  'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

const NAV_ITEM_BASE =
  'group/link block rounded-lg border-l-3 px-3 py-2.5 text-sm transition-all hover:border-l-revamp-green hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:pl-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

function activeClasses(active: boolean) {
  return active
    ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-primary'
    : 'text-grey-dark';
}

function isActive(href: string | undefined, pathname: string): boolean {
  if (!href || href === '#' || href.startsWith('http')) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

// -- MegaMenu (desktop) — keyboard accessible -------------------------------

function MegaMenu({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const menuId = useId();
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openMenu = useCallback(() => {
    clearTimeout(closeTimeout.current);
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }, []);

  // Close when focus leaves the entire wrapper
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (
        wrapperRef.current &&
        e.relatedTarget instanceof Node &&
        !wrapperRef.current.contains(e.relatedTarget)
      ) {
        setOpen(false);
      }
    },
    [],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      const trigger = wrapperRef.current?.querySelector<HTMLElement>(
        '[aria-haspopup]',
      );
      trigger?.focus();
    }
  }, []);

  return (
    <li
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onBlurCapture={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <Link
        href={item.href || '#'}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          // If item has no real href, toggle menu instead of navigating
          if (!item.href || item.href === '#') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`${NAV_LINK_BASE} ${activeClasses(isActive(item.href, pathname))}`}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </Link>
      <div
        id={menuId}
        role="menu"
        className={`absolute left-1/2 top-full z-50 w-[640px] -translate-x-1/2 pt-3 transition-all duration-200 ${
          open
            ? 'visible opacity-100 translate-y-0'
            : 'invisible opacity-0 -translate-y-1'
        }`}
      >
        <div className="overflow-hidden rounded-xl border-2 border-emerald-200 bg-white shadow-2xl">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-revamp-blue via-revamp-green to-revamp-orange"></div>
          <div className="grid grid-cols-2 gap-8 p-8">
            {item.sections?.map((section: NavSection) => (
              <div key={section.title} role="group" aria-label={section.title}>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
                  <span className="text-sm font-bold uppercase tracking-wider text-revamp-blue">
                    {section.title}
                  </span>
                </div>
                <ul className="space-y-2" role="none">
                  {section.items.map((link) => (
                    <li key={link.href} role="none">
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          className={`${NAV_ITEM_BASE} border-transparent`}
                        >
                          <span className="font-semibold text-grey-dark group-hover/link:text-revamp-green">
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-xs text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          role="menuitem"
                          className={`${NAV_ITEM_BASE} ${
                            link.highlight
                              ? 'border-l-revamp-orange bg-gradient-to-r from-orange-50 to-yellow-50'
                              : 'border-transparent'
                          } ${
                            isActive(link.href, pathname)
                              ? 'border-l-revamp-blue bg-gradient-to-r from-blue-50 to-emerald-50'
                              : ''
                          }`}
                        >
                          <span
                            className={`font-semibold group-hover/link:text-revamp-green ${
                              link.highlight
                                ? 'text-revamp-orange'
                                : 'text-grey-dark'
                            } ${
                              isActive(link.href, pathname)
                                ? 'text-revamp-blue'
                                : ''
                            }`}
                          >
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-xs text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

// -- Dropdown (desktop) — keyboard accessible --------------------------------

function Dropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const menuId = useId();
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openMenu = useCallback(() => {
    clearTimeout(closeTimeout.current);
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (
        wrapperRef.current &&
        e.relatedTarget instanceof Node &&
        !wrapperRef.current.contains(e.relatedTarget)
      ) {
        setOpen(false);
      }
    },
    [],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      const trigger = wrapperRef.current?.querySelector<HTMLElement>(
        '[aria-haspopup]',
      );
      trigger?.focus();
    }
  }, []);

  return (
    <li
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onBlurCapture={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={`${NAV_LINK_BASE} ${activeClasses(false)}`}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute left-0 top-full z-50 w-72 pt-3 transition-all duration-200 ${
          open
            ? 'visible opacity-100 translate-y-0'
            : 'invisible opacity-0 -translate-y-1'
        }`}
      >
        <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-white shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
          <div className="py-3">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                className={`${NAV_ITEM_BASE} mx-2 my-1 ${
                  isActive(child.href, pathname)
                    ? 'border-l-revamp-blue bg-gradient-to-r from-blue-50 to-emerald-50'
                    : 'border-transparent'
                }`}
              >
                <span
                  className={`font-semibold group-hover/link:text-revamp-green ${
                    isActive(child.href, pathname)
                      ? 'text-revamp-blue'
                      : 'text-grey-dark'
                  }`}
                >
                  {child.text}
                </span>
                {child.desc && (
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {child.desc}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

// -- Mobile accordion item ---------------------------------------------------

function MobileAccordion({
  item,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = useId();
  const hasChildren = !!(item.children || item.sections);

  // Simple link — no children
  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href || '#'}
          className="flex min-h-11 items-center py-2 text-sm font-medium text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={onNavigate}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.text}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center">
        {/* If item has an href, make the label a link */}
        {item.href ? (
          <Link
            href={item.href}
            className="flex min-h-11 flex-1 items-center py-2 text-sm font-medium text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={onNavigate}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.text}
          </Link>
        ) : (
          <span className="flex min-h-11 flex-1 items-center py-2 text-sm font-medium text-grey-dark">
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.text}
          </span>
        )}
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex min-h-11 min-w-11 items-center justify-center rounded text-text-muted hover:text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`${item.text} ${expanded ? 'zuklappen' : 'aufklappen'}`}
        >
          <span
            className={`text-xs transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            ▸
          </span>
        </button>
      </div>

      {/* Accordion panel with smooth animation */}
      <div
        id={panelId}
        role="region"
        aria-label={item.text}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="ml-4 space-y-1 pb-2">
            {item.children?.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={`block min-h-11 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive(child.href, pathname)
                      ? 'font-medium text-primary'
                      : 'text-text-light'
                  }`}
                  onClick={onNavigate}
                >
                  {child.text}
                </Link>
              </li>
            ))}
            {item.sections?.map((section) => (
              <li key={section.title} className="mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </span>
                <ul className="mt-1 space-y-1">
                  {section.items
                    .filter((l) => !l.external)
                    .map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block min-h-11 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive(link.href, pathname)
                              ? 'font-medium text-primary'
                              : 'text-text-light'
                          }`}
                          onClick={onNavigate}
                        >
                          {link.text}
                          {link.desc && (
                            <span className="block text-xs text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

// -- Main Nav ----------------------------------------------------------------

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setExpandedItem(null);
  }, []);

  return (
    <nav className="border-b-2 border-emerald-100 bg-white shadow-sm">
      {/* Brand color accent bar */}
      <div className="h-1 bg-gradient-to-r from-revamp-blue via-revamp-green to-revamp-orange"></div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
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
            <span className="text-xs text-text-muted">
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
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_STRUCTURE.items.map((item) => {
            if (item.mega) {
              return (
                <MegaMenu key={item.text} item={item} pathname={pathname} />
              );
            }
            if (item.children) {
              return (
                <Dropdown key={item.text} item={item} pathname={pathname} />
              );
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
        </ul>
      </div>

      {/* Mobile backdrop + nav */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-[calc(4.25rem+4px)] z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-border bg-white px-4 py-4 lg:hidden">
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
          </div>
        </>
      )}
    </nav>
  );
}
