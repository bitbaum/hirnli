'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_STRUCTURE } from '@/lib/config/nav';
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
        className={`rounded px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isActive(item.href, pathname) ? 'text-primary' : 'text-grey-dark'
        }`}
      >
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.text}
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-[600px] -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="rounded-lg border border-border bg-white p-6 shadow-md">
          <div className="grid grid-cols-3 gap-6">
            {item.sections?.map((section: NavSection) => (
              <div key={section.title}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.items.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded px-2 py-1.5 text-sm text-text-light transition-colors hover:bg-bg-light hover:text-primary"
                        >
                          <span className="font-medium">{link.text}</span>
                          {link.desc && (
                            <span className="block text-xs text-text-muted">{link.desc}</span>
                          )}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className={`block rounded px-2 py-1.5 text-sm transition-colors hover:bg-bg-light hover:text-primary ${
                            link.highlight ? 'font-semibold text-primary' : 'text-text-light'
                          } ${isActive(link.href, pathname) ? 'bg-bg-light text-primary' : ''}`}
                        >
                          <span className="font-medium">{link.text}</span>
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
      <button className="flex items-center rounded px-3 py-2 text-sm font-medium text-grey-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.text}
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-56 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="rounded-lg border border-border bg-white py-2 shadow-md">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block px-4 py-2 text-sm transition-colors hover:bg-bg-light hover:text-primary ${
                isActive(child.href, pathname) ? 'bg-bg-light text-primary' : 'text-grey-dark'
              }`}
            >
              <span className="font-medium">{child.text}</span>
              {child.desc && (
                <span className="block text-xs text-text-muted">{child.desc}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-grey-dark hover:text-primary hover:no-underline">
          {NAV_STRUCTURE.logo.text}
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
                  className={`rounded px-3 py-2 text-sm font-medium transition-colors hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive(item.href, pathname) ? 'text-primary' : 'text-grey-dark'
                  }`}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
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
