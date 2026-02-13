'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_STRUCTURE } from '@/lib/config/nav';
import { BRANDING } from '@/lib/config/branding';
import type { NavItem, NavSection } from '@/lib/config/nav';

function isActive(href: string | undefined, pathname: string): boolean {
  if (!href || href === '#' || href.startsWith('http')) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function MegaMenu({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <li className="group relative">
      <Link
        href={item.href || '#'}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isActive(item.href, pathname)
            ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-primary'
            : 'text-grey-dark'
        }`}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-[640px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-xl border-2 border-emerald-200 bg-white shadow-2xl">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-revamp-blue via-revamp-green to-revamp-orange"></div>
          <div className="grid grid-cols-2 gap-8 p-8">
            {item.sections?.map((section: NavSection, idx: number) => (
              <div key={section.title}>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-revamp-blue">
                    {section.title}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {section.items.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link block rounded-lg border-l-3 border-transparent px-3 py-2.5 text-sm transition-all hover:border-l-revamp-green hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:pl-4"
                        >
                          <span className="font-semibold text-grey-dark group-hover/link:text-revamp-green">
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-xs text-text-muted">{link.desc}</span>
                          )}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className={`group/link block rounded-lg border-l-3 px-3 py-2.5 text-sm transition-all hover:border-l-revamp-green hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:pl-4 ${
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
                              link.highlight ? 'text-revamp-orange' : 'text-grey-dark'
                            } ${isActive(link.href, pathname) ? 'text-revamp-blue' : ''}`}
                          >
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-xs text-text-muted">{link.desc}</span>
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

function Dropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <li className="group relative">
      <button className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-grey-dark transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-72 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-white shadow-2xl">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
          <div className="py-3">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`group/link mx-2 my-1 block rounded-lg border-l-3 px-4 py-3 text-sm transition-all hover:border-l-revamp-green hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:pl-5 ${
                  isActive(child.href, pathname)
                    ? 'border-l-revamp-blue bg-gradient-to-r from-blue-50 to-emerald-50'
                    : 'border-transparent'
                }`}
              >
                <span
                  className={`font-semibold group-hover/link:text-revamp-green ${
                    isActive(child.href, pathname) ? 'text-revamp-blue' : 'text-grey-dark'
                  }`}
                >
                  {child.text}
                </span>
                {child.desc && (
                  <span className="block text-xs text-text-muted mt-0.5">{child.desc}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <span className="text-xs text-text-muted">{BRANDING.siteTagline}</span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          className="rounded text-2xl lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
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
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive(item.href, pathname)
                      ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-primary'
                      : 'text-grey-dark'
                  }`}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <ul className="space-y-2">
            {NAV_STRUCTURE.items.map((item) => (
              <li key={item.text}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block py-2 text-sm font-medium text-grey-dark"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.text}
                  </Link>
                ) : (
                  <span className="block py-2 text-sm font-medium text-grey-dark">
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.text}
                  </span>
                )}
                {(item.children || item.sections) && (
                  <ul className="ml-4 space-y-1">
                    {item.children?.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block py-1 text-sm text-text-light"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.text}
                        </Link>
                      </li>
                    ))}
                    {item.sections?.map((section) => (
                      <li key={section.title} className="ml-4 mt-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{section.title}</h4>
                        <ul className="mt-1 space-y-1">
                          {section.items.filter((l) => !l.external).map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block py-1 text-sm text-text-light"
                                onClick={() => setMobileOpen(false)}
                              >
                                {link.text}
                                {link.desc && <span className="block text-xs text-text-muted">{link.desc}</span>}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
